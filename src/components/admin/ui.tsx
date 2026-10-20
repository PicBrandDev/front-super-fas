import type { ReactNode } from "react";

export type Tone = "ok" | "warn" | "off" | "info";

const toneClass: Record<Tone, string> = {
  ok: "bg-adm-ok-bg text-adm-ok",
  warn: "bg-adm-warn-bg text-adm-warn",
  off: "bg-adm-off-bg text-adm-off",
  info: "bg-adm-blue-soft text-adm-blue-dark",
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass[tone]}`}>{children}</span>
  );
}

/** Mini desenho de celular mostrando onde fica a vitrine. */
export function SlotDiagram({ top, height, small = false }: { top: number; height: number; small?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex-none rounded-[10px] border-2 border-adm-ink bg-adm-bg ${small ? "h-[86px] w-[50px]" : "h-24 w-14"}`}
    >
      <span className="absolute inset-x-1.5 top-2 h-1 rounded-sm bg-adm-line" />
      <span className="absolute inset-x-1.5 bottom-2 h-1 rounded-sm bg-adm-line" />
      <span className="absolute inset-x-[5px] rounded-[3px] bg-adm-blue" style={{ top, height }} />
    </div>
  );
}

export const thClass = "border-b border-adm-line px-4 py-3 text-left font-adm-mono text-xs font-semibold text-adm-muted";
export const tdClass = "border-b border-adm-line-soft px-4 py-3.5";
export const inputClass =
  "min-h-11 rounded-lg border border-adm-input bg-white px-3 text-[15px] text-adm-ink placeholder:text-adm-muted";
export const btnPrimary =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-adm-blue px-[18px] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-adm-disabled";
export const btnSecondary =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-adm-line bg-white px-4 text-sm font-semibold text-adm-ink";
export const btnOutlineBlue =
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-adm-blue bg-white px-3 text-[13px] font-semibold text-adm-blue";
