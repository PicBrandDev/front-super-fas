"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteContent } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { FeedCard, FeedGrid } from "@/components/admin/FeedCard";
import { AdminEmpty, AdminNotice, btnPrimary } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { FeedItem } from "@/lib/types";
import { DropComposer } from "./DropComposer";

type Tab = "drop" | "galera";

/** Feed do admin: cada publicação é um card com foto, legenda e os números dela. */
export function MuralAdmin({
  slug,
  artistName,
  drops,
  galera,
}: {
  slug: string;
  artistName: string;
  drops: FeedItem[];
  galera: FeedItem[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("drop");
  const [composer, setComposer] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [pending, start] = useTransition();
  const items = tab === "drop" ? drops : galera;

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
        description={`As publicações oficiais de ${artistName} e a moderação do mural da galera.`}
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

      <div role="tablist" aria-label="Tipo de publicação" className="flex gap-1 border-b border-adm-line">
        {(
          [
            { id: "drop", label: "Drop News", n: drops.length },
            { id: "galera", label: "Galera", n: galera.length },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="mural-painel"
            onClick={() => setTab(t.id)}
            className={`-mb-px min-h-11 cursor-pointer border-0 border-b-2 bg-transparent px-4 font-adm text-sm font-semibold ${
              tab === t.id ? "border-adm-blue text-adm-ink" : "border-transparent text-adm-muted"
            }`}
          >
            {t.label} <span className="font-adm-mono text-xs text-adm-muted">{t.n}</span>
          </button>
        ))}
      </div>

      {error && <AdminNotice tone="error">{error}</AdminNotice>}

      <div id="mural-painel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {items.length === 0 ? (
          <AdminEmpty
            title={tab === "drop" ? "Nenhum Drop News ainda" : "A galera ainda não postou"}
            text={tab === "drop" ? "Publique o primeiro: foto, legenda, revisão e pronto." : "Os posts dos fãs aparecem aqui para você moderar."}
            action={
              tab === "drop" ? (
                <button type="button" onClick={() => setComposer(true)} className={btnPrimary}>
                  <Icon name="plus" size={18} strokeWidth={2.4} />
                  Novo post
                </button>
              ) : undefined
            }
          />
        ) : (
          <FeedGrid>
            {items.map((p) => (
              <li key={p.id}>
                <FeedCard item={p}>
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

      {composer && (
        <DropComposer
          slug={slug}
          artistName={artistName}
          onClose={() => setComposer(false)}
          onPublished={() => {
            setComposer(false);
            setTab("drop");
            setAnnounce("Drop News publicado.");
            router.refresh();
          }}
        />
      )}
    </>
  );
}
