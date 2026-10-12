import { shop } from "@/config/site";
import type { Faq, Product } from "./types";

// Product-page FAQs. These answer questions about ordering from IDE Cert only;
// they never state technical values (those come from EDELRID's data and manuals).

export function isPpe(p: Product) {
  return p.certifications.some((c) => c !== "NO PPE");
}

export function productFaqs(p: Product): Faq[] {
  const faqs: Faq[] = [
    {
      question: "Is this item in stock?",
      answer: `We order every item from EDELRID on demand, so you always get current production. ${
        shop.leadTime ? `Delivery usually takes ${shop.leadTime}.` : "We confirm the delivery date by email after you order."
      }`,
    },
    {
      question: "Can I get an invoice for my company?",
      answer:
        "Yes. Enter your company name and NUI (fiscal number) at checkout and the invoice is issued to your company. Prices include 18% Kosovo VAT; the price excluding VAT is shown under each price.",
    },
    {
      question: "How do I pay?",
      answer: "By bank transfer. After you order, we email a proforma invoice with our bank details and order the item once payment arrives.",
    },
  ];
  if (p.quoteNotes?.length) {
    faqs.push({
      question: "Can I order a custom length, a sewn termination or a whole batch?",
      answer: `${p.quoteNotes.join(" ")} Send us a quote request with the item number and the lengths you need, and we reply with a price and delivery date.`,
    });
  }
  if (p.variants.some((v) => v.unit.kind === "metre")) {
    faqs.push({
      question: "How does “Cut to length” work?",
      answer: `Choose “Cut to length” and enter the number of metres. The price is per metre; up to ${shop.maxCutLength} m per line. For longer pieces or several pieces of the same rope, request a quote.`,
    });
  }
  if (isPpe(p)) {
    faqs.push({
      question: "Do you inspect PPE?",
      answer:
        "Yes. IDE Cert offers periodic inspection of personal protective equipment against falls from height. See our Services page or contact us to arrange an inspection.",
    });
  }
  return faqs;
}
