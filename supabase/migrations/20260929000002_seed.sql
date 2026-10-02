-- =============================================================================
-- CAP Media Studio – startdata (pakketten, sjablonen, e-mails, tips, instellingen)
-- Alles is daarna aan te passen in /admin.
-- =============================================================================

-- Prijzen worden excl. btw opgeslagen. 175 / 1.21 enz., zodat de website bij "incl. btw" exact €175 toont.
-- Categorieën: beeld (foto en video), digitaal (apps en websites), games.
insert into public.packages (slug, name, tagline, price, price_label, duration, features, category, highlighted, active, sort) values
  ('mini', 'Mini shoot', 'Ideaal voor een nieuwe profielset of snelle content.', round(175 / 1.21, 4), '', '1 uur',
   array['1 uur shoot', '12 bewerkte foto''s', 'Online galerij'], 'beeld', false, true, 1),
  ('halve-dag', 'Halve dag', 'Voor trainers, coaches en kleine merken.', round(395 / 1.21, 4), '', '3 uur',
   array['3 uur shoot', '25 bewerkte foto''s', 'Verschillende looks of locaties'], 'beeld', true, true, 2),
  ('foto-video', 'Foto en video', 'Compleet contentpakket.', round(595 / 1.21, 4), 'vanaf', 'Halve dag',
   array['Halve dag shoot', '25 bewerkte foto''s', 'Een korte reel voor social media'], 'beeld', false, true, 3),
  ('op-maat', 'Op maat', 'Voor je sportschool of merk.', null, '', 'In overleg',
   array['Meerdere shoots', 'Een maandpakket', 'Of een grotere productie'], 'beeld', false, true, 4),
  ('website', 'Website', 'Een snelle, strakke site die past bij je merk, met beelden die kloppen.', null, '', 'Ontwerp en bouw',
   array['Ontwerp in je eigen stijl', 'Gebouwd voor mobiel en snelheid', 'Zelf teksten en beelden beheren'], 'digitaal', false, true, 10),
  ('app', 'App of webapp', 'Van idee tot werkende app: een klantportaal, boekingssysteem of je eigen tool.', null, '', 'Op maat',
   array['Concept en ontwerp', 'Web of mobiel', 'Doorontwikkeling mogelijk'], 'digitaal', false, true, 11),
  ('game', 'Game of interactief', 'Een game, interactieve ervaring of iets speels voor je merk.', null, '', 'Op maat',
   array['Concept en prototype', 'Web of mobiel', 'In overleg'], 'games', false, false, 20)
on conflict (slug) do nothing;

-- Offertesjablonen op basis van de pakketten (regels excl. btw).
insert into public.quote_templates (name, package_id, title, intro, items, validity_days, usage_rights, revision_rounds)
select p.name, p.id, p.name,
       'Leuk dat je met CAP Media Studio aan de slag wilt! Hieronder vind je de offerte op basis van ons gesprek. Vragen? Stel ze gerust via de knop onderaan.',
       case when p.price is null then '[]'::jsonb
            else jsonb_build_array(jsonb_build_object(
              'description', p.name || ': ' || array_to_string(p.features, ', '),
              'quantity', 1,
              'unit_price', round(p.price, 2)))
       end,
       14,
       case when p.category = 'beeld'
            then 'Gebruik voor je eigen social media en website, onbeperkt in tijd. Gebruik voor betaalde advertenties alleen na aparte afspraak.'
            else 'Na volledige betaling krijg je het gebruiksrecht op het opgeleverde werk voor je eigen organisatie.' end,
       case when p.category = 'beeld' then 1 else 2 end
  from public.packages p;

