import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { AcceptContract, PrintButton } from "@/components/contracts/AcceptContract";
import { site } from "@/config/site";
import { getCurrentUser, isAdmin } from "@/lib/auth/session";
import { contractDocumentHtml, formatDate } from "@/lib/contracts/document";
import { acceptanceExpired, getContractByToken, markContractViewed } from "@/lib/contracts/store";

// The client's private contract page (link from the contract email). Not indexed.

export const metadata: Metadata = { title: "Kontrata · Contract", robots: { index: false, follow: false } };

const L = {
  sq: {
    print: "Ruaj si PDF / Printo",
    heading: "Pranoni kontratën",
    lead: "Lexoni kontratën më sipër. Nëse pajtoheni, shkruani emrin tuaj dhe konfirmoni. Pranimi regjistrohet me datë dhe orë.",
    name: "Emri dhe mbiemri",
    agree: "E kam lexuar kontratën dhe e pranoj në emër të Porositësit.",
    button: "Pranoj kontratën",
    sending: "Duke dërguar…",
    done: "Faleminderit! Kontrata u pranua.",
    doneLead: "Ju kontaktojmë së shpejti për hapat e ardhshëm. Mund ta ruani kontratën si PDF me butonin lart.",
    accepted: (n: string, d: string) => `Kjo kontratë është pranuar nga ${n} më ${d}.`,
    cancelled: "Kjo kontratë është anuluar. Për pyetje na kontaktoni.",
    expired: "Afati për pranimin e kësaj kontrate ka kaluar. Na kontaktoni dhe ju dërgojmë një version të ri.",
    draft: "Kjo kontratë ende nuk është dërguar.",
    questions: "Pyetje?",
  },
  en: {
    print: "Save as PDF / Print",
    heading: "Accept the contract",
    lead: "Read the contract above. If you agree, type your name and confirm. The acceptance is recorded with date and time.",
    name: "Full name",
    agree: "I have read the contract and accept it on behalf of the Client.",
    button: "Accept the contract",
    sending: "Sending…",
    done: "Thank you! The contract has been accepted.",
    doneLead: "We will contact you shortly about the next steps. You can save the contract as a PDF with the button at the top.",
    accepted: (n: string, d: string) => `This contract was accepted by ${n} on ${d}.`,
    cancelled: "This contract has been cancelled. Please contact us with any questions.",
    expired: "The period for accepting this contract has ended. Contact us and we will send you a new version.",
    draft: "This contract has not been sent yet.",
    questions: "Questions?",
  },
};

export default async function ContractPage({ params, searchParams }: PageProps<"/kontrata/[token]">) {
  const c = await getContractByToken((await params).token);
  if (!c) notFound();
  const user = await getCurrentUser();
  const admin = Boolean(user && isAdmin(user));
  // A draft is only visible to the admin (preview); opening by the admin is not "viewed".
  if (c.status === "draft" && !admin) notFound();
  if (!admin && c.status === "sent") await markContractViewed(c.id);
  const t = L[c.language];
  const expired = acceptanceExpired(c);
  const autoPrint = (await searchParams).print === "1";

  let notice: string | null = null;
  if (c.status === "accepted") notice = t.accepted(c.acceptedName ?? "", formatDate(c.acceptedAt));
  else if (c.status === "cancelled") notice = t.cancelled;
  else if (c.status === "draft") notice = t.draft;
  else if (expired) notice = t.expired;

  return (
    <div className="min-h-dvh bg-[#ecebe8] print:bg-white">
      <header className="bg-ink print:hidden">
        <div className="mx-auto flex max-w-[760px] items-center justify-between gap-4 px-4 py-3">
          <Logo tone="light" className="h-7 w-auto" />
          <PrintButton label={t.print} auto={autoPrint} />
        </div>
      </header>
      <main className="mx-auto max-w-[760px] px-2 py-6 sm:px-4 sm:py-10 print:p-0">
        <div className="overflow-x-auto bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] print:shadow-none" dangerouslySetInnerHTML={{ __html: contractDocumentHtml(c) }} />
        <div className="mt-6 space-y-4 px-2 sm:px-0 print:hidden">
          {notice ? (
            <p className="rounded-xl border border-line bg-white p-5 text-sm font-medium">{notice}</p>
          ) : (
            <AcceptContract
              token={c.token}
              labels={{ heading: t.heading, lead: t.lead, name: t.name, agree: t.agree, button: t.button, sending: t.sending, done: t.done, doneLead: t.doneLead }}
            />
          )}
          <p className="text-center text-xs text-muted">
            {t.questions} {site.phones[0].display} ·{" "}
            <a href={`mailto:${site.email}?subject=${encodeURIComponent(c.number)}`} className="underline hover:text-ink">
              {site.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
