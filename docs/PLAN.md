# CAP Studio – plan van aanpak

Website + klantportal voor **CAP Studio** (Cheryl Aldessa Prijs), foto en video voor sport en lifestyle.

## Stack

| Onderdeel | Keuze |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions), TypeScript |
| Styling | Tailwind CSS v4, fonts via `next/font` (Cormorant Garamond voor koppen, Inter voor tekst) |
| Backend | Supabase: Postgres + Row Level Security, Auth (magic link), Storage |
| E-mail | Resend, met sjablonen uit de database (door admin aanpasbaar) |
| PDF | `@react-pdf/renderer` (offertes en overeenkomsten) |
| Hosting | Vercel (+ Vercel Cron voor herinneringen) |
| Agenda | Optioneel: Google Calendar via OAuth refresh token, altijd een `.ics` bij de bevestigingsmail |

## Structuur

```
src/app
├── (site)/            publieke website: home, portfolio, diensten, over-mij, contact, privacy, voorwaarden
├── login/             magic link inloggen
├── auth/confirm/      verifieert de magic link (token_hash) en zet de sessie
├── portal/            klantportal (alleen ingelogd)
│   ├── afspraken, offertes, overeenkomsten, berichten, galerijen, tips, documenten, account
├── admin/             beheer (alleen role = admin)
│   ├── klanten, projecten, offertes, sjablonen, overeenkomst, agenda, galerijen, tips, portfolio, pakketten, emails, instellingen
└── api/
    ├── cron/reminders           herinnering 24 uur vooraf
    ├── pdf/quote/[id]           offerte als pdf
    ├── pdf/agreement/[id]       overeenkomst als pdf
    └── files/[id]/download      signed download-url voor hoge resolutie
```

## Beveiliging

* **RLS op alle tabellen.** Klanten zien alleen rijen die via `clients.user_id = auth.uid()` bij hen horen. De admin (`profiles.role = 'admin'`) ziet alles.
* Gevoelige acties lopen via `security definer` functies die zelf controleren of de gebruiker eigenaar is:
  `book_slot`, `reschedule_appointment`, `cancel_appointment`, `accept_quote`, `toggle_favorite`, `set_portfolio_consent`.
* **Handtekeningen** worden alleen server-side geschreven (service role), zodat naam, tijdstip, IP-adres en user agent niet door de klant te vervalsen zijn. De tekst van de overeenkomst wordt bij ondertekening vastgelegd met een SHA-256 hash.
* Storage: `portfolio` is publiek (voor snelle, geoptimaliseerde beelden). `previews` en `originals` zijn privé en alleen via signed URLs bereikbaar. Originelen zijn pas te downloaden als de galerij vrijgegeven is of de betaalstatus `betaald` is.

## Statusflow van een project

`aanvraag → offerte → akkoord → shoot_gepland → bewerking → opgeleverd`

De status verandert automatisch:

* offerte verstuurd → `offerte`
* offerte geaccepteerd → `akkoord`
* shoot geboekt → `shoot_gepland`
* galerij gepubliceerd → `opgeleverd`

De admin kan de status ook altijd handmatig zetten.

## Bouwvolgorde

1. Plan + databaseschema (`supabase/migrations`)
2. Publieke site, design system, SEO, cookiebanner, admin-login
3. Portal-basis: dashboard, account (AVG), berichten
4. Afspraken (beschikbaarheid, boeken, verzetten, annuleren, mails, cron, Google Calendar)
5. Offertes (sjablonen, versturen, accepteren, vraag stellen) en overeenkomsten (sjabloon, ondertekenen, pdf)
6. Galerijen (upload met previews, favorieten, downloads) en tips/kennisbank
7. Admin: portfolio, e-mailsjablonen, instellingen

## Later toe te voegen: facturatie

`projects.payment_status` (`open`, `deels`, `betaald`) en de tabel `invoices` (met `provider` en `external_id`) zijn al voorbereid op Mollie of Moneybird. Een webhook kan later `payment_status` bijwerken. Daarmee gaan downloads automatisch open.
