"use client";

import { useEffect, useRef, useState } from "react";
import { AdminNotice, btnSecondary } from "@/components/admin/ui";
import { Icon } from "@/components/icons";

/**
 * Mostra uma única vez a senha provisória de uma conta criada por convite.
 * Quando o e-mail do convite não foi enviado (SMTP desligado ou falhou), quem convidou copia a senha e passa para a pessoa.
 * Ao fechar, a senha some e não dá para vê-la de novo.
 */
export function TempPasswordNotice({
  email,
  password,
  emailSent = false,
  onClose,
}: {
  email: string;
  password: string | null;
  emailSent?: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(`Login: ${email}\nSenha provisória: ${password}`);
      setCopied("ok");
    } catch {
      // Sem permissão de área de transferência: a pessoa seleciona e copia na mão.
      setCopied("fail");
    }
  };

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="region"
      aria-label={`Conta criada para ${email}`}
      className="flex flex-col gap-3 rounded-xl border border-adm-ok bg-white p-4 outline-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <strong className="text-sm">{emailSent && !password ? `Convite enviado para ${email}` : `Conta criada para ${email}`}</strong>
          {password ? (
            <span className="text-sm">
              Senha provisória:{" "}
              <code className="select-all rounded bg-adm-bg px-1.5 py-0.5 font-adm-mono text-[15px] font-semibold">{password}</code>
            </span>
          ) : (
            <span className="text-sm">A pessoa já tinha conta e foi vinculada; ela entra com a senha que já usa.</span>
          )}
        </div>
        <div className="flex gap-2">
          {password && (
            <button type="button" onClick={copy} className={btnSecondary}>
              {copied === "ok" ? "Copiado" : "Copiar"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar aviso da senha provisória"
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-adm-line bg-white"
          >
            <Icon name="close" size={14} strokeWidth={2.6} />
          </button>
        </div>
      </div>
      {password && (
        <AdminNotice tone={copied === "fail" ? "error" : "warn"}>
          {copied === "fail"
            ? "Não deu para copiar automaticamente. Selecione a senha acima e copie na mão antes de fechar."
            : emailSent
              ? "O convite foi enviado por e-mail. Esta senha aparece só agora; guarde caso a pessoa não receba o e-mail."
              : "O e-mail não foi enviado. Esta senha aparece só agora: copie e passe para a pessoa antes de fechar. No primeiro login ela escolhe a própria senha."}
        </AdminNotice>
      )}
    </div>
  );
}
