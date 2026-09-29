-- =============================================================================
-- CAP Studio – startdata (pakketten, sjablonen, e-mails, tips, instellingen)
-- Alles is daarna aan te passen in /admin.
-- =============================================================================

insert into public.packages (slug, name, tagline, price_from, price_label, duration, features, highlighted, sort) values
  ('kennismaking', 'Kennismakingsshoot', 'Even aftasten, zonder gedoe', 95, 'vanaf', '30 minuten',
   array['Korte intake vooraf', '1 locatie', '10 bewerkte foto''s', 'Online galerij', 'Levering binnen 7 dagen'], false, 1),
  ('mini', 'Mini shoot', 'Snel, strak en to the point', 195, 'vanaf', '1 uur',
   array['Intake en moodboard', '1 locatie, 1 outfitwissel', '25 bewerkte foto''s', '1 bewerkingsronde', 'Online galerij met favorieten'], false, 2),
  ('halve-dag', 'Halve dag', 'Voor merken, coaches en campagnes', 495, 'vanaf', '4 uur',
   array['Uitgebreide briefing en shotlist', 'Tot 2 locaties', '60+ bewerkte foto''s', '2 bewerkingsrondes', 'Gebruiksrechten voor online en social'], true, 3),
  ('foto-video', 'Foto plus video', 'Beeld dat beweegt én blijft hangen', 895, 'vanaf', '4 tot 6 uur',
   array['Foto en video in één dag', '60+ bewerkte foto''s', '1 reel van 30 tot 60 seconden', '3 korte clips voor social', '2 bewerkingsrondes'], false, 4)
on conflict (slug) do nothing;

insert into public.quote_templates (name, package_id, title, intro, items, validity_days, usage_rights, revision_rounds)
select p.name, p.id, p.name,
       'Leuk dat je met CAP Studio wilt shooten! Hieronder vind je de offerte op basis van ons gesprek. Vragen? Stel ze gerust via de knop onderaan.',
       jsonb_build_array(jsonb_build_object('description', p.name || ' (' || p.duration || ')', 'quantity', 1, 'unit_price', round(p.price_from / 1.21, 2)),
                         jsonb_build_object('description', 'Reiskosten', 'quantity', 1, 'unit_price', 0)),
       14,
       case when p.slug in ('halve-dag', 'foto-video')
            then 'Online gebruik op eigen website, social media en betaalde social advertenties, onbeperkt in tijd.'
            else 'Persoonlijk gebruik en eigen social media, onbeperkt in tijd.' end,
       case when p.slug in ('halve-dag', 'foto-video') then 2 else 1 end
  from public.packages p;

insert into public.agreement_templates (name, is_default, default_usage_rights, default_revision_rounds, body) values
('Standaard overeenkomst', true, 'Persoonlijk gebruik en eigen social media, onbeperkt in tijd.', 1,
$tpl$# Overeenkomst fotografie en video

**Tussen** CAP Studio (Cheryl Aldessa Prijs), hierna "de fotograaf",
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

Het auteursrecht blijft bij de fotograaf. Doorverkopen of het gebruik door derden is alleen toegestaan na schriftelijke toestemming. Bij publicatie wordt waar mogelijk @capstudio vermeld.

## 4. Portfolio
De fotograaf gebruikt beelden alleen in haar portfolio of op social media als de opdrachtgever daar in het portaal toestemming voor geeft.

## 5. Betaling
Betaling volgens de factuur, binnen 14 dagen na factuurdatum. Hoge-resolutiebestanden zijn te downloaden zodra de betaling binnen is.

## 6. Annuleren en verzetten
Verzetten of annuleren kan kosteloos tot 24 uur voor de shoot via het klantportaal. Daarna kan de fotograaf 50% van het shootbedrag in rekening brengen.

## 7. Aansprakelijkheid en voorwaarden
Op deze overeenkomst zijn de algemene voorwaarden van CAP Studio van toepassing. De aansprakelijkheid van de fotograaf is beperkt tot het factuurbedrag.

Door digitaal te ondertekenen gaat de opdrachtgever akkoord met deze overeenkomst. Naam, datum, tijd en IP-adres worden vastgelegd.
$tpl$);

