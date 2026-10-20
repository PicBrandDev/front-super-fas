"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { Field, FormError } from "@/components/auth/AuthShell";
import { btnPrimary, inputClass } from "@/components/admin/ui";

export function RegisterForm({ clubs }: { clubs: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(register, undefined);
  const v = state?.values ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <Field id="cd-name" label="Seu nome">
        <input key={v.name} defaultValue={v.name} id="cd-name" name="name" autoComplete="name" required minLength={2} className={inputClass} />
      </Field>
      <Field id="cd-email" label="E-mail">
        <input key={v.email} defaultValue={v.email} id="cd-email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="cd-handle" label="@ no Instagram">
          <input key={v.handle} defaultValue={v.handle} id="cd-handle" name="handle" placeholder="@voce" autoComplete="off" className={inputClass} />
        </Field>
        <Field id="cd-city" label="Cidade">
          <input key={v.city} defaultValue={v.city} id="cd-city" name="city" autoComplete="address-level2" className={inputClass} />
        </Field>
      </div>
      {clubs.length > 0 && (
        <Field id="cd-artist" label="Fã clube">
          <select key={v.artist} id="cd-artist" name="artist" defaultValue={v.artist || clubs[0].slug} className={inputClass}>
            {clubs.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field id="cd-password" label="Senha" hint="Pelo menos 8 caracteres.">
        <input
          id="cd-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-describedby="cd-password-hint"
          className={inputClass}
        />
      </Field>
      <Field id="cd-confirm" label="Repita a senha">
        <input id="cd-confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} aria-busy={pending} className={`${btnPrimary} w-full`}>
        {pending ? "Criando conta…" : "Criar conta"}
      </button>
    </form>
  );
}
