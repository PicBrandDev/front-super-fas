"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Field, FormError } from "@/components/auth/AuthShell";
import { btnPrimary, inputClass } from "@/components/admin/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <FormError message={state?.error} />
      <Field id="lg-email" label="E-mail">
        <input
          key={state?.values?.email}
          id="lg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          className={inputClass}
        />
      </Field>
      <Field id="lg-password" label="Senha">
        <input
          id="lg-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <button type="submit" disabled={pending} aria-busy={pending} className={`${btnPrimary} w-full`}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
