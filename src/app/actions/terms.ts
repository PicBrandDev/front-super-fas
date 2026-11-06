"use server";

import { headers } from "next/headers";
import { apiEnabled, send, type ApiResult } from "@/lib/api";
import { TERMS_VERSION, cpfValido, onlyDigits } from "@/lib/terms";

/** Registra o aceite do termo (CPF, ambiente, versão, IP e navegador). Sem API (modo exemplo) só valida o CPF. */
export async function acceptTerms(slug: string, cpf: string): Promise<ApiResult<null>> {
  if (!/^[a-z0-9-]+$/.test(slug) || !cpfValido(cpf)) return { ok: false, error: "CPF inválido. Confira os números.", status: 422 };
  if (!apiEnabled()) return { ok: true, data: null };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0].trim();
  const res = await send("POST", "/terms/accept", {
    artistSlug: slug,
    cpf: onlyDigits(cpf),
    version: TERMS_VERSION,
    ip,
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
  });
  return res.ok ? { ok: true, data: null } : res;
}
