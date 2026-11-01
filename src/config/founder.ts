// IDE Cert's founder and the company's distribution, as supplied by IDE Cert (1 November 2026).
// Shown on the home page (FounderSection) and the About page, in Albanian and English.

import type { L10n } from "@/lib/i18n/T";

export const founder = {
  name: "Dr. sc. Shpetim Lajqi",
  role: { sq: "Themelues dhe drejtor i IDE Cert", en: "Founder and director of IDE Cert" } as L10n,
  position: {
    sq: "Profesor i asociuar, Fakulteti i Inxhinierisë Mekanike, Universiteti i Prishtinës",
    en: "Associate Professor, Faculty of Mechanical Engineering, University of Prishtina",
  } as L10n,
  credentials: [
    {
      title: { sq: "Ekspert gjyqësor", en: "Court-appointed expert" },
      text: {
        sq: "Siguria dhe shëndeti në punë, inxhinieria mekanike, makineria dhe komunikacioni.",
        en: "Occupational safety and health, mechanical engineering, machinery and transport.",
      },
    },
    {
      title: { sq: "Këshilli i Akreditimit", en: "Accreditation Council" },
      text: {
        sq: "Ekspert dhe anëtar i Këshillit të Akreditimit pranë Drejtorisë së Akreditimit të Kosovës.",
        en: "Expert and member of the Accreditation Council at the Kosovo Accreditation Directorate.",
      },
    },
    {
      title: { sq: "Anëtar i ERCA", en: "ERCA member" },
      text: {
        sq: "Shoqata Evropiane e Kurseve me Litarë. Trajnime për inspektim, operim dhe mirëmbajtje në Suedi, Angli, Holandë dhe Gjermani.",
        en: "European Ropes Course Association. Training in inspection, operation and maintenance in Sweden, England, the Netherlands and Germany.",
      },
    },
    {
      title: { sq: "ISO/IEC 17020 · 17025", en: "ISO/IEC 17020 · 17025" },
      text: {
        sq: "Trajnime në vlerësimin e konformitetit. I certifikuar për punë në lartësi.",
        en: "Training in conformity assessment. Certified for work at height.",
      },
    },
  ] as { title: L10n; text: L10n }[],
  projects: {
    ziplines: ["Përmet", "Korçë", "Pukë", "Prizren", "Theth"],
    parks: ["Prishtinë", "Kamenicë", "Pukë"],
  },
  intro: {
    sq: "Inxhinier mekanik dhe profesor universitar që projekton, inspekton dhe vlerëson sisteme sigurie në lartësi: zipline, parqe me litarë, Via Ferrata, vinça, ashensorë dhe teleferikë.",
    en: "Mechanical engineer and university professor who designs, inspects and assesses safety systems at height: zip lines, rope parks, via ferratas, cranes, lifts and cable cars.",
  } as L10n,
  /** The CV as short, scannable groups for the About page. */
  highlights: [
    {
      title: { sq: "Edukimi", en: "Education" },
      items: [
        { sq: "Doktoratë në Inxhinieri Mekanike, Universiteti i Mariborit, Slloveni", en: "PhD in Mechanical Engineering, University of Maribor, Slovenia" },
        { sq: "Studimet universitare dhe master, Universiteti i Prishtinës", en: "Bachelor's and master's studies, University of Prishtina" },
      ],
    },
    {
      title: { sq: "Rolet", en: "Roles" },
      items: [
        { sq: "Profesor i asociuar, Fakulteti i Inxhinierisë Mekanike, Universiteti i Prishtinës", en: "Associate Professor, Faculty of Mechanical Engineering, University of Prishtina" },
        { sq: "Ekspert gjyqësor: siguria dhe shëndeti në punë, inxhinieria mekanike, makineria dhe komunikacioni", en: "Court-appointed expert: occupational safety and health, mechanical engineering, machinery and transport" },
        { sq: "Ekspert dhe anëtar i Këshillit të Akreditimit, Drejtoria e Akreditimit të Kosovës", en: "Expert and member of the Accreditation Council, Kosovo Accreditation Directorate" },
        { sq: "Anëtar i ERCA (Shoqata Evropiane e Kurseve me Litarë)", en: "Member of ERCA (European Ropes Course Association)" },
      ],
    },
    {
      title: { sq: "Projektim", en: "Design" },
      items: [
        { sq: "Zipline në Përmet, Korçë, Pukë, Prizren dhe Theth", en: "Zip lines in Përmet, Korçë, Pukë, Prizren and Theth" },
        { sq: "Parqe aventure në Prishtinë, Kamenicë, Pukë dhe lokacione të tjera", en: "Adventure parks in Prishtina, Kamenica, Pukë and other locations" },
        { sq: "Via Ferrata, parqe me litarë dhe projekte komplekse inxhinierike: analiza, zgjidhje teknike, dokumentacion", en: "Via ferratas, rope parks and complex engineering projects: analysis, technical solutions, documentation" },
      ],
    },
    {
      title: { sq: "Inspektim dhe vlerësim", en: "Inspection and assessment" },
      items: [
        { sq: "Kurse me litarë dhe pajisje sigurie", en: "Ropes courses and safety equipment" },
        { sq: "Vinça, ashensorë, teleferikë dhe pajisje të tjera mekanike", en: "Cranes, lifts, cable cars and other mechanical equipment" },
        { sq: "Vlerësime sigurie për parqe aventure, zipline, Via Ferrata dhe ura tibetiane", en: "Safety assessments of adventure parks, zip lines, via ferratas and Tibetan bridges" },
        { sq: "Raporte teknike dhe dokumentacion për inspektim dhe vlerësim konformiteti", en: "Technical reports and documentation for inspection and conformity assessment" },
      ],
    },
    {
      title: { sq: "Trajnime dhe certifikime", en: "Training and certification" },
      items: [
        { sq: "ERCA: inspektim periodik dhe operativ, operim dhe mirëmbajtje e kurseve me litarë (Suedi, Angli, Holandë, Gjermani)", en: "ERCA: periodic and operational inspection, operation and maintenance of ropes courses (Sweden, England, the Netherlands, Germany)" },
        { sq: "I certifikuar për punë në lartësi", en: "Certified for work at height" },
        { sq: "Vlerësimi i konformitetit: ISO/IEC 17020 dhe ISO/IEC 17025", en: "Conformity assessment: ISO/IEC 17020 and ISO/IEC 17025" },
      ],
    },
    {
      title: { sq: "Në IDE Cert", en: "At IDE Cert" },
      items: [
        { sq: "Projektim, inspektim dhe vlerësim teknik", en: "Design, inspection and technical assessment" },
        { sq: "Dokumentacion për vlerësimin e sigurisë, konformitetit dhe certifikimit", en: "Documentation for safety, conformity and certification assessments" },
        { sq: "Punime, publikime dhe projekte të shumta në inxhinierinë mekanike", en: "Numerous papers, publications and projects in mechanical engineering" },
      ],
    },
  ] as { title: L10n; items: L10n[] }[],
};

export const distribution = {
  brands: ["Edelrid", "Pfeiffer", "TruBlue Technology"],
  text: {
    sq: "IDE Cert është distributor në Kosovë dhe Shqipëri për pajisje dhe sisteme sigurie nga prodhues të njohur ndërkombëtarë, si Edelrid, Pfeiffer dhe TruBlue Technology, dhe synon ta zgjerojë këtë veprimtari edhe në tregjet e tjera të Evropës Juglindore.",
    en: "IDE Cert is the distributor in Kosovo and Albania for safety equipment and systems from well-known international manufacturers such as Edelrid, Pfeiffer and TruBlue Technology, and aims to expand into other markets in South-East Europe.",
  } as L10n,
};

export const mottos = {
  main: { sq: "Aty ku të tjerët nuk ia dalin, ne ia arrijmë.", en: "Where others can't, we deliver." } as L10n,
  safety: { sq: "Siguria mbi të gjitha.", en: "Safety above all." } as L10n,
};
