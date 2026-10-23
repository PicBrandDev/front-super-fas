"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { send } from "@/lib/api";
import { SESSION_COOKIE, artistSlugOfPath, homeFor, type Role } from "@/lib/auth";
import { ENTRY_AD_COOKIE, ENTRY_AD_COOKIE_MAX_AGE } from "@/lib/entryAdCookie";

/** `values` devolve o que a pessoa digitou (o React limpa o formulário depois da ação). */
export type FormState = { error?: string; values?: Record<string, string> } | undefined;

type TokenOut = {
  token: string;
  user: { role: Role; artists: string[]; clubs: string[]; mustChangePassword: boolean };
};

/** Marca "acabou de entrar" para o anúncio de entrada da área do fã (ver lib/entryAdCookie). */
async function flagEntryAd(slug: string) {
  (await cookies()).set(ENTRY_AD_COOKIE, slug, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ENTRY_AD_COOKIE_MAX_AGE,
  });
}

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

  const artista = String(form.get("artista") ?? "");
  if (res.data.user.mustChangePassword) {
    redirect(/^[a-z0-9-]+$/.test(artista) ? `/${artista}/conta/senha?primeiro=1` : "/conta/senha?primeiro=1");
  }
  // Fã que entrou pelo login de um artista volta para o ambiente dele; equipe vai para o painel.
  const validSlug = /^[a-z0-9-]+$/.test(artista);
  const u = res.data.user;
  // Dono de um fã clube (não é da administração do ambiente) entra no "Meu fandom" do ambiente em que fez o login.
  const ownsHere = u.role === "artist_admin" && validSlug && !u.artists.includes(artista) && u.clubs.some((c) => c.startsWith(`${artista}/`));
  const fanHome = (u.role === "fan" && validSlug) || ownsHere ? (ownsHere ? `/${artista}/meu-fandom` : `/${artista}`) : "";
  if (fanHome) await flagEntryAd(artista);
  redirect(safeNext(form.get("next")) || fanHome || homeFor(res.data.user));
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const body = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
    handle: String(form.get("handle") ?? "").trim(),
    city: String(form.get("city") ?? "").trim(),
    zipCode: String(form.get("zipCode") ?? "").trim(),
    street: String(form.get("street") ?? "").trim(),
    number: String(form.get("number") ?? "").trim(),
    complement: String(form.get("complement") ?? "").trim(),
    neighborhood: String(form.get("neighborhood") ?? "").trim(),
    state: String(form.get("state") ?? "").trim().toUpperCase(),
    artist: String(form.get("artist") ?? "") || null,
  };
  const values = {
    name: body.name,
    email: body.email,
    handle: body.handle,
    city: body.city,
    zipCode: body.zipCode,
    street: body.street,
    number: body.number,
    complement: body.complement,
    neighborhood: body.neighborhood,
    state: body.state,
    artist: body.artist ?? "",
  };
  if (!body.artist) return { error: "Abra o cadastro pelo fã clube do artista.", values };
  if (body.name.length < 2) return { error: "Digite seu nome.", values };
  if (!/^\d{5}-?\d{3}$/.test(body.zipCode)) return { error: "Digite um CEP válido (8 números).", values };
  if (!body.street || !body.number || !body.neighborhood || !body.city) {
    return { error: "Preencha rua, número, bairro e cidade.", values };
  }
  if (!/^[A-Z]{2}$/.test(body.state)) return { error: "Escolha o estado.", values };
  if (body.password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres.", values };
  if (body.password !== String(form.get("confirm") ?? "")) return { error: "As senhas não conferem.", values };

  const res = await send<TokenOut>("POST", "/auth/register", body);
  if (!res.ok) return { error: res.error, values };
  await startSession(res.data);
  if (/^[a-z0-9-]+$/.test(body.artist)) await flagEntryAd(body.artist);
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
  // Saiu de dentro do ambiente de um artista: volta para o login dele.
  const referer = (await headers()).get("referer");
  let path = "";
  try {
    path = referer ? new URL(referer).pathname : "";
  } catch {}
  const slug = artistSlugOfPath(path);
  redirect(slug ? `/${slug}/login` : path.startsWith("/patrocinador") ? "/patrocinador/login" : "/");
}
