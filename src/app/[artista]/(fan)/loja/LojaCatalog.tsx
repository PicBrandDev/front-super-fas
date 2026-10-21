"use client";

import { useState } from "react";
import { Masthead } from "@/components/fan/Masthead";
import { Sheet } from "@/components/fan/Sheet";
import { Tabs, type TabItem } from "@/components/fan/Tabs";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import type { MediaImage, Product } from "@/lib/types";
import s from "./Loja.module.css";

type Tab = "all" | "wear" | "acc";

const TABS: TabItem<Tab>[] = [
  { id: "all", label: "Tudo" },
  { id: "wear", label: "Camisetas" },
  { id: "acc", label: "Acessórios" },
];

/** Categorias da API nas abas do protótipo: roupas → Camisetas; acessórios e música → Acessórios. */
const tabOf = (p: Product): Tab => (p.category === "roupas" ? "wear" : "acc");

export type StoreItem = Product & { photo: MediaImage | null };

export function LojaCatalog({ products, demo }: { products: StoreItem[]; demo: boolean }) {
  const [tab, setTab] = useState<Tab>("all");
  const [bag, setBag] = useState<Set<string>>(() => new Set());
  const [open, setOpen] = useState(false);
  const { show: toast } = useToast();

  const list = products.filter((p) => tab === "all" || tabOf(p) === tab);
  const count = bag.size;

  const toggle = (id: string) =>
    setBag((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <Masthead word="Vintage" label="Loja Vintage" tone="lagoon-deep" steps={3} index={TABS.findIndex((t) => t.id === tab)} />
      <Tabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        label="Loja"
        slot={
          <button type="button" className={s.bag} onClick={() => setOpen(true)} aria-label={`Sacola, ${count} ${count === 1 ? "item" : "itens"}`}>
            Sacola <b className="num">{count}</b>
          </button>
        }
      />

      <div className={s.prods}>
        {list.length === 0 ? (
          <p className={s.empty}>Nenhum acessório na loja agora. As camisetas estão em Tudo.</p>
        ) : (
          list.map((p) => {
            const inBag = bag.has(p.id);
            return (
              <article key={p.id} className={s.prod}>
                <div className={`${s.img} ${p.photo?.cover ? s.cover : ""}`} style={p.photo ? undefined : { background: p.color }}>
                  {/* Foto real do produto (ver lib/media.ts); <img> comum para o blend sobre mist. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.photo && <img src={p.photo.src} alt={p.photo.alt} loading="lazy" />}
                </div>
                <h3>{p.name}</h3>
                <div className={s.price}>{p.priceLabel}</div>
                {demo && (
                  <span className="tag tag-demo" style={{ justifySelf: "start" }}>
                    Exemplo
                  </span>
                )}
                <button type="button" className="btn btn-outline btn-sm" aria-pressed={inBag} onClick={() => toggle(p.id)}>
                  {inBag ? (
                    <>
                      <Icon name="check" size={14} />
                      Na sacola
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </button>
              </article>
            );
          })
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={count ? `Sacola · ${count} ${count > 1 ? "itens" : "item"}` : "Sacola · Vazia"}>
        <p>
          {count
            ? "O pagamento acontece na loja oficial VINTAGE. A fanzone só monta a sua sacola."
            : "Adicione peças da loja e elas aparecem aqui."}
        </p>
        {count > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            data-close
            data-autofocus
            onClick={() => toast("A loja oficial abre em breve")}
          >
            Ir para a loja oficial
            <Icon name="external" size={16} />
          </button>
        )}
        <button type="button" className="btn btn-outline" data-close>
          Fechar
        </button>
      </Sheet>
    </>
  );
}
