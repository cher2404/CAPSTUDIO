-- =============================================================================
-- CAP Studio – databaseschema
-- Tabellen, helpers, triggers, RPC's en row level security.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- profiles: één rij per auth-gebruiker
-- -----------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'client' check (role in ('admin', 'client')),
  created_at  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------

create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references public.profiles (id) on delete set null,
  email       text not null,
  full_name   text,
  phone       text,
  company     text,
  instagram   text,
  city        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index clients_email_key on public.clients (lower(email));
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

-- Klanten mogen hun eigen gegevens aanpassen, maar niet e-mail of koppeling.
create or replace function public.protect_client_columns()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and not public.is_admin() and auth.uid() is not null then
    new.user_id = old.user_id;
    new.email = old.email;
  end if;
  new.email = lower(trim(new.email));
  return new;
end $$;
create trigger clients_protect before insert or update on public.clients
  for each row execute function public.protect_client_columns();

create or replace function public.my_client_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.clients where user_id = auth.uid();
$$;

-- Interne notities, alleen voor de admin.
create table public.client_notes (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- Nieuwe gebruiker → profiel + koppelen aan (of aanmaken van) een klant.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', null);
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, v_name)
  on conflict (id) do nothing;

  update public.clients set user_id = new.id
   where lower(email) = lower(new.email) and user_id is null;

  if not found then
    insert into public.clients (user_id, email, full_name)
    values (new.id, new.email, v_name)
    on conflict do nothing;
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------

