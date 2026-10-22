"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions/auth";
import { AuthInput, AuthSubmit, Field, FormError } from "@/components/auth/look";

export function PasswordForm({ first, next = "" }: { first: boolean; next?: string }) {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <FormError message={state?.error} />
      <Field id="pw-current" label={first ? "Senha provisória" : "Senha atual"}>
        <AuthInput id="pw-current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field id="pw-new" label="Nova senha" hint="Pelo menos 8 caracteres.">
        <AuthInput
          id="pw-new"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-describedby="pw-new-hint"
        />
      </Field>
      <Field id="pw-confirm" label="Repita a nova senha">
        <AuthInput id="pw-confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <AuthSubmit pending={pending} idle="Salvar senha">
        Salvando…
      </AuthSubmit>
    </form>
  );
}
