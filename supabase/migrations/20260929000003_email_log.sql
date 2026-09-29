-- Log van verstuurde e-mails (voor overzicht in admin en om misbruik van het loginformulier te remmen).
create table public.email_log (
  id          uuid primary key default gen_random_uuid(),
  recipient   text not null,
  template    text not null,
  subject     text,
  status      text not null default 'sent' check (status in ('sent', 'skipped', 'failed')),
  created_at  timestamptz not null default now()
);
create index email_log_recipient_idx on public.email_log (lower(recipient), template, created_at desc);

alter table public.email_log enable row level security;
create policy "admin_all" on public.email_log for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
