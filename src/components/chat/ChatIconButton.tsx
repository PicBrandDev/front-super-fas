"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useArtist } from "@/components/fan/ArtistContext";
import { useChatUnread } from "./useChatUnread";

/** Balão de conversa (o mesmo traço dos ícones de 24px do app). */
export function ChatBubbleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 11.5a8 7.5 0 0 1-11.3 6.8L4 20l1.4-4A7.3 7.3 0 0 1 4 11.5a8 7.5 0 0 1 16 0z" />
    </svg>
  );
}

/** Número de não lidas, pronto para ir ao lado de um ícone ou rótulo ("9+" acima de 9). */
export function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className={`num inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber px-1 font-mono text-[10px] font-bold leading-none text-on-amber ${className}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

/**
 * Botão de conversas da top bar: balão com o número de não lidas, leva para /conversas.
 * Sem props. O contador vem de `useChatUnread()` (polling compartilhado de 15 s).
 */
export function ChatIconButton() {
  const { base } = useArtist();
  const pathname = usePathname();
  const count = useChatUnread();
  const href = `${base}/conversas`;
  const here = pathname === href || pathname.startsWith(`${href}/`);
  const label = count > 0 ? `Conversas, ${count} ${count === 1 ? "não lida" : "não lidas"}` : "Conversas";
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={here ? "page" : undefined}
      className="relative flex size-11 flex-none items-center justify-center rounded-hair text-fg no-underline transition-colors duration-150 ease-fan hover:text-amber-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
    >
      <ChatBubbleIcon />
      <UnreadBadge count={count} className="absolute right-0.5 top-1" />
    </Link>
  );
}

export default ChatIconButton;
