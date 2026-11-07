import Link from "next/link";
import { contractsFor } from "@/lib/contracts/store";
import { StatusBadge, contractStatusLabel } from "@/lib/orders/status";
import { Card } from "./ui";

/** Contracts made from a quote, message or order (server component). */
export async function LinkedContracts({ sourceType, sourceId }: { sourceType: "quote" | "order" | "message"; sourceId: string }) {
  const contracts = await contractsFor(sourceType, sourceId).catch(() => []);
  if (!contracts.length) return null;
  return (
    <Card title="Contracts">
      <ul className="-my-1 divide-y divide-line">
        {contracts.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <Link href={`/admin/contracts/${c.id}`} className="font-semibold hover:text-brand-strong">
              {c.number}
            </Link>
            <StatusBadge status={c.status} labels={contractStatusLabel} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
