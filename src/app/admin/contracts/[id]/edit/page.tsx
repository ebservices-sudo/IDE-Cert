import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { fromContract } from "@/lib/contracts/prefill";
import { getContract } from "@/lib/contracts/store";
import { AdminHeader } from "@/components/admin/ui";
import { ContractForm } from "@/components/admin/ContractForm";

export const metadata: Metadata = { title: "Edit contract" };

export default async function EditContract({ params }: PageProps<"/admin/contracts/[id]/edit">) {
  // Layouts do not protect pages (segments render independently): check here.
  await requireAdmin();
  const c = await getContract((await params).id);
  if (!c) notFound();
  if (c.status === "accepted") redirect(`/admin/contracts/${c.id}`);

  return (
    <>
      <AdminHeader
        back={{ href: `/admin/contracts/${c.id}`, label: c.number }}
        title={`Edit ${c.number}`}
        description={c.status === "sent" ? "Already sent: after saving, send it again so the client sees the new version (the same link shows the latest version)." : undefined}
      />
      <ContractForm initial={fromContract(c)} />
    </>
  );
}
