/**
 * Alle aanpasbare websiteteksten met hun standaardwaarde.
 * In /admin/teksten kun je ze overschrijven; de database bewaart alleen jouw aanpassingen.
 */
export type TextDef = { label: string; page: string; default: string; multiline?: boolean; markdown?: boolean };

export const textDefs = {
  // Home
  "home.hero_title": { page: "Home", label: "Kop", default: "Sterke beelden voor sportief Nederland" },
  "home.hero_subtitle": {
    page: "Home",
    label: "Ondertitel",
    default: "Foto en video voor sport en lifestyle, met een donkere, filmische look die opvalt.",
    multiline: true,
  },
  "home.hero_button": { page: "Home", label: "Knop", default: "Boek een shoot" },
  "home.block_foto_title": { page: "Home", label: "Blok 1: titel", default: "Foto" },
  "home.block_foto_text": {
    page: "Home",
    label: "Blok 1: tekst",
    default: "Krachtige beelden van jou, je training of je merk. Echt, dynamisch en klaar voor social media en je website.",
    multiline: true,
  },
  "home.block_video_title": { page: "Home", label: "Blok 2: titel", default: "Video" },
  "home.block_video_text": {
    page: "Home",
    label: "Blok 2: tekst",
    default: "Korte reels en clips die de sfeer van je gym of training laten zien. Perfect voor Instagram en TikTok.",
    multiline: true,
  },
  "home.block_persoonlijk_title": { page: "Home", label: "Blok 3: titel", default: "Persoonlijk" },
  "home.block_persoonlijk_text": {
    page: "Home",
    label: "Blok 3: tekst",
    default:
      "Geen standaard shoot, maar beelden die passen bij jou. We bespreken vooraf wat je nodig hebt, zodat je op de dag zelf gewoon kunt doen waar je goed in bent.",
    multiline: true,
  },
  "home.work_title": { page: "Home", label: "Kop portfolio-selectie", default: "Uit het portfolio" },
  "home.cta_title": { page: "Home", label: "Afsluiter", default: "Benieuwd wat ik voor jou kan doen?" },
  "home.cta_button": { page: "Home", label: "Afsluiter: knop", default: "Vraag een vrijblijvende offerte aan" },

  // Portfolio
  "portfolio.title": { page: "Portfolio", label: "Kop", default: "Portfolio" },
  "portfolio.intro": {
    page: "Portfolio",
    label: "Intro",
    default: "Een selectie uit recente shoots. Klik op een beeld om het groot te bekijken.",
    multiline: true,
  },

  // Diensten
  "diensten.title": { page: "Diensten en tarieven", label: "Kop", default: "Diensten en tarieven" },
  "diensten.intro": {
    page: "Diensten en tarieven",
    label: "Intro",
    default: "Kies het pakket dat bij je past. Twijfel je? Vraag een offerte aan, dan denk ik met je mee.",
    multiline: true,
  },
  "diensten.included": {
    page: "Diensten en tarieven",
    label: "Inbegrepen",
    default:
      "Bij elk pakket inbegrepen: een kort kennismakingsgesprek, professionele bewerking in mijn eigen stijl, 1 bewerkingsronde en gebruik voor je eigen social media en website.",
    multiline: true,
  },
  "diensten.extra": {
    page: "Diensten en tarieven",
    label: "Extra",
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
    default: "Vertel me kort wat je zoekt. Ik reageer binnen twee werkdagen, en je krijgt direct toegang tot je eigen klantportaal.",
    multiline: true,
  },
} satisfies Record<string, TextDef>;

export type TextKey = keyof typeof textDefs;
