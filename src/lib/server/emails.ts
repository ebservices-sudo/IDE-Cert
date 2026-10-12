import "server-only";
import { business } from "@/config/business";
import { site } from "@/config/site";
import { countryName } from "@/config/shipping";
import type { OrderRecord, QuoteRecord } from "@/lib/orders/store";
import { unitLabel } from "@/lib/orders/pricing";
import type { Email } from "./email";

// Plain, table-based HTML emails (work in every mail client) plus a text version.

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const eur = (cents: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);

function layout(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#141414">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">
<tr><td style="background:#141414;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:1px">IDE <span style="color:#e5484d">CERT</span></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.55">${body}</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #e4e4e1;font-size:12px;line-height:1.5;color:#5f5f5c">
${esc(site.legalName)} · ${esc(site.address.street)}, ${esc(site.address.locality)}, ${esc(site.address.postalCode)} ${esc(site.address.city)}, Kosovo<br>
${site.phones.map((p) => esc(p.display)).join(" · ")} · <a href="mailto:${esc(site.email)}" style="color:#5f5f5c">${esc(site.email)}</a>
</td></tr></table></td></tr></table></body></html>`;
}

function itemsTable(o: OrderRecord) {
  const rows = o.lines
    .map(
      (l) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid #e4e4e1;vertical-align:top"><strong>${esc(l.name)}</strong><br>
<span style="color:#5f5f5c;font-size:13px">${esc(l.optionsText)}${l.optionsText ? " · " : ""}Item ${esc(l.sku)}</span></td>
<td style="padding:10px 8px;border-bottom:1px solid #e4e4e1;vertical-align:top;white-space:nowrap;text-align:right">${l.qty} ${esc(unitLabel(l.unit))}</td>
<td style="padding:10px 0;border-bottom:1px solid #e4e4e1;vertical-align:top;white-space:nowrap;text-align:right">${eur(l.lineCents)}</td></tr>`,
    )
    .join("");
  const ship = o.shippingCents == null ? "Confirmed on your proforma invoice" : eur(o.shippingCents);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
<tr><td colspan="2" style="padding:10px 0 2px">Items</td><td style="padding:10px 0 2px;text-align:right">${eur(o.itemsCents)}</td></tr>
<tr><td colspan="2" style="padding:2px 0">Shipping (${esc(o.zoneName)})</td><td style="padding:2px 0;text-align:right">${esc(ship)}</td></tr>
<tr><td colspan="2" style="padding:8px 0 2px;font-weight:bold">Total${o.shippingCents == null ? " (excl. shipping)" : ""}</td><td style="padding:8px 0 2px;text-align:right;font-weight:bold">${eur(o.totalCents)}</td></tr>
<tr><td colspan="3" style="padding:2px 0;color:#5f5f5c;font-size:13px">Incl. ${eur(o.vatCents)} VAT (18%)</td></tr></table>`;
}

function itemsText(o: OrderRecord) {
  return [
    ...o.lines.map((l) => `- ${l.name} (${[l.optionsText, `item ${l.sku}`].filter(Boolean).join(", ")}): ${l.qty} ${unitLabel(l.unit)} = ${eur(l.lineCents)}`),
    `Items: ${eur(o.itemsCents)}`,
    `Shipping (${o.zoneName}): ${o.shippingCents == null ? "confirmed on your proforma invoice" : eur(o.shippingCents)}`,
    `Total${o.shippingCents == null ? " (excl. shipping)" : ""}: ${eur(o.totalCents)} incl. ${eur(o.vatCents)} VAT`,
  ].join("\n");
}

function addressBlock(o: OrderRecord) {
  return [
    o.company ? `${o.company}${o.nui ? ` (NUI ${o.nui})` : ""}${o.vatNumber ? `, VAT ${o.vatNumber}` : ""}` : null,
    o.name,
    o.addressLine1,
    o.addressLine2,
    [o.postalCode, o.city].filter(Boolean).join(" "),
    countryName(o.country),
  ].filter(Boolean) as string[];
}

export function orderConfirmationEmail(o: OrderRecord): Email {
  const subject = `Your IDE Cert order ${o.number}`;
  const html = layout(
    subject,
    `<p style="margin:0 0 16px;font-size:20px;font-weight:bold">Thank you for your order, ${esc(o.name.split(" ")[0])}.</p>
