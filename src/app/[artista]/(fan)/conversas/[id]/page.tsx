import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatThread } from "@/components/chat/ChatThread";
import { getArtist, getConversation, getMessages } from "@/lib/api";

export const metadata: Metadata = { title: "Conversa" };

/** Conversa privada com outro fã (só texto). */
export default async function ConversaPage({ params }: { params: Promise<{ artista: string; id: string }> }) {
  const { artista, id } = await params;
  const convId = /^\d{1,12}$/.test(id) ? Number(id) : 0;
  if (!convId) notFound();
  const [artist, conversation] = await Promise.all([getArtist(artista), getConversation(artista, convId)]);
  if (!artist || !conversation) notFound();
  const messages = await getMessages(artista, convId);
  return <ChatThread key={convId} conversation={conversation} initial={messages} />;
}
