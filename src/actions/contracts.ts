"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { requireAdmin } from "@/lib/auth/session";
import { contractAcceptedEmail, contractEmail } from "@/lib/contracts/document";
import {
  acceptContract,
  acceptanceExpired,
  CONTRACT_KINDS,
  createContract,
  deleteContractById,
  getContract,
  getContractByToken,
  markContractSent,
  setContractStatus,
  updateContract,
  type ContractInput,
  type ContractItem,
  type ContractKind,
} from "@/lib/contracts/store";
import { FormReader, type FieldErrors } from "@/lib/forms";
import { getQuote, updateMessageStatus, updateQuote } from "@/lib/orders/queries";
import { sendEmail, shopInbox } from "@/lib/server/email";
import { requestOrigin } from "@/lib/server/origin";

// Every admin action re-checks the session: server actions are public endpoints.

export type ContractFormState = { status: "idle" } | { status: "error"; message: string; errors?: FieldErrors };
export type ContractActionState = { status: "idle" } | { status: "ok"; message: string } | { status: "error"; message: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const date = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return DATE.test(s) ? s : null;
};
const opt = (s: string) => (s ? s : null);

/** Amount typed in euros ("1.250,50", "1250.5", "1250") → cents, or NaN. */
function cents(raw: string) {
  let s = raw.trim().replace(/\s|€/g, "");
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number(s);
  return s && Number.isFinite(n) && n >= 0 && n < 10_000_000 ? Math.round(n * 100) : NaN;
}

export async function saveContract(_prev: ContractFormState, fd: FormData): Promise<ContractFormState> {
  await requireAdmin();
  const f = new FormReader(fd);
  const id = String(fd.get("id") ?? "");
  const kind = String(fd.get("kind")) as ContractKind;
  if (!CONTRACT_KINDS.includes(kind)) f.errors.kind = "Choose the type of contract.";
  const language = fd.get("language") === "en" ? "en" : "sq";

  const clientName = f.text("clientName", { required: true, max: 160, label: "Client name" });
  const clientEmail = f.email("clientEmail");
  const clientCompany = f.text("clientCompany", { max: 200 });
  const clientNui = f.text("clientNui", { max: 40 });
  const clientRepresentative = f.text("clientRepresentative", { max: 160 });
  const clientAddress = f.longText("clientAddress", { max: 400 });
  const clientPhone = f.text("clientPhone", { max: 40 });
  const title = f.text("title", { required: true, max: 200, label: "Title" });
  const scope = f.longText("scope", { required: true, max: 6000, label: "Scope of work" });
  const location = f.longText("location", { max: 600 });
  const paymentTerms = f.longText("paymentTerms", { required: true, max: 2000, label: "Payment terms" });
  const specialTerms = f.longText("specialTerms", { max: 6000 });
  const internalNotes = f.longText("internalNotes", { max: 4000 });

  const items: ContractItem[] = [];
  const descs = fd.getAll("itemDesc");
  const qtys = fd.getAll("itemQty");
  const units = fd.getAll("itemUnit");
  const prices = fd.getAll("itemPrice");
  for (let i = 0; i < Math.min(descs.length, 60); i++) {
    const description = String(descs[i] ?? "").trim().slice(0, 600);
    const qtyRaw = String(qtys[i] ?? "").trim().replace(",", ".");
    const priceRaw = String(prices[i] ?? "");
    if (!description && !qtyRaw && !priceRaw.trim()) continue;
    const quantity = Number(qtyRaw || "1");
    const unitCents = cents(priceRaw);
    if (!description || !Number.isFinite(quantity) || quantity <= 0 || quantity > 1_000_000 || Number.isNaN(unitCents)) {
      f.errors.items = `Line ${i + 1}: enter a description, a quantity above 0 and a price in euros (e.g. 450 or 1.250,50).`;
      break;
    }
    items.push({ description, quantity, unit: String(units[i] ?? "").trim().slice(0, 30) || "—", unitCents });
  }
  if (!items.length && !f.errors.items) f.errors.items = "Add at least one price line.";

  const vatRate = fd.get("vat") === "0" ? 0 : 18;
  const validityDays = Math.min(180, Math.max(1, Number(fd.get("validityDays")) || 30));
  const startDate = date(fd.get("startDate"));
  const endDate = date(fd.get("endDate"));
  if (startDate && endDate && endDate < startDate) f.errors.endDate = "The end date is before the start date.";
  const nextInspectionDate = date(fd.get("nextInspectionDate"));

  if (!f.ok) return { status: "error", message: "Please check the highlighted fields.", errors: f.errors };

  const st = String(fd.get("sourceType") ?? "");
  const input: ContractInput = {
    language,
    kind,
    sourceType: st === "quote" || st === "message" || st === "order" ? st : null,
    sourceId: opt(String(fd.get("sourceId") ?? "").slice(0, 80)),
    sourceNumber: opt(String(fd.get("sourceNumber") ?? "").slice(0, 40)),
    clientName,
    clientCompany: opt(clientCompany),
    clientNui: opt(clientNui),
    clientRepresentative: opt(clientRepresentative),
    clientAddress: opt(clientAddress),
    clientEmail,
    clientPhone: opt(clientPhone),
    title,
    scope,
    location: opt(location),
    startDate,
    endDate,
    items,
    vatRate,
    paymentTerms,
    validityDays,
    specialTerms: opt(specialTerms),
    nextInspectionDate,
    internalNotes: opt(internalNotes),
  };

  let targetId = id;
  if (id) {
    const existing = await getContract(id);
    if (!existing) return { status: "error", message: "Contract not found." };
    if (existing.status === "accepted") return { status: "error", message: "An accepted contract can no longer be changed. Create a new one instead." };
    await updateContract(id, input);
  } else {
    targetId = (await createContract(input)).id;
  }
  redirect(`/admin/contracts/${targetId}?saved=1`);
}

