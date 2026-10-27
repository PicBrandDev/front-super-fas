"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type CSSProperties } from "react";
import { deleteContent, saveContent } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { DetalheHitDialog } from "@/components/admin/DetalheDialogs";
import { ItemForm, type FieldDef, type Item } from "@/components/admin/ResourceManager";
import { AdminNotice, btnPrimary } from "@/components/admin/ui";
import { Vinyl } from "@/components/fan/Vinyl";
import { Icon } from "@/components/icons";
import { formatShort } from "@/lib/format";
import s from "@/app/[artista]/(fan)/mural/Mural.module.css";

export type DropTrack = Item & { title: string; meta: string; releaseLabel: string; votes: number; views?: number };

/**
 * Drops Hits do admin com os mesmos cards que o fã vê (disco de vinil, título, legenda, lançamento e votos).
 * Cada card tem Editar e Excluir; "Adicionar drop" cria uma faixa nova.
 */
export function DropsAdmin({
  slug,
  themeVars,
  fields,
  tracks,
}: {
  slug: string;
  themeVars: CSSProperties;
  fields: FieldDef[];
  tracks: DropTrack[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<DropTrack | "new" | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const remove = (t: DropTrack) =>
    start(async () => {
      const res = await deleteContent(slug, "tracks", t.id);
      if (!res.ok) return setError(res.error);
      setConfirmDel(null);
      setError("");
      router.refresh();
    });

  const add = (
    <button type="button" onClick={() => setEditing("new")} disabled={editing === "new"} className={btnPrimary}>
      <Icon name="plus" size={18} strokeWidth={2.4} />
      Adicionar drop
    </button>
  );

  return (
    <>
      <AdminPageHeader
        title="Drops Hits"
        headingId="drops-title"
        description="As prévias de música do jeito que o fã vê. Edite ou exclua direto no card."
        actions={add}
      />
      {error && !editing && <AdminNotice tone="error">{error}</AdminNotice>}

      {editing && (
        <ItemForm
          key={editing === "new" ? "new" : editing.id}
          fields={fields}
          item={editing === "new" ? null : editing}
          singular="faixa"
          feminine
          resource="tracks"
          onCancel={() => setEditing(null)}
          onSave={async (data) => {
            const res = await saveContent(slug, "tracks", editing === "new" ? null : editing.id, data);
            if (!res.ok) return res.error;
            setEditing(null);
            setError("");
            router.refresh();
            return null;
          }}
        />
      )}

      <div style={themeVars} className="fan overflow-hidden rounded-xl border border-adm-line bg-night font-grotesk text-base leading-6 text-fg">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <h2 className="m-0 font-display text-2xl font-black leading-7">Nenhuma prévia por enquanto</h2>
            <p className="m-0 text-fg-muted">Adicione o primeiro drop: ele aparece para os fãs na aba Drops do mural.</p>
          </div>
        ) : (
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(360px,1fr))]">
            {tracks.map((t, i) => (
              <article key={t.id} className={s.drop}>
                <div className={s.disc}>
                  <Vinyl />
                </div>
                <div>
                  <h3>{t.title}</h3>
                  <div className="mono">
                    {t.meta}
                    <br />
                    Lançamento {t.releaseLabel || "—"}
                  </div>
                  <div className={s.tags}>{i === 0 && <span className="tag">Drop novo</span>}</div>
                  <div className={s.ops}>
                    <span className="act like" aria-label={`${t.votes} votos pela versão completa`}>
                      <Icon name="heart" size={20} />
                      <span className="num">{formatShort(t.votes)}</span>
                    </span>
                    <span className="act like" aria-label={`${t.views ?? 0} visualizações`}>
                      <Icon name="eye" size={20} />
                      <span className="num">{formatShort(t.views ?? 0)}</span>
                    </span>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setDetail(t.id)}>
                      Ver detalhes<span className="sr-only"> de {t.title}</span>
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(t)} disabled={!!editing}>
                      Editar<span className="sr-only"> {t.title}</span>
                    </button>
                    {confirmDel === t.id ? (
                      <>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => remove(t)} disabled={pending}>
                          Excluir
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(null)}>
                          Manter
                        </button>
                      </>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(t.id)}>
                        Excluir<span className="sr-only"> {t.title}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {detail && <DetalheHitDialog key={detail} artist={slug} id={detail} onClose={() => setDetail(null)} />}
    </>
  );
}
