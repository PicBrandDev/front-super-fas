"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type CSSProperties } from "react";
import { deleteContent, saveContent } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ItemForm, type FieldDef, type Item } from "@/components/admin/ResourceManager";
import { AdminNotice, btnPrimary } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { MediaImage } from "@/lib/types";
import s from "@/app/[artista]/(fan)/loja/Loja.module.css";

export type LojaProduct = Item & {
  name: string;
  priceLabel: string;
  color: string;
  category: string;
  photo: MediaImage | null;
};

const CATEGORY: Record<string, string> = { roupas: "Camiseta", acessorios: "Acessório", musica: "Música" };

/**
 * A Loja do admin com os mesmos cards que o fã vê (foto, nome e preço), na grade, em vez de lista.
 * Cada card tem Editar e Excluir; o primeiro card cria um produto novo.
 */
export function LojaAdmin({
  slug,
  themeVars,
  fields,
  products,
}: {
  slug: string;
  themeVars: CSSProperties;
  fields: FieldDef[];
  products: LojaProduct[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<LojaProduct | "new" | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const remove = (p: LojaProduct) =>
    start(async () => {
      const res = await deleteContent(slug, "products", p.id);
      if (!res.ok) return setError(res.error);
      setConfirmDel(null);
      setError("");
      router.refresh();
    });

  return (
    <>
      <AdminPageHeader
        title="Loja"
        headingId="loja-title"
        description="Os produtos da loja do fã clube, do jeito que o fã vê. Edite ou exclua direto no card."
        actions={
          <button type="button" onClick={() => setEditing("new")} disabled={editing === "new"} className={btnPrimary}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Novo produto
          </button>
        }
      />
      {error && !editing && <AdminNotice tone="error">{error}</AdminNotice>}

      {editing && (
        <ItemForm
          key={editing === "new" ? "new" : editing.id}
          fields={fields}
          item={editing === "new" ? null : editing}
          singular="produto"
          feminine={false}
          resource="products"
          onCancel={() => setEditing(null)}
          onSave={async (data) => {
            const res = await saveContent(slug, "products", editing === "new" ? null : editing.id, data);
            if (!res.ok) return res.error;
            setEditing(null);
            setError("");
            router.refresh();
            return null;
          }}
        />
      )}

      <div style={themeVars} className="fan rounded-xl border border-adm-line bg-night font-grotesk text-base leading-6 text-fg">
        <div className={s.prods} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))" }}>
          <button
            type="button"
            onClick={() => setEditing("new")}
            disabled={editing === "new"}
            className="flex aspect-[4/5] min-h-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-hair border border-dashed border-line-strong bg-transparent font-grotesk text-fg-muted"
          >
            <Icon name="plus" size={22} />
            <span className="mono">Novo produto</span>
          </button>

          {products.map((p) => (
            <article key={p.id} className={s.prod}>
              <div className={`${s.img} ${p.photo?.cover ? s.cover : ""}`} style={p.photo ? undefined : { background: p.color }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.photo && <img src={p.photo.src} alt={p.photo.alt} loading="lazy" />}
              </div>
              <span className="mono">{CATEGORY[p.category] ?? p.category}</span>
              <h3>{p.name}</h3>
              <div className={s.price}>{p.priceLabel}</div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(p)} disabled={!!editing}>
                  Editar<span className="sr-only"> {p.name}</span>
                </button>
                {confirmDel === p.id ? (
                  <>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => remove(p)} disabled={pending}>
                      Excluir
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(null)}>
                      Manter
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(p.id)}>
                    Excluir<span className="sr-only"> {p.name}</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