<p style="margin:0 0 16px">We have received order <strong>${esc(o.number)}</strong>. Here is what happens next:</p>
<ol style="margin:0 0 20px;padding-left:20px">
<li style="margin-bottom:6px">We check your items with EDELRID and email you a <strong>proforma invoice</strong> with our bank details${o.shippingCents == null ? " and the shipping cost" : ""}.</li>
<li style="margin-bottom:6px">You pay by bank transfer, quoting <strong>${esc(o.number)}</strong>.</li>
<li>We order your items from EDELRID and confirm the delivery date.</li></ol>
${itemsTable(o)}
<p style="margin:24px 0 4px;font-weight:bold">Delivery address</p>
<p style="margin:0">${addressBlock(o).map(esc).join("<br>")}</p>
${o.customerNotes ? `<p style="margin:16px 0 4px;font-weight:bold">Your note</p><p style="margin:0">${esc(o.customerNotes)}</p>` : ""}
<p style="margin:24px 0 0">Questions? Reply to this email or call ${esc(site.phones[0].display)}.</p>`,
  );
  const text = `Thank you for your order, ${o.name}.

We have received order ${o.number}. Next:
1. We check your items with EDELRID and email you a proforma invoice with our bank details${o.shippingCents == null ? " and the shipping cost" : ""}.
2. You pay by bank transfer, quoting ${o.number}.
3. We order your items from EDELRID and confirm the delivery date.

${itemsText(o)}

Delivery address:
${addressBlock(o).join("\n")}
${o.customerNotes ? `\nYour note: ${o.customerNotes}\n` : ""}
Questions? Reply to this email or call ${site.phones[0].display}.
${site.legalName}`;
  return { to: o.email, subject, html, text, replyTo: site.email };
}

export function orderNotificationEmail(o: OrderRecord, to: string, adminUrl: string): Email {
  const subject = `New order ${o.number} · ${eur(o.totalCents)} · ${o.company ?? o.name}`;
  const contact = [`${o.name} <${o.email}>`, o.phone, o.customerType === "company" ? `Company: ${o.company} · NUI ${o.nui}${o.vatNumber ? ` · VAT ${o.vatNumber}` : ""}` : "Private customer"];
  const html = layout(
    subject,
    `<p style="margin:0 0 12px;font-size:18px;font-weight:bold">New order ${esc(o.number)}</p>
<p style="margin:0 0 16px">${contact.map(esc).join("<br>")}</p>
${itemsTable(o)}
<p style="margin:20px 0 4px;font-weight:bold">Delivery</p><p style="margin:0">${addressBlock(o).map(esc).join("<br>")}</p>
<p style="margin:16px 0 0">Payment: ${esc(o.paymentMethod === "bank_transfer" ? "bank transfer (send proforma)" : o.paymentMethod)}</p>
${o.customerNotes ? `<p style="margin:16px 0 0"><strong>Customer note:</strong> ${esc(o.customerNotes)}</p>` : ""}
<p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="background:#ce2c31;color:#fff;padding:10px 16px;text-decoration:none;font-weight:bold">Open in admin</a></p>`,
  );
  const text = `New order ${o.number}\n${contact.join("\n")}\n\n${itemsText(o)}\n\nDelivery:\n${addressBlock(o).join("\n")}\n\nPayment: ${o.paymentMethod}\n${o.customerNotes ? `Note: ${o.customerNotes}\n` : ""}\n${adminUrl}`;
  return { to, subject, html, text, replyTo: o.email };
}

function quoteItems(q: QuoteRecord) {
  return q.items.map((i) => `${i.name || i.sku}${i.sku && i.name ? ` (item ${i.sku})` : ""}: ${i.quantity}${i.details ? ` — ${i.details}` : ""}`);
}

export function quoteConfirmationEmail(q: QuoteRecord): Email {
  const subject = `Your quote request ${q.number}`;
  const items = quoteItems(q);
  const html = layout(
    subject,
    `<p style="margin:0 0 16px;font-size:20px;font-weight:bold">Thank you, ${esc(q.name.split(" ")[0])}.</p>
