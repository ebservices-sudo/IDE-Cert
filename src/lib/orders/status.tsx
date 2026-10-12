// Labels for order and quote statuses (shared by the account and admin pages).

export const orderStatusLabel: Record<string, string> = {
  received: "Received",
  proforma_sent: "Proforma sent",
  paid: "Paid",
  ordered: "Ordered from EDELRID",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const orderStatusTone: Record<string, string> = {
  received: "bg-brand-soft text-brand-strong",
  proforma_sent: "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-900",
  ordered: "bg-sky-100 text-sky-900",
  shipped: "bg-indigo-100 text-indigo-900",
  completed: "bg-mist text-ink",
  cancelled: "bg-mist text-muted line-through",
};

export const quoteStatusLabel: Record<string, string> = {
  new: "New",
  answered: "Answered",
  won: "Won",
  lost: "Lost",
};

export const messageStatusLabel: Record<string, string> = {
  new: "New",
  answered: "Answered",
  archived: "Archived",
};

export function StatusBadge({ status, labels = orderStatusLabel }: { status: string; labels?: Record<string, string> }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${orderStatusTone[status] ?? "bg-mist text-ink"}`}>
      {labels[status] ?? status}
    </span>
  );
}