create table public.projects (
  id                    uuid primary key default gen_random_uuid(),
  client_id             uuid not null references public.clients (id) on delete cascade,
  title                 text not null,
  description           text,
  shoot_type            text,
  location              text,
  status                text not null default 'aanvraag'
                        check (status in ('aanvraag', 'offerte', 'akkoord', 'shoot_gepland', 'bewerking', 'opgeleverd')),
  payment_status        text not null default 'open'
                        check (payment_status in ('open', 'deels', 'betaald')),
  portfolio_consent     boolean not null default false,
  portfolio_consent_at  timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index projects_client_idx on public.projects (client_id);
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create or replace function public.owns_project(p_project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.projects p
      join public.clients c on c.id = p.client_id
     where p.id = p_project_id and c.user_id = auth.uid()
  );
$$;

-- Status alleen vooruit zetten (automatisch vanuit offertes, afspraken, galerijen).
create or replace function public.advance_project_status(p_project_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_order text[] := array['aanvraag', 'offerte', 'akkoord', 'shoot_gepland', 'bewerking', 'opgeleverd'];
begin
  update public.projects
     set status = p_status
   where id = p_project_id
     and array_position(v_order, status) < array_position(v_order, p_status);
end $$;
revoke execute on function public.advance_project_status(uuid, text) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- packages (diensten en tarieven)
-- -----------------------------------------------------------------------------

create table public.packages (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  tagline      text,
  price_from   numeric(10, 2),
  price_label  text,
  duration     text,
  features     text[] not null default '{}',
  highlighted  boolean not null default false,
  sort         int not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- quotes
-- -----------------------------------------------------------------------------

create table public.quote_templates (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  package_id       uuid references public.packages (id) on delete set null,
  title            text not null,
  intro            text,
  items            jsonb not null default '[]',  -- [{description, quantity, unit_price}]
  validity_days    int not null default 14,
  usage_rights     text,
  revision_rounds  int not null default 1,
  created_at       timestamptz not null default now()
);

create sequence public.quote_number_seq;

create table public.quotes (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  number           text not null unique
                   default ('CAP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.quote_number_seq')::text, 4, '0')),
  title            text not null,
  intro            text,
  status           text not null default 'concept'
                   check (status in ('concept', 'verstuurd', 'vraag', 'geaccepteerd', 'afgewezen', 'verlopen')),
  vat_rate         numeric(5, 2) not null default 21,
  subtotal         numeric(10, 2) not null default 0,
  vat_amount       numeric(10, 2) not null default 0,
  total            numeric(10, 2) not null default 0,
  valid_until      date,
  usage_rights     text,
  revision_rounds  int not null default 1,
  sent_at          timestamptz,
  accepted_at      timestamptz,
  accepted_by      uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index quotes_project_idx on public.quotes (project_id);
create trigger quotes_updated_at before update on public.quotes
  for each row execute function public.set_updated_at();

create table public.quote_items (
  id           uuid primary key default gen_random_uuid(),
  quote_id     uuid not null references public.quotes (id) on delete cascade,
  description  text not null,
  quantity     numeric(10, 2) not null default 1,
  unit_price   numeric(10, 2) not null default 0,
  sort         int not null default 0
);
create index quote_items_quote_idx on public.quote_items (quote_id);

create or replace function public.recalc_quote(p_quote_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_sub numeric(10, 2);
begin
  select coalesce(sum(round(quantity * unit_price, 2)), 0) into v_sub
    from public.quote_items where quote_id = p_quote_id;
  update public.quotes
     set subtotal = v_sub,
         vat_amount = round(v_sub * vat_rate / 100, 2),
         total = v_sub + round(v_sub * vat_rate / 100, 2)
   where id = p_quote_id;
end $$;

create or replace function public.quote_items_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recalc_quote(coalesce(new.quote_id, old.quote_id));
  return null;
end $$;
create trigger quote_items_recalc after insert or update or delete on public.quote_items
  for each row execute function public.quote_items_changed();

create or replace function public.quote_vat_changed()
returns trigger language plpgsql as $$
begin
  if new.vat_rate is distinct from old.vat_rate then
    perform public.recalc_quote(new.id);
  end if;
  return null;
end $$;
create trigger quotes_vat_recalc after update of vat_rate on public.quotes
  for each row execute function public.quote_vat_changed();

create or replace function public.quote_status_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'verstuurd' and old.status = 'concept' then
    perform public.advance_project_status(new.project_id, 'offerte');
  elsif new.status = 'geaccepteerd' and old.status <> 'geaccepteerd' then
    perform public.advance_project_status(new.project_id, 'akkoord');
  end if;
  return null;
end $$;
create trigger quotes_status_flow after update of status on public.quotes
  for each row execute function public.quote_status_changed();

-- -----------------------------------------------------------------------------
-- agreements + signatures
-- -----------------------------------------------------------------------------

create table public.agreement_templates (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  body                     text not null,
  default_usage_rights     text,
  default_revision_rounds  int not null default 1,
  is_default               boolean not null default false,
  updated_at               timestamptz not null default now()
);
create unique index agreement_templates_one_default on public.agreement_templates (is_default) where is_default;
create trigger agreement_templates_updated_at before update on public.agreement_templates
  for each row execute function public.set_updated_at();

create table public.agreements (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  quote_id         uuid unique references public.quotes (id) on delete set null,
  title            text not null,
  body             text not null,
  usage_rights     text,
  revision_rounds  int not null default 1,
  status           text not null default 'te_ondertekenen'
                   check (status in ('te_ondertekenen', 'ondertekend', 'ingetrokken')),
  content_hash     text,
  signed_at        timestamptz,
  created_at       timestamptz not null default now()
);
create index agreements_project_idx on public.agreements (project_id);

-- Een ondertekende overeenkomst is niet meer inhoudelijk te wijzigen.
create or replace function public.protect_signed_agreement()
returns trigger language plpgsql as $$
begin
  if old.status = 'ondertekend' and (
       new.body is distinct from old.body or
       new.usage_rights is distinct from old.usage_rights or
       new.revision_rounds is distinct from old.revision_rounds) then
    raise exception 'Een ondertekende overeenkomst kan niet worden gewijzigd';
  end if;
  return new;
end $$;
create trigger agreements_protect before update on public.agreements
  for each row execute function public.protect_signed_agreement();

create table public.signatures (
  id            uuid primary key default gen_random_uuid(),
  agreement_id  uuid not null references public.agreements (id) on delete cascade,
  user_id       uuid references public.profiles (id) on delete set null,
  signer_role   text not null default 'client' check (signer_role in ('client', 'admin')),
  signer_name   text not null,
  signer_email  text,
  signed_at     timestamptz not null default now(),
  ip_address    text,
  user_agent    text,
  content_hash  text not null
);
create index signatures_agreement_idx on public.signatures (agreement_id);

-- -----------------------------------------------------------------------------
-- availability + appointments
-- -----------------------------------------------------------------------------

create table public.availability (
  id          uuid primary key default gen_random_uuid(),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  note        text,
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index availability_starts_idx on public.availability (starts_at);

create table public.appointments (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete cascade,
  availability_id   uuid references public.availability (id) on delete set null,
  title             text not null default 'Shoot',
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  location          text,
  notes             text,
  status            text not null default 'bevestigd'
                    check (status in ('bevestigd', 'geannuleerd', 'afgerond')),
  reminder_sent_at  timestamptz,
  google_event_id   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index appointments_project_idx on public.appointments (project_id);
create index appointments_starts_idx on public.appointments (starts_at);
create unique index appointments_slot_taken on public.appointments (availability_id)
  where status = 'bevestigd' and availability_id is not null;
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- Vrije momenten (minimaal 24 uur vooruit).
create or replace function public.open_slots(p_from timestamptz default now(), p_to timestamptz default now() + interval '90 days')
returns setof public.availability language sql stable security definer set search_path = public as $$
  select a.* from public.availability a
   where a.starts_at >= greatest(p_from, now() + interval '24 hours')
     and a.starts_at < p_to
     and not exists (
       select 1 from public.appointments ap
        where ap.availability_id = a.id and ap.status = 'bevestigd')
   order by a.starts_at;
$$;

create or replace function public.book_slot(p_slot_id uuid, p_project_id uuid, p_notes text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_slot public.availability;
  v_id uuid;
begin
  if not (public.owns_project(p_project_id) or public.is_admin()) then
    raise exception 'Geen toegang tot dit project';
  end if;

  select * into v_slot from public.availability where id = p_slot_id for update;
  if not found then
    raise exception 'Dit moment bestaat niet meer';
  end if;
  if v_slot.starts_at < now() + interval '24 hours' and not public.is_admin() then
    raise exception 'Dit moment ligt te dichtbij om nog te boeken';
  end if;
  if exists (select 1 from public.appointments
              where availability_id = p_slot_id and status = 'bevestigd') then
    raise exception 'Dit moment is net door iemand anders geboekt';
  end if;

  insert into public.appointments (project_id, availability_id, starts_at, ends_at, notes)
  values (p_project_id, p_slot_id, v_slot.starts_at, v_slot.ends_at, p_notes)
  returning id into v_id;

  perform public.advance_project_status(p_project_id, 'shoot_gepland');
  return v_id;
end $$;

create or replace function public.reschedule_appointment(p_appointment_id uuid, p_new_slot_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_appt public.appointments;
  v_slot public.availability;
begin
  select * into v_appt from public.appointments where id = p_appointment_id for update;
  if not found or not (public.owns_project(v_appt.project_id) or public.is_admin()) then
    raise exception 'Afspraak niet gevonden';
  end if;
  if v_appt.status <> 'bevestigd' then
    raise exception 'Deze afspraak kan niet meer verzet worden';
  end if;
  if v_appt.starts_at < now() + interval '24 hours' and not public.is_admin() then
    raise exception 'Verzetten kan tot 24 uur voor de shoot. Stuur me even een bericht.';
  end if;

  select * into v_slot from public.availability where id = p_new_slot_id for update;
  if not found then
    raise exception 'Dit moment bestaat niet meer';
  end if;
  if v_slot.starts_at < now() + interval '24 hours' and not public.is_admin() then
    raise exception 'Dit moment ligt te dichtbij om nog te boeken';
  end if;
  if exists (select 1 from public.appointments
              where availability_id = p_new_slot_id and status = 'bevestigd' and id <> p_appointment_id) then
    raise exception 'Dit moment is net door iemand anders geboekt';
  end if;

  update public.appointments
     set availability_id = p_new_slot_id,
         starts_at = v_slot.starts_at,
         ends_at = v_slot.ends_at,
         reminder_sent_at = null
   where id = p_appointment_id;
  return p_appointment_id;
end $$;

create or replace function public.cancel_appointment(p_appointment_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_appt public.appointments;
begin
  select * into v_appt from public.appointments where id = p_appointment_id for update;
  if not found or not (public.owns_project(v_appt.project_id) or public.is_admin()) then
    raise exception 'Afspraak niet gevonden';
  end if;
  if v_appt.status <> 'bevestigd' then
    raise exception 'Deze afspraak is al geannuleerd of afgerond';
  end if;
  if v_appt.starts_at < now() + interval '24 hours' and not public.is_admin() then
    raise exception 'Annuleren kan tot 24 uur voor de shoot. Stuur me even een bericht.';
  end if;
  update public.appointments set status = 'geannuleerd' where id = p_appointment_id;
end $$;

-- -----------------------------------------------------------------------------
-- accept_quote: accepteert een offerte en maakt direct de overeenkomst aan
-- -----------------------------------------------------------------------------

create or replace function public.render_template(p_body text, p_vars jsonb)
returns text language plpgsql immutable as $$
declare
  k text;
  v text;
  r text := p_body;
begin
  for k, v in select key, value from jsonb_each_text(p_vars) loop
    r := replace(r, '{{' || k || '}}', coalesce(v, ''));
  end loop;
  return r;
end $$;

create or replace function public.accept_quote(p_quote_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_quote public.quotes;
  v_project public.projects;
  v_client public.clients;
  v_tpl public.agreement_templates;
  v_usage text;
  v_rounds int;
  v_agreement_id uuid;
begin
  select * into v_quote from public.quotes where id = p_quote_id for update;
  if not found or not public.owns_project(v_quote.project_id) then
    raise exception 'Offerte niet gevonden';
  end if;
  if v_quote.status not in ('verstuurd', 'vraag') then
    raise exception 'Deze offerte kan niet (meer) geaccepteerd worden';
  end if;
  if v_quote.valid_until is not null and v_quote.valid_until < current_date then
    update public.quotes set status = 'verlopen' where id = p_quote_id;
    raise exception 'Deze offerte is verlopen. Vraag gerust een nieuwe aan.';
  end if;

  update public.quotes
     set status = 'geaccepteerd', accepted_at = now(), accepted_by = auth.uid()
   where id = p_quote_id;

  select * into v_project from public.projects where id = v_quote.project_id;
  select * into v_client from public.clients where id = v_project.client_id;
  select * into v_tpl from public.agreement_templates where is_default limit 1;
  if not found then
    select * into v_tpl from public.agreement_templates order by updated_at desc limit 1;
  end if;

  v_usage := coalesce(nullif(v_quote.usage_rights, ''), v_tpl.default_usage_rights, 'Gebruik voor eigen (social) media en website.');
  v_rounds := coalesce(v_quote.revision_rounds, v_tpl.default_revision_rounds, 1);

  insert into public.agreements (project_id, quote_id, title, body, usage_rights, revision_rounds)
  values (
    v_quote.project_id,
    v_quote.id,
    'Overeenkomst ' || v_quote.number,
    public.render_template(coalesce(v_tpl.body, ''), jsonb_build_object(
      'klant_naam', coalesce(v_client.full_name, v_client.email),
      'klant_email', v_client.email,
      'bedrijf', coalesce(v_client.company, ''),
      'project', v_project.title,
      'offerte_nummer', v_quote.number,
      'totaal', to_char(v_quote.total, 'FM999G999G990D00'),
      'gebruiksrechten', v_usage,
      'bewerkingsrondes', v_rounds::text,
      'datum', to_char(now() at time zone 'Europe/Amsterdam', 'DD-MM-YYYY')
    )),
    v_usage,
    v_rounds
  )
  on conflict (quote_id) do update set status = 'te_ondertekenen'
  returning id into v_agreement_id;

  return v_agreement_id;
end $$;

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  sender_id   uuid references public.profiles (id) on delete set null,
  body        text not null check (length(body) between 1 and 5000),
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index messages_project_idx on public.messages (project_id, created_at);

create or replace function public.mark_messages_read(p_project_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.owns_project(p_project_id) or public.is_admin()) then
    raise exception 'Geen toegang';
  end if;
  update public.messages
     set read_at = now()
   where project_id = p_project_id
     and read_at is null
     and sender_id is distinct from auth.uid();
end $$;

-- -----------------------------------------------------------------------------
-- galleries + files
-- -----------------------------------------------------------------------------

create table public.galleries (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects (id) on delete cascade,
  title               text not null,
  description         text,
  shoot_date          date,
  published           boolean not null default false,
  published_at        timestamptz,
  downloads_unlocked  boolean not null default false,
  created_at          timestamptz not null default now()
);
create index galleries_project_idx on public.galleries (project_id);

create or replace function public.gallery_published()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.published and not coalesce(old.published, false) then
    new.published_at = now();
    perform public.advance_project_status(new.project_id, 'opgeleverd');
  end if;
  return new;
end $$;
create trigger galleries_publish before insert or update of published on public.galleries
  for each row execute function public.gallery_published();

create table public.files (
  id             uuid primary key default gen_random_uuid(),
  gallery_id     uuid not null references public.galleries (id) on delete cascade,
  original_path  text not null,
  preview_path   text,
  file_name      text not null,
  mime_type      text,
  width          int,
  height         int,
  size_bytes     bigint,
  is_favorite    boolean not null default false,
  sort           int not null default 0,
  created_at     timestamptz not null default now()
);
create index files_gallery_idx on public.files (gallery_id, sort);

create or replace function public.can_view_gallery(p_gallery_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.galleries g
     where g.id = p_gallery_id and g.published and public.owns_project(g.project_id)
  );
$$;

create or replace function public.can_download_gallery(p_gallery_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.galleries g
      join public.projects p on p.id = g.project_id
     where g.id = p_gallery_id
       and g.published
       and public.owns_project(g.project_id)
       and (g.downloads_unlocked or p.payment_status = 'betaald')
  );
$$;

create or replace function public.toggle_favorite(p_file_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_gallery uuid;
  v_new boolean;
begin
  select gallery_id into v_gallery from public.files where id = p_file_id;
  if v_gallery is null or not public.can_view_gallery(v_gallery) then
    raise exception 'Bestand niet gevonden';
  end if;
  update public.files set is_favorite = not is_favorite where id = p_file_id
  returning is_favorite into v_new;
  return v_new;
end $$;

create or replace function public.set_portfolio_consent(p_project_id uuid, p_consent boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.owns_project(p_project_id) or public.is_admin()) then
    raise exception 'Geen toegang';
  end if;
  update public.projects
     set portfolio_consent = p_consent,
         portfolio_consent_at = case when p_consent then now() else null end
   where id = p_project_id;
end $$;

-- -----------------------------------------------------------------------------
-- invoices (facturatie later via Mollie / Moneybird)
-- -----------------------------------------------------------------------------

create table public.invoices (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  number          text not null,
  amount          numeric(10, 2),
  payment_status  text not null default 'open' check (payment_status in ('open', 'deels', 'betaald')),
  due_date        date,
  file_path       text,
  provider        text,           -- 'mollie' | 'moneybird' | null
  external_id     text,
  created_at      timestamptz not null default now()
);
create index invoices_project_idx on public.invoices (project_id);

-- -----------------------------------------------------------------------------
-- articles (tips / kennisbank)
-- -----------------------------------------------------------------------------

create table public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text,
  body          text not null default '',
  cover_url     text,
  published     boolean not null default false,
  published_at  timestamptz,
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger articles_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- portfolio
-- -----------------------------------------------------------------------------

create table public.portfolio_items (
  id           uuid primary key default gen_random_uuid(),
  title        text,
  category     text not null check (category in ('gym', 'training', 'lifestyle', 'video')),
  image_url    text not null,
  storage_path text,
  video_url    text,
  width        int not null default 1600,
  height       int not null default 2000,
  alt          text,
  featured     boolean not null default false,
  published    boolean not null default true,
  sort         int not null default 0,
  created_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- e-mailsjablonen, instellingen, AVG-verzoeken
-- -----------------------------------------------------------------------------

create table public.email_templates (
  key          text primary key,
  name         text not null,
  description  text,
  subject      text not null,
  body         text not null,
  variables    text[] not null default '{}',
  updated_at   timestamptz not null default now()
);
create trigger email_templates_updated_at before update on public.email_templates
  for each row execute function public.set_updated_at();

create table public.settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

create table public.deletion_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles (id) on delete set null,
  email         text not null,
  reason        text,
  status        text not null default 'open' check (status in ('open', 'afgerond', 'afgewezen')),
  created_at    timestamptz not null default now(),
  processed_at  timestamptz
);

-- =============================================================================
-- Row level security
-- =============================================================================

alter table public.profiles           enable row level security;
alter table public.clients            enable row level security;
alter table public.client_notes       enable row level security;
alter table public.projects           enable row level security;
alter table public.packages           enable row level security;
alter table public.quote_templates    enable row level security;
alter table public.quotes             enable row level security;
alter table public.quote_items        enable row level security;
alter table public.agreement_templates enable row level security;
alter table public.agreements         enable row level security;
alter table public.signatures         enable row level security;
alter table public.availability       enable row level security;
alter table public.appointments       enable row level security;
alter table public.messages           enable row level security;
alter table public.galleries          enable row level security;
alter table public.files              enable row level security;
alter table public.invoices           enable row level security;
alter table public.articles           enable row level security;
alter table public.portfolio_items    enable row level security;
alter table public.email_templates    enable row level security;
alter table public.settings           enable row level security;
alter table public.deletion_requests  enable row level security;

-- Admin mag overal alles.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'clients', 'client_notes', 'projects', 'packages', 'quote_templates', 'quotes',
    'quote_items', 'agreement_templates', 'agreements', 'signatures', 'availability',
    'appointments', 'messages', 'galleries', 'files', 'invoices', 'articles',
    'portfolio_items', 'email_templates', 'settings', 'deletion_requests']
  loop
    execute format(
      'create policy "admin_all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- profiles
create policy "own_profile_select" on public.profiles for select to authenticated
  using (id = auth.uid());

-- clients
create policy "own_client_select" on public.clients for select to authenticated
  using (user_id = auth.uid());
create policy "own_client_update" on public.clients for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- projects
create policy "own_projects_select" on public.projects for select to authenticated
  using (public.owns_project(id));

-- packages / portfolio / settings: publiek leesbaar
create policy "public_packages_select" on public.packages for select to anon, authenticated
  using (active);
create policy "public_portfolio_select" on public.portfolio_items for select to anon, authenticated
  using (published);
create policy "public_settings_select" on public.settings for select to anon, authenticated
  using (true);

-- quotes (concepten blijven verborgen)
create policy "own_quotes_select" on public.quotes for select to authenticated
  using (status <> 'concept' and public.owns_project(project_id));
create policy "own_quote_items_select" on public.quote_items for select to authenticated
  using (exists (select 1 from public.quotes q
                  where q.id = quote_id and q.status <> 'concept' and public.owns_project(q.project_id)));

-- agreements + signatures (ondertekenen gaat via de server met service role)
create policy "own_agreements_select" on public.agreements for select to authenticated
  using (public.owns_project(project_id));
create policy "own_signatures_select" on public.signatures for select to authenticated
  using (exists (select 1 from public.agreements a
                  where a.id = agreement_id and public.owns_project(a.project_id)));

-- appointments (wijzigen via RPC)
create policy "own_appointments_select" on public.appointments for select to authenticated
  using (public.owns_project(project_id));

-- messages
create policy "own_messages_select" on public.messages for select to authenticated
  using (public.owns_project(project_id));
create policy "own_messages_insert" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and read_at is null and public.owns_project(project_id));

-- galleries + files
create policy "own_galleries_select" on public.galleries for select to authenticated
  using (published and public.owns_project(project_id));
create policy "own_files_select" on public.files for select to authenticated
  using (public.can_view_gallery(gallery_id));

-- invoices
create policy "own_invoices_select" on public.invoices for select to authenticated
  using (public.owns_project(project_id));

-- articles: gepubliceerde tips voor ingelogde klanten
create policy "published_articles_select" on public.articles for select to authenticated
  using (published);

-- AVG-verwijderverzoeken
create policy "own_deletion_select" on public.deletion_requests for select to authenticated
  using (user_id = auth.uid());
create policy "own_deletion_insert" on public.deletion_requests for insert to authenticated
  with check (user_id = auth.uid() and status = 'open');

-- RPC's alleen voor ingelogde gebruikers
revoke execute on function public.book_slot(uuid, uuid, text) from public, anon;
revoke execute on function public.reschedule_appointment(uuid, uuid) from public, anon;
revoke execute on function public.cancel_appointment(uuid) from public, anon;
revoke execute on function public.accept_quote(uuid) from public, anon;
revoke execute on function public.mark_messages_read(uuid) from public, anon;
revoke execute on function public.toggle_favorite(uuid) from public, anon;
revoke execute on function public.set_portfolio_consent(uuid, boolean) from public, anon;
revoke execute on function public.open_slots(timestamptz, timestamptz) from public, anon;
revoke execute on function public.recalc_quote(uuid) from public, anon;
grant execute on function public.book_slot(uuid, uuid, text) to authenticated;
grant execute on function public.reschedule_appointment(uuid, uuid) to authenticated;
grant execute on function public.cancel_appointment(uuid) to authenticated;
grant execute on function public.accept_quote(uuid) to authenticated;
grant execute on function public.mark_messages_read(uuid) to authenticated;
grant execute on function public.toggle_favorite(uuid) to authenticated;
grant execute on function public.set_portfolio_consent(uuid, boolean) to authenticated;
grant execute on function public.open_slots(timestamptz, timestamptz) to authenticated;

-- =============================================================================
-- Storage
--   portfolio : publiek (geoptimaliseerd via next/image)
--   previews  : privé, webformaat voor de klantgalerij
--   originals : privé, hoge resolutie
--   documents : privé, facturen en overige pdf's
-- Privé-bestanden worden server-side via signed URLs geserveerd na een RLS-check.
-- =============================================================================

insert into storage.buckets (id, name, public) values
  ('portfolio', 'portfolio', true),
  ('previews',  'previews',  false),
  ('originals', 'originals', false),
  ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "portfolio_public_read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'portfolio');
create policy "admin_storage_all" on storage.objects for all to authenticated
  using (bucket_id in ('portfolio', 'previews', 'originals', 'documents') and public.is_admin())
  with check (bucket_id in ('portfolio', 'previews', 'originals', 'documents') and public.is_admin());

-- Realtime voor berichten
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