<p style="margin:0 0 16px">We have received quote request <strong>${esc(q.number)}</strong> and will reply with prices and delivery times.</p>
<ul style="margin:0 0 16px;padding-left:20px">${items.map((i) => `<li style="margin-bottom:4px">${esc(i)}</li>`).join("")}</ul>
${q.message ? `<p style="margin:0 0 4px;font-weight:bold">Your message</p><p style="margin:0">${esc(q.message)}</p>` : ""}`,
  );
  const text = `Thank you, ${q.name}.\n\nWe have received quote request ${q.number} and will reply with prices and delivery times.\n\n${items.map((i) => `- ${i}`).join("\n")}\n${q.message ? `\nYour message: ${q.message}\n` : ""}\n${site.legalName}`;
  return { to: q.email, subject, html, text, replyTo: site.email };
}

export function quoteNotificationEmail(q: QuoteRecord, to: string, adminUrl: string): Email {
  const subject = `Quote request ${q.number} · ${q.company ?? q.name}`;
  const items = quoteItems(q);
  const who = [`${q.name} <${q.email}>`, q.phone, q.company ? `${q.company}${q.nui ? ` · NUI ${q.nui}` : ""}` : null, countryName(q.country)].filter(Boolean) as string[];
  const html = layout(
    subject,
    `<p style="margin:0 0 12px;font-size:18px;font-weight:bold">Quote request ${esc(q.number)}</p>
<p style="margin:0 0 16px">${who.map(esc).join("<br>")}</p>
<ul style="margin:0 0 16px;padding-left:20px">${items.map((i) => `<li style="margin-bottom:4px">${esc(i)}</li>`).join("")}</ul>
${q.message ? `<p style="margin:0"><strong>Message:</strong> ${esc(q.message)}</p>` : ""}
<p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="background:#ce2c31;color:#fff;padding:10px 16px;text-decoration:none;font-weight:bold">Open in admin</a></p>`,
  );
  const text = `Quote request ${q.number}\n${who.join("\n")}\n\n${items.map((i) => `- ${i}`).join("\n")}\n${q.message ? `\nMessage: ${q.message}\n` : ""}\n${adminUrl}`;
  return { to, subject, html, text, replyTo: q.email };
}

export function verifyEmailEmail(to: string, name: string, link: string): Email {
  const subject = "Confirm your email for IDE Cert";
  const html = layout(
    subject,
    `<p style="margin:0 0 16px;font-size:20px;font-weight:bold">Welcome, ${esc(name.split(" ")[0])}.</p>
<p style="margin:0 0 20px">Please confirm your email address so we can show your orders in your account.</p>
<p style="margin:0 0 20px"><a href="${esc(link)}" style="background:#ce2c31;color:#fff;padding:12px 18px;text-decoration:none;font-weight:bold">Confirm email</a></p>
<p style="margin:0;color:#5f5f5c;font-size:13px">The link is valid for 48 hours. If you did not create an account, ignore this email.</p>`,
  );
  return { to, subject, html, text: `Welcome, ${name}.\n\nConfirm your email address: ${link}\n\nThe link is valid for 48 hours.` };
}

export function resetPasswordEmail(to: string, link: string): Email {
  const subject = "Reset your IDE Cert password";
  const html = layout(
    subject,
    `<p style="margin:0 0 16px">We received a request to reset your password.</p>
