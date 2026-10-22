"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { AuthInput, AuthSubmit, Field, FormError } from "@/components/auth/look";

export function LoginForm({ next, artista = "" }: { next: string; artista?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="artista" value={artista} />
      <FormError message={state?.error} />
      <Field id="lg-email" label="E-mail">
        <AuthInput
          key={state?.values?.email}
          id="lg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
        />
      </Field>
      <Field id="lg-password" label="Senha">
        <AuthInput id="lg-password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <AuthSubmit pending={pending} idle="Entrar">
        Entrando…
      </AuthSubmit>
    </form>
  );
}
