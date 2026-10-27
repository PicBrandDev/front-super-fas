"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { startChat } from "@/app/actions/chat";
import { useArtist } from "@/components/fan/ArtistContext";
import { Notice } from "@/components/fan/states";
import { ChatBubbleIcon } from "./ChatIconButton";

/** CTA do perfil público: abre (ou reaproveita) a conversa com o fã e leva até ela. */
export function StartChatButton({ userId, name }: { userId: string; name: string }) {
  const { slug, base } = useArtist();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setError(null);
    start(async () => {
      const res = await startChat(slug, userId).catch(() => null);
      if (res?.ok) {
        router.push(`${base}/conversas/${res.data.id}`);
        return;
      }
      if (res?.status === 401) {
        setError("Entre na sua conta para mandar mensagem.");
        return;
      }
      setError(res?.error || "Não deu para abrir a conversa. Confira a conexão e tente de novo.");
    });
  };

  return (
    <div className="grid gap-2">
      <button type="button" onClick={open} disabled={pending} aria-label={`Mandar mensagem para ${name}`} className="btn btn-primary btn-block gap-2">
        <ChatBubbleIcon size={18} />
        {pending ? "Abrindo conversa…" : "Mandar mensagem"}
      </button>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
