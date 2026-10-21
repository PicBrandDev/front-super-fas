"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authUi, type AuthLook, type AuthUi } from "./ui";

/**
 * O AuthShell escolhe o visual ("platform" ou "artist"); campos, botões e links leem daqui.
 */
const Ctx = createContext<AuthLook>("platform");

export function AuthLookProvider({ look, children }: { look: AuthLook; children: ReactNode }) {
  return <Ctx.Provider value={look}>{children}</Ctx.Provider>;
}

export function useAuthLook(): { look: AuthLook; ui: AuthUi } {
  const look = useContext(Ctx);
  return { look, ui: authUi[look] };
}

/** Campo de formulário com rótulo. */
export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  const { ui } = useAuthLook();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={ui.label}>
        {label}
      </label>
      {children}
      {hint && (
        <span id={`${id}-hint`} className={ui.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  const { look } = useAuthLook();
  if (!message) return null;
  // No tema do artista, o erro é só texto na cor de sinal (`.err`), sem caixa.
  const cls = look === "artist" ? "err" : "rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger";
  return (
    <p role="alert" className={`m-0 ${cls}`}>
      {message}
    </p>
  );
}

/** Campo de texto que já pega o visual da tela. */
export function AuthInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const { ui } = useAuthLook();
  return <input {...props} className={`${ui.input} ${className}`} />;
}

export function AuthSelect({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { ui } = useAuthLook();
  return <select {...props} className={`${ui.input} ${className}`} />;
}

export function AuthSubmit({ pending, children, idle }: { pending: boolean; children: ReactNode; idle: ReactNode }) {
  const { ui } = useAuthLook();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${ui.button} w-full`}>
      {pending ? children : idle}
    </button>
  );
}
