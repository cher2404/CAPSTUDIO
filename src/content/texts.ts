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
  "home.hero_title": { page: "Home", label: "Kop", default: "Creatieve studio voor beeld en digitaal" },
  "home.hero_subtitle": {
    page: "Home",
    label: "Ondertitel",
    default: "Foto, video, websites en apps. Met een donkere, filmische look die opvalt, en altijd met oog voor hoe het werkt.",
    multiline: true,
  },
  "home.hero_button": { page: "Home", label: "Knop", default: "Start een project" },
  "home.block_1_title": { page: "Home", label: "Discipline 1: titel", default: "Foto" },
  "home.block_1_text": {
    page: "Home",
    label: "Discipline 1: tekst",
    default: "Krachtige beelden van jou, je team of je merk. Echt, dynamisch en klaar voor social media en je website. Met een specialisatie in sport en lifestyle.",
    multiline: true,
  },
  "home.block_1_tag": { page: "Home", label: "Discipline 1: label (optioneel)", default: "" },
  "home.block_2_title": { page: "Home", label: "Discipline 2: titel", default: "Video" },
  "home.block_2_text": {
    page: "Home",
    label: "Discipline 2: tekst",
    default: "Korte reels en clips die de sfeer van je merk, gym of event laten zien. Perfect voor Instagram en TikTok.",
    multiline: true,
  },
  "home.block_2_tag": { page: "Home", label: "Discipline 2: label (optioneel)", default: "" },
  "home.block_3_title": { page: "Home", label: "Discipline 3: titel", default: "Apps en websites" },
  "home.block_3_text": {
    page: "Home",
    label: "Discipline 3: tekst",
    default: "Websites, webapps en klantportalen die snel zijn, goed werken en er net zo goed uitzien als je beelden.",
    multiline: true,
  },
  "home.block_3_tag": { page: "Home", label: "Discipline 3: label (optioneel)", default: "" },
  "home.block_4_title": { page: "Home", label: "Discipline 4: titel (leeg = verborgen)", default: "Games" },
  "home.block_4_text": {
    page: "Home",
    label: "Discipline 4: tekst",
    default: "Speelse, interactieve ervaringen en games. Een nieuwe richting waar ik nu mee experimenteer.",
    multiline: true,
  },
  "home.block_4_tag": { page: "Home", label: "Discipline 4: label (optioneel)", default: "Lab" },
  "home.statement": {
    page: "Home",
    label: "Statement onder de hero. {foto} {video} {apps} {games} worden kleine beelden uit je portfolio.",
    default: "Ik maak {foto} foto's en {video} video's, bouw {apps} websites en apps, en speel met {games} games. Alles met dezelfde filmische blik.",
    multiline: true,
  },
  "home.approach_title": { page: "Home", label: "Werkwijze: kop", default: "Persoonlijk" },
  "home.approach_text": {
    page: "Home",
    label: "Werkwijze: tekst",
    default:
      "Geen standaard aanpak, maar werk dat past bij jou. We bespreken vooraf wat je nodig hebt, zodat je op de dag zelf gewoon kunt doen waar je goed in bent.",
    multiline: true,
  },
  "home.work_title": { page: "Home", label: "Kop portfolio-selectie", default: "Geselecteerd werk" },
  "home.cta_title": { page: "Home", label: "Afsluiter", default: "Benieuwd wat ik voor jou kan doen?" },
  "home.cta_link": { page: "Home", label: "Afsluiter: grote link (laatste woord wordt cursief)", default: "Laten we praten" },
  "home.cta_button": { page: "Home", label: "Afsluiter: knop", default: "Vraag een vrijblijvende offerte aan" },

  // Portfolio
  "portfolio.title": { page: "Portfolio", label: "Kop", default: "Portfolio" },
  "portfolio.intro": {
    page: "Portfolio",
    label: "Intro",
    default: "Een selectie uit recent werk: foto, video en digitaal. Klik op een beeld om het groot te bekijken.",
    multiline: true,
  },

  // Diensten
  "diensten.title": { page: "Diensten en tarieven", label: "Kop", default: "Diensten en tarieven" },
  "diensten.intro": {
    page: "Diensten en tarieven",
    label: "Intro",
    default: "Van een fotoshoot tot een complete app. Twijfel je wat je nodig hebt? Vraag een offerte aan, dan denk ik met je mee.",
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
      "Ik ben Cheryl, fotograaf en videomaker met een oog voor licht en sfeer. Naast beeld bouw ik ook websites en apps, dus ik denk graag mee over hoe je content echt voor je gaat werken.",
    multiline: true,
  },
  "over.story": {
    page: "Over mij",
    label: "Uitgebreid verhaal (markdown, leeg = verborgen)",
    default: "",
    multiline: true,
    markdown: true,
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
