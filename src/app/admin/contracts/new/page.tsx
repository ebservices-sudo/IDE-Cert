import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { prefill } from "@/lib/contracts/prefill";
import { AdminHeader } from "@/components/admin/ui";
import { ContractForm } from "@/components/admin/ContractForm";

export const metadata: Metadata = { title: "New contract" };

export default async function NewContract({ searchParams }: PageProps<"/admin/contracts/new">) {
  // Layouts do not protect pages (segments render independently): check here.
  await requireAdmin();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v.slice(0, 80) : undefined);
  const { values, source } = await prefill({ quote: one(sp.quote), message: one(sp.message), order: one(sp.order), kind: one(sp.kind) });

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/contracts", label: "Contracts" }}
        title="New contract"
        description={
          source ? (
            <>
              Client details filled in from{" "}
              <Link href={source.href} className="font-semibold text-ink hover:text-brand-strong hover:underline">
                {source.label}
              </Link>
              . Check them, describe the work and set the price.
            </>
          ) : (
            "Fill in the client, describe the work and set the price. The legal articles are added automatically."
          )
        }
      />
      {source?.message && (
        <div className="mb-6 rounded-xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">What the client wrote</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{source.message}</p>
        </div>
      )}
      <ContractForm initial={values} />
    </>
  );
}
