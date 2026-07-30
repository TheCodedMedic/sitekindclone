import { createFileRoute } from "@tanstack/react-router";

import { PortalHeader, StatusPill } from "@/components/portal/widgets";
import { CreditCard, Download } from "lucide-react";
import { invoices, portalClient } from "@/lib/data/portal";

function BillingPage() {
  return (
    <>
      <PortalHeader
        title="Billing"
        subtitle="Manage your plan, payment method, and invoices."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current plan */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-2">
                Current plan
              </div>
              <div className="mt-1 font-display text-xl font-bold text-ink">
                {portalClient.plan}
              </div>
              <div className="mt-1 text-sm text-ink-2">
                Billed monthly · Next charge Aug 1, 2026
              </div>
            </div>
            <span className="inline-flex rounded-full bg-[rgb(15_118_110_/0.14)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)] dark:text-[#2dd4bf]">
              Active
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Core Agency", "$417/mo"],
              ["AI Voice Agent", "$292/mo"],
              ["Total", "$708/mo"],
            ].map(([label, val], i) => (
              <div
                key={label}
                className={`rounded-xl border border-[var(--card-border)] p-4 ${
                  i === 2 ? "bg-[rgb(194_65_12_/0.07)]" : "bg-[var(--surface)]"
                }`}
              >
                <div className="text-xs text-ink-2">{label}</div>
                <div className="mt-1 font-display text-lg font-bold text-ink">
                  {val}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-secondary">Change plan</button>
            <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:text-ink">
              Cancel subscription
            </button>
          </div>
        </div>

        {/* Payment method */}
        <div className="glass-card p-6">
          <div className="text-xs uppercase tracking-wide text-ink-2">
            Payment method
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--color-primary)] text-white">
              <CreditCard size={18} />
            </span>
            <div>
              <div className="text-sm font-semibold text-ink">•••• 4242</div>
              <div className="text-xs text-ink-2">Visa · exp 09/28</div>
            </div>
          </div>
          <button className="mt-4 w-full rounded-xl border border-[var(--card-border)] px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[var(--surface-2)]">
            Update card
          </button>
          <div className="mt-4 rounded-xl bg-[var(--surface-2)] p-4 text-xs text-ink-2">
            Payments secured by Stripe. You own your domain and website.
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="mt-6 glass-card overflow-hidden">
        <div className="border-b border-[var(--card-border)] p-6">
          <h3 className="font-display text-base font-semibold text-ink">
            Invoice history
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-left text-xs uppercase tracking-wide text-ink-2">
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-[var(--card-border)] last:border-0"
                >
                  <td className="px-6 py-4 font-code text-xs text-ink">
                    {inv.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-2">{inv.date}</td>
                  <td className="px-6 py-4 text-sm text-ink-2">{inv.desc}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-ink">
                    {inv.amount}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={inv.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] dark:text-[#fdba74]"
                      aria-label={`Download ${inv.id}`}
                    >
                      <Download size={14} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}


export const Route = createFileRoute("/portal/billing")({
  component: BillingPage,
});
