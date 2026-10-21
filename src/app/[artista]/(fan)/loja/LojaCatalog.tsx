"use client";

import { useState } from "react";
import { Rings } from "@/components/fan/decor";
import { EmptyState } from "@/components/fan/states";
import { Icon } from "@/components/icons";
import type { Product, ProductCategory } from "@/lib/types";

type CategoryFilter = "todos" | ProductCategory;

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "roupas", label: "Roupas" },
  { id: "acessorios", label: "Acessórios" },
  { id: "musica", label: "Música" },
];

export function LojaCatalog({ artistName, products }: { artistName: string; products: Product[] }) {
  const [cat, setCat] = useState<CategoryFilter>("todos");
  const [cart, setCart] = useState<Record<string, boolean>>({});

  const visible = products.filter((p) => cat === "todos" || p.category === cat);
  const count = Object.values(cart).filter(Boolean).length;

  const toggle = (id: string) => setCart((cur) => ({ ...cur, [id]: !cur[id] }));

  return (
    <>
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex w-full max-w-[1000px] items-center justify-between gap-3 px-4 pb-3 pt-3.5 lg:px-8 lg:pt-8">
          <div className="flex flex-col gap-0.5">
            <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">Loja {artistName}</span>
            <h1 className="m-0 font-display text-[32px] font-normal leading-none text-accent lg:text-5xl">Loja</h1>
          </div>
          {/* TODO: abrir a sacola / checkout quando existir */}
          <button
            type="button"
            aria-label={`Sacola com ${count} ${count === 1 ? "item" : "itens"}`}
            className="relative flex min-h-12 flex-none cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-ink px-3.5 font-label text-[13px] font-bold text-paper"
          >
            <Icon name="bag" size={20} />
            <span>Sacola · {count}</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-4 px-4 pb-6 pt-4 lg:px-8 lg:pt-6">
        <section
          aria-labelledby="loja-drop"
          className="relative overflow-hidden rounded-2xl border-2 border-ink bg-ink p-[18px] text-paper shadow-[4px_4px_0_var(--fc-accent)] lg:p-7"
        >
          <Rings className="-bottom-[70px] -right-[30px] size-[170px] lg:size-[240px]" start={26} step={16} />
          <span className="relative font-label text-[11px] font-bold uppercase tracking-[0.1em] text-accent-2">
            Drop da loja · só membros
          </span>
          <h2
            id="loja-drop"
            className="relative m-0 mt-1.5 max-w-[220px] font-display text-[26px] font-normal leading-[1.05] text-cream lg:max-w-[420px] lg:text-4xl"
          >
            Coleção [nome do drop]
          </h2>
          <p className="relative m-0 mt-2 max-w-[200px] text-sm text-paper-2 lg:max-w-[360px]">
            Peças em edição limitada para o fã clube {artistName}.
          </p>
        </section>

        <div role="group" aria-label="Categorias" className="flex gap-2 overflow-x-auto pb-0.5">
          {CATEGORIES.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCat(c.id)}
                className={`min-h-11 flex-none cursor-pointer rounded-full border-2 border-ink px-4 font-label text-xs font-bold ${
                  active ? "bg-ink text-paper" : "bg-cream text-ink"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="A loja ainda está vazia"
            text={`Quando ${artistName} colocar produtos à venda, eles aparecem aqui.`}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nenhum produto nesta categoria"
            text="Veja as outras categorias ou volte para todos os produtos."
            action={
              <button
                type="button"
                onClick={() => setCat("todos")}
                className="min-h-11 cursor-pointer rounded-full border-2 border-ink bg-accent-2 px-4 font-label text-xs font-bold text-ink"
              >
                Ver todos os produtos
              </button>
            }
          />
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:gap-4">
            {visible.map((p) => {
              const inCart = !!cart[p.id];
              return (
                <li key={p.id} className="flex flex-col overflow-hidden rounded-[14px] border-2 border-ink bg-cream">
                  <div
                    role="img"
                    aria-label={`[Foto] ${p.name}`}
                    className="halftone-dark flex h-[150px] items-end border-b-2 border-ink p-2 lg:h-[190px]"
                    style={{ backgroundColor: p.color }}
                  >
                    <span className="rounded-md bg-ink px-[7px] py-[3px] font-label text-[11px] font-bold text-cream">[Foto]</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-2.5">
                    <strong id={`loja-${p.id}`} className="font-body text-[15px] font-extrabold leading-[1.2]">
                      {p.name}
                    </strong>
                    <span className="font-label text-xs font-bold text-ink-soft">{p.priceLabel}</span>
                    <button
                      type="button"
                      aria-pressed={inCart}
                      aria-describedby={`loja-${p.id}`}
                      onClick={() => toggle(p.id)}
                      className={`mt-auto min-h-11 cursor-pointer rounded-[10px] border-2 border-ink font-label text-xs font-bold ${
                        inCart ? "bg-ink text-paper" : "bg-accent-2 text-ink"
                      }`}
                    >
                      {inCart ? "Na sacola ✓" : "Adicionar"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
