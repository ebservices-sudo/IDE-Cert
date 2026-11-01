import { shop } from "@/config/site";
import type { Faq, Product } from "./types";

// Product-page FAQs. These answer questions about ordering from IDE Cert only;
// they never state technical values (those come from EDELRID's data and manuals).

export function isPpe(p: Product) {
  return p.certifications.some((c) => c !== "NO PPE");
}

export type LocalFaq = Faq & { questionSq: string; answerSq: string };

export function productFaqs(p: Product): LocalFaq[] {
  const faqs: LocalFaq[] = [
    {
      question: "Is this item in stock?",
      questionSq: "A është ky artikull në stok?",
      answer: `We order every item from EDELRID on demand, so you always get current production. ${
        shop.leadTime ? `Delivery usually takes ${shop.leadTime}.` : "We confirm the delivery date by email after your request."
      }`,
      answerSq: `Çdo artikull e porosisim nga EDELRID sipas kërkesës, që të merrni gjithmonë prodhimin aktual. ${
        shop.leadTime ? `Dorëzimi zakonisht zgjat ${shop.leadTime}.` : "Datën e dorëzimit jua konfirmojmë me email pas kërkesës."
      }`,
    },
    {
      question: "Can I get an invoice for my company?",
      questionSq: "A mund të marr faturë për kompaninë?",
      answer:
        "Yes. Add your company name and NUI (fiscal number) to your request and the invoice is issued to your company. Prices include 18% Kosovo VAT; the price excluding VAT is shown under each price.",
      answerSq:
        "Po. Shkruani emrin e kompanisë dhe NUI-në (numrin fiskal) në kërkesë dhe fatura lëshohet në emër të kompanisë. Çmimet përfshijnë TVSH-në 18% të Kosovës; çmimi pa TVSH shfaqet nën çdo çmim.",
    },
    {
      question: "How do I pay?",
      questionSq: "Si paguaj?",
      answer: "By bank transfer. After your request, we email a proforma invoice with our bank details and order the item once payment arrives.",
      answerSq: "Me transfer bankar. Pas kërkesës, ju dërgojmë me email faturë proforma me të dhënat tona bankare dhe e porosisim artikullin kur të arrijë pagesa.",
    },
  ];
  if (p.quoteNotes?.length) {
    faqs.push({
      question: "Can I order a custom length, a sewn termination or a whole batch?",
      questionSq: "A mund të porosis gjatësi të veçantë, skaj të qepur ose një seri të tërë?",
      answer: `${p.quoteNotes.join(" ")} Send us a quote request with the item number and the lengths you need, and we reply with a price and delivery date.`,
      answerSq: "Po. Na dërgoni një kërkesë me numrin e artikullit dhe gjatësitë që ju duhen, dhe ju kthejmë çmimin dhe datën e dorëzimit.",
    });
  }
  if (p.variants.some((v) => v.unit.kind === "metre")) {
    faqs.push({
      question: "How does “Cut to length” work?",
      questionSq: "Si funksionon “Prerja sipas gjatësisë”?",
      answer: `Choose “Cut to length” and enter the number of metres. The price is per metre; up to ${shop.maxCutLength} m per line. For longer pieces or several pieces of the same rope, request a quote.`,
      answerSq: `Zgjidhni “Cut to length” dhe shkruani numrin e metrave. Çmimi është për metër; deri në ${shop.maxCutLength} m për rresht. Për copa më të gjata ose disa copa të të njëjtit litar, kërkoni ofertë.`,
    });
  }
  if (isPpe(p)) {
    faqs.push({
      question: "Do you inspect PPE?",
      questionSq: "A e inspektoni PPE-në?",
      answer:
        "Yes. IDE Cert offers periodic inspection of personal protective equipment against falls from height. See our Services page or contact us to arrange an inspection.",
      answerSq:
        "Po. IDE Cert ofron inspektim periodik të pajisjeve mbrojtëse personale kundër rënies nga lartësia. Shihni faqen e Shërbimeve ose na kontaktoni për të caktuar një inspektim.",
    });
  }
  return faqs;
}
