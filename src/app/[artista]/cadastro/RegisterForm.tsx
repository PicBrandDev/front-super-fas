"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { AuthInput, AuthSelect, AuthSubmit, Field, FormError } from "@/components/auth/look";

import { UFS } from "@/lib/ufs";

/** O cadastro é de um ambiente só: quem se cadastra aqui entra no fã clube deste artista. */
export function RegisterForm({ artista }: { artista: string }) {
  const [state, action, pending] = useActionState(register, undefined);
  const v = state?.values ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <Field id="cd-name" label="Seu nome">
        <AuthInput key={v.name} defaultValue={v.name} id="cd-name" name="name" autoComplete="name" required minLength={2} />
      </Field>
      <Field id="cd-email" label="E-mail">
        <AuthInput key={v.email} defaultValue={v.email} id="cd-email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field id="cd-handle" label="@ no Instagram">
        <AuthInput key={v.handle} defaultValue={v.handle} id="cd-handle" name="handle" placeholder="@voce" autoComplete="off" />
      </Field>
      <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
        <legend className="mono mb-1 p-0">Endereço</legend>
        <Field id="cd-zip" label="CEP">
          <AuthInput
            key={v.zipCode}
            defaultValue={v.zipCode}
            id="cd-zip"
            name="zipCode"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            required
          />
        </Field>
        <Field id="cd-street" label="Rua">
          <AuthInput key={v.street} defaultValue={v.street} id="cd-street" name="street" autoComplete="address-line1" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="cd-number" label="Número">
            <AuthInput key={v.number} defaultValue={v.number} id="cd-number" name="number" autoComplete="off" required />
          </Field>
          <Field id="cd-complement" label="Complemento">
            <AuthInput key={v.complement} defaultValue={v.complement} id="cd-complement" name="complement" autoComplete="address-line2" />
          </Field>
        </div>
        <Field id="cd-neighborhood" label="Bairro">
          <AuthInput key={v.neighborhood} defaultValue={v.neighborhood} id="cd-neighborhood" name="neighborhood" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_96px]">
          <Field id="cd-city" label="Cidade">
            <AuthInput key={v.city} defaultValue={v.city} id="cd-city" name="city" autoComplete="address-level2" required />
          </Field>
          <Field id="cd-state" label="Estado">
            <AuthSelect key={v.state} id="cd-state" name="state" defaultValue={v.state ?? ""} required>
              <option value="" disabled>
                UF
              </option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </AuthSelect>
          </Field>
        </div>
      </fieldset>
      <input type="hidden" name="artist" value={artista} />
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
