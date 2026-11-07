import "server-only";
import { business } from "@/config/business";
import { site } from "@/config/site";
import type { Email } from "@/lib/server/email";
import { acceptDeadline, contractTotals, type Contract, type ContractKind, type ContractLanguage } from "./store";

// The contract as one HTML document with inline styles, so the same markup works in an
// email, on the client's contract page and printed / saved as PDF.
//
// The clauses are a solid starting point written for Kosovo, not legal advice: have a
// lawyer review them once, then change the wording here (both languages).

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const multiline = (v: string) => esc(v).replace(/\r?\n/g, "<br>");

export const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
};
const money = (cents: number) =>
  `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100)} €`;
const qty = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(n);

type Clauses = Record<ContractKind, string[]>;

const T = {
  sq: {
    kindTitle: {
      inspection: "Kontratë për shërbime inspektimi",
      certification: "Kontratë për shërbime certifikimi",
      design: "Kontratë për shërbime projektimi dhe inxhinierie",
      supply: "Kontratë për furnizim me pajisje",
      other: "Kontratë për shërbime",
    } satisfies Record<ContractKind, string>,
    number: "Nr.",
    date: "Data",
    parties: "Palët kontraktuese",
    provider: "Ofruesi i shërbimit",
    client: "Porositësi",
    supplyProvider: "Furnizuesi",
    representedBy: "Përfaqësuar nga",
    nui: "NUI",
    vat: "Nr. TVSH",
    intro: "Palët e lartpërmendura lidhin këtë kontratë me kushtet në vijim.",
    article: "Neni",
    a: {
      subject: "Objekti i kontratës",
      price: "Çmimi dhe pagesa",
      deadlines: "Afatet",
      providerDuties: "Detyrimet e Ofruesit",
      clientDuties: "Detyrimet e Porositësit",
      liability: "Përgjegjësia",
      confidentiality: "Konfidencialiteti",
      termination: "Ndërprerja e kontratës",
      force: "Forca madhore",
      special: "Kushte të veçanta",
      disputes: "Ligji në fuqi dhe mosmarrëveshjet",
      final: "Dispozitat përfundimtare",
    },
    subjectLead: (title: string) => `Ofruesi merr përsipër të kryejë për Porositësin: <strong>${title}</strong>.`,
    scope: "Përmbajtja e punës",
    location: "Vendi / objekti",
    th: { desc: "Përshkrimi", qty: "Sasia", unit: "Njësia", price: "Çmimi për njësi", total: "Shuma" },
    net: "Shuma pa TVSH",
    vatLine: (r: number) => `TVSH ${r}%`,
    noVat: "Pa TVSH",
    total: "Totali për pagesë",
    paymentTerms: "Kushtet e pagesës",
    bank: "Pagesa bëhet në llogarinë bankare",
    bankHolder: "Mbajtësi i llogarisë",
    bankName: "Banka",
    reference: "Referenca",
    start: "Fillimi i punës",
    end: "Përfundimi / dorëzimi",
    noDates: "Afatet e sakta i caktojnë palët me marrëveshje, pas nënshkrimit të kontratës.",
    nextInspection: (d: string) => `Inspektimi i radhës periodik rekomandohet të kryhet deri më <strong>${d}</strong>.`,
    providerDuties: {
      inspection: [
        "Kryen inspektimin e objektit dhe të pajisjeve të përshkruara në Nenin 1, sipas standardeve dhe rregullave teknike në fuqi që vlejnë për to.",
        "Inspektimin e kryen me personel të kualifikuar dhe me mjete matëse të përshtatshme.",
        "I dorëzon Porositësit raport me shkrim me gjetjet, vlerësimin dhe rekomandimet, brenda afatit të Nenit 3.",
        "E njofton menjëherë Porositësin për çdo defekt që rrezikon sigurinë e përdoruesve.",
      ],
      certification: [
        "Shqyrton dokumentacionin teknik dhe kryen kontrollet e nevojshme për vlerësimin e konformitetit.",
        "Lëshon certifikatën kur objekti ose pajisja i plotëson kërkesat; në të kundërtën, i jep Porositësit listën e mospërputhjeve që duhet të korrigjohen.",
        "Punën e kryen me personel të kualifikuar, në mënyrë të paanshme dhe të pavarur.",
        "E njofton menjëherë Porositësin për çdo defekt që rrezikon sigurinë e përdoruesve.",
      ],
      design: [
        "Harton dokumentacionin e projektit (vizatime, llogaritje statike dhe përshkrime teknike) sipas kërkesave të Porositësit dhe standardeve në fuqi.",
        "Konsultohet me Porositësin në fazat kryesore të projektit dhe i merr parasysh vërejtjet e tij.",
        "Dorëzon dokumentacionin përfundimtar në formë elektronike dhe, me kërkesë, edhe të shtypur.",
        "Ofruesi ruan të drejtat e autorit mbi projektin; Porositësi fiton të drejtën ta përdorë për objektin e kësaj kontrate.",
      ],
      supply: [
        "Furnizon pajisje origjinale EDELRID, të reja dhe të papërdorura, sipas specifikimit në Nenin 2.",
        "Bashkë me pajisjet dorëzon deklaratat e konformitetit dhe udhëzimet e përdorimit, aty ku prodhuesi i ofron.",
        "Dorëzon në vendin dhe në afatin e caktuar; rreziku kalon te Porositësi me dorëzimin.",
        "Për pajisjet vlen garancia sipas kushteve të prodhuesit.",
      ],
      other: [
        "Kryen shërbimet e përshkruara në Nenin 1 me kujdes profesional dhe sipas standardeve në fuqi.",
        "E njofton Porositësin pa vonesë për çdo rrethanë që ndikon në afatet ose në rezultatin e punës.",
      ],
    } satisfies Clauses,
    clientDuties: {
      base: ["Paguan çmimin sipas Nenit 2."],
      site: [
        "Siguron qasje të sigurt dhe në kohë në objekt dhe te pajisjet, si dhe një person kontakti gjatë punës.",
        "Vë në dispozicion dokumentacionin teknik ekzistues: projektet, manualet, raportet e mëparshme dhe evidencat e mirëmbajtjes.",
      ],
      safety: ["Pajisjet e shënuara si të pasigurta nuk i përdor deri në riparim dhe rikontroll."],
      supply: ["Pranon dorëzimin dhe e kontrollon mallin; vërejtjet për dëmtime të dukshme i paraqet me shkrim brenda 8 ditësh."],
    },
    liability:
      "Gjetjet e Ofruesit pasqyrojnë gjendjen e objektit dhe të pajisjeve në kohën e kontrollit. Ofruesi nuk mban përgjegjësi për dëme që vijnë nga përdorimi i gabuar, mungesa e mirëmbajtjes, ndryshimet ose riparimet e bëra pas kontrollit, apo nga informacione të pasakta të dhëna nga Porositësi. Përdorimi i përditshëm dhe mirëmbajtja e objektit mbeten përgjegjësi e Porositësit. Përveç rasteve të qëllimit ose të pakujdesisë së rëndë, përgjegjësia e Ofruesit kufizohet në vlerën e kësaj kontrate.",
    liabilitySupply:
      "Për pajisjet e furnizuara vlen garancia e prodhuesit. Ofruesi nuk mban përgjegjësi për dëme nga përdorimi në kundërshtim me udhëzimet e prodhuesit ose nga mungesa e kontrolleve periodike të detyrueshme. Përveç rasteve të qëllimit ose të pakujdesisë së rëndë, përgjegjësia e Ofruesit kufizohet në vlerën e kësaj kontrate.",
    confidentiality:
      "Palët i ruajnë si konfidenciale të dhënat dhe dokumentet që marrin nga njëra-tjetra gjatë zbatimit të kësaj kontrate dhe nuk ua japin palëve të treta pa pëlqimin me shkrim, përveç kur e kërkon ligji ose një organ kompetent.",
    termination:
      "Secila palë mund ta ndërpresë kontratën me njoftim me shkrim 15 ditë përpara. Në rast të shkeljes së rëndë të detyrimeve, pala tjetër mund ta ndërpresë menjëherë. Në çdo rast, Porositësi paguan punën e kryer deri në ditën e ndërprerjes.",
    force:
      "Asnjëra palë nuk përgjigjet për vonesa ose mospërmbushje të shkaktuara nga forca madhore (fatkeqësi natyrore, kushte të rrezikshme moti, vendime të autoriteteve dhe ngjarje të tjera jashtë kontrollit të palëve). Pala e prekur e njofton tjetrën pa vonesë dhe afatet zgjaten për kohën e pengesës.",
    disputes:
      "Për këtë kontratë zbatohen ligjet e Republikës së Kosovës. Palët përpiqen t'i zgjidhin mosmarrëveshjet me marrëveshje. Nëse kjo nuk arrihet, kompetente është Gjykata Themelore në Prishtinë.",
    final: [
      "Kontrata hyn në fuqi në ditën e nënshkrimit ose të pranimit nga Porositësi. Ndryshimet dhe plotësimet bëhen vetëm me shkrim.",
      "Porositësi mund ta pranojë kontratën edhe elektronikisht, përmes lidhjes personale që i dërgohet me email. Palët pajtohen që pranimi elektronik, i regjistruar me emrin, datën dhe orën, vlen si pëlqim i Porositësit për këtë kontratë.",
      "Me kërkesën e secilës palë, kontrata nënshkruhet edhe në letër, në dy kopje të njëjta, nga një për secilën palë.",
    ],
    validUntil: (d: string) => `Kjo kontratë mund të pranohet deri më ${d}.`,
    signatures: "Nënshkrimet",
    signHere: "Nënshkrimi dhe vula",
    placeDate: "Vendi dhe data",
    acceptedStamp: (name: string, when: string) => `Pranuar elektronikisht nga ${name} më ${when}`,
    footer: "Dokument i krijuar nga IDE Cert",
  },
  en: {
    kindTitle: {
      inspection: "Contract for inspection services",
      certification: "Contract for certification services",
      design: "Contract for design and engineering services",
      supply: "Contract for the supply of equipment",
      other: "Service contract",
    } satisfies Record<ContractKind, string>,
    number: "No.",
    date: "Date",
    parties: "Contracting parties",
    provider: "Service provider",
    client: "Client",
    supplyProvider: "Supplier",
    representedBy: "Represented by",
    nui: "Business no. (NUI)",
    vat: "VAT no.",
    intro: "The parties named above enter into this contract on the following terms.",
    article: "Article",
    a: {
      subject: "Subject of the contract",
      price: "Price and payment",
      deadlines: "Schedule",
      providerDuties: "Obligations of the Provider",
      clientDuties: "Obligations of the Client",
      liability: "Liability",
      confidentiality: "Confidentiality",
      termination: "Termination",
      force: "Force majeure",
      special: "Special terms",
      disputes: "Governing law and disputes",
      final: "Final provisions",
    },
    subjectLead: (title: string) => `The Provider undertakes to carry out for the Client: <strong>${title}</strong>.`,
    scope: "Scope of work",
    location: "Site / object",
    th: { desc: "Description", qty: "Qty", unit: "Unit", price: "Unit price", total: "Amount" },
    net: "Amount excl. VAT",
    vatLine: (r: number) => `VAT ${r}%`,
    noVat: "No VAT",
    total: "Total due",
    paymentTerms: "Payment terms",
    bank: "Payment by bank transfer to",
    bankHolder: "Account holder",
    bankName: "Bank",
    reference: "Reference",
    start: "Start of work",
    end: "Completion / delivery",
    noDates: "The exact dates are agreed between the parties after the contract is signed.",
    nextInspection: (d: string) => `The next periodic inspection is recommended by <strong>${d}</strong>.`,
    providerDuties: {
      inspection: [
        "Inspects the site and equipment described in Article 1 according to the standards and technical rules that apply to them.",
        "Carries out the inspection with qualified staff and suitable measuring equipment.",
        "Delivers a written report with the findings, assessment and recommendations within the schedule in Article 3.",
        "Informs the Client immediately of any defect that endangers the safety of users.",
      ],
      certification: [
        "Reviews the technical documentation and carries out the checks needed to assess conformity.",
        "Issues the certificate when the site or equipment meets the requirements; otherwise gives the Client the list of non-conformities to correct.",
        "Works with qualified staff, impartially and independently.",
        "Informs the Client immediately of any defect that endangers the safety of users.",
      ],
      design: [
        "Prepares the design documentation (drawings, structural calculations and technical descriptions) to the Client's requirements and the applicable standards.",
        "Consults the Client at the main stages of the design and takes their comments into account.",
        "Delivers the final documentation electronically and, on request, on paper.",
        "The Provider keeps the copyright in the design; the Client may use it for the site covered by this contract.",
      ],
      supply: [
        "Supplies original EDELRID equipment, new and unused, as specified in Article 2.",
        "Delivers the declarations of conformity and instructions for use with the equipment, where the manufacturer provides them.",
        "Delivers at the agreed place and time; the risk passes to the Client on delivery.",
        "The manufacturer's warranty applies to the equipment.",
      ],
      other: [
        "Carries out the services described in Article 1 with professional care and according to the applicable standards.",
        "Informs the Client without delay of anything that affects the schedule or the result of the work.",
      ],
    } satisfies Clauses,
    clientDuties: {
      base: ["Pays the price according to Article 2."],
      site: [
        "Provides safe and timely access to the site and equipment, and a contact person during the work.",
        "Makes the existing technical documentation available: designs, manuals, previous reports and maintenance records.",
      ],
      safety: ["Does not use equipment marked as unsafe until it has been repaired and checked again."],
      supply: ["Accepts the delivery and checks the goods; reports visible damage in writing within 8 days."],
    },
    liability:
      "The Provider's findings reflect the condition of the site and equipment at the time of the check. The Provider is not liable for damage caused by improper use, lack of maintenance, changes or repairs made after the check, or incorrect information given by the Client. Day-to-day operation and maintenance remain the Client's responsibility. Except in cases of intent or gross negligence, the Provider's liability is limited to the value of this contract.",
    liabilitySupply:
      "The manufacturer's warranty applies to the supplied equipment. The Provider is not liable for damage caused by use contrary to the manufacturer's instructions or by missing mandatory periodic inspections. Except in cases of intent or gross negligence, the Provider's liability is limited to the value of this contract.",
    confidentiality:
      "The parties keep confidential the information and documents they receive from each other while performing this contract and do not pass them to third parties without written consent, unless required by law or a competent authority.",
    termination:
      "Either party may terminate the contract with 15 days' written notice. In the event of a serious breach of obligations, the other party may terminate it immediately. In every case, the Client pays for the work carried out up to the date of termination.",
    force:
      "Neither party is liable for delays or non-performance caused by force majeure (natural disasters, dangerous weather, decisions of authorities and other events beyond the parties' control). The affected party informs the other without delay and the deadlines are extended for the duration of the obstacle.",
    disputes:
      "This contract is governed by the laws of the Republic of Kosovo. The parties will try to settle disputes by agreement. If that fails, the Basic Court in Prishtina has jurisdiction.",
    final: [
      "The contract enters into force on the day it is signed or accepted by the Client. Changes and additions are valid only in writing.",
      "The Client may also accept the contract electronically, through the personal link sent by email. The parties agree that electronic acceptance, recorded with the name, date and time, counts as the Client's consent to this contract.",
      "At the request of either party, the contract is also signed on paper in two identical copies, one for each party.",
    ],
    validUntil: (d: string) => `This contract can be accepted until ${d}.`,
    signatures: "Signatures",
    signHere: "Signature and stamp",
    placeDate: "Place and date",
    acceptedStamp: (name: string, when: string) => `Accepted electronically by ${name} on ${when}`,
    footer: "Document created by IDE Cert",
  },
} as const;

