// IDE Cert's services, shown on the home page and the Services page.
// TODO(content): the client has not sent service descriptions yet. The texts
// below describe the four disciplines in general terms only — no standards,
// accreditations or scope are claimed. Replace with IDE Cert's own wording.

export type Service = {
  letter: string;
  name: string;
  nameSq: string;
  anchor: string;
  summary: string;
  summarySq: string;
  body: string;
  bodySq: string;
  points: string[];
  pointsSq: string[];
};

export const services: Service[] = [
  {
    letter: "I",
    name: "Inspection",
    nameSq: "Inspektim",
    summarySq: "Inspektim i pavarur i pajisjeve dhe instalimeve, i dokumentuar në raport me shkrim.",
    bodySq: "Inspektojmë pajisje dhe instalime dhe e dokumentojmë rezultatin në raport me shkrim, që të dini çfarë mund të mbetet në përdorim dhe çfarë duhet zëvendësuar.",
    pointsSq: ["Inspektim i pajisjeve mbrojtëse personale kundër rënies nga lartësia", "Inspektim i instalimeve në vend", "Raport me shkrim për arkivin tuaj"],
    anchor: "inspection",
    summary: "Independent inspection of equipment and installations, documented in a written report.",
    body: "We inspect equipment and installations and document the result in a written report, so you know what can stay in service and what has to be replaced.",
    points: ["Inspection of personal protective equipment against falls from height", "Inspection of installations on site", "Written report for your records"],
  },
  {
    letter: "D",
    name: "Design",
    nameSq: "Dizajnim",
    summarySq: "Dizajnim i sistemeve të sigurisë dhe instalimeve, i zhvilluar bashkë me ekipin tuaj.",
    bodySq: "Dizajnojmë sisteme sigurie dhe instalime sipas mënyrës si punojnë njerëzit tuaj, nga vizita e parë në terren deri te vizatimet.",
    pointsSq: ["Vizitë në terren dhe kërkesat", "Koncept dhe dizajn i detajuar", "Zgjedhja e pajisjeve nga gama EDELRID"],
    anchor: "design",
    summary: "Design of safety systems and installations, developed together with your team.",
    body: "We design safety systems and installations around the way your people work, from the first site visit to the drawings.",
    points: ["Site visit and requirements", "Concept and detailed design", "Equipment selection from the EDELRID range"],
  },
  {
    letter: "E",
    name: "Engineering",
    nameSq: "Inxhinieri",
    summarySq: "Analiza inxhinierike, llogaritje dhe dokumentacion teknik.",
    bodySq: "Sigurojmë inxhinierinë pas projektit: analizat, llogaritjet dhe dokumentacionin teknik që i shoqëron.",
    pointsSq: ["Analiza inxhinierike dhe llogaritje", "Dokumentacion teknik", "Mbështetje gjatë instalimit"],
    anchor: "engineering",
    summary: "Engineering analysis, calculations and technical documentation.",
    body: "We provide the engineering behind a project: analysis, calculations and the technical documentation that goes with it.",
    points: ["Engineering analysis and calculations", "Technical documentation", "Support during installation"],
  },
  {
    letter: "C",
    name: "Certification",
    nameSq: "Certifikim",
    summarySq: "Mbështetje për certifikimin dhe vlerësimin e konformitetit të produkteve dhe instalimeve.",
    bodySq: "I mbështesim prodhuesit, instaluesit dhe operatorët të tregojnë se produktet dhe instalimet plotësojnë kërkesat që vlejnë për to.",
    pointsSq: ["Mbështetje për vlerësimin e konformitetit", "Përgatitja e dokumentacionit", "Udhëzime për kërkesat që vlejnë"],
    anchor: "certification",
    summary: "Certification and conformity assessment support for products and installations.",
    body: "We support manufacturers, installers and operators in showing that products and installations meet the requirements that apply to them.",
    points: ["Conformity assessment support", "Preparation of documentation", "Guidance on the applicable requirements"],
  },
];

/**
 * Smart Belay servicing for adventure parks. EDELRID lists these services in its
 * Adventure price list (dealer prices only), so they are offered on request.
 * TODO(client): set IDE Cert's prices, or keep "price on request".
 */
export const smartBelayServices = [
  { en: "Annual inspection of Smart Belay and Smart Belay X systems", sq: "Inspektim vjetor i sistemeve Smart Belay dhe Smart Belay X" },
  { en: "PPE check for Smart Belay", sq: "Kontroll PPE për Smart Belay" },
  { en: "System diagnosis", sq: "Diagnostikim i sistemit" },
  { en: "Wire tension re-adjustment", sq: "Rregullim i tensionit të kabllos" },
  { en: "Opening and professional closing of Conecto / Conecto Swivel", sq: "Hapje dhe mbyllje profesionale e Conecto / Conecto Swivel" },
  { en: "Additional cleaning of heavily soiled units", sq: "Pastrim shtesë i njësive shumë të ndotura" },
];
