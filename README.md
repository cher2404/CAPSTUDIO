# CAP Studio

Website en klantportaal voor **CAP Studio**, het merk van Cheryl Aldessa Prijs: foto en video voor sport en lifestyle.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (auth, database, storage, RLS) · Resend · Vercel

Het plan van aanpak en de architectuur staan in [`docs/PLAN.md`](docs/PLAN.md), het databaseschema in [`supabase/migrations`](supabase/migrations).

## Wat zit erin

**Publieke site**: home met fullscreen hero, portfolio (masonry, filters, lightbox, showreel), diensten en tarieven, over mij, contact (maakt direct een klant en project aan), privacyverklaring, algemene voorwaarden, cookiebanner, sitemap, robots, Open Graph-beeld en JSON-LD.

**Klantportaal** (`/portal`, inloggen met magic link):
dashboard · afspraken (zelf boeken, verzetten en annuleren tot 24 uur vooraf, bevestiging met .ics, herinnering) · offertes (accepteren of vraag stellen, pdf) · overeenkomsten (automatisch na acceptatie, digitaal ondertekenen met naam, tijd, IP en SHA-256 hash, pdf) · berichten per project (realtime, e-mailnotificatie) · privé galerijen (favorieten, download in hoge resolutie na betaling of vrijgave) · tips · documenten · account (gegevens wijzigen, portfoliotoestemming per project, gegevens downloaden, verwijderverzoek).

**Admin** (`/admin`): overzicht en pipeline · klanten en projecten (status, betaalstatus, notities, facturen) · offertes vanuit sjablonen · offertesjablonen · overeenkomstsjabloon · agenda en beschikbaarheid · galerijen (drag-and-drop upload, webversies worden in de browser gemaakt) · portfolio · pakketten · tips · alle e-mailsjablonen met live voorbeeld en testmail · instellingen, AVG-verzoeken en e-maillog.

## Installatie

### 1. Supabase

1. Maak een project aan op [supabase.com](https://supabase.com), bij voorkeur in regio **eu-central-1 (Frankfurt)**.
2. Voer de migraties uit, in volgorde. Dat kan via de SQL-editor (plak de bestanden uit `supabase/migrations/`) of met de CLI:
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push
   ```
3. **Authentication → URL Configuration**: zet de *Site URL* op je domein en voeg `https://jouwdomein.nl/auth/confirm` toe aan de *Redirect URLs* (voor lokaal ook `http://localhost:3000/auth/confirm`).
4. Alleen als je géén Resend gebruikt: pas bij **Authentication → Email Templates → Magic Link** de link aan naar
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink`.

### 2. Admin-account

Log één keer in op `/login` met het adres uit `ADMIN_EMAIL`. Maak jezelf daarna admin in de SQL-editor:

```sql
update public.profiles set role = 'admin', full_name = 'Cheryl Aldessa Prijs'
where email = 'hallo@capstudio.nl';
```

### 3. Resend

Maak een API-key aan op [resend.com](https://resend.com) en verifieer je domein. Het adres in `EMAIL_FROM` moet op dat domein staan. Alle mails, ook de inloglink, gebruiken de sjablonen uit `/admin/emails`.

### 4. Lokaal draaien

```bash
cp .env.example .env.local   # en vul in
npm install
npm run dev
```

Zonder Supabase-variabelen draait de publieke site op voorbeelddata. Het portaal werkt dan niet.

### 5. Deploy op Vercel

1. Importeer de repository in Vercel.
2. Zet alle variabelen uit `.env.example` bij *Environment Variables*.
3. `vercel.json` bevat een dagelijkse cron (18:00 NL-tijd) die herinneringen stuurt voor alle shoots van de volgende dag. Vercel roept hem aan met `CRON_SECRET`.
   - **Precies 24 uur vooraf?** Op Vercel Pro zet je de schedule op `0 * * * *` en `REMINDER_WINDOW_HOURS=24`. Gratis alternatief: laat Supabase `pg_cron` + `pg_net` elk uur `GET /api/cron/reminders` aanroepen met de header `Authorization: Bearer <CRON_SECRET>`.

### 6. Optioneel: Google Calendar

Maak in Google Cloud een OAuth-client (type *Web*) met de Calendar API aan. Haal via de [OAuth Playground](https://developers.google.com/oauthplayground) een refresh token op met scope `https://www.googleapis.com/auth/calendar.events`. Vul daarna de `GOOGLE_*` variabelen in. Boekingen, verzettingen en annuleringen komen dan automatisch in je agenda. Klanten krijgen altijd een `.ics`-uitnodiging, ook zonder deze koppeling.

## Eerste stappen na livegang

1. Pas `NEXT_PUBLIC_KVK`, e-mail en Instagram aan.
2. Upload je eigen werk via **Admin → Portfolio**. De voorbeeldfoto's (Unsplash) verdwijnen zodra er één eigen foto staat. Vink bij je beste foto **Hero** aan voor de homepage.
3. Zet je showreel en portretfoto bij **Admin → Instellingen**.
4. Loop de pakketten, offertesjablonen, het overeenkomstsjabloon en de e-mailteksten na.
5. Laat de privacyverklaring, de algemene voorwaarden en de overeenkomst juridisch checken. De teksten zijn een stevige basis, maar geen juridisch advies.
6. Zet momenten open bij **Admin → Agenda**.

## Facturatie later toevoegen

`projects.payment_status` en de tabel `invoices` (met `provider` en `external_id`) zijn al voorbereid. Een webhook van Mollie of Moneybird hoeft alleen `invoices.payment_status` bij te werken en daarna `projects.payment_status` (zie `updateInvoiceStatus` in `src/app/admin/_actions/crm.ts`). Staat een project op *betaald*, dan gaan de downloads automatisch open.

## Beveiliging in het kort

* Row level security op alle tabellen: klanten zien alleen hun eigen data.
* Statuswijzigingen (boeken, verzetten, accepteren, favorieten, toestemming) lopen via `security definer`-functies die eigenaarschap controleren.
* Handtekeningen en verwijderingen gaan alleen server-side via de service role.
* Privébestanden zijn alleen bereikbaar via kortlevende signed URLs.
* Inloglinks worden alleen verstuurd naar bekende klanten, maximaal drie per kwartier, en vragen eerst om een klik op een knop (zodat linkscanners in mailprogramma's de link niet verbruiken).