export const kindLabel = (kind: ContractKind, lang: ContractLanguage = "en") => T[lang].kindTitle[kind];

const C = {
  ink: "#141414",
  muted: "#5f5f5c",
  line: "#e4e4e1",
  soft: "#f5f5f4",
  red: "#ce2c31",
  font: "Arial,Helvetica,sans-serif",
};

function article(n: number, label: string, title: string, body: string) {
  return `<tr><td style="padding:22px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font:700 11px/1 ${C.font};letter-spacing:2px;text-transform:uppercase;color:${C.red};padding:0 0 6px">${esc(label)} ${n}</td></tr>
<tr><td style="font:700 16px/1.3 ${C.font};color:${C.ink};padding:0 0 10px;border-bottom:1px solid ${C.line}">${esc(title)}</td></tr>
<tr><td style="font:400 14px/1.65 ${C.font};color:${C.ink};padding:10px 0 0">${body}</td></tr></table></td></tr>`;
}

const list = (items: readonly string[]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items
    .map(
      (t) =>
        `<tr><td style="width:18px;vertical-align:top;padding:2px 0 6px;color:${C.red};font:700 14px/1.65 ${C.font}">&#8212;</td><td style="padding:2px 0 6px;font:400 14px/1.65 ${C.font};color:${C.ink}">${esc(t)}</td></tr>`,
    )
    .join("")}</table>`;

function partyBlock(heading: string, lines: (string | null | false)[]) {
  return `<td width="50%" style="vertical-align:top;padding:16px 18px;background:${C.soft};border-top:3px solid ${C.ink}">
