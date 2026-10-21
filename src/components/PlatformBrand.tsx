import { platform } from "@/lib/platform";

/**
 * Selo + nome da plataforma (white label). `tone` segue o fundo:
 * "light" para fundos claros e "dark" para o menu lateral escuro dos painéis.
 */
export function PlatformBrand({
  subtitle = platform.tagline,
  tone = "light",
  size = "md",
}: {
  subtitle?: string;
  tone?: "light" | "dark";
  size?: "md" | "lg";
}) {
  const text = tone === "dark" ? "text-adm-side-text" : "text-adm-ink";
  const muted = tone === "dark" ? "text-adm-side-muted" : "text-adm-muted";
  const mark = size === "lg" ? "size-10 rounded-[10px] text-lg" : "size-[34px] rounded-lg text-[15px]";
  return (
    <span className={`flex items-center gap-2.5 ${text}`}>
      <span aria-hidden="true" className={`flex flex-none items-center justify-center bg-adm-blue font-bold text-white ${mark}`}>
        {platform.mark}
      </span>
      <span className="flex min-w-0 flex-col">
        <strong className={size === "lg" ? "text-[15px]" : "text-sm"}>{platform.name}</strong>
        <span className={`font-adm-mono text-[11px] ${muted}`}>{subtitle}</span>
      </span>
    </span>
  );
}
