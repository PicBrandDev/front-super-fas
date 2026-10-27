"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteContent } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { FeedCard, FeedGrid } from "@/components/admin/FeedCard";
import { DetalhePostDialog } from "@/components/admin/DetalheDialogs";
import { AdminEmpty, AdminNotice, btnPrimary } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { FeedItem } from "@/lib/types";
import { DropComposer } from "./DropComposer";

/** Feed do admin: cada publicação é um card com foto, legenda e os números dela. */
export function MuralAdmin({
  slug,
  artistName,
  drops,
}: {
  slug: string;
  artistName: string;
  drops: FeedItem[];
}) {
  const router = useRouter();
  const [composer, setComposer] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [pending, start] = useTransition();
  const items = drops;

  const remove = (id: string) =>
    start(async () => {
      const res = await deleteContent(slug, "posts", id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setConfirm(null);
      setError("");
      setAnnounce("Publicação excluída.");
      router.refresh();
    });

  return (
    <>
      <AdminPageHeader
        title="Drop News"
        headingId="mural-title"
        description={`As publicações oficiais de ${artistName}. Saem sempre no fã clube master.`}
        actions={
          <button type="button" onClick={() => setComposer(true)} className={btnPrimary}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Novo post
          </button>
        }
      />
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>

      {error && <AdminNotice tone="error">{error}</AdminNotice>}

      <div>
        {items.length === 0 ? (
          <AdminEmpty
            title="Nenhum Drop News ainda"
            text="Publique o primeiro: foto, legenda, revisão e pronto."
            action={
              <button type="button" onClick={() => setComposer(true)} className={btnPrimary}>
                <Icon name="plus" size={18} strokeWidth={2.4} />
                Novo post
              </button>
            }
          />
        ) : (
          <FeedGrid>
            {items.map((p) => (
              <li key={p.id}>
                <FeedCard item={p} onOpen={() => setOpen(p.id)}>
                  {confirm === p.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        disabled={pending}
                        className="min-h-10 cursor-pointer rounded-lg border-0 bg-adm-danger px-3 text-[13px] font-semibold text-white disabled:opacity-60"
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirm(null)}
                        className="min-h-10 cursor-pointer rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-ink"
                      >
                        Manter
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirm(p.id)}
                      className="min-h-10 cursor-pointer self-start rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger"
                    >
                      Excluir
                    </button>
                  )}
                </FeedCard>
              </li>
            ))}
          </FeedGrid>
        )}
      </div>

      {open && <DetalhePostDialog key={open} artist={slug} id={open} onClose={() => setOpen(null)} />}

      {composer && (
        <DropComposer
          slug={slug}
          artistName={artistName}
          onClose={() => setComposer(false)}
          onPublished={() => {
            setComposer(false);
            setAnnounce("Drop News publicado.");
            router.refresh();
          }}
        />
      )}
    </>
  );
}