<div style="font:700 10px/1 ${C.font};letter-spacing:2px;text-transform:uppercase;color:${C.muted};margin:0 0 10px">${esc(heading)}</div>
<div style="font:400 13.5px/1.6 ${C.font};color:${C.ink}">${lines.filter(Boolean).join("<br>")}</div></td>`;
}

/** The full contract document (HTML with inline styles). */
export function contractDocumentHtml(c: Contract, opts: { issuedAt?: string } = {}) {
  const t = T[c.language];
  const totals = contractTotals(c);
  const issued = formatDate(c.sentAt ?? opts.issuedAt ?? c.createdAt);
  const isSupply = c.kind === "supply";
  const providerHeading = isSupply ? t.supplyProvider : t.provider;

  const provider = partyBlock(providerHeading, [
    `<strong>${esc(business.legalName)}</strong>`,
    `${esc(site.address.street)}, ${esc(site.address.locality)}`,
    `${esc(site.address.postalCode)} ${esc(site.address.city)}, Kosovo`,
    business.nui && `${t.nui}: ${esc(business.nui)}`,
    business.vatNumber && `${t.vat}: ${esc(business.vatNumber)}`,
    `${t.representedBy}: ${esc(site.owner)}`,
    `${esc(site.email)} · ${esc(site.phones[0].display)}`,
  ]);
  const client = partyBlock(t.client, [
    `<strong>${esc(c.clientCompany || c.clientName)}</strong>`,
    c.clientAddress && multiline(c.clientAddress),
    c.clientNui && `${t.nui}: ${esc(c.clientNui)}`,
    `${t.representedBy}: ${esc(c.clientRepresentative || c.clientName)}`,
    [c.clientEmail, c.clientPhone].filter(Boolean).map(esc).join(" · "),
  ]);

  const rows = c.items
    .map(
      (i) => `<tr>
