"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

/**
 * Mostra uma única vez a senha provisória de uma conta criada por convite.
 * Ainda não enviamos e-mail: quem convidou passa a senha para a pessoa.
 */
export function TempPasswordNotice({
  email,
  password,
  onClose,
}: {
  email: string;
  password: string | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(`Login: ${email}\nSenha provisória: ${password}`);
      setCopied(true);
    } catch {
      // Sem permissão de área de transferência: a pessoa copia na mão.
    }
  };

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-adm-ok bg-adm-ok-bg p-4 text-adm-ink outline-none"
    >
      <div className="flex flex-col gap-1">
        <strong className="text-sm">Conta criada para {email}</strong>
        {password ? (
          <>
            <span className="text-sm">
              Senha provisória: <code className="rounded bg-white px-1.5 py-0.5 font-adm-mono text-[13px] font-semibold">{password}</code>
            </span>
            <span className="text-xs text-adm-muted">
              Anote agora: ela não aparece de novo. No primeiro login a pessoa escolhe a própria senha.
            </span>
          </>
        ) : (
          <span className="text-sm">A pessoa já tinha conta e foi vinculada; ela entra com a senha que já usa.</span>
        )}
      </div>
      <div className="flex gap-2">
        {password && (
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar aviso"
          className="flex size-10 cursor-pointer items-center justify-center rounded-lg border border-adm-line bg-white"
        >
          <Icon name="close" size={14} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}
