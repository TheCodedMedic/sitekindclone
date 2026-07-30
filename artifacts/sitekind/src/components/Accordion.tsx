import { useState } from "react";
import { Plus } from "lucide-react";

export function Accordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[var(--card-border)] overflow-hidden rounded-2xl border border-[var(--card-border)]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="bg-[var(--glass)] backdrop-blur-md">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-base font-semibold text-ink">
                {item.q}
              </span>
              <Plus
                size={20}
                className={`shrink-0 text-[var(--color-primary)] transition-transform duration-300 dark:text-[#fdba74] ${
                  isOpen ? "rotate-45" : ""
                }`}
              />
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
              }}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-[0.9375rem] leading-relaxed text-ink-2">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