insert into public.agreement_templates (name, is_default, default_usage_rights, default_revision_rounds, body) values
('Foto en video (standaard)', true, 'Gebruik voor je eigen social media en website, onbeperkt in tijd. Gebruik voor betaalde advertenties alleen na aparte afspraak.', 1,
$tpl$# Overeenkomst fotografie en video

**Tussen** CAP Media Studio (Cheryl Aldessa Prijs), hierna "de fotograaf",
**en** {{klant_naam}} {{bedrijf}} ({{klant_email}}), hierna "de opdrachtgever".

Datum: {{datum}}
Project: {{project}}
Op basis van offerte: {{offerte_nummer}} (totaal € {{totaal}} incl. btw)

## 1. De opdracht
De fotograaf verzorgt de shoot zoals beschreven in offerte {{offerte_nummer}}. Datum, tijd en locatie worden vastgelegd in het klantportaal.

## 2. Oplevering en bewerkingsrondes
De bewerkte beelden worden geleverd via een privé online galerij. Bij deze opdracht horen **{{bewerkingsrondes}} bewerkingsronde(s)**. Extra rondes worden in overleg gefactureerd.

## 3. Gebruiksrechten
{{gebruiksrechten}}

Het auteursrecht blijft bij de fotograaf. Doorverkopen of het gebruik door derden is alleen toegestaan na schriftelijke toestemming. Bij publicatie wordt waar mogelijk @capmediastudio vermeld.

## 4. Portfolio
De fotograaf gebruikt beelden alleen in haar portfolio of op social media als de opdrachtgever daar in het portaal toestemming voor geeft.

## 5. Betaling
Betaling volgens de factuur, binnen 14 dagen na factuurdatum. Hoge-resolutiebestanden zijn te downloaden zodra de betaling binnen is.

## 6. Annuleren en verzetten
Verzetten of annuleren kan kosteloos tot 24 uur voor de shoot via het klantportaal. Daarna kan de fotograaf 50% van het shootbedrag in rekening brengen.

## 7. Aansprakelijkheid en voorwaarden
Op deze overeenkomst zijn de algemene voorwaarden van CAP Media Studio van toepassing. De aansprakelijkheid van de fotograaf is beperkt tot het factuurbedrag.

Door digitaal te ondertekenen gaat de opdrachtgever akkoord met deze overeenkomst. Naam, datum, tijd en IP-adres worden vastgelegd.
$tpl$);

insert into public.agreement_templates (name, category, is_default, default_usage_rights, default_revision_rounds, body) values
('Digitaal project (websites, apps, games)', 'digitaal', false, 'Na volledige betaling krijg je het gebruiksrecht op het opgeleverde werk voor je eigen organisatie.', 2,
$tpl$# Overeenkomst digitaal project

**Tussen** CAP Media Studio (Cheryl Aldessa Prijs), hierna "de opdrachtnemer",
**en** {{klant_naam}} {{bedrijf}} ({{klant_email}}), hierna "de opdrachtgever".

Datum: {{datum}}
Project: {{project}}
Op basis van offerte: {{offerte_nummer}} (totaal € {{totaal}} incl. btw)

## 1. De opdracht
De opdrachtnemer ontwerpt en bouwt het project zoals beschreven in offerte {{offerte_nummer}}. Wijzigingen in de scope worden vooraf besproken en zo nodig apart geoffreerd.

## 2. Feedbackrondes
Bij deze opdracht horen **{{bewerkingsrondes}} feedbackronde(s)** op het ontwerp en de oplevering. Extra rondes worden in overleg gefactureerd.

## 3. Gebruiksrechten
{{gebruiksrechten}}

Herbruikbare onderdelen, eigen tools en code-bibliotheken van de opdrachtnemer blijven haar eigendom; de opdrachtgever krijgt daarvan een gebruiksrecht voor dit project. Software van derden (zoals open source) valt onder de licentie van die partij.

## 4. Hosting, accounts en onderhoud
Hosting, domeinnamen en accounts van externe diensten staan bij voorkeur op naam van de opdrachtgever. Onderhoud en doorontwikkeling na oplevering zijn niet inbegrepen, tenzij anders afgesproken.

## 5. Portfolio
De opdrachtnemer toont het project alleen in haar portfolio als de opdrachtgever daar in het portaal toestemming voor geeft.

## 6. Betaling
Betaling volgens de factuur, binnen 14 dagen na factuurdatum. Bij grotere projecten kan in termijnen worden gefactureerd.

## 7. Aansprakelijkheid en voorwaarden
Op deze overeenkomst zijn de algemene voorwaarden van CAP Media Studio van toepassing. De aansprakelijkheid van de opdrachtnemer is beperkt tot het factuurbedrag.

Door digitaal te ondertekenen gaat de opdrachtgever akkoord met deze overeenkomst. Naam, datum, tijd en IP-adres worden vastgelegd.
$tpl$);

