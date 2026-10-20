import type { ReactNode } from "react";

/** Moldura das telas de login, cadastro e senha (visual neutro da plataforma). */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-adm-bg px-4 py-10 font-adm text-adm-ink">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-[10px] bg-adm-blue text-lg font-bold text-white">
            S
          </span>
          <span className="flex flex-col">
            <strong className="text-[15px]">Super Fãs</strong>
            <span className="font-adm-mono text-[11px] text-adm-muted">Plataforma de fã clubes</span>
          </span>
        </div>

        <section className="flex flex-col gap-5 rounded-[14px] border border-adm-line bg-white p-6 shadow-[0_8px_30px_rgba(20,23,28,.06)] sm:p-7">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-2xl font-bold">{title}</h1>
            <p className="m-0 text-[14px] text-adm-muted">{description}</p>
          </div>
          {children}
        </section>

        {footer && <div className="text-center text-sm text-adm-muted">{footer}</div>}
      </div>
    </main>
  );
}

/** Campo de formulário com rótulo. */
export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
      {hint && (
        <span id={`${id}-hint`} className="text-xs text-adm-muted">
          {hint}
        </span>
      )}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
      {message}
    </p>
  );
}
