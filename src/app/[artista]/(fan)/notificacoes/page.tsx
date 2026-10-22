import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/fan/Masthead";
import { Icon } from "@/components/icons";
import { getArtist, getMyTickets, getRanking, getSpinCredits, getViewer } from "@/lib/api";
import { isPastEvent } from "@/lib/events";

export const metadata: Metadata = { title: "Notificações" };

/** Notificações do fã, montadas a partir dos dados dele: giros para usar, ingressos de shows chegando, ranking. */
export default async function NotificacoesPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, viewer, credits, tickets, ranking] = await Promise.all([
    getArtist(artista),
    getViewer(artista),
    getSpinCredits(artista),
    getMyTickets(artista),
    getRanking(artista),
  ]);
  if (!artist) notFound();
  const base = `/${artista}`;

  const items: { icon: "wheel" | "calendar" | "star"; title: string; text: string; href: string; cta: string }[] = [];
  const free = credits.filter((c) => !c.used);
  if (free.length > 0) {
    items.push({
      icon: "wheel",
      title: `${free.length} ${free.length === 1 ? "giro" : "giros"} esperando você`,
      text: free[0].reason,
      href: `${base}/pickap`,
      cta: "Girar a roleta",
    });
  } else if (viewer.spins > 0) {
    items.push({ icon: "wheel", title: `${viewer.spins} ${viewer.spins === 1 ? "giro" : "giros"} esperando você`, text: "Gire a roleta do PicKap.", href: `${base}/pickap`, cta: "Girar a roleta" });
  }
  for (const t of tickets.filter((t) => !isPastEvent(t.event)).slice(0, 3)) {
    items.push({
      icon: "calendar",
      title: `Seu ingresso: ${t.event.city}, ${t.event.day} ${t.event.month}`,
      text: t.label,
      href: `${base}/agenda`,
      cta: "Ver meus ingressos",
    });
  }
  if (ranking && ranking.me.pending > 0) {
    items.push({
      icon: "star",
      title: `${ranking.me.pending} ${ranking.me.pending === 1 ? "compartilhamento aguardando" : "compartilhamentos aguardando"} confirmação`,
      text: `Só conta com a #${ranking.hashtag} e o seu código ${ranking.myCode}.`,
      href: `${base}/comunidade?aba=ranking`,
      cta: "Ver o ranking",
    });
  }

  return (
    <>
      <Masthead word="Avisos" label="Notificações" tone="night" />
      <div className="px-4 pb-8">
        <Link href={base} className="back">
          <Icon name="back" size={18} />
          Início
        </Link>
        {items.length === 0 ? (
          <p className="mono py-8">Nenhuma notificação por enquanto.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {items.map((n, i) => (
              <li key={i} className="flex items-start gap-3 border-b border-line py-4">
                <Icon name={n.icon} size={22} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <strong className="text-[16px] leading-5">{n.title}</strong>
                  <span className="text-[14px] leading-5 text-fg-muted">{n.text}</span>
                  <Link href={n.href} className="go min-h-11">
                    {n.cta}
                    <Icon name="arrow" size={14} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
