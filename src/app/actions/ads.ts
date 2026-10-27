"use server";

import { send } from "@/lib/api";

/** Soma uma visualização ou um clique no anúncio (o app manda uma vez por anúncio e sessão). Falhar não atrapalha o fã. */
export async function trackAd(slug: string, campaignId: string, kind: "view" | "click"): Promise<void> {
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[A-Za-z0-9_-]+$/.test(campaignId)) return;
  await send("POST", `/artists/${slug}/ads/${campaignId}/track`, { kind });
}
