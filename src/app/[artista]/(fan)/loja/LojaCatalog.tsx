"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  checkoutStore,
  myOrders,
  quoteStore,
  type CheckoutResult,
  type StoreCartItem,
  type StoreDelivery,
  type StoreOrder,
  type StoreQuote,
} from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { NO_CARD, PaymentFields, cardError, payLabel, type Card, type Method } from "@/components/fan/PaymentFields";
import { Sheet } from "@/components/fan/Sheet";
import { Tabs, type TabItem } from "@/components/fan/Tabs";
import { Icon } from "@/components/icons";
import { formatBRL } from "@/lib/format";
import type { MediaImage, Product } from "@/lib/types";
import s from "./Loja.module.css";

type Tab = "all" | "wear" | "acc";

const TABS: TabItem<Tab>[] = [
  { id: "all", label: "Tudo" },
  { id: "wear", label: "Camisetas" },
  { id: "acc", label: "Acessórios" },
];

const SIZES = ["P", "M", "G", "GG"];
const MAX_QTY = 10;
// Mesmas regras da API (ela confere o valor final): frete fixo na entrega, grátis acima de R$ 300.
const SHIPPING_CENTS = 1990;
const FREE_SHIPPING_FROM_CENTS = 30000;

/** Categorias da API nas abas do protótipo: roupas → Camisetas; acessórios e música → Acessórios. */
const tabOf = (p: Product): Tab => (p.category === "roupas" ? "wear" : "acc");

export type StoreItem = Product & { photo: MediaImage | null };
type Bag = Record<string, { qty: number; size: string }>;

const inputCls = "min-h-12 w-full min-w-0 border border-line bg-night px-3 font-mono text-[15px] text-fg";

