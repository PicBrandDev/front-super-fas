import { btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";

/**
 * Visual das telas de conta: "platform" (neutro) ou "artist" (tema do fã clube).
 * Módulo sem React para ser lido tanto no servidor (AuthShell) quanto no cliente (look.tsx).
 *
 * O look "artist" usa o vocabulário Noite de `globals.css` (`.field`, `.btn`, `.mono`,
 * `.go`), que só vale dentro do wrapper `.fan` montado pelo AuthShell.
 */
export type AuthLook = "platform" | "artist";

export type AuthUi = {
  input: string;
  button: string;
  secondary: string;
  link: string;
  label: string;
  hint: string;
};

export const authUi: Record<AuthLook, AuthUi> = {
  platform: {
    input: inputClass,
    button: btnPrimary,
    secondary: btnSecondary,
    link: "font-semibold text-adm-blue",
    label: "text-[13px] font-semibold",
    hint: "text-xs text-adm-muted",
  },
  artist: {
    input: "field",
    button: "btn btn-primary btn-block",
    // Linha de lista (como as opções da folha do protótipo): fio embaixo, caixa alta, sem caixa.
    secondary:
      "flex min-h-14 w-full cursor-pointer items-center justify-start gap-2 border-0 border-b border-line bg-transparent px-0 text-left font-grotesk text-[13px] font-bold uppercase tracking-[0.06em] text-fg no-underline hover:text-amber-text",
    link: "go",
    label: "mono",
    hint: "text-[13px] leading-[18px] text-fg-muted",
  },
};
