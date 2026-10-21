"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { send } from "@/lib/api";
import { SESSION_COOKIE, homeFor, type Role } from "@/lib/auth";

/** `values` devolve o que a pessoa digitou (o React limpa o formulário depois da ação). */
export type FormState = { error?: string; values?: Record<string, string> } | undefined;

type TokenOut = {
  token: string;
  user: { role: Role; artists: string[]; clubs: string[]; mustChangePassword: boolean };
};

async function startSession(out: TokenOut) {
  (await cookies()).set(SESSION_COOKIE, out.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Só aceita voltar para caminhos internos (evita redirecionar para outro site). */
const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "";
};

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const values = { email };
  if (!email || !password) return { error: "Preencha e-mail e senha.", values };

  const res = await send<TokenOut>("POST", "/auth/login", { email, password });
  if (!res.ok) return { error: res.error, values };
  await startSession(res.data);

  if (res.data.user.mustChangePassword) redirect("/conta/senha?primeiro=1");
  redirect(safeNext(form.get("next")) || homeFor(res.data.user));
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const body = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
    handle: String(form.get("handle") ?? "").trim(),
    city: String(form.get("city") ?? "").trim(),
    artist: String(form.get("artist") ?? "") || null,
  };
  const values = { name: body.name, email: body.email, handle: body.handle, city: body.city, artist: body.artist ?? "" };
  if (body.name.length < 2) return { error: "Digite seu nome.", values };
  if (body.password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres.", values };
  if (body.password !== String(form.get("confirm") ?? "")) return { error: "As senhas não conferem.", values };

  const res = await send<TokenOut>("POST", "/auth/register", body);
  if (!res.ok) return { error: res.error, values };
  await startSession(res.data);
  redirect(body.artist ? `/${body.artist}` : "/");
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const currentPassword = String(form.get("current") ?? "");
  const newPassword = String(form.get("password") ?? "");
  if (newPassword.length < 8) return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  if (newPassword !== String(form.get("confirm") ?? "")) return { error: "As senhas não conferem." };

  const res = await send<TokenOut>("POST", "/auth/change-password", { currentPassword, newPassword });
  if (!res.ok) return { error: res.error };
  await startSession(res.data);
  redirect(safeNext(form.get("next")) || homeFor(res.data.user));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