insert into public.email_templates (key, name, description, subject, body, variables) values
('login_link', 'Inloglink', 'Magic link om in te loggen op het portaal', 'Je inloglink voor CAP Media Studio',
$b$Hoi{{naam_komma}}

Klik op de knop hieronder om in te loggen op je CAP Media Studio-portaal. De link is 1 uur geldig en werkt één keer.

[Inloggen]({{link}})

Heb je deze mail niet aangevraagd? Dan kun je hem gewoon negeren.$b$,
 array['naam_komma', 'link']),

('contact_confirmation', 'Bevestiging contactaanvraag', 'Naar de klant na het contactformulier', 'Thanks voor je bericht!',
$b$Hoi {{naam}},

Thanks voor je bericht! Ik lees alles zelf en kom binnen twee werkdagen bij je terug.

Ondertussen kun je al inloggen op je persoonlijke portaal. Daar komen straks je offerte, afspraken en foto's te staan.

[Naar je portaal]({{portal_link}})

Groet,
Cheryl – CAP Media Studio$b$,
 array['naam', 'portal_link']),

('contact_admin', 'Nieuwe aanvraag (voor jou)', 'Naar jou bij een nieuwe aanvraag', 'Nieuwe aanvraag van {{naam}}',
$b$Nieuwe aanvraag via de website.

**Naam:** {{naam}}
**E-mail:** {{email}}
**Soort project:** {{type}}
**Bericht:**

{{bericht}}

[Open in admin]({{admin_link}})$b$,
 array['naam', 'email', 'type', 'bericht', 'admin_link']),

('appointment_confirmed', 'Afspraak bevestigd', 'Na het boeken van een afspraak', 'Je afspraak staat gepland: {{datum}}',
$b$Hoi {{naam}},

Top, onze afspraak staat vast!

**Wanneer:** {{datum}}, {{tijd}}
**Project:** {{project}}

In de bijlage zit een agenda-uitnodiging. Verzetten of annuleren kan tot 24 uur van tevoren in je portaal.

Gaan we shooten? Lees dan vast [Zo bereid je je voor]({{tips_link}}).

[Bekijk je afspraak]({{link}})

Tot dan!
Cheryl$b$,
 array['naam', 'datum', 'tijd', 'project', 'link', 'tips_link']),

('appointment_rescheduled', 'Afspraak verzet', 'Na het verzetten van een afspraak', 'Je afspraak is verzet naar {{datum}}',
$b$Hoi {{naam}},

Je afspraak is verzet. Dit is het nieuwe moment:

**Wanneer:** {{datum}}, {{tijd}}
**Project:** {{project}}

[Bekijk je afspraak]({{link}})

Groet,
Cheryl$b$,
 array['naam', 'datum', 'tijd', 'project', 'link']),

('appointment_cancelled', 'Afspraak geannuleerd', 'Na het annuleren van een afspraak', 'Je afspraak op {{datum}} is geannuleerd',
$b$Hoi {{naam}},

Je afspraak op {{datum}} om {{tijd}} is geannuleerd. Wil je een nieuw moment kiezen? Dat kan altijd in je portaal.

[Kies een nieuw moment]({{link}})

Groet,
Cheryl$b$,
 array['naam', 'datum', 'tijd', 'project', 'link']),