insert into public.email_templates (key, name, description, subject, body, variables) values
('login_link', 'Inloglink', 'Magic link om in te loggen op het portaal', 'Je inloglink voor CAP Studio',
$b$Hoi{{naam_komma}}

Klik op de knop hieronder om in te loggen op je CAP Studio-portaal. De link is 1 uur geldig en werkt één keer.

[Inloggen]({{link}})

Heb je deze mail niet aangevraagd? Dan kun je hem gewoon negeren.$b$,
 array['naam_komma', 'link']),

('contact_confirmation', 'Bevestiging contactaanvraag', 'Naar de klant na het contactformulier', 'Thanks voor je bericht!',
$b$Hoi {{naam}},

Thanks voor je bericht! Ik lees alles zelf en kom binnen twee werkdagen bij je terug.

Ondertussen kun je al inloggen op je persoonlijke portaal. Daar komen straks je offerte, afspraken en foto's te staan.

[Naar je portaal]({{portal_link}})

Groet,
Cheryl – CAP Studio$b$,
 array['naam', 'portal_link']),

('contact_admin', 'Nieuwe aanvraag (voor jou)', 'Naar jou bij een nieuwe aanvraag', 'Nieuwe aanvraag van {{naam}}',
$b$Nieuwe aanvraag via de website.

**Naam:** {{naam}}
**E-mail:** {{email}}
**Type shoot:** {{type}}
**Bericht:**

{{bericht}}

[Open in admin]({{admin_link}})$b$,
 array['naam', 'email', 'type', 'bericht', 'admin_link']),

('appointment_confirmed', 'Afspraak bevestigd', 'Na het boeken van een shoot', 'Je shoot staat gepland: {{datum}}',
$b$Hoi {{naam}},

Top, je shoot staat vast!

**Wanneer:** {{datum}}, {{tijd}}
**Project:** {{project}}

In de bijlage zit een agenda-uitnodiging. Verzetten of annuleren kan tot 24 uur van tevoren in je portaal.

Tip: lees vast [Zo bereid je je voor]({{tips_link}}).

[Bekijk je afspraak]({{link}})

Tot dan!
Cheryl$b$,
 array['naam', 'datum', 'tijd', 'project', 'link', 'tips_link']),

('appointment_rescheduled', 'Afspraak verzet', 'Na het verzetten van een shoot', 'Je shoot is verzet naar {{datum}}',
$b$Hoi {{naam}},

Je shoot is verzet. Dit is het nieuwe moment:

**Wanneer:** {{datum}}, {{tijd}}
**Project:** {{project}}

[Bekijk je afspraak]({{link}})

Groet,
Cheryl$b$,
 array['naam', 'datum', 'tijd', 'project', 'link']),

('appointment_cancelled', 'Afspraak geannuleerd', 'Na het annuleren van een shoot', 'Je shoot op {{datum}} is geannuleerd',
$b$Hoi {{naam}},

Je shoot op {{datum}} om {{tijd}} is geannuleerd. Wil je een nieuw moment kiezen? Dat kan altijd in je portaal.

[Kies een nieuw moment]({{link}})

Groet,
Cheryl$b$,
 array['naam', 'datum', 'tijd', 'project', 'link']),

('appointment_reminder', 'Herinnering (24 uur vooraf)', 'Automatisch 24 uur voor de shoot', 'Morgen is het zover!',
$b$Hoi {{naam}},

Nog even en we gaan shooten!

**Wanneer:** {{datum}}, {{tijd}}
**Project:** {{project}}

Checklist: outfits gestreken, water mee, goed geslapen. Twijfel je nog over je outfit? Lees [Wat trek ik aan tijdens een shoot]({{tips_link}}).

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

('quote_sent', 'Offerte verstuurd', 'Als je een offerte verstuurt', 'Je offerte van CAP Studio ({{nummer}})',
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

Nu nog een moment kiezen voor de shoot, als dat nog niet is gebeurd.

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
  ('booking_lead_hours', '24'::jsonb)
on conflict (key) do nothing;
