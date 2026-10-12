import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { setMessageStatus } from "@/actions/admin";
import { listMessages } from "@/lib/orders/queries";
import { StatusBadge, messageStatusLabel } from "@/lib/orders/status";
import { AdminHeader, dateTime } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Messages" };


export default async function AdminMessages() {
  // Layouts do not protect pages (segments render independently): check here.
  await requireAdmin();
  const messages = await listMessages(200);
  return (
    <>
      <AdminHeader title="Messages" description="From the contact form." />
      {messages.length ? (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className={`rounded-xl border border-line bg-white p-5 ${m.status === "archived" ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {m.name}
                    {m.company && <span className="font-normal text-muted"> · {m.company}</span>}
                  </p>
                  <p className="text-sm">
                    <a href={`mailto:${m.email}`} className="hover:text-brand-strong hover:underline">
                      {m.email}
                    </a>
                    {m.phone && <span className="text-muted"> · {m.phone}</span>}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {dateTime(m.createdAt)} · {m.topic}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={m.status} labels={messageStatusLabel} />
                  {(["answered", "archived"] as const)
                    .filter((s) => s !== m.status)
                    .map((s) => (
                      <form key={s} action={setMessageStatus}>
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="status" value={s} />
                        <button className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold hover:border-ink/40">
                          Mark {messageStatusLabel[s].toLowerCase()}
                        </button>
                      </form>
                    ))}
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{m.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">No messages yet.</p>
      )}
    </>
  );
}
