"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { formatBRL } from "@/lib/format";

/** Topo das telas internas da revenda: voltar, título em serifa e uma frase. */
export function PageHead({ back, backLabel, title, text, aside }: { back: string; backLabel: string; title: string; text?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Link href={back} className="back">
          <Icon name="back" size={18} />
          {backLabel}
        </Link>
        {aside}
      </div>
      <h1 className="m-0 font-display text-[40px] font-black leading-[40px] [text-wrap:balance]">{title}</h1>
      {text && <p className="m-0 max-w-[40ch] text-[15px] leading-[22px] text-fg-muted">{text}</p>}
    </header>
  );
}

/** Valor em destaque no canhoto: rótulo em mono, número em serifa tabular, linha de composição embaixo. */
export function Money({ label, cents, detail }: { label: string; cents: number; detail?: ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="mono">{label}</span>
      <strong className="num font-display text-[40px] font-black leading-[40px]">{formatBRL(cents)}</strong>
      {detail && <span className="num text-[14px] leading-5 text-fg-muted">{detail}</span>}
    </div>
  );
}

/** Segundos até `iso` (atualiza a cada segundo; 0 quando passou). null antes de montar: o servidor não conta o tempo. */
export function useSecondsLeft(iso: string | null): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!iso) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [iso]);
  if (!iso || now == null) return null;
  return Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000));
}

export const mmss = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

/** Bloco de prazo: o que precisa acontecer e até quando. */
export function Deadline({ label, value, tone = "plain" }: { label: string; value: ReactNode; tone?: "plain" | "urgent" }) {
  return (
    <div className="grid gap-1 border-t border-line pt-3">
      <span className="mono">{label}</span>
      <span className={`num text-[17px] font-bold leading-[22px] ${tone === "urgent" ? "text-signal" : ""}`}>{value}</span>
    </div>
  );
}

export const DemoTag = () => <span className="tag tag-demo">Exemplo</span>;