<p style="margin:0 0 20px"><a href="${esc(link)}" style="background:#ce2c31;color:#fff;padding:12px 18px;text-decoration:none;font-weight:bold">Choose a new password</a></p>
<p style="margin:0;color:#5f5f5c;font-size:13px">The link is valid for one hour. If you did not ask for this, ignore this email — your password stays the same.</p>`,
  );
  return { to, subject, html, text: `Reset your password: ${link}\n\nThe link is valid for one hour. If you did not ask for this, ignore this email.` };
}

/** Proforma invoice for bank transfer. Requires the bank details in src/config/business.ts. */
export function proformaHtml(o: OrderRecord) {
  const issued = new Date();
  const validUntil = new Date(issued.getTime() + business.proformaValidDays * 86_400_000);
  const d = (x: Date) => x.toLocaleDateString("en-GB");
  const seller = [business.legalName, `${site.address.street}, ${site.address.locality}`, `${site.address.postalCode} ${site.address.city}, Kosovo`, business.nui ? `NUI ${business.nui}` : null, business.vatNumber ? `VAT ${business.vatNumber}` : null].filter(Boolean) as string[];
  const bank = [
    ["Account holder", business.bank.accountHolder],
    ["Bank", business.bank.name],
    ["IBAN", business.bank.iban],
    ["SWIFT/BIC", business.bank.swift],
    ["Reference", o.number],
    ["Amount", eur(o.totalCents)],
  ] as const;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px"><tr>
<td style="vertical-align:top;padding-bottom:16px"><strong>Proforma invoice ${esc(o.number)}</strong><br>Issued ${d(issued)} · valid until ${d(validUntil)}</td></tr>
<tr><td style="vertical-align:top;padding-bottom:16px"><strong>Seller</strong><br>${seller.map(esc).join("<br>")}</td></tr>
<tr><td style="vertical-align:top;padding-bottom:16px"><strong>Customer</strong><br>${addressBlock(o).map(esc).join("<br>")}<br>${esc(o.email)} · ${esc(o.phone)}</td></tr></table>
${itemsTable(o)}
<p style="margin:24px 0 8px;font-weight:bold">Payment by bank transfer</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px">${bank
    .map(([k, v]) => `<tr><td style="padding:3px 16px 3px 0;color:#5f5f5c">${esc(k)}</td><td style="padding:3px 0;font-weight:bold">${esc(v)}</td></tr>`)
    .join("")}</table>
<p style="margin:16px 0 0;color:#5f5f5c;font-size:13px">Please quote ${esc(o.number)} as the payment reference. We order your items from EDELRID once the payment has arrived and confirm the delivery date.</p>`;
}

export function proformaEmail(o: OrderRecord): Email {
  const subject = `Proforma invoice ${o.number} · IDE Cert`;
  const html = layout(subject, `<p style="margin:0 0 16px">Dear ${esc(o.name)},</p><p style="margin:0 0 20px">thank you for your order. Please find the proforma invoice below.</p>${proformaHtml(o)}`);
  const text = `Dear ${o.name},

Proforma invoice ${o.number}

${itemsText(o)}

Payment by bank transfer
Account holder: ${business.bank.accountHolder}
Bank: ${business.bank.name}
IBAN: ${business.bank.iban}
SWIFT/BIC: ${business.bank.swift}
Reference: ${o.number}
Amount: ${eur(o.totalCents)}

We order your items from EDELRID once the payment has arrived.
${site.legalName}`;
  return { to: o.email, subject, html, text, replyTo: site.email };
}

export function contactNotificationEmail(
  m: { topic: string; name: string; email: string; phone: string; company: string; message: string },
  to: string,
  adminUrl: string,
): Email {
  const subject = `${m.topic} · ${m.company || m.name}`;
  const who = [`${m.name} <${m.email}>`, m.phone, m.company].filter(Boolean);
  const html = layout(
    subject,
    `<p style="margin:0 0 12px;font-size:18px;font-weight:bold">${esc(m.topic)}</p>
<p style="margin:0 0 16px">${who.map(esc).join("<br>")}</p>
<p style="margin:0;white-space:pre-line">${esc(m.message)}</p>
<p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="color:#ce2c31;font-weight:bold">All messages</a></p>`,
  );
  return { to, subject, html, text: `${m.topic}\n${who.join("\n")}\n\n${m.message}\n\n${adminUrl}`, replyTo: m.email };
}
