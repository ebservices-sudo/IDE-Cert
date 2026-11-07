import "server-only";
import { countryName } from "@/config/shipping";
import { shop } from "@/config/site";
import type { ContractFormValues } from "@/components/admin/ContractForm";
import { getCatalog } from "@/lib/catalog/data";
import { unitLabel } from "@/lib/orders/pricing";
import { getMessage, getOrder, getQuote, type MessageRecord } from "@/lib/orders/queries";
import { contractDefaults } from "./defaults";
import type { Contract, ContractKind } from "./store";

// Starting values for the contract form: blank, from a request, or from an existing contract.

const net = (grossCents: number) => Math.round(grossCents / (1 + shop.vatRate));
const price = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

function blank(kind: ContractKind = "inspection"): ContractFormValues {
  const d = contractDefaults(kind, "sq");
  return {
    kind,
    language: "sq",
    clientName: "",
    clientCompany: "",
    clientNui: "",
    clientRepresentative: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    title: d.title,
    scope: "",
    location: "",
    startDate: "",
    endDate: "",
    items: [],
    vatRate: 18,
    paymentTerms: d.paymentTerms,
    validityDays: 30,
    specialTerms: "",
    nextInspectionDate: "",
    internalNotes: "",
  };
}

export type Prefill = { values: ContractFormValues; source?: { label: string; href: string; message?: string } };

export async function prefill(params: { quote?: string; message?: string; order?: string; kind?: string }): Promise<Prefill> {
  if (params.quote) {
    const q = await getQuote(params.quote);
    if (q) {
      const { getVariant } = await getCatalog();
      const v = blank("supply");
      return {
        source: { label: `Quote request ${q.number}`, href: `/admin/quotes/${q.id}`, message: q.message ?? undefined },
        values: {
          ...v,
          sourceType: "quote",
          sourceId: q.id,
          sourceNumber: q.number,
          clientName: q.name,
          clientCompany: q.company ?? "",
          clientNui: q.nui ?? "",
          clientEmail: q.email,
          clientPhone: q.phone ?? "",
          clientAddress: countryName(q.country),
          scope: q.items.map((i) => `${i.name}${i.quantity ? `: ${i.quantity}` : ""}`).join("\n"),
          items: q.items.map((i) => {
            const known = i.sku ? getVariant(i.sku) : undefined;
            const m = i.quantity.match(/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/);
            return {
              description: [i.name, i.sku && `Art. ${i.sku}`, i.details].filter(Boolean).join("\n"),
              quantity: m ? m[1] : "1",
              unit: m?.[2]?.trim().slice(0, 30) || (known?.variant.unit.kind === "metre" ? "m" : v.items[0]?.unit || "copë"),
              price: known ? price(net(Math.round(known.variant.price * 100))) : "",
            };
          }),
        },
      };
    }
  }
  if (params.order) {
    const o = await getOrder(params.order);
    if (o) {
      const v = blank("supply");
      return {
        source: { label: `Order ${o.number}`, href: `/admin/orders/${o.id}`, message: o.customerNotes ?? undefined },
        values: {
          ...v,
          sourceType: "order",
          sourceId: o.id,
          sourceNumber: o.number,
          clientName: o.name,
          clientCompany: o.company ?? "",
          clientNui: o.nui ?? "",
          clientEmail: o.email,
          clientPhone: o.phone,
          clientAddress: [o.addressLine1, o.addressLine2, [o.postalCode, o.city].filter(Boolean).join(" "), countryName(o.country)].filter(Boolean).join("\n"),
          scope: `Furnizim me pajisjet e porosisë ${o.number}, sipas tabelës së çmimeve në Nenin 2.`,
          items: [
            ...o.lines.map((l) => ({
              description: [l.name, l.optionsText, `Art. ${l.sku}`].filter(Boolean).join("\n"),
              quantity: String(l.qty),
              unit: unitLabel(l.unit) === "m" ? "m" : "copë",
              price: price(net(l.unitCents)),
            })),
            ...(o.shippingCents ? [{ description: "Transporti", quantity: "1", unit: "shërbim", price: price(net(o.shippingCents)) }] : []),
          ],
        },
      };
    }
  }
  if (params.message) {
    const m: MessageRecord | null = await getMessage(params.message);
    if (m) {
      const kind: ContractKind = /inspection/i.test(m.topic) ? "inspection" : "other";
      const v = blank(kind);
      return {
        source: { label: `Message from ${m.name} · ${m.topic}`, href: "/admin/messages", message: m.message },
        values: {
          ...v,
          sourceType: "message",
          sourceId: m.id,
          clientName: m.name,
          clientCompany: m.company ?? "",
          clientEmail: m.email,
          clientPhone: m.phone ?? "",
        },
      };
    }
  }
  const kind = (["inspection", "certification", "design", "supply", "other"] as const).find((k) => k === params.kind);
  return { values: blank(kind) };
}

/** Form values for editing an existing contract. */
export function fromContract(c: Contract): ContractFormValues {
  return {
    id: c.id,
    kind: c.kind,
    language: c.language,
    sourceType: c.sourceType,
    sourceId: c.sourceId,
    sourceNumber: c.sourceNumber,
    clientName: c.clientName,
    clientCompany: c.clientCompany ?? "",
    clientNui: c.clientNui ?? "",
    clientRepresentative: c.clientRepresentative ?? "",
    clientAddress: c.clientAddress ?? "",
    clientEmail: c.clientEmail,
    clientPhone: c.clientPhone ?? "",
    title: c.title,
    scope: c.scope,
    location: c.location ?? "",
    startDate: c.startDate ?? "",
    endDate: c.endDate ?? "",
    items: c.items.map((i) => ({ description: i.description, quantity: String(i.quantity), unit: i.unit, price: price(i.unitCents) })),
    vatRate: c.vatRate,
    paymentTerms: c.paymentTerms,
    validityDays: c.validityDays,
    specialTerms: c.specialTerms ?? "",
    nextInspectionDate: c.nextInspectionDate ?? "",
    internalNotes: c.internalNotes ?? "",
  };
}