('appointment_reminder', 'Herinnering (24 uur vooraf)', 'Automatisch 24 uur voor de afspraak', 'Morgen is het zover!',
$b$Hoi {{naam}},

Nog even en we zien elkaar!

**Wanneer:** {{datum}}, {{tijd}}
**Project:** {{project}}

Gaan we shooten? Check dan nog even de [tips voor je shoot]({{tips_link}}).

[Bekijk je afspraak]({{link}})

Tot morgen!
Cheryl$b$,
 array['naam', 'datum', 'tijd', 'project', 'link', 'tips_link']),

('appointment_admin', 'Afspraak gewijzigd (voor jou)', 'Naar jou bij boeken, verzetten of annuleren', '{{actie}}: {{naam}} op {{datum}}',
$b$**{{actie}}**

**Klant:** {{naam}}
**Wanneer:** {{datum}}, {{tijd}}
**Project:** {{project}}

[Open in admin]({{admin_link}})$b$,
 array['actie', 'naam', 'datum', 'tijd', 'project', 'admin_link']),

('quote_sent', 'Offerte verstuurd', 'Als je een offerte verstuurt', 'Je offerte van CAP Media Studio ({{nummer}})',
$b$Hoi {{naam}},

Je offerte voor **{{project}}** staat klaar in je portaal.

**Totaal:** € {{totaal}} incl. btw
**Geldig tot:** {{geldig_tot}}

Je kunt de offerte daar direct accepteren of een vraag stellen.

[Bekijk je offerte]({{link}})

Groet,
Cheryl$b$,
 array['naam', 'project', 'nummer', 'totaal', 'geldig_tot', 'link']),

('quote_accepted', 'Offerte geaccepteerd (voor jou)', 'Naar jou als een klant accepteert', '{{naam}} heeft offerte {{nummer}} geaccepteerd',
$b$Goed nieuws! **{{naam}}** heeft offerte **{{nummer}}** geaccepteerd (€ {{totaal}}).

De overeenkomst is automatisch aangemaakt en klaargezet om te ondertekenen.

[Open in admin]({{admin_link}})$b$,
 array['naam', 'nummer', 'totaal', 'admin_link']),

('quote_question', 'Vraag over offerte (voor jou)', 'Naar jou als een klant een vraag stelt', 'Vraag over offerte {{nummer}}',
$b$**{{naam}}** heeft een vraag over offerte **{{nummer}}**:

{{vraag}}

[Beantwoorden]({{admin_link}})$b$,
 array['naam', 'nummer', 'vraag', 'admin_link']),

('agreement_ready', 'Overeenkomst klaar', 'Na het accepteren van een offerte', 'Je overeenkomst staat klaar om te ondertekenen',
$b$Hoi {{naam}},

Thanks voor je akkoord! De overeenkomst voor **{{project}}** staat klaar. Lees hem rustig door en onderteken digitaal, dat duurt nog geen minuut.

[Overeenkomst bekijken]({{link}})

Groet,
Cheryl$b$,
 array['naam', 'project', 'link']),

('agreement_signed', 'Overeenkomst ondertekend', 'Bevestiging na ondertekenen (klant + kopie naar jou)', 'Overeenkomst ondertekend: {{project}}',
$b$Hoi {{naam}},

De overeenkomst voor **{{project}}** is ondertekend op {{datum}}. Je kunt hem altijd downloaden als pdf in je portaal.

[Bekijk en download de pdf]({{link}})

Nu nog een moment plannen, als dat nog niet is gebeurd.

Groet,
Cheryl$b$,
 array['naam', 'project', 'datum', 'link']),

('new_message', 'Nieuw bericht', 'Melding bij een nieuw bericht in het portaal', 'Nieuw bericht over {{project}}',
$b$Hoi {{naam}},

Er is een nieuw bericht over **{{project}}**:

> {{bericht}}

[Beantwoorden]({{link}})$b$,
 array['naam', 'project', 'bericht', 'link']),

