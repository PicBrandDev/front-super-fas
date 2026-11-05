import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, type Tone } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { brandStyle } from "@/lib/brand-style";
import { formatCount } from "@/lib/format";
import { SponsorAvatar } from "./SponsorAvatar";

export type AnuncioStatus = "live" | "scheduled" | "ended" | "pending" | "rejected";

export type AnuncioItem = {
  id: string;
  sponsor: string;
  sponsorLogo?: string | null;
  title: string;
  text?: string;
  cta?: string;
  artUrl?: string | null;
  videoUrl?: string | null;
  status: AnuncioStatus;
  slotName: string;
  artist?: string | null; // cantor
  fanClub?: string | null;
  start?: string | null; // AAAA-MM-DD
  end?: string | null;
  views?: number;
  clicks?: number;
  series?: number[]; // views por dia, para o mini gráfico
  href?: string; // com isso o cartão inteiro vira um link (ex.: para o analytics do anúncio)
};

/** As cores de cada cantor (as mesmas do app do fã): Vintage Culture em marrom e laranja, Departamento em azul elétrico e branco, Anitta em azul-noite e vermelho, Veigh em preto e vinho. */
function artistLook(name?: string | null) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("vintage")) return { bg: "#120907", fg: "#FFFFFF", accent: "#FE9900", onAccent: "#120907", radius: "9999px" };
  if (n.includes("departamento")) return { bg: "#0000FF", fg: "#FFFFFF", accent: "#FFFFFF", onAccent: "#0000FF", radius: "0px" };
  if (n.includes("anitta")) return { bg: "#0A1A31", fg: "#FAF8EC", accent: "#DD2325", onAccent: "#FFFFFF", radius: "9999px" };
  if (n.includes("veigh")) return { bg: "#0E0B0B", fg: "#F3EEE7", accent: "#8E1A22", onAccent: "#F3EEE7", radius: "0px" };
  return { bg: "#1b1f2a", fg: "#FFFFFF", accent: "#8FB0FF", onAccent: "#1b1f2a", radius: "9999px" };
}

const STATUS: Record<AnuncioStatus, { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  scheduled: { label: "Agendado", tone: "info" },
  ended: { label: "Encerrado", tone: "off" },
  pending: { label: "Aguardando aprovação", tone: "warn" },
  rejected: { label: "Recusado", tone: "off" },
};

