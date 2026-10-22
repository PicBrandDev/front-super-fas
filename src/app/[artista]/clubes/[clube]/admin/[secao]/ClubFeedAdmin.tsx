"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteContent } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { FeedCard, FeedGrid } from "@/components/admin/FeedCard";
import { AdminEmpty, AdminNotice } from "@/components/admin/ui";
import type { FeedItem } from "@/lib/types";

/** Posts do fã clube em cards (foto, texto e números), como o fã vê. O dono modera: pode excluir um post. */
export function ClubFeedAdmin({ slug, club, clubName, items }: { slug: string; club: string; clubName: string; items: FeedItem[] }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const remove = (id: string) =>
    start(async () => {
      const res = await deleteContent(slug, "posts", id, club);
      if (!res.ok) return setError(res.error);
      setConfirm(null);
      setError("");
      router.refresh();
    });

  return (
    <>
      <AdminPageHeader title="Posts do fã clube" headingId="posts-title" description={`O que a galera do ${clubName} publicou. Você pode excluir um post impróprio.`} />
      {error && <AdminNotice tone="error">{error}</AdminNotice>}
      {items.length === 0 ? (
        <AdminEmpty title="Nenhum post ainda" text="Quando o fã clube publicar, os posts aparecem aqui com curtidas, comentários e visualizações." />
      ) : (
        <FeedGrid>
          {items.map((p) => (
            <li key={p.id}>
              <FeedCard item={p}>
                {confirm === p.id ? (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => remove(p.id)} disabled={pending} className="min-h-10 cursor-pointer rounded-lg border-0 bg-adm-danger px-3 text-[13px] font-semibold text-white disabled:opacity-60">
                      Excluir
                    </button>
                    <button type="button" onClick={() => setConfirm(null)} className="min-h-10 cursor-pointer rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-ink">
                      Manter
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirm(p.id)} className="min-h-10 cursor-pointer self-start rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger">
                    Excluir
                  </button>
                )}
              </FeedCard>
            </li>
          ))}
        </FeedGrid>
      )}
    </>
  );
}
