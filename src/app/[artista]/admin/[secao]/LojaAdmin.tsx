"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import { deleteContent, removeProductImage, saveContent, setProductImage } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ItemForm, type FieldDef, type Item } from "@/components/admin/ResourceManager";
import { AdminNotice, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { MediaImage } from "@/lib/types";
import { thumb } from "@/lib/thumb";
import s from "@/app/[artista]/(fan)/loja/Loja.module.css";

export type LojaProduct = Item & {
  name: string;
  priceLabel: string;
  color: string;
  category: string;
  /** Foto enviada pelo admin (/uploads/...); vazio = o card usa a foto de exemplo ou a cor. */
  imagePath: string;
  photo: MediaImage | null;
};

/** Foto escolhida no formulário: só sobe (ou sai) quando o produto é salvo. */
type PhotoDraft = { file: File | null; preview: string | null; remove: boolean };

const NO_DRAFT: PhotoDraft = { file: null, preview: null, remove: false };
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [draft, setDraft] = useState<PhotoDraft>(NO_DRAFT);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  // Cada abertura (ou fechamento) do formulário começa sem foto escolhida.
  const openForm = (e: LojaProduct | "new" | null) => {
    setEditing(e);
    setDraft(NO_DRAFT);
  };
  // A prévia local da foto escolhida é liberada quando muda ou some.
  useEffect(() => () => void (draft.preview && URL.revokeObjectURL(draft.preview)), [draft.preview]);

  const remove = (p: LojaProduct) =>
    start(async () => {
      const res = await deleteContent(slug, "products", p.id);
      if (!res.ok) return setError(res.error);
      setConfirmDel(null);
      setError("");
      router.refresh();
    });

  /** Sobe a foto escolhida (ou tira a antiga) depois que o produto foi salvo. Devolve o erro, se houver. */
  const savePhoto = async (id: string, hadPhoto: boolean): Promise<string> => {
    if (draft.file) {
      const form = new FormData();
      form.set("image", draft.file);
      const res = await setProductImage(slug, id, form);
      return res.ok ? "" : res.error;
    }
    if (draft.remove && hadPhoto) {
      const res = await removeProductImage(slug, id);
      return res.ok ? "" : res.error;
    }
    return "";
  };

  return (
    <>
      <AdminPageHeader
        title="Loja"
        headingId="loja-title"
        description="Os produtos da loja do fã clube, do jeito que o fã vê. Edite ou exclua direto no card."
        actions={
          <button type="button" onClick={() => openForm("new")} disabled={editing === "new"} className={btnPrimary}>
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
          onCancel={() => openForm(null)}
          onSave={async (data) => {
            const isNew = editing === "new";
            const res = await saveContent(slug, "products", isNew ? null : editing.id, data);
            if (!res.ok) return res.error;
            const id = isNew ? (res.data as { id?: string } | undefined)?.id : editing.id;
            const photoError = id ? await savePhoto(id, !isNew && !!editing.imagePath) : "";
            router.refresh();
            // Na edição o formulário fica aberto para tentar a foto de novo; o produto novo já existe, então fecha.
            if (photoError && !isNew) return `Os dados foram salvos, mas a foto não: ${photoError}`;
            openForm(null);
            setError(photoError ? `Produto criado, mas a foto não subiu: ${photoError} Abra Editar para tentar de novo.` : "");
            return null;
          }}
        >
          <ProductPhotoField
            current={editing === "new" ? null : editing}
            color={editing === "new" ? "#E0A526" : editing.color}
            draft={draft}
            onChange={setDraft}
          />
        </ItemForm>
      )}

      <div style={themeVars} className="fan rounded-xl border border-adm-line bg-night font-grotesk text-base leading-6 text-fg">
        <div className={s.prods} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))" }}>
          <button
            type="button"
            onClick={() => openForm("new")}
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
                {p.photo && <img src={thumb(p.photo.src, 360)} alt={p.photo.alt} loading="lazy" />}
              </div>
              <span className="mono">{CATEGORY[p.category] ?? p.category}</span>
              <h3>{p.name}</h3>
              <div className={s.price}>{p.priceLabel}</div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => openForm(p)} disabled={!!editing}>
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

/**
 * Foto do produto no formulário: prévia, "Escolher/Trocar foto" e "Tirar foto".
 * Sem foto enviada, a prévia mostra a foto de exemplo do card (ou a cor), com o aviso.
 */
function ProductPhotoField({
  current,
  color,
  draft,
  onChange,
}: {
  current: LojaProduct | null;
  color: string;
  draft: PhotoDraft;
  onChange: (d: PhotoDraft) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const uploaded = !!current?.imagePath && !draft.remove;
  const src = draft.preview ?? (draft.remove ? null : (current?.photo?.src ?? null));
  const isSample = !draft.file && !uploaded && !!src;

  const pick = (f: File | undefined) => {
    if (input.current) input.current.value = "";
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) return setError("Envie a foto em JPG, PNG ou WebP.");
    if (f.size > 5 * 1024 * 1024) return setError("A foto pode ter no máximo 5 MB.");
    setError("");
    onChange({ file: f, preview: URL.createObjectURL(f), remove: false });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span id="fld-products-photo" className="text-[13px] font-semibold">
        Foto do produto
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex size-24 flex-none items-center justify-center overflow-hidden rounded-lg border border-adm-line" style={src ? undefined : { background: color }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src && <img src={src} alt="" className="size-full object-cover" />}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className={btnSecondary} aria-describedby="fld-products-photo-hint">
              {draft.file || uploaded ? "Trocar foto" : "Escolher foto"}
            </button>
            {(draft.file || uploaded) && (
              <button
                type="button"
                onClick={() => onChange({ file: null, preview: null, remove: uploaded })}
                className="min-h-11 cursor-pointer rounded-lg px-3 text-sm font-semibold text-adm-muted underline-offset-2 hover:underline"
              >
                Tirar foto
              </button>
            )}
          </div>
          <span id="fld-products-photo-hint" className="text-xs text-adm-muted">
            {draft.file
              ? `${draft.file.name}: entra no card quando você salvar.`
              : draft.remove
                ? "A foto sai quando você salvar."
                : isSample
                  ? "Foto de exemplo. Envie a foto real do produto (JPG, PNG ou WebP, até 5 MB)."
                  : "JPG, PNG ou WebP, até 5 MB."}
          </span>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-labelledby="fld-products-photo"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {error && <AdminNotice tone="error">{error}</AdminNotice>}
    </div>
  );
}