export async function sendContract(_prev: ContractActionState, fd: FormData): Promise<ContractActionState> {
  await requireAdmin();
  const c = await getContract(String(fd.get("id")));
  if (!c) return { status: "error", message: "Contract not found." };
  if (c.status === "accepted") return { status: "error", message: "This contract is already accepted." };
  if (c.status === "cancelled") return { status: "error", message: "This contract is cancelled. Reopen it first." };
  const note = String(fd.get("note") ?? "").trim().slice(0, 1500);
  const link = `${await requestOrigin()}/kontrata/${c.token}`;
  const r = await sendEmail(contractEmail(c, link, note || undefined));
  if (!r.ok) return { status: "error", message: `The email could not be sent: ${r.error}` };
  await markContractSent(c.id, c.clientEmail);
  // The request it came from now has an answer.
  if (c.sourceType === "quote" && c.sourceId) {
    const q = await getQuote(c.sourceId);
    if (q?.status === "new") await updateQuote(q.id, { status: "answered" });
  }
  if (c.sourceType === "message" && c.sourceId) await updateMessageStatus(c.sourceId, "answered");
  refresh();
  return { status: "ok", message: `Sent to ${c.clientEmail}.` };
}

export async function changeContractStatus(fd: FormData) {
  await requireAdmin();
  const c = await getContract(String(fd.get("id")));
  if (!c) return;
  const to = String(fd.get("status"));
  if (to === "cancelled" && c.status !== "accepted") await setContractStatus(c.id, "cancelled");
  if (to === "draft" && c.status === "cancelled") await setContractStatus(c.id, c.sentAt ? "sent" : "draft");
  refresh();
}

export async function deleteContract(fd: FormData) {
  await requireAdmin();
  await deleteContractById(String(fd.get("id")));
  redirect("/admin/contracts?deleted=1");
}

// ---- public: the client accepts through their personal link --------------------

export type AcceptState = { status: "idle" } | { status: "error"; message: string } | { status: "ok" };

const ACCEPT_TEXT = {
  sq: {
    name: "Shkruani emrin dhe mbiemrin tuaj.",
    agree: "Konfirmoni që e keni lexuar dhe e pranoni kontratën.",
    closed: "Kjo kontratë nuk mund të pranohet më. Ju lutemi na kontaktoni.",
    expired: "Afati për pranimin e kësaj kontrate ka kaluar. Ju lutemi na kontaktoni për një version të ri.",
    failed: `Diçka nuk shkoi mirë. Ju lutemi provoni përsëri ose na shkruani në ${site.email}.`,
  },
  en: {
    name: "Enter your full name.",
    agree: "Confirm that you have read and accept the contract.",
    closed: "This contract can no longer be accepted. Please contact us.",
    expired: "The period for accepting this contract has ended. Please contact us for a new version.",
    failed: `Something went wrong. Please try again or email ${site.email}.`,
  },
};

export async function acceptContractOnline(_prev: AcceptState, fd: FormData): Promise<AcceptState> {
  const c = await getContractByToken(String(fd.get("token") ?? ""));
  if (!c) return { status: "error", message: ACCEPT_TEXT.en.closed };
  const t = ACCEPT_TEXT[c.language];
  const name = String(fd.get("name") ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (name.length < 3) return { status: "error", message: t.name };
  if (fd.get("agree") !== "on") return { status: "error", message: t.agree };
  if (c.status !== "sent") return { status: "error", message: t.closed };
  if (acceptanceExpired(c)) return { status: "error", message: t.expired };
  try {
    const ip = (await headers()).get("cf-connecting-ip");
    if (!(await acceptContract(c.id, name, ip))) return { status: "error", message: t.closed };
    const accepted = (await getContract(c.id))!;
    const r = await sendEmail(contractAcceptedEmail(accepted, await shopInbox(), `${site.url}/admin/contracts/${c.id}`));
    if (!r.ok) console.error(`Contract ${c.number}: acceptance email failed`, r.error);
  } catch (e) {
    console.error("acceptContractOnline failed", e);
    return { status: "error", message: t.failed };
  }
  refresh();
  return { status: "ok" };
}
