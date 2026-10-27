import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/chat/AutoRefresh";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { UnreadBadge } from "@/components/chat/ChatIconButton";
import { PageHead } from "@/components/fan/resale/parts";
import { EmptyState } from "@/components/fan/states";
import { getArtist, getConversations } from "@/lib/api";
import { chatWhen } from "@/lib/chat";

export const metadata: Metadata = { title: "Conversas" };

/** Lista das conversas privadas do fã, a mais recente primeiro. */
export default async function ConversasPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, conversations] = await Promise.all([getArtist(artista), getConversations(artista)]);
  if (!artist) notFound();
  const base = `/${artista}`;
  const now = new Date();

  return (
    <div className="px-4 pb-8 pt-4">
      <AutoRefresh />
      <PageHead back={`${base}/comunidade`} backLabel="Comunidade" title="Conversas" text="Mensagens privadas com outros fãs. Só texto." />

      {conversations.length === 0 ? (
        <EmptyState
          className="mt-4 border-t border-line"
          title="Nenhuma conversa ainda."
          text="Abra o perfil de um fã na Comunidade e toque em Mandar mensagem."
          action={
            <Link href={`${base}/comunidade`} className="btn btn-primary">
              Ir para a Comunidade
            </Link>
          }
        />
      ) : (
        <ul className="m-0 mt-5 list-none border-t border-line p-0">
          {conversations.map((c) => {
            const last = c.lastMessage;
            const unread = c.unread > 0;
            const snippet = last ? `${last.mine ? "Você: " : ""}${last.body.replace(/\s+/g, " ")}` : "Nenhuma mensagem ainda.";
            const when = chatWhen(c.lastMessageAt ?? last?.createdAt ?? null, now);
            const unreadLabel = unread ? `, ${c.unread} ${c.unread === 1 ? "não lida" : "não lidas"}` : "";
            return (
              <li key={c.id} className="border-b border-line">
                <Link
                  href={`${base}/conversas/${c.id}`}
                  aria-label={`${c.other.name}${unreadLabel}. ${snippet}${when ? `. ${when}` : ""}`}
                  className="-mx-4 flex min-h-[72px] items-center gap-3 px-4 py-3 text-fg no-underline transition-colors duration-150 ease-fan hover:bg-surface"
                >
                  <ChatAvatar name={c.other.name} avatar={c.other.avatar} size={44} />
                  <div className="min-w-0 flex-1" aria-hidden="true">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`truncate text-[15px] leading-5 ${unread ? "font-bold" : "font-semibold"}`}>{c.other.name}</span>
                      {when && <span className={`num flex-none font-mono text-[11px] leading-4 ${unread ? "text-amber-text" : "text-fg-muted"}`}>{when}</span>}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-3">
                      <span className={`truncate text-[14px] leading-5 ${unread ? "text-fg" : "text-fg-muted"}`}>{snippet}</span>
                      {unread && <UnreadBadge count={c.unread} className="flex-none" />}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