export function LojaCatalog({ products, demo }: { products: StoreItem[]; demo: boolean }) {
  const [tab, setTab] = useState<Tab>("all");
  const [bag, setBag] = useState<Bag>({});
  const [open, setOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [orders, setOrders] = useState<StoreOrder[] | null>(null);
  const [step, setStep] = useState<"bag" | "done">("bag");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<CheckoutResult | null>(null);
  const [delivery, setDelivery] = useState<StoreDelivery>("pickup");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<Method>("pix");
  const [card, setCard] = useState<Card>(NO_CARD);
  const [installments, setInstallments] = useState(1);
  const [quote, setQuote] = useState<StoreQuote | null>(null);
  const { base, slug } = useArtist();
  const router = useRouter();

  const byId = new Map(products.map((p) => [p.id, p]));
  const list = products.filter((p) => tab === "all" || tabOf(p) === tab);
  const lines = Object.entries(bag)
    .map(([id, v]) => ({ id, ...v, product: byId.get(id) }))
    .filter((l): l is typeof l & { product: StoreItem } => !!l.product);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const shirts = lines.filter((l) => l.product.category === "roupas").reduce((n, l) => n + l.qty, 0);
  const items: StoreCartItem[] = lines.map((l) => ({ productId: l.id, qty: l.qty, size: l.product.category === "roupas" ? l.size : "" }));

  // Valores locais (aparecem na hora); a API confirma e o valor dela, quando chega, é o que vale.
  const localSubtotal = lines.reduce((sum, l) => sum + (l.product.priceCents ?? 0) * l.qty, 0);
  const localShipping = delivery === "ship" && localSubtotal < FREE_SHIPPING_FROM_CENTS ? SHIPPING_CENTS : 0;
  const subtotal = quote?.subtotalCents ?? localSubtotal;
  const shipping = quote?.shippingCents ?? localShipping;
  const total = quote?.totalCents ?? localSubtotal + localShipping;

  const cartKey = JSON.stringify(items) + delivery + (delivery === "ship" && address.trim().length >= 8 ? "1" : "0");
  useEffect(() => {
    if (!open || step !== "bag" || items.length === 0) return;
    let alive = true;
    const t = setTimeout(() => {
      void quoteStore(slug, items, delivery, delivery === "ship" ? address : "").then((res) => {
        if (alive) setQuote(res.ok ? res.data : null);
      });
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, cartKey]);

  const closeBag = () => {
    setOpen(false);
    setStep("bag");
    setError("");
    setCard(NO_CARD); // os dados do cartão não ficam guardados
    setInstallments(1);
    setQuote(null);
  };

  const add = (id: string) => setBag((cur) => (cur[id] ? cur : { ...cur, [id]: { qty: 1, size: "M" } }));
  const patch = (id: string, v: Partial<Bag[string]>) => setBag((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], ...v } } : cur));
  const remove = (id: string) =>
    setBag((cur) => {
      const next = { ...cur };
      delete next[id];
      return next;
    });
  const toggle = (id: string) => (bag[id] ? remove(id) : add(id));

  async function checkout() {
    if (paying || items.length === 0) return;
    if (delivery === "ship" && address.trim().length < 8) return setError("Informe o endereço de entrega (rua, número e cidade).");
    if (method === "card") {
      const bad = cardError(card);
      if (bad) return setError(bad);
    }
    setPaying(true);
    setError("");
    const res = await checkoutStore(slug, items, delivery, delivery === "ship" ? address : "");
    setPaying(false);
    // Sem API (modo exemplo, status 0) só avança na tela.
    if (!res.ok && res.status !== 0) return setError(res.error);
    setDone(res.ok ? res.data : { items: count, spinsGranted: shirts, orderCode: "", totalCents: total, delivery });
    setBag({});
    setCard(NO_CARD);
    setStep("done");
  }

  async function showOrders() {
    setOrdersOpen(true);
    setOrders(null);
    setOrders(await myOrders(slug));
  }

  const title = step === "done" ? "Compra confirmada" : count ? `Seu carrinho · ${count} ${count > 1 ? "itens" : "item"}` : "Seu carrinho · Vazio";

  return (
    <>
      <Masthead word="Vintage" label="Loja Vintage" tone="lagoon-deep" steps={3} index={TABS.findIndex((t) => t.id === tab)} />
      <Tabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        label="Loja"
        slot={
          <button type="button" className={s.bag} onClick={() => setOpen(true)} aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}>
            Carrinho <b className="num">{count}</b>
          </button>
        }
      />
      <div className="flex justify-end px-4 pt-3">
        <button type="button" className="btn btn-ghost btn-sm" onClick={showOrders}>
          Meus pedidos
        </button>
      </div>

      <div className={s.prods}>
        {list.length === 0 ? (
          <p className={s.empty}>Nenhum acessório na loja agora. As camisetas estão em Tudo.</p>
        ) : (
          list.map((p) => {
            const inBag = !!bag[p.id];
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
                      No carrinho
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

      <Sheet open={open} onClose={closeBag} title={title}>
        {step === "done" && done ? (
          <>
            <p>
              Pagamento de <strong>{formatBRL(done.totalCents)}</strong> confirmado.
              {done.spinsGranted > 0 && (
                <>
                  {" "}
                  Você ganhou <strong>{done.spinsGranted === 1 ? "1 giro" : `${done.spinsGranted} giros`} na roleta</strong> pelas camisetas.
                </>
              )}
            </p>
            {done.orderCode && (
              <div className="flex flex-col gap-1 border border-dashed border-line-strong p-3">
                <span className="mono">Pedido</span>
                <strong className="num text-[26px] tracking-[0.2em]">{done.orderCode}</strong>
              </div>
            )}
            <p>
              {done.delivery === "pickup"
                ? "Retire na lojinha do Vintage, no show, mostrando o código do pedido e um documento com foto."
                : "Seu pedido será enviado para o endereço informado. Você acompanha o código do pedido em Pedidos."}
            </p>
            <span className="tag tag-demo self-start">Simulação</span>
            {done.spinsGranted > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  closeBag();
                  router.push(`${base}/pickup`);
                }}
                data-autofocus
              >
                Tentar
              </button>
            )}
            <button type="button" className="btn btn-outline" data-close>
              Fechar
            </button>
          </>
        ) : count === 0 ? (
          <>
            <p>Adicione peças da loja e elas aparecem aqui.</p>
            <button type="button" className="btn btn-outline" data-close>
              Fechar
            </button>
          </>
        ) : (
          <>
            <ul className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0" aria-label="Itens do carrinho">
              {lines.map((l) => {
                const p = l.product;
                const unit = p.priceCents ?? 0;
                return (
                  <li key={l.id} className="flex flex-col gap-2 py-3">
                    <div className="flex items-start gap-3">
                      <span className="size-14 flex-none overflow-hidden bg-mist" style={p.photo ? undefined : { background: p.color }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.photo && <img src={p.photo.src} alt="" className="size-full object-contain mix-blend-multiply" />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <strong className="text-[15px] leading-5 text-fg">{p.name}</strong>
                        <span className="mono">{unit ? `${formatBRL(unit)} cada` : p.priceLabel}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(l.id)}
                        aria-label={`Remover ${p.name} do carrinho`}
                        className="flex size-11 flex-none cursor-pointer items-center justify-center border border-line bg-transparent text-fg-muted"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {p.category === "roupas" ? (
                        <label className="flex items-center gap-2">
                          <span className="mono">Tamanho</span>
                          <select value={l.size} onChange={(e) => patch(l.id, { size: e.target.value })} className="min-h-11 border border-line bg-night px-2 font-mono text-[15px] text-fg" aria-label={`Tamanho de ${p.name}`}>
                            {SIZES.map((z) => (
                              <option key={z} value={z}>
                                {z}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <span />
                      )}
                      <span className="flex items-center gap-1" role="group" aria-label={`Quantidade de ${p.name}`}>
                        <button
                          type="button"
                          onClick={() => (l.qty > 1 ? patch(l.id, { qty: l.qty - 1 }) : remove(l.id))}
                          aria-label="Diminuir quantidade"
                          className="flex size-11 cursor-pointer items-center justify-center border border-line bg-transparent text-[20px] text-fg"
                        >
                          −
                        </button>
                        <span className="num w-8 text-center text-[16px] text-fg" aria-live="polite">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => patch(l.id, { qty: Math.min(MAX_QTY, l.qty + 1) })}
                          disabled={l.qty >= MAX_QTY}
                          aria-label="Aumentar quantidade"
                          className="flex size-11 cursor-pointer items-center justify-center border border-line bg-transparent text-[20px] text-fg disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </span>
                      <strong className="num text-[16px] text-fg">{formatBRL(unit * l.qty)}</strong>
                    </div>
                  </li>
                );
              })}
            </ul>

            <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className="mono mb-1 p-0">Como receber</legend>
              {(
                [
                  ["pickup", "Retirar na lojinha do Vintage", "Grátis · no show, com o código do pedido"],
                  ["ship", "Receber em casa", `${formatBRL(SHIPPING_CENTS)} · grátis acima de ${formatBRL(FREE_SHIPPING_FROM_CENTS)}`],
                ] as const
              ).map(([key, label, sub]) => (
                <label
                  key={key}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 border p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber ${
                    delivery === key ? "border-amber bg-raised" : "border-line bg-night"
                  }`}
                >
                  <input type="radio" name="entrega" className="size-5 accent-amber" checked={delivery === key} onChange={() => setDelivery(key)} />
                  <span className="flex flex-1 flex-col">
                    <strong className="text-[15px] leading-5 text-fg">{label}</strong>
                    <span className="mono">{sub}</span>
                  </span>
                </label>
              ))}
              {delivery === "ship" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="loja-endereco" className="mono">
                    Endereço de entrega
                  </label>
                  <input
                    id="loja-endereco"
                    autoComplete="street-address"
                    placeholder="Rua, número, bairro, cidade"
                    value={address}
                    maxLength={200}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )}
            </fieldset>

            <p>
              {shirts > 0
                ? `Cada camiseta rende 1 giro na roleta depois do pagamento (${shirts} ${shirts === 1 ? "giro" : "giros"}).`
                : "Camisetas rendem 1 giro na roleta depois do pagamento."}
            </p>

            <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-[15px] leading-5">
              <dt className="text-fg-muted">Subtotal</dt>
              <dd className="num m-0 text-right text-fg">{formatBRL(subtotal)}</dd>
              <dt className="text-fg-muted">{delivery === "pickup" ? "Retirada na lojinha" : "Frete"}</dt>
              <dd className="num m-0 text-right text-fg">{shipping > 0 ? formatBRL(shipping) : "Grátis"}</dd>
              <dt className="border-t border-line pt-2 text-[17px] font-bold text-fg">Total</dt>
              <dd className="num m-0 border-t border-line pt-2 text-right text-[22px] font-black text-amber-text" aria-live="polite">
                {formatBRL(total)}
              </dd>
            </dl>

            <PaymentFields method={method} onMethod={setMethod} card={card} onCard={setCard} installments={installments} onInstallments={setInstallments} total={total} name="pagamento-loja" />

            <span className="tag tag-demo self-start">Simulação</span>
            {error && (
              <p className="err" role="alert">
                {error}
              </p>
            )}
            <button type="button" className="btn btn-primary btn-block" onClick={checkout} disabled={paying} aria-busy={paying || undefined}>
              {paying ? "Confirmando…" : payLabel(method, installments, total)}
            </button>
            <button type="button" className="btn btn-ghost" data-close>
              Continuar comprando
            </button>
          </>
        )}
      </Sheet>

      <Sheet open={ordersOpen} onClose={() => setOrdersOpen(false)} title="Meus pedidos">
        {orders === null ? (
          <p>Carregando…</p>
        ) : orders.length === 0 ? (
          <p>Você ainda não fez pedidos na loja.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-col gap-2 border border-line p-3">
                <div className="flex items-center justify-between gap-3">
                  <strong className="num text-[18px] tracking-[0.15em] text-fg">{o.code}</strong>
                  <span className="mono">{o.createdAt}</span>
                </div>
                <ul className="m-0 list-none p-0 text-[14px] leading-5 text-fg-muted">
                  {o.lines.map((l, i) => (
                    <li key={i}>
                      {l.qty}× {l.name}
                      {l.size ? ` (${l.size})` : ""}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-3">
                  <span className="mono">{o.delivery === "pickup" ? "Retirar na lojinha" : "Entrega em casa"}</span>
                  <strong className="num text-fg">{formatBRL(o.totalCents)}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn-outline" data-close>
          Fechar
        </button>
      </Sheet>
    </>
  );
}