<td style="padding:10px 8px 10px 0;border-bottom:1px solid ${C.line};vertical-align:top">${multiline(i.description)}</td>
<td style="padding:10px 8px;border-bottom:1px solid ${C.line};text-align:right;white-space:nowrap;vertical-align:top">${qty(i.quantity)}</td>
<td style="padding:10px 8px;border-bottom:1px solid ${C.line};white-space:nowrap;vertical-align:top">${esc(i.unit)}</td>
<td style="padding:10px 8px;border-bottom:1px solid ${C.line};text-align:right;white-space:nowrap;vertical-align:top">${money(i.unitCents)}</td>
<td style="padding:10px 0 10px 8px;border-bottom:1px solid ${C.line};text-align:right;white-space:nowrap;vertical-align:top">${money(Math.round(i.quantity * i.unitCents))}</td></tr>`,
    )
    .join("");
  // Same horizontal padding as the body cells, so headings line up with their columns.
  const th = (s: string, right = false, pad = "0 8px 8px 8px") =>
    `<th style="padding:${pad};text-align:${right ? "right" : "left"};font:700 10px/1.2 ${C.font};letter-spacing:1px;text-transform:uppercase;color:${C.muted};border-bottom:2px solid ${C.ink};white-space:nowrap">${esc(s)}</th>`;
  const sumRow = (label: string, value: string, strong = false) =>
    `<tr><td colspan="4" style="padding:${strong ? "10px" : "6px"} 8px 0 0;text-align:right;${strong ? `font-weight:700;font-size:15px` : `color:${C.muted}`}">${esc(label)}</td><td style="padding:${strong ? "10px" : "6px"} 0 0 8px;text-align:right;white-space:nowrap;${strong ? `font-weight:700;font-size:15px;color:${C.red}` : ""}">${value}</td></tr>`;
  const priceTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:400 13.5px/1.5 ${C.font};color:${C.ink}">
<tr>${th(t.th.desc, false, "0 8px 8px 0")}${th(t.th.qty, true)}${th(t.th.unit)}${th(t.th.price, true)}${th(t.th.total, true, "0 0 8px 8px")}</tr>${rows}
${sumRow(t.net, money(totals.net))}
${sumRow(c.vatRate ? t.vatLine(c.vatRate) : t.noVat, money(totals.vat))}
${sumRow(t.total, money(totals.total), true)}</table>`;

  const bankComplete = business.bank.iban && business.bank.name;
  const bank = bankComplete
    ? `<p style="margin:14px 0 0">${esc(t.bank)}:<br>${esc(t.bankHolder)}: <strong>${esc(business.bank.accountHolder)}</strong> · ${esc(t.bankName)}: <strong>${esc(business.bank.name)}</strong><br>IBAN: <strong>${esc(business.bank.iban)}</strong>${business.bank.swift ? ` · SWIFT: <strong>${esc(business.bank.swift)}</strong>` : ""}<br>${esc(t.reference)}: <strong>${esc(c.number)}</strong></p>`
    : "";

  const clientDuties = [
    ...t.clientDuties.base,
    ...(isSupply ? t.clientDuties.supply : t.clientDuties.site),
    ...(c.kind === "inspection" || c.kind === "certification" ? t.clientDuties.safety : []),
  ];

  const dates =
    c.startDate || c.endDate
      ? `${c.startDate ? `${esc(t.start)}: <strong>${formatDate(c.startDate)}</strong>` : ""}${c.startDate && c.endDate ? "<br>" : ""}${c.endDate ? `${esc(t.end)}: <strong>${formatDate(c.endDate)}</strong>` : ""}`
      : esc(t.noDates);
  const nextInsp = c.nextInspectionDate && (c.kind === "inspection" || c.kind === "certification") ? `<p style="margin:10px 0 0">${t.nextInspection(formatDate(c.nextInspectionDate))}</p>` : "";

  const sections: [string, string][] = [
    [
      t.a.subject,
      `<p style="margin:0">${t.subjectLead(esc(c.title))}</p>
<p style="margin:12px 0 4px;font-weight:700">${esc(t.scope)}</p><p style="margin:0">${multiline(c.scope)}</p>
${c.location ? `<p style="margin:12px 0 4px;font-weight:700">${esc(t.location)}</p><p style="margin:0">${multiline(c.location)}</p>` : ""}`,
    ],
    [t.a.price, `${priceTable}<p style="margin:16px 0 4px;font-weight:700">${esc(t.paymentTerms)}</p><p style="margin:0">${multiline(c.paymentTerms)}</p>${bank}`],
    [t.a.deadlines, `<p style="margin:0">${dates}</p>${nextInsp}`],
    [t.a.providerDuties, list(t.providerDuties[c.kind])],
    [t.a.clientDuties, list(clientDuties)],
    [t.a.liability, `<p style="margin:0">${esc(isSupply ? t.liabilitySupply : t.liability)}</p>`],
    [t.a.confidentiality, `<p style="margin:0">${esc(t.confidentiality)}</p>`],
    [t.a.termination, `<p style="margin:0">${esc(t.termination)}</p>`],
    [t.a.force, `<p style="margin:0">${esc(t.force)}</p>`],
    ...(c.specialTerms ? ([[t.a.special, `<p style="margin:0">${multiline(c.specialTerms)}</p>`]] as [string, string][]) : []),
    [t.a.disputes, `<p style="margin:0">${esc(t.disputes)}</p>`],
    [t.a.final, list(t.final)],
  ];

  const deadline = acceptDeadline(c);
  const accepted = c.status === "accepted" && c.acceptedAt && c.acceptedName;
  const acceptedWhen = accepted
    ? `${formatDate(c.acceptedAt)} ${new Date(c.acceptedAt!).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Belgrade" })}`
    : "";

  const signature = (heading: string, who: string, stamp?: string) => `<td width="50%" style="vertical-align:top;padding:0 ${heading === providerHeading ? "14px 0 0" : "0 0 14px"}">
<div style="font:700 10px/1 ${C.font};letter-spacing:2px;text-transform:uppercase;color:${C.muted};margin:0 0 8px">${esc(heading)}</div>
<div style="font:700 13.5px/1.4 ${C.font};color:${C.ink}">${who}</div>
${
  stamp
    ? `<div style="margin:18px 0 0;padding:10px 12px;border:2px solid ${C.red};color:${C.red};font:700 12px/1.4 ${C.font};text-transform:uppercase;letter-spacing:1px">&#10003; ${esc(stamp)}</div>`
    : `<div style="height:56px;border-bottom:1px solid ${C.ink}"></div>
<div style="font:400 11px/1.4 ${C.font};color:${C.muted};padding:6px 0 0">${esc(t.signHere)}</div>`
}
<div style="height:30px;border-bottom:1px solid ${C.line}"></div>
<div style="font:400 11px/1.4 ${C.font};color:${C.muted};padding:6px 0 0">${esc(t.placeDate)}</div></td>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;margin:0 auto;background:#ffffff;font-family:${C.font};color:${C.ink}">
<tr><td style="background:${C.ink};padding:26px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font:800 22px/1 ${C.font};letter-spacing:2px;color:#ffffff">IDE <span style="color:#e5484d">CERT</span></td>
<td style="text-align:right;font:400 11px/1.6 ${C.font};color:#a8a49d">${site.disciplines.map(esc).join(" · ")}</td></tr></table></td></tr>
<tr><td style="height:4px;background:${C.red};font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:30px 32px 6px">
<div style="font:700 11px/1 ${C.font};letter-spacing:2px;text-transform:uppercase;color:${C.red}">${esc(t.number)} ${esc(c.number)} · ${esc(t.date)} ${issued}</div>
<h1 style="margin:10px 0 0;font:800 26px/1.2 ${C.font};color:${C.ink}">${esc(t.kindTitle[c.kind])}</h1>
<p style="margin:8px 0 0;font:400 15px/1.5 ${C.font};color:${C.muted}">${esc(c.title)}</p></td></tr>
<tr><td style="padding:22px 32px 0">
<div style="font:700 11px/1 ${C.font};letter-spacing:2px;text-transform:uppercase;color:${C.muted};margin:0 0 10px">${esc(t.parties)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${provider}<td style="width:12px">&nbsp;</td>${client}</tr></table>
<p style="margin:16px 0 0;font:400 14px/1.6 ${C.font}">${esc(t.intro)}</p></td></tr>
<tr><td style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${sections.map(([title, body], i) => article(i + 1, t.article, title, body)).join("\n")}
</table></td></tr>
${deadline && c.status === "sent" ? `<tr><td style="padding:22px 32px 0;font:400 13px/1.5 ${C.font};color:${C.muted}">${esc(t.validUntil(formatDate(deadline.toISOString())))}</td></tr>` : ""}
<tr><td style="padding:30px 32px 8px">
<div style="font:700 11px/1 ${C.font};letter-spacing:2px;text-transform:uppercase;color:${C.muted};margin:0 0 16px">${esc(t.signatures)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
${signature(providerHeading, `${esc(business.legalName)}<br><span style="font-weight:400">${esc(site.owner)}</span>`)}
${signature(t.client, `${esc(c.clientCompany || c.clientName)}<br><span style="font-weight:400">${esc(c.clientRepresentative || c.clientName)}</span>`, accepted ? t.acceptedStamp(c.acceptedName!, acceptedWhen) : undefined)}
</tr></table></td></tr>
<tr><td style="padding:26px 32px;border-top:1px solid ${C.line};font:400 11px/1.6 ${C.font};color:${C.muted}">
${esc(site.legalName)} · ${esc(site.address.street)}, ${esc(site.address.locality)}, ${esc(site.address.postalCode)} ${esc(site.address.city)}, Kosovo · ${site.phones.map((p) => esc(p.display)).join(" · ")} · ${esc(site.email)}<br>${esc(t.footer)} · ${esc(c.number)}</td></tr>
</table>`;
}

// ---- emails -------------------------------------------------------------------

const E = {
  sq: {
    subject: (n: string, title: string) => `Kontrata ${n} · ${title}`,
    hello: (name: string) => `I/e nderuar ${name},`,
    lead: "ju falënderojmë për besimin. Më poshtë gjeni kontratën e përgatitur për ju. Mund ta lexoni, ta ruani si PDF dhe ta pranoni online përmes butonit.",
    button: "Shiko dhe prano kontratën",
    until: (d: string) => `Kontrata mund të pranohet deri më ${d}.`,
    questions: "Për çdo pyetje, thjesht përgjigjuni këtij emaili ose na telefononi.",
    regards: "Me respekt,",
  },
  en: {
    subject: (n: string, title: string) => `Contract ${n} · ${title}`,
    hello: (name: string) => `Dear ${name},`,
    lead: "thank you for your trust. Below is the contract we prepared for you. You can read it, save it as a PDF and accept it online with the button.",
    button: "View and accept the contract",
    until: (d: string) => `The contract can be accepted until ${d}.`,
    questions: "If you have any questions, just reply to this email or call us.",
    regards: "Kind regards,",
  },
} as const;

/** Email to the client with the full contract and the personal acceptance link. */
export function contractEmail(c: Contract, link: string, note?: string): Email {
  const e = E[c.language];
  const deadline = acceptDeadline({ sentAt: new Date().toISOString(), validityDays: c.validityDays })!;
  const subject = e.subject(c.number, c.title);
  const button = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0"><tr><td style="background:${C.red};border-radius:6px">
<a href="${esc(link)}" style="display:inline-block;padding:14px 26px;font:700 15px/1 ${C.font};color:#ffffff;text-decoration:none">${esc(e.button)} &rarr;</a></td></tr></table>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;background:${C.soft};font-family:${C.font};color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;background:#ffffff"><tr><td style="padding:28px 32px 6px;font:400 15px/1.6 ${C.font}">
<p style="margin:0 0 12px">${esc(e.hello(c.clientName))}</p>
<p style="margin:0">${esc(e.lead)}</p>
${note ? `<p style="margin:14px 0 0;padding:12px 14px;background:${C.soft};border-left:3px solid ${C.red}">${multiline(note)}</p>` : ""}
${button}
<p style="margin:0 0 6px;color:${C.muted};font-size:13px">${esc(e.until(formatDate(deadline.toISOString())))}</p>
</td></tr>
<tr><td style="padding:10px 0 0">${contractDocumentHtml({ ...c, status: "sent", sentAt: new Date().toISOString() })}</td></tr>
<tr><td style="padding:10px 32px 28px;font:400 15px/1.6 ${C.font}">${button}
<p style="margin:0">${esc(e.questions)}</p><p style="margin:14px 0 0">${esc(e.regards)}<br><strong>${esc(site.owner)}</strong><br>${esc(site.legalName)} · ${esc(site.phones[0].display)}</p></td></tr>
</table></td></tr></table></body></html>`;
  const totals = contractTotals(c);
  const text = `${e.hello(c.clientName)}

${e.lead}
${note ? `\n${note}\n` : ""}
${kindLabel(c.kind, c.language)} ${c.number}
${c.title}
${money(totals.total)}

${e.button}: ${link}
${e.until(formatDate(deadline.toISOString()))}

${e.questions}

${e.regards}
${site.owner}
${site.legalName} · ${site.phones[0].display}`;
  return { to: c.clientEmail, subject, html, text, replyTo: site.email };
}

/** Notification to IDE Cert when a client accepts a contract online. */
export function contractAcceptedEmail(c: Contract, to: string, adminUrl: string): Email {
  const totals = contractTotals(c);
  const subject = `Contract ${c.number} accepted by ${c.clientCompany || c.clientName}`;
  const lines = [
    `${c.acceptedName} accepted contract ${c.number} online on ${formatDate(c.acceptedAt)}.`,
    `${c.title} · ${money(totals.total)} incl. VAT`,
    `Client: ${c.clientCompany || c.clientName} <${c.clientEmail}>`,
  ];
  const html = `<!doctype html><html><body style="margin:0;background:${C.soft};font-family:${C.font};color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff">
<tr><td style="background:${C.ink};padding:18px 28px;color:#fff;font:800 18px/1 ${C.font};letter-spacing:1px">IDE <span style="color:#e5484d">CERT</span></td></tr>
<tr><td style="padding:26px 28px;font:400 15px/1.6 ${C.font}">
<p style="margin:0 0 10px;font-size:20px;font-weight:700;color:${C.red}">&#10003; Contract accepted</p>
${lines.map((l) => `<p style="margin:0 0 6px">${esc(l)}</p>`).join("")}
<p style="margin:18px 0 0"><a href="${esc(adminUrl)}" style="color:${C.red};font-weight:700">Open the contract</a></p></td></tr></table></td></tr></table></body></html>`;
  return { to, subject, html, text: `${lines.join("\n")}\n\n${adminUrl}`, replyTo: c.clientEmail };
}
