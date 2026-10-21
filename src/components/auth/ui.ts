import { btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";

/**
 * Visual das telas de conta: "platform" (neutro) ou "artist" (tema do fã clube).
 * Módulo sem React para ser lido tanto no servidor (AuthShell) quanto no cliente (look.tsx).
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
    input:
      "min-h-12 rounded-xl border-2 border-ink bg-cream px-3.5 font-body text-[15px] text-ink placeholder:text-ink-soft",
    button:
      "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-ink bg-accent px-5 font-label text-sm font-bold text-accent-fg disabled:cursor-not-allowed disabled:opacity-60",
    secondary:
      "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-ink bg-cream px-5 font-label text-[13px] font-bold text-ink",
    link: "font-label font-bold text-ink",
    label: "font-label text-xs font-bold uppercase tracking-[0.08em]",
    hint: "text-xs text-ink-soft",
  },
};
