"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions/auth";
import { Field, FormError } from "@/components/auth/AuthShell";
import { btnPrimary, inputClass } from "@/components/admin/ui";

export function PasswordForm({ first }: { first: boolean }) {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <Field id="pw-current" label={first ? "Senha provisória" : "Senha atual"}>
        <input id="pw-current" name="current" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <Field id="pw-new" label="Nova senha" hint="Pelo menos 8 caracteres.">
        <input
          id="pw-new"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-describedby="pw-new-hint"
          className={inputClass}
        />
      </Field>
      <Field id="pw-confirm" label="Repita a nova senha">
        <input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} aria-busy={pending} className={`${btnPrimary} w-full`}>
        {pending ? "Salvando…" : "Salvar senha"}
      </button>
    </form>
  );
}
