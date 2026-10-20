import Link from "next/link";
import { Icon } from "@/components/icons";
import type { ShowEvent } from "@/lib/types";

const statusLabel: Record<ShowEvent["status"], string> = {
  on_sale: "Vendas abertas",
  last_batches: "Últimos lotes",
  soon: "Em breve",
};

const tones = {
  gold: { card: "bg-accent-2 text-ink", line: "border-ink", pill: "bg-ink text-paper", outline: "border-ink" },
  cream: { card: "bg-cream text-ink", line: "border-ink", pill: "bg-accent text-accent-fg", outline: "border-ink" },
  accent: { card: "bg-accent text-accent-fg", line: "border-accent-fg", pill: "bg-cream text-ink", outline: "border-accent-fg" },
} as const;

/** Card "canhoto de ingresso" de um show. */
export function ShowStub({
  event,
  href,
  tone = "gold",
  showStatus = false,
  showArrow = false,
}: {
  event: ShowEvent;
  href: string;
  tone?: keyof typeof tones;
  showStatus?: boolean;
  showArrow?: boolean;
}) {
  const t = tones[tone];
  return (
    <Link href={href} className={`shadow-hard flex overflow-hidden rounded-[14px] border-2 border-ink no-underline ${t.card}`}>
      <div className={`flex w-[86px] flex-none flex-col items-center justify-center border-r-2 border-dashed px-2 py-3.5 font-label text-xs font-bold ${t.line}`}>
        <span>{event.weekday}</span>
        <span className="font-display text-[34px] font-normal leading-tight">{event.day}</span>
        <span>{event.month}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3.5">
        <strong className="font-body text-[19px] font-extrabold leading-tight">{event.city}</strong>
        <span className="text-sm">
          {event.venue} · {event.time}
        </span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-label text-[11px] font-bold ${t.pill}`}>
            <Icon name="gift" size={13} strokeWidth={2.4} />
            {event.giftsCount} brindes na sorte
          </span>
          {showStatus && (
            <span className={`rounded-full border-[1.5px] px-2.5 py-1 font-label text-[11px] font-bold ${t.outline}`}>
              {statusLabel[event.status]}
            </span>
          )}
        </div>
      </div>
      {showArrow && (
        <div aria-hidden="true" className="flex items-center pr-3">
          <Icon name="chevron-right" size={20} strokeWidth={2.4} />
        </div>
      )}
    </Link>
  );
}
