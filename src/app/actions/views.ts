"use server";

import { send } from "@/lib/api";

/** Soma uma visualização no post (chamado uma vez por post e sessão). Falhar não atrapalha o fã. */
export async function trackView(slug: string, postId: string): Promise<void> {
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[A-Za-z0-9_-]+$/.test(postId)) return;
  await send("POST", `/artists/${slug}/posts/${postId}/view`);
}
