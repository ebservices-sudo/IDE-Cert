// Starting text for new contracts, per type and language. The admin form fills these in
// and swaps them when the type or language changes, as long as they were not edited.

import type { ContractKind, ContractLanguage } from "./store";

export const KIND_OPTIONS: { value: ContractKind; label: string }[] = [
  { value: "inspection", label: "Inspection" },
  { value: "certification", label: "Certification" },
  { value: "design", label: "Design & engineering" },
  { value: "supply", label: "Supply of EDELRID equipment" },
  { value: "other", label: "Other services" },
];

type Defaults = { title: string; paymentTerms: string; unit: string };

const SQ: Record<ContractKind, Defaults> = {
  inspection: {
    title: "Inspektim periodik i sigurisë",
    paymentTerms: "50% e shumës paguhet si avans pas nënshkrimit të kontratës, ndërsa 50% brenda 15 ditësh nga dorëzimi i raportit të inspektimit.",
    unit: "shërbim",
  },
  certification: {
    title: "Vlerësim i konformitetit dhe certifikim",
    paymentTerms: "50% e shumës paguhet si avans pas nënshkrimit të kontratës, ndërsa 50% brenda 15 ditësh nga lëshimi i certifikatës ose i raportit.",
    unit: "shërbim",
  },
  design: {
    title: "Projektim dhe llogaritje inxhinierike",
    paymentTerms: "40% e shumës paguhet si avans pas nënshkrimit të kontratës, 30% pas dorëzimit të projektit ideor dhe 30% pas dorëzimit të dokumentacionit përfundimtar.",
    unit: "shërbim",
  },
  supply: {
    title: "Furnizim me pajisje EDELRID",
    paymentTerms: "100% e shumës paguhet përmes transferit bankar para porositjes së mallit te prodhuesi. Afati i dorëzimit konfirmohet pas pagesës.",
    unit: "copë",
  },
  other: {
    title: "Shërbime profesionale",
    paymentTerms: "Pagesa bëhet brenda 15 ditësh nga përfundimi i punës, me transfer bankar.",
    unit: "shërbim",
  },
};

const EN: Record<ContractKind, Defaults> = {
  inspection: {
    title: "Periodic safety inspection",
    paymentTerms: "50% of the amount is paid in advance after signing the contract and 50% within 15 days of delivery of the inspection report.",
    unit: "service",
  },
  certification: {
    title: "Conformity assessment and certification",
    paymentTerms: "50% of the amount is paid in advance after signing the contract and 50% within 15 days of issuing the certificate or report.",
    unit: "service",
  },
  design: {
    title: "Design and engineering calculations",
    paymentTerms: "40% of the amount is paid in advance after signing the contract, 30% on delivery of the concept design and 30% on delivery of the final documentation.",
    unit: "service",
  },
  supply: {
    title: "Supply of EDELRID equipment",
    paymentTerms: "100% of the amount is paid by bank transfer before the goods are ordered from the manufacturer. The delivery date is confirmed after payment.",
    unit: "pc",
  },
  other: {
    title: "Professional services",
    paymentTerms: "Payment by bank transfer within 15 days of completion of the work.",
    unit: "service",
  },
};

export const contractDefaults = (kind: ContractKind, lang: ContractLanguage): Defaults => (lang === "en" ? EN : SQ)[kind];

/** Every default title / payment text, to tell whether a field still holds untouched default text. */
export const allDefaultTexts = new Set(
  [SQ, EN].flatMap((m) => Object.values(m).flatMap((d) => [d.title, d.paymentTerms, d.unit])),
);