('gallery_ready', 'Galerij klaar', 'Als je een galerij publiceert', 'Je foto''s staan klaar!',
$b$Hoi {{naam}},

Het is zover: je foto's van **{{galerij}}** staan online in je privé galerij.

Klik op het hartje bij je favorieten, dan weet ik welke beelden je het mooist vindt. {{download_tekst}}

[Bekijk je galerij]({{link}})

Veel plezier ermee!
Cheryl$b$,
 array['naam', 'galerij', 'download_tekst', 'link']),

('deletion_requested', 'Verwijderverzoek (voor jou)', 'Naar jou als iemand zijn gegevens wil laten verwijderen', 'AVG-verzoek: gegevens verwijderen ({{email}})',
$b$**{{email}}** heeft gevraagd om verwijdering van alle gegevens.

Reden: {{reden}}

Let op: facturen moet je wettelijk 7 jaar bewaren. Handel het verzoek binnen een maand af.

[Open in admin]({{admin_link}})$b$,
 array['email', 'reden', 'admin_link'])
on conflict (key) do nothing;

insert into public.articles (slug, title, excerpt, body, published, published_at, sort) values
('wat-trek-ik-aan', 'Wat trek ik aan tijdens een shoot?',
 'Kleding maakt of breekt het beeld. Met deze tips sta je er op je best op.',
$a$Kleding bepaalt voor een groot deel de sfeer van je foto's. Een paar vuistregels:

## Kies effen kleuren
Rustige, effen kleuren werken het best bij mijn filmische stijl. Denk aan zwart, wit, beige, olijf, bordeaux en diep blauw. Grote logo's en drukke prints trekken de aandacht weg van jou.

## Sportkleding die goed zit
Voor gym- en trainingsshoots: kies kleding die je vaker draagt en waarin je vrij kunt bewegen. Check vooraf of niets doorschijnt bij squats of stretches (de klassieke telefoon-flitstest werkt prima).

## Neem wissels mee
Neem twee tot drie outfits mee, ook als je pakket er maar één bevat. Dan kiezen we samen op locatie.

## Details maken het verschil
- Schone sneakers
- Haarelastiekjes om je pols? Even af
- Nagels en accessoires simpel houden
- Een handdoek en extra shirt voor tussendoor

Twijfel je? Stuur me een foto van je opties via **Berichten**, dan denk ik mee.$a$, true, now(), 1),

('zo-bereid-je-je-voor', 'Zo bereid je je voor',
 'Van goed slapen tot een playlist: zo haal je het meeste uit je shoot.',
$a$Een goede voorbereiding zorgt voor een ontspannen shoot en betere beelden.

## De week ervoor
- Deel je ideeën en voorbeelden via **Berichten**. Screenshots van Instagram zijn perfect.
- Plan je training zo dat je niet stijf en kapot bent op de shootdag.

## De dag ervoor
- Drink genoeg water en slaap goed.
- Leg je outfits klaar en laad je telefoon op (voor je playlist).
- Check de locatie en parkeermogelijkheden.

## Op de dag zelf
- Eet een licht maaltijd een paar uur van tevoren.
- Kom tien minuten eerder, dan hebben we tijd om even in te komen.
- Een pump-up workout vlak voor de shoot? Graag. Dat geeft definitie.

## Zenuwachtig?
Heel normaal. Ik begin altijd rustig met een paar simpele shots en geef tijdens de shoot veel aanwijzingen. Na tien minuten vergeet je de camera.$a$, true, now(), 2)
on conflict (slug) do nothing;

insert into public.settings (key, value) values
  ('reel_url', '""'::jsonb),
  ('hero_image', '""'::jsonb),
  ('booking_lead_hours', '24'::jsonb),
  ('vat_rate', '21'::jsonb),
  ('price_display', '"incl"'::jsonb)
on conflict (key) do nothing;