const dm = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "—");
const days = (iso: string) => Math.round((new Date(`${iso}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86_400_000);

/** "faltam 12 dias", "termina hoje", "começa em 3 dias", "encerrou há 5 dias". */
export function tempo(status: AnuncioStatus, start?: string | null, end?: string | null): string {
  if (status === "live") {
    if (!end) return "sem data para acabar";
    const d = days(end);
    return d <= 0 ? "termina hoje" : `faltam ${d} ${d === 1 ? "dia" : "dias"}`;
  }
  if (status === "scheduled" && start) {
    const d = days(start);
    return d <= 0 ? "começa hoje" : `começa em ${d} ${d === 1 ? "dia" : "dias"}`;
  }
  if (status === "ended" && end) {
    const d = -days(end);
    return d <= 0 ? "encerrou hoje" : `encerrou há ${d} ${d === 1 ? "dia" : "dias"}`;
  }
  return "";
}

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * 100).toFixed(1)},${(22 - (v / max) * 20).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" role="img" aria-label="Visualizações por dia" className="h-6 w-24 flex-none">
      <polyline points={pts} fill="none" stroke="var(--color-adm-blue)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Cartão ilustrativo de um anúncio: o banner (a imagem do anúncio; sem imagem, um banner nas cores da marca, com o play se for
 * vídeo), o patrocinador, o cantor e o lugar onde aparece, quanto tempo falta e os números. `children` é o rodapé (ações).
 */
export function AnuncioCard({ ad, children }: { ad: AnuncioItem; children?: ReactNode }) {
  const st = brandStyle(ad.sponsor);
  const look = STATUS[ad.status];
  const when = tempo(ad.status, ad.start, ad.end);
  const views = ad.views ?? 0;
  const clicks = ad.clicks ?? 0;
  const ctr = views ? (clicks * 100) / views : 0;
  return (
    <article className={`relative flex flex-col overflow-hidden rounded-xl border border-adm-line bg-white ${ad.href ? "transition-shadow hover:shadow-md" : ""}`}>
      {ad.href && <Link href={ad.href} className="absolute inset-0 z-10" aria-label={`Ver analytics do anúncio ${ad.title}`} />}
      <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: st.bg, color: st.fg }}>
        {ad.artUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- banner do anunciante, /uploads ou /ads
          <img src={ad.artUrl} alt={`Banner de ${ad.title}`} className="absolute inset-0 size-full object-cover" />
        ) : ad.videoUrl && /\.(mp4|webm)(\?|$)/i.test(ad.videoUrl) ? (
          // a capa do vídeo: o primeiro quadro, sem baixar o vídeo inteiro
          <video src={`${ad.videoUrl}#t=0.5`} preload="metadata" muted playsInline aria-label={`Capa do vídeo de ${ad.title}`} className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-1 p-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-80">{ad.videoUrl ? "Anúncio em vídeo" : "Anúncio"}</span>
            <strong className="font-display text-3xl font-black uppercase leading-8">{ad.sponsor}</strong>
            <span className="line-clamp-2 text-sm font-semibold opacity-90">{ad.title}</span>
          </div>
        )}
        {ad.videoUrl && (
          <span aria-hidden="true" className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/55 text-white">
            <Icon name="play" size={16} />
          </span>
        )}
        <span className="absolute left-3 top-3">
          <Badge tone={look.tone}>{look.label}</Badge>
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white p-0.5 shadow">
          <SponsorAvatar name={ad.sponsor} src={ad.sponsorLogo} size={32} />
        </span>
      </div>

      {(ad.artist || ad.slotName) && (() => {
        const k = artistLook(ad.artist);
        return (
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: k.bg, color: k.fg }}>
            <span
              aria-hidden="true"
              className="flex size-11 flex-none items-center justify-center text-sm font-black"
              style={{ background: k.accent, color: k.onAccent, borderRadius: k.radius }}
            >
              {(ad.artist ?? ad.slotName).split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: k.accent }}>
                Aparece no app de
              </span>
              <strong className="truncate font-display text-2xl font-black uppercase leading-7">{ad.artist ?? "Ambiente do cantor"}</strong>
              <span className="truncate text-[13px] font-semibold" style={{ color: k.accent }}>
                {ad.slotName} · {ad.fanClub ? ad.fanClub : "ambiente do cantor"}
              </span>
            </span>
          </div>
        );
      })()}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="m-0 text-base font-bold leading-5">{ad.title}</h3>
          {ad.text && <p className="m-0 line-clamp-2 text-[13px] leading-[18px] text-adm-muted">{ad.text}</p>}
          {ad.cta && <span className="mt-1 w-fit rounded-full border border-adm-line px-2.5 py-0.5 text-[12px] font-semibold">{ad.cta}</span>}
        </div>

        <dl className="m-0 grid gap-1.5 text-[13px]">
          <div className="flex gap-2">
            <dt className="w-[74px] flex-none text-adm-muted">Patrocinador</dt>
            <dd className="m-0 font-semibold">{ad.sponsor}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[74px] flex-none text-adm-muted">Período</dt>
            <dd className="m-0 font-adm-mono">
              {dm(ad.start)} a {dm(ad.end)}
              {when && <span className="font-sans text-adm-muted"> · {when}</span>}
            </dd>
          </div>
        </dl>

        {(ad.views !== undefined || ad.clicks !== undefined) && (
          <div className="mt-auto flex items-end justify-between gap-3 border-t border-adm-line-soft pt-3">
            <dl className="m-0 flex gap-5">
              {[
                { l: "Views", v: formatCount(views) },
                { l: "Cliques", v: formatCount(clicks) },
                { l: "CTR", v: `${ctr.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` },
              ].map((k) => (
                <div key={k.l} className="flex flex-col">
                  <dt className="text-[11px] text-adm-muted">{k.l}</dt>
                  <dd className="m-0 font-adm-mono text-[15px] font-semibold">{k.v}</dd>
                </div>
              ))}
            </dl>
            {ad.series && <Spark values={ad.series} />}
            {ad.href && <span aria-hidden="true" className="flex size-8 flex-none items-center justify-center rounded-full bg-adm-bg text-base font-bold text-adm-ink">→</span>}
          </div>
        )}
        {children}
      </div>
    </article>
  );
}
