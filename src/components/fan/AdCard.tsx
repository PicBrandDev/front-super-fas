import type { HomeAd } from "@/lib/types";

/**
 * Card de anúncio patrocinado (vitrine "Card da Home").
 * Borda tracejada + selo "Patrocinado" para não confundir com conteúdo do fã clube.
 */
export function AdCard({ ad, variant = "compact" }: { ad: HomeAd; variant?: "compact" | "wide" }) {
  const isWide = variant === "wide";
  return (
    <a
      href={ad.url}
      rel="sponsored noopener"
      aria-label={`Anúncio patrocinado: ${ad.title}`}
      className={`flex overflow-hidden rounded-[14px] border-2 border-dashed border-ink bg-cream text-ink no-underline ${
        isWide ? "flex-row" : "flex-col"
      }`}
    >
      {!isWide && (
        <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-ink px-3 py-2">
          <span className="font-label text-[11px] font-bold uppercase tracking-widest text-ink-soft">Patrocinado</span>
          <span className="font-label text-[11px] font-bold text-ink-soft">{ad.sponsor}</span>
        </div>
      )}
      <div className={`flex gap-3 ${isWide ? "flex-1" : "items-center p-3"}`}>
        <div
          aria-hidden="true"
          className={`halftone-dark flex flex-none items-center justify-center bg-paper-2 font-label text-[11px] font-bold ${
            isWide ? "w-[180px] border-r-[1.5px] border-ink" : "size-[92px] rounded-[10px] border-[1.5px] border-ink"
          }`}
        >
          [Arte]
        </div>
        <div className={`flex min-w-0 flex-col gap-1 ${isWide ? "flex-1 px-[18px] py-3.5" : ""}`}>
          {isWide && (
            <span className="flex flex-wrap justify-between gap-2">
              <span className="font-label text-[11px] font-bold uppercase tracking-widest text-ink-soft">Patrocinado</span>
              <span className="font-label text-[11px] font-bold text-ink-soft">{ad.sponsor}</span>
            </span>
          )}
          <strong className={`font-body font-extrabold leading-tight ${isWide ? "text-[19px]" : "text-[17px]"}`}>{ad.title}</strong>
          <span className={`leading-snug text-ink-soft ${isWide ? "text-[15px]" : "text-sm"}`}>{ad.text}</span>
          <span className="mt-1 font-label text-xs font-bold underline">{ad.cta} →</span>
        </div>
      </div>
    </a>
  );
}
