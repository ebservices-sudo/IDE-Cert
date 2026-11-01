// IDE Cert's projects, as supplied by IDE Cert (1 November 2026). Albanian is the original;
// English is a faithful translation. Photos live in public/projects/{slug}/ and are listed
// in `photos` (add files there and list them here, best first).

import type { L10n } from "@/lib/i18n/T";

export type Project = {
  slug: string;
  name: string;
  place: L10n;
  /** Albania or Kosovo, for the label next to the place. */
  country: L10n;
  status: "designed" | "built";
  kind: L10n;
  tagline: L10n;
  intro: L10n;
  engineering: L10n;
  /** For the animated profile drawing and the counters. */
  lengthM: number;
  /** Parallel lines (1 or 2). */
  lines: number;
  /** null when not published. */
  dropM: number | null;
  speed: string;
  facts: { label: L10n; value: L10n }[];
  year: number;
  standards: string[];
  photos: { src: string; alt: L10n }[];
  /** A river or valley name drawn at the bottom of the profile. */
  valley?: string;
  link?: { label: string; href: string };
};

const t = (sq: string, en: string): L10n => ({ sq, en });
const same = (v: string): L10n => ({ sq: v, en: v });

export const projects: Project[] = [
  {
    slug: "permet-zipline",
    name: "Përmeti Zipline",
    place: t("Përmet", "Përmet"),
    country: t("Shqipëri", "Albania"),
    status: "built",
    kind: t("Zipline panoramik", "Panoramic zip line"),
    tagline: t(
      "Projektimi inxhinierik i një Zipline panoramik mbi lumin Vjosa, një nga lumenjtë e fundit të egër në Evropë",
      "Engineering design of a panoramic zip line over the Vjosa, one of the last wild rivers in Europe",
    ),
    intro: t(
      "Përmeti Zipline është një projekt i turizmit të aventurës, i zhvilluar për të ofruar një përvojë unike fluturimi mbi peizazhet spektakolare të Përmetit, duke kaluar mbi lumin Vjosa, një nga lumenjtë e fundit të egër në Evropë. Ky projekt bashkon natyrën e paprekur, emocionin e aventurës dhe zgjidhjet moderne inxhinierike në një atraksion të veçantë turistik. Me një gjatësi prej 524 metrash dhe disnivel prej 103.08 metrash, sistemi mundëson shpejtësi të projektuar prej 50–80 km/h, duke përdorur karroca magnetike dhe sistem automatik frenimi ZipSTOP IR nga Head Rush Technologies (USA), të plotësuar me sistem sekondar të frenimit emergjent.",
      "Përmeti Zipline is an adventure tourism project built to offer a unique flight over the spectacular landscapes of Përmet, crossing the Vjosa, one of the last wild rivers in Europe. It brings together untouched nature, the thrill of adventure and modern engineering in one distinctive attraction. At 524 metres long with a 103.08-metre drop, the system reaches a design speed of 50–80 km/h, using magnetic trolleys and the ZipSTOP IR automatic braking system by Head Rush Technologies (USA), backed by a secondary emergency braking system.",
    ),
    engineering: t(
      "Projektimi inxhinierik përfshin analizat strukturore, llogaritjet e ngarkesave dhe tensioneve të litarit, projektimin e sistemeve të ankorimit, përzgjedhjen e pajisjeve të sigurisë dhe përgatitjen e dokumentacionit teknik e operacional, duke marrë për bazë kërkesat e standardeve evropiane EN 15567-1 dhe EN 15567-2.",
      "The engineering design covers structural analysis, load and rope tension calculations, anchorage design, selection of the safety equipment, and the technical and operational documentation, based on the requirements of the European standards EN 15567-1 and EN 15567-2.",
    ),
    lengthM: 524,
    lines: 1,
    dropM: 103.08,
    speed: "50–80 km/h",
    facts: [
      { label: t("Lokacioni", "Location"), value: t("Përmet, Shqipëri", "Përmet, Albania") },
      { label: t("Lloji i projektit", "Project type"), value: t("Zipline panoramik", "Panoramic zip line") },
      { label: t("Veçantia", "Highlight"), value: t("Kalon mbi lumin Vjosa, një nga lumenjtë e fundit të egër në Evropë", "Crosses the Vjosa, one of the last wild rivers in Europe") },
      { label: t("Gjatësia", "Length"), value: same("524 m") },
      { label: t("Disniveli", "Drop"), value: same("103.08 m") },
      { label: t("Shpejtësia e projektuar", "Design speed"), value: same("50–80 km/h") },
      { label: t("Pesha e pjesëmarrësve", "Rider weight"), value: same("40–120 kg") },
      { label: t("Sistemi i frenimit", "Braking system"), value: t("ZipSTOP IR me sistem sekondar emergjent", "ZipSTOP IR with secondary emergency system") },
      { label: t("Investitori", "Investor"), value: t("Fondi Shqiptar i Zhvillimit", "Albanian Development Fund") },
      { label: t("Ndërtuesi", "Builder"), value: same("VIBTIS SH.P.K.") },
      { label: t("Përfituesi", "Beneficiary"), value: t("Bashkia Përmet", "Municipality of Përmet") },
      { label: t("Viti", "Year"), value: same("2026") },
    ],
    year: 2026,
    standards: ["EN 15567-1", "EN 15567-2"],
    photos: [],
    valley: "Vjosa",
  },
  {
    slug: "decan-zipline",
    name: "Deçani Zipline",
    place: t("Bjeshkët e Belegut, Deçan", "Beleg Mountains, Deçan"),
    country: t("Kosovë", "Kosovo"),
    status: "designed",
    kind: t("Zipline panoramik me dy linja paralele", "Panoramic twin-line zip line"),
    tagline: t(
      "Projektimi inxhinierik i një Zipline panoramik me dy linja paralele në zemër të Bjeshkëve të Nemuna",
      "Engineering design of a panoramic twin-line zip line in the heart of the Accursed Mountains",
    ),
    intro: t(
      "Deçani Zipline është një projekt i turizmit të aventurës, i projektuar në Bjeshkët e Belegut, në një nga zonat më të bukura malore të Kosovës. Projekti synon të ofrojë një përvojë unike fluturimi mbi peizazhet spektakolare alpine, duke kombinuar emocionin e aventurës, bukuritë natyrore dhe zgjidhjet moderne inxhinierike. Me një gjatësi prej 1,104 metrash dhe disnivel prej 102.85 metrash, sistemi përbëhet nga dy linja paralele Zipline, që mundësojnë fluturimin e njëkohshëm të dy pjesëmarrësve, me shpejtësi të projektuar prej 50–80 km/h. Sistemi është projektuar me teknologji automatike të frenimit magnetik ZipSTOP IR, të plotësuar me sistem sekondar të frenimit emergjent për rritjen e sigurisë së pjesëmarrësve.",
      "Deçani Zipline is an adventure tourism project designed in the Beleg Mountains, one of the most beautiful mountain areas of Kosovo. It offers a unique flight over spectacular alpine landscapes, combining the thrill of adventure, natural beauty and modern engineering. At 1,104 metres long with a 102.85-metre drop, the system has two parallel lines so two riders can fly at the same time, at a design speed of 50–80 km/h. It is designed with ZipSTOP IR automatic magnetic braking, backed by a secondary emergency braking system for added rider safety.",
    ),
    engineering: t(
      "Projektimi inxhinierik përfshin studimin dhe përzgjedhjen e lokacionit, analizat strukturore, llogaritjet e ngarkesave dhe tensioneve të litarëve, projektimin e platformave të nisjes dhe mbërritjes, sistemeve të ankorimit dhe frenimit, si dhe përgatitjen e dokumentacionit teknik, duke marrë për bazë kërkesat e standardeve evropiane EN 15567-1 dhe EN 15567-2.",
      "The engineering design covers the site study and selection, structural analysis, load and rope tension calculations, the design of the launch and landing platforms, anchorage and braking systems, and the technical documentation, based on the requirements of the European standards EN 15567-1 and EN 15567-2.",
    ),
    lengthM: 1104,
    lines: 2,
    dropM: 102.85,
    speed: "50–80 km/h",
    facts: [
      { label: t("Lokacioni", "Location"), value: t("Bjeshkët e Belegut, Deçan, Kosovë", "Beleg Mountains, Deçan, Kosovo") },
      { label: t("Lloji i projektit", "Project type"), value: t("Zipline panoramik me dy linja paralele", "Panoramic zip line with two parallel lines") },
      { label: t("Veçantia", "Highlight"), value: t("Fluturim i njëkohshëm i dy pjesëmarrësve mbi peizazhet alpine të Bjeshkëve të Nemuna", "Two riders fly side by side over the alpine landscapes of the Accursed Mountains") },
      { label: t("Gjatësia", "Length"), value: t("1,104 m për linjë", "1,104 m per line") },
      { label: t("Disniveli", "Drop"), value: same("102.85 m") },
      { label: t("Shpejtësia e projektuar", "Design speed"), value: same("50–80 km/h") },
      { label: t("Pesha e pjesëmarrësve", "Rider weight"), value: same("40–125 kg") },
      { label: t("Sistemi i frenimit", "Braking system"), value: t("ZipSTOP IR me sistem sekondar emergjent", "ZipSTOP IR with secondary emergency system") },
      { label: t("Investitori", "Investor"), value: t("Komuna e Deçanit", "Municipality of Deçan") },
      { label: t("Viti i projektimit", "Design year"), value: same("2024") },
    ],
    year: 2024,
    standards: ["EN 15567-1", "EN 15567-2"],
    photos: [],
  },
  {
    slug: "dardha-zipline",
    name: "Dardha Zipline",
    place: t("Dardhë, Korçë", "Dardhë, Korçë"),
    country: t("Shqipëri", "Albania"),
    status: "designed",
    kind: t("Zipline panoramik malor", "Panoramic mountain zip line"),
    tagline: t(
      "Projektimi inxhinierik i një Zipline panoramik mbi peizazhet malore të Dardhës, një prej destinacioneve më të njohura turistike të Shqipërisë juglindore",
      "Engineering design of a panoramic zip line over the mountains of Dardhë, one of the best-known destinations in south-east Albania",
    ),
    intro: t(
      "Dardha Zipline është një projekt i turizmit të aventurës, i projektuar për të ofruar një përvojë unike fluturimi mbi pyjet dhe peizazhet e mrekullueshme malore të Dardhës, në rajonin e Korçës. Projekti lidh zonën e Malit të Shën Gjergjit me fshatin turistik të Dardhës, duke ndërthurur bukuritë natyrore, emocionin e aventurës dhe zgjidhjet bashkëkohore inxhinierike. Me një gjatësi prej 885 metrash dhe disnivel prej 75.85 metrash, sistemi është projektuar me shpejtësi maksimale prej 50–80 km/h, duke ofruar pamje panoramike mbi pyjet dhe relievin malor. Sistemi përfshin teknologji automatike të frenimit ZipSTOP IR, platforma të projektuara posaçërisht për nisje dhe mbërritje, si dhe sisteme sigurie për funksionim të kontrolluar.",
      "Dardha Zipline is an adventure tourism project designed to offer a unique flight over the forests and mountain landscapes of Dardhë, in the Korçë region. It links the St. George Mountain area with the tourist village of Dardhë, combining natural beauty, adventure and modern engineering. At 885 metres long with a 75.85-metre drop, the system is designed for top speeds of 50–80 km/h with panoramic views over the forests and mountain relief. It includes ZipSTOP IR automatic braking, purpose-designed launch and landing platforms, and safety systems for controlled operation.",
    ),
    engineering: t(
      "Projektimi inxhinierik përfshin studimet topografike, gjeologjike dhe sizmologjike, analizat strukturore, llogaritjet e ngarkesave dhe tensioneve të litarëve, projektimin e konstruksioneve mbështetëse, sistemeve të ankorimit dhe frenimit, si dhe përgatitjen e dokumentacionit teknik dhe operacional, duke marrë për bazë kërkesat e standardeve evropiane EN 15567-1 dhe EN 15567-2.",
      "The engineering design covers topographic, geological and seismological studies, structural analysis, load and rope tension calculations, the design of the supporting structures, anchorage and braking systems, and the technical and operational documentation, based on the requirements of the European standards EN 15567-1 and EN 15567-2.",
    ),
    lengthM: 885,
    lines: 1,
    dropM: 75.85,
    speed: "50–80 km/h",
    facts: [
      { label: t("Lokacioni", "Location"), value: t("Dardhë, Korçë, Shqipëri", "Dardhë, Korçë, Albania") },
      { label: t("Lloji i projektit", "Project type"), value: t("Zipline panoramik malor", "Panoramic mountain zip line") },
      { label: t("Veçantia", "Highlight"), value: t("Fluturim panoramik nga Mali i Shën Gjergjit drejt fshatit Dardhë, mbi pyje dhe peizazhe alpine", "A panoramic flight from St. George Mountain to the village of Dardhë, over forests and alpine landscapes") },
      { label: t("Gjatësia", "Length"), value: same("885 m") },
      { label: t("Disniveli", "Drop"), value: same("75.85 m") },
      { label: t("Shpejtësia e projektuar", "Design speed"), value: same("50–80 km/h") },
      { label: t("Pesha e pjesëmarrësve", "Rider weight"), value: same("40–125 kg") },
      { label: t("Sistemi i frenimit", "Braking system"), value: same("ZipSTOP IR") },
      { label: t("Investitori / Agjencia zbatuese", "Investor / implementing agency"), value: t("Fondi Shqiptar i Zhvillimit", "Albanian Development Fund") },
      { label: t("Financimi i programit", "Programme funding"), value: t("Bashkimi Evropian dhe BERZH", "European Union and EBRD") },
      { label: t("Viti i projektimit", "Design year"), value: same("2026") },
    ],
    year: 2026,
    standards: ["EN 15567-1", "EN 15567-2"],
    photos: [],
  },
  {
    slug: "theth-zipline",
    name: "Thethi Zipline",
    place: t("Theth, Shkodër", "Theth, Shkodër"),
    country: t("Shqipëri", "Albania"),
    status: "designed",
    kind: t("Zipline panoramik me dy linja", "Panoramic twin-line zip line"),
    tagline: t(
      "Projektimi i dy linjave Zipline panoramike në zemër të Alpeve Shqiptare",
      "Design of two panoramic zip lines in the heart of the Albanian Alps",
    ),
    intro: t(
      "Thethi Zipline është një projekt i turizmit të aventurës, i projektuar për të ofruar një përvojë unike fluturimi mbi peizazhet mahnitëse të luginës së Thethit, një prej destinacioneve më të njohura malore në Shqipëri. Projekti përfshin dy linja paralele Zipline, me gjatësi të projektuar prej rreth 1,000 metrash secila, të cilat lidhin stacionin e nisjes me atë të mbërritjes, duke mundësuar shpejtësi të parashikuara prej 50–70 km/h dhe pamje panoramike të Alpeve Shqiptare.",
      "Thethi Zipline is an adventure tourism project designed to offer a unique flight over the breathtaking Theth valley, one of the best-known mountain destinations in Albania. It has two parallel zip lines of about 1,000 metres each, linking the launch and landing stations, with expected speeds of 50–70 km/h and panoramic views of the Albanian Alps.",
    ),
    engineering: t(
      "Projektimi inxhinierik përfshin përzgjedhjen e trasesë, analizat e ngarkesave, llogaritjen e tensioneve të litarëve, projektimin e sistemeve të ankorimit dhe masat e sigurisë, duke marrë për bazë kërkesat e standardit evropian EN 15567-1.",
      "The engineering design covers route selection, load analysis, rope tension calculations, anchorage design and safety measures, based on the requirements of the European standard EN 15567-1.",
    ),
    lengthM: 1000,
    lines: 2,
    dropM: null,
    speed: "50–70 km/h",
    facts: [
      { label: t("Lokacioni", "Location"), value: t("Theth, Shkodër, Shqipëri", "Theth, Shkodër, Albania") },
      { label: t("Lloji", "Type"), value: t("Zipline panoramik me dy linja", "Panoramic twin-line zip line") },
      { label: t("Numri i linjave", "Number of lines"), value: same("2") },
      { label: t("Gjatësia e projektuar", "Design length"), value: t("Rreth 1,000 m për linjë", "About 1,000 m per line") },
      { label: t("Shpejtësia e parashikuar", "Expected speed"), value: same("50–70 km/h") },
      { label: t("Pesha e pjesëmarrësve", "Rider weight"), value: same("40–125 kg") },
      { label: t("Shërbimi", "Service"), value: t("Projektim inxhinierik dhe dokumentacion teknik", "Engineering design and technical documentation") },
      { label: t("Viti", "Year"), value: same("2023") },
    ],
    year: 2023,
    standards: ["EN 15567-1"],
    photos: [],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const STATUS: Record<Project["status"], L10n> = {
  built: { sq: "Ndërtuar", en: "Built" },
  designed: { sq: "Projektuar", en: "Designed" },
};
