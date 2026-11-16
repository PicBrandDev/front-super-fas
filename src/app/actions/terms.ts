"use server";

import { headers } from "next/headers";
import { apiEnabled, send, type ApiResult } from "@/lib/api";
import { TERMS_VERSION, cpfValido, nomeValido, onlyDigits } from "@/lib/terms";

/** Registra o aceite do termo (nome, CPF, ambiente, versão, IP e navegador). Sem API (modo exemplo) só valida o CPF. */
export async function acceptTerms(slug: string, name: string, cpf: string): Promise<ApiResult<null>> {
  const cleanName = name.replace(/\s+/g, " ").trim();
  if (!/^[a-z0-9-]+$/.test(slug)) return { ok: false, error: "Ambiente inválido.", status: 422 };
  if (!nomeValido(cleanName)) return { ok: false, error: "Informe seu nome completo.", status: 422 };
  if (!cpfValido(cpf)) return { ok: false, error: "CPF inválido. Confira os números.", status: 422 };
  if (!apiEnabled()) return { ok: true, data: null };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0].trim();
  const res = await send("POST", "/terms/accept", {
    artistSlug: slug,
    name: cleanName.slice(0, 120),
    cpf: onlyDigits(cpf),
    version: TERMS_VERSION,
    ip,
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
  });
  return res.ok ? { ok: true, data: null } : res;
}
