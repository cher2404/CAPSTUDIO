/**
 * Alle aanpasbare websiteteksten met hun standaardwaarde.
 * In /admin/teksten kun je ze overschrijven; de database bewaart alleen jouw aanpassingen.
 */
export type TextDef = { label: string; page: string; default: string; multiline?: boolean; markdown?: boolean };

export const textDefs = {
  // Algemeen
  "site.availability": {
    page: "Algemeen",
    label: "Beschikbaarheid (in de header en footer, leeg = verborgen)",
    default: "Beschikbaar voor nieuwe projecten",
  },

  // Home
  "home.hero_title": { page: "Home", label: "Kop", default: "Creatieve studio voor web, apps en games" },
  "home.hero_subtitle": {
    page: "Home",
    label: "Ondertitel",
    default: "Websites, apps en games die goed werken en opvallen. En omdat ik ook fotografeer en film, maak ik het beeld er meteen bij.",
    multiline: true,
  },
  "home.hero_button": { page: "Home", label: "Knop", default: "Start een project" },
  "home.block_1_title": { page: "Home", label: "Discipline 1: titel", default: "Websites" },
  "home.block_1_text": {
    page: "Home",
    label: "Discipline 1: tekst",
    default: "Sites die snel laden, goed vindbaar zijn en er net zo goed uitzien als je merk. Van een onepager tot een complete bedrijfssite.",
    multiline: true,
  },
  "home.block_1_tag": { page: "Home", label: "Discipline 1: label (optioneel)", default: "" },
  "home.block_2_title": { page: "Home", label: "Discipline 2: titel", default: "Apps" },
  "home.block_2_text": {
    page: "Home",
    label: "Discipline 2: tekst",
    default: "Webapps, klantportalen en prototypes. Van idee en ontwerp tot iets dat je klanten echt gebruiken.",
    multiline: true,
  },
  "home.block_2_tag": { page: "Home", label: "Discipline 2: label (optioneel)", default: "" },
  "home.block_3_title": { page: "Home", label: "Discipline 3: titel", default: "Games" },
  "home.block_3_text": {
    page: "Home",
    label: "Discipline 3: tekst",
    default: "Minigames en speelse, interactieve ervaringen. Voor een campagne, een event of gewoon omdat het kan.",
    multiline: true,
  },
  "home.block_3_tag": { page: "Home", label: "Discipline 3: label (optioneel)", default: "Lab" },
  "home.block_4_title": { page: "Home", label: "Discipline 4: titel (leeg = verborgen)", default: "Foto en video" },
  "home.block_4_text": {
    page: "Home",
    label: "Discipline 4: tekst",
    default: "Het beeld erbij: portretten, sfeer en korte clips in dezelfde stijl als je site. Zo klopt alles met elkaar.",
    multiline: true,
  },
  "home.block_4_tag": { page: "Home", label: "Discipline 4: label (optioneel)", default: "" },
  "home.statement": {
    page: "Home",
    label: "Statement onder de hero. {foto} {video} {apps} {games} worden kleine beelden uit je portfolio.",
    default: "Ik bouw {apps} websites en apps, maak {games} games, en zorg met {foto} foto's en {video} video's dat het beeld klopt. Alles onder één dak.",
    multiline: true,
  },
  "home.approach_title": { page: "Home", label: "Werkwijze: kop", default: "Persoonlijk" },
  "home.approach_text": {
    page: "Home",
    label: "Werkwijze: tekst",
    default:
      "Geen standaard aanpak, maar werk dat past bij jou. We bespreken vooraf wat je nodig hebt, en daarna houd ik je onderweg op de hoogte.",
    multiline: true,
  },
  "home.step_1_title": { page: "Home", label: "Werkwijze stap 1: titel", default: "Kennismaken" },
  "home.step_1_text": {
    page: "Home",
    label: "Werkwijze stap 1: tekst",
    default: "Je vertelt wat je zoekt, ik stel de vragen. Binnen twee werkdagen hoor je van me.",
    multiline: true,
  },
  "home.step_2_title": { page: "Home", label: "Werkwijze stap 2: titel", default: "Voorstel" },
  "home.step_2_text": {
    page: "Home",
    label: "Werkwijze stap 2: tekst",
    default: "Je krijgt een offerte en overeenkomst in je eigen klantportaal, en tekent daar ook digitaal.",
    multiline: true,
  },
  "home.step_3_title": { page: "Home", label: "Werkwijze stap 3: titel", default: "Maken" },
  "home.step_3_text": {
    page: "Home",
    label: "Werkwijze stap 3: tekst",
    default: "Ontwerpen, bouwen, fotograferen of filmen. Je ziet tussentijds wat ik maak en kunt meedenken.",
    multiline: true,
  },
  "home.step_4_title": { page: "Home", label: "Werkwijze stap 4: titel", default: "Oplevering" },
  "home.step_4_text": {
    page: "Home",
    label: "Werkwijze stap 4: tekst",
    default: "Je site of app gaat live, en je beelden staan in een privégalerij in je portaal om in hoge resolutie te downloaden.",
    multiline: true,
  },
  "home.roll_title": { page: "Home", label: "Kop filmrol", default: "Van de rol" },
  "home.work_title": { page: "Home", label: "Kop portfolio-selectie", default: "Geselecteerd werk" },
  "home.cta_title": { page: "Home", label: "Afsluiter", default: "Benieuwd wat ik voor jou kan doen?" },
  "home.cta_link": { page: "Home", label: "Afsluiter: grote link (laatste woord wordt cursief)", default: "Laten we praten" },
  "home.cta_button": { page: "Home", label: "Afsluiter: knop", default: "Vraag een vrijblijvende offerte aan" },

  // Portfolio
  "portfolio.title": { page: "Portfolio", label: "Kop", default: "Portfolio" },
  "portfolio.intro": {
    page: "Portfolio",
    label: "Intro",
    default: "Een selectie uit recent werk: websites, apps, games en beeld. Klik op een project om het groot te bekijken.",
    multiline: true,
  },

  // Diensten
  "diensten.title": { page: "Diensten en tarieven", label: "Kop", default: "Diensten en tarieven" },
  "diensten.intro": {
    page: "Diensten en tarieven",
    label: "Intro",
    default: "Van een website of app tot een minigame of fotoshoot. Twijfel je wat je nodig hebt? Vraag een offerte aan, dan denk ik met je mee.",
    multiline: true,
  },
  "diensten.beeld_title": { page: "Diensten en tarieven", label: "Sectie foto en video: titel", default: "Foto en video" },
  "diensten.digitaal_title": { page: "Diensten en tarieven", label: "Sectie digitaal: titel", default: "Apps en websites" },
  "diensten.digitaal_intro": {
    page: "Diensten en tarieven",
    label: "Sectie digitaal: intro",
    default: "Elk digitaal project is anders. Na een kennismaking krijg je een voorstel met een duidelijke planning en prijs.",
    multiline: true,
  },
  "diensten.games_title": { page: "Diensten en tarieven", label: "Sectie games: titel", default: "Games" },
  "diensten.games_intro": {
    page: "Diensten en tarieven",
    label: "Sectie games: intro",
    default: "Interactief en speels: van een kleine webgame tot een prototype. Zin om te experimenteren? Laten we praten.",
    multiline: true,
  },
  "diensten.included": {
    page: "Diensten en tarieven",
    label: "Foto en video: inbegrepen",
    default:
      "Bij elk pakket inbegrepen: een kort kennismakingsgesprek, professionele bewerking in mijn eigen stijl, 1 bewerkingsronde en gebruik voor je eigen social media en website.",
    multiline: true,
  },
  "diensten.extra": {
    page: "Diensten en tarieven",
    label: "Foto en video: extra",
    default: "Extra: gebruik voor betaalde advertenties, extra bewerkte foto's of een snelle oplevering reken ik apart.",
    multiline: true,
  },
  "diensten.disclaimer": {
    page: "Diensten en tarieven",
    label: "Kleine lettertjes",
    default: "Alle prijzen zijn indicatief, een offerte krijg je altijd vooraf.",
    multiline: true,
  },

  // Over mij
  "over.title": { page: "Over mij", label: "Kop", default: "Hoi, ik ben Cheryl" },
  "over.intro": {
    page: "Over mij",
    label: "Korte tekst",
    default:
      "Ik ben Cheryl. Ik bouw websites, apps en games, en ik fotografeer en film. Dat maakt het makkelijk: je site en je beeld komen van één plek en kloppen meteen met elkaar.",
    multiline: true,
  },
  "over.story": {
    page: "Over mij",
    label: "Uitgebreid verhaal (markdown, leeg = verborgen)",
    default: [
      "Ik ben altijd bezig met hoe iets eruitziet én hoe het werkt. Dat begon met een camera op reis: in Londen keek ik meer naar het licht op de gebouwen dan naar de route. Later kwam het bouwen erbij: websites, apps en, steeds vaker, kleine games.",
      "Bij een website of app begin ik bij de mensen die hem gaan gebruiken. Wat willen ze doen, en hoe maak je dat zo makkelijk mogelijk? Pas daarna komt de vorm. Zo bouwde ik een klantportaal waarin mijn klanten offertes tekenen en hun beelden downloaden, en ontwierp ik een tennisapp voor iedereen die bij meerdere clubs speelt.",
      "Omdat ik ook fotografeer en film, hoef je voor het beeld niet naar een ander. Je site, je foto's en je video's komen van één plek, in dezelfde stijl.",
      "Games zijn mijn speeltuin. Daar probeer ik nieuwe dingen uit, en die ideeën vinden hun weg terug naar alles wat ik maak. Zelf sta ik in mijn vrije tijd graag op de tennisbaan, dus het is geen toeval dat mijn eerste minigame over tennis gaat.",
    ].join("\n\n"),
    multiline: true,
    markdown: true,
  },
  "over.gallery_title": { page: "Over mij", label: "Kop fotostrook", default: "Buiten opdrachten" },
  "over.gallery_intro": {
    page: "Over mij",
    label: "Tekst bij fotostrook",
    default: "Als niemand me boekt, fotografeer ik vooral steden, licht en kleine dingen. Hier leerde ik kijken.",
    multiline: true,
  },

  // Contact
  "contact.title": { page: "Contact", label: "Kop", default: "Laten we iets moois maken" },
  "contact.title_quote": { page: "Contact", label: "Kop bij offerteaanvraag", default: "Vraag een offerte aan" },
  "contact.intro": {
    page: "Contact",
    label: "Intro",
    default: "Een shoot, een website, een app of een gek idee: vertel me kort wat je zoekt. Ik reageer binnen twee werkdagen, en je krijgt direct toegang tot je eigen klantportaal.",
    multiline: true,
  },
} satisfies Record<string, TextDef>;

export type TextKey = keyof typeof textDefs;
