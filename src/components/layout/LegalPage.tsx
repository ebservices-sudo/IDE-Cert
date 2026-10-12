import { legal } from "@/config/site";
import { PageHeader } from "./PageHeader";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader kicker="Legal" title={title} breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}>
        <p className="mt-5 text-sm text-muted-dark">Last updated {legal.lastUpdated}</p>
      </PageHeader>
      <Container className="py-14 lg:py-20">
        {!legal.reviewed && (
          <p className="mb-10 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            This text is being finalised. If anything is unclear, please contact us before ordering.
          </p>
        )}
        <Prose>{children}</Prose>
      </Container>
    </>
  );
}
