"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { AuthInput, AuthSelect, AuthSubmit, Field, FormError } from "@/components/auth/look";

export function RegisterForm({ clubs, preset }: { clubs: { slug: string; name: string }[]; preset?: string }) {
  const [state, action, pending] = useActionState(register, undefined);
  const v = state?.values ?? {};
  const chosen = v.artist || preset || clubs[0]?.slug;
  // Veio do ambiente de um artista: o fã clube já está escolhido, sem lista para confundir.
  const fixed = !!preset && clubs.some((c) => c.slug === preset);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <Field id="cd-name" label="Seu nome">
        <AuthInput key={v.name} defaultValue={v.name} id="cd-name" name="name" autoComplete="name" required minLength={2} />
      </Field>
      <Field id="cd-email" label="E-mail">
        <AuthInput key={v.email} defaultValue={v.email} id="cd-email" name="email" type="email" autoComplete="email" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="cd-handle" label="@ no Instagram">
          <AuthInput key={v.handle} defaultValue={v.handle} id="cd-handle" name="handle" placeholder="@voce" autoComplete="off" />
        </Field>
        <Field id="cd-city" label="Cidade">
          <AuthInput key={v.city} defaultValue={v.city} id="cd-city" name="city" autoComplete="address-level2" />
        </Field>
      </div>
      {fixed ? (
        <input type="hidden" name="artist" value={preset} />
      ) : (
        clubs.length > 0 && (
          <Field id="cd-artist" label="Fã clube">
            <AuthSelect key={chosen} id="cd-artist" name="artist" defaultValue={chosen}>
              {clubs.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </AuthSelect>
          </Field>
        )
      )}
      <Field id="cd-password" label="Senha" hint="Pelo menos 8 caracteres.">
        <AuthInput
          id="cd-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-describedby="cd-password-hint"
        />
      </Field>
      <Field id="cd-confirm" label="Repita a senha">
        <AuthInput id="cd-confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <AuthSubmit pending={pending} idle="Criar conta">
        Criando conta…
      </AuthSubmit>
    </form>
  );
}
