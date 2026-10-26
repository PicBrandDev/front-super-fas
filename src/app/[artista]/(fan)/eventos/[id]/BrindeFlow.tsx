"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buyTicket, myCoupons, quoteTicket } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet } from "@/components/fan/Sheet";
import { Icon } from "@/components/icons";
import { formatBRL } from "@/lib/format";
import type { PackageChoice, summarize } from "@/lib/package-choice";
import type { MyCoupon, Quote } from "@/lib/types";

type Step = "intro" | "pay" | "done";
type Method = "pix" | "card";
type Cart = NonNullable<ReturnType<typeof summarize>>;

const METHODS: { key: Method; label: string }[] = [
  { key: "pix", label: "Pix" },
  { key: "card", label: "Cartão de crédito" },
];

/**
 * Fluxo de compra com brinde: avisa que comprar o ingresso dá um prêmio, mostra o carrinho (ingresso, experiências,
 * Photo Finder incluso, cupom de desconto e total), simula o pagamento e, depois de pagar, o fã ganha 1 tentativa
 * na roleta (com o motivo registrado). O botão "Tentar" abre o PicKap, onde ele gira.
 * O pagamento é uma simulação: acontece fora do app. O valor com cupom vem da API (nunca só da tela).
 */
export function BrindeFlow({
  open,
  onClose,
  event,
  picked,
  choice,
  onRemoveAddon,
}: {
  open: boolean;
  onClose: () => void;
  event: { id: string; title: string; city: string; day: string; month: string };
  picked: Cart | null;
  choice: PackageChoice | null;
  onRemoveAddon: (key: string) => void;
}) {
  const { base, slug } = useArtist();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [method, setMethod] = useState<Method>("pix");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [applied, setApplied] = useState<Quote | null>(null);
  const [coupons, setCoupons] = useState<MyCoupon[]>([]);
  const [paidTotal, setPaidTotal] = useState(0);

  const cartKey = picked ? `${choice?.id}|${choice?.item}|${choice?.addons.join(",")}` : "";

  // Meus cupons (ex.: o de 10% ganho na roleta), carregados quando o carrinho abre.
  useEffect(() => {
    if (!open || step !== "pay") return;
    let alive = true;
    void myCoupons(slug).then((c) => alive && setCoupons(c));
    return () => {
      alive = false;
    };
  }, [open, step, slug]);

  // Mudou o carrinho (tirou uma experiência) com cupom aplicado: a API recalcula o desconto.
  const appliedCode = applied?.coupon;
  useEffect(() => {
    if (!appliedCode || !choice || !picked) return;
    let alive = true;
    void quoteTicket(slug, event.id, picked.pkg.id, choice.item, choice.addons, appliedCode).then((res) => {
      if (!alive) return;
      if (res.ok) setApplied(res.data);
      else {
        setApplied(null);
        setCouponError(res.error);
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  const close = () => {
    setStep("intro");
    setError("");
    setCode("");
    setCouponError("");
    setApplied(null);
    onClose();
  };

  async function applyCoupon(raw: string) {
    const value = raw.trim().toUpperCase();
    if (!value || !choice || !picked || applying) return;
    setApplying(true);
    setCouponError("");
    const res = await quoteTicket(slug, event.id, picked.pkg.id, choice.item, choice.addons, value);
    setApplying(false);
    if (res.ok) {
      setApplied(res.data);
      setCode("");
    } else if (res.status === 0 && value === "ROLETA10") {
      // Sem API (modo exemplo): aplica os 10% só na tela.
      const off = Math.floor(picked.priceCents / 10);
      setApplied({ subtotalCents: picked.priceCents, discountCents: off, totalCents: picked.priceCents - off, coupon: value, couponLabel: "10% de desconto" });
    } else setCouponError(res.status === 0 ? "Cupom inválido." : res.error);
  }

  const subtotal = picked?.priceCents ?? 0;
  const discount = applied?.discountCents ?? 0;
  const total = applied ? applied.totalCents : subtotal;

  async function paid() {
    if (paying || !picked || !choice) return;
    setPaying(true);
    setError("");
    const res = await buyTicket(slug, event.id, picked.pkg.id, choice.item, choice.addons, applied?.coupon ?? "");
    setPaying(false);
    // Sem API (modo exemplo, status 0) só avança na tela.
    if (!res.ok && res.status !== 0) return setError(res.error);
    setPaidTotal(total);
    setStep("done");
  }

  const titles: Record<Step, string> = { intro: "Concorra a um brinde", pay: "Seu carrinho", done: "Você ganhou 1 tentativa!" };
  const offered = coupons.filter((c) => c.code !== applied?.coupon);

  return (
    <Sheet open={open && !!picked} onClose={close} title={titles[step]}>
      {step === "intro" && picked && (
        <>
          <p>
            Comprando este ingresso você ganha um prêmio: <strong>depois do pagamento, o seu brinde é liberado aqui</strong>.
          </p>
          <p className="mono">{picked.label}</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setStep("pay")}>
            Ir para o carrinho
          </button>
          <button type="button" className="btn btn-outline" data-close>
            Voltar
          </button>
        </>
      )}

      {step === "pay" && picked && (
        <>
          <div className="flex flex-col gap-1 border-b border-line pb-3">
            <strong className="text-[16px] leading-5 text-fg">{event.title}</strong>
            <span className="mono">
              {event.city} · {event.day} {event.month} · {picked.pkg.agencyName}
            </span>
          </div>

          <ul className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0" aria-label="Itens do carrinho">
            {picked.lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3 py-3">
                <span className="flex min-w-0 flex-1 flex-col">
                  <strong className="text-[15px] leading-5 text-fg">{l.label}</strong>
                  <span className="mono">{l.key === "ticket" ? "Ingresso" : "Experiência"}</span>
                </span>
                <span className="num flex-none text-[15px] text-fg">{formatBRL(l.priceCents)}</span>
                {l.key !== "ticket" ? (
                  <button
                    type="button"
                    onClick={() => onRemoveAddon(l.key)}
                    aria-label={`Remover ${l.label} do carrinho`}
                    className="flex size-11 flex-none cursor-pointer items-center justify-center border border-line bg-transparent text-fg-muted"
                  >
                    <Icon name="close" size={14} />
                  </button>
                ) : (
                  <span className="size-11 flex-none" aria-hidden="true" />
                )}
              </li>
            ))}
            <li className="flex items-center gap-3 py-3">
              <span className="flex min-w-0 flex-1 flex-col">
                <strong className="flex items-center gap-1.5 text-[15px] leading-5 text-fg">
                  <Icon name="camera" size={14} />
                  Photo Finder
                </strong>
                <span className="mono">Suas fotos do show no app</span>
              </span>
              <span className="tag tag-key flex-none">Incluso</span>
              <span className="size-11 flex-none" aria-hidden="true" />
            </li>
          </ul>

          <div className="flex flex-col gap-2">
            <span className="mono">Cupom de desconto</span>
            {applied ? (
              <div className="flex items-center gap-3 border border-amber bg-raised p-3">
                <Icon name="check" size={16} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <strong className="text-[15px] leading-5 text-fg">{applied.coupon}</strong>
                  <span className="mono">{applied.couponLabel}</span>
                </span>
                <button type="button" className="btn btn-ghost" onClick={() => setApplied(null)}>
                  Remover
                </button>
              </div>
            ) : (
              <>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void applyCoupon(code);
                  }}
                >
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={30}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Digite o código"
                    aria-label="Código do cupom de desconto"
                    aria-invalid={!!couponError}
                    className="min-h-12 min-w-0 flex-1 border border-line bg-night px-3 font-mono text-[15px] uppercase text-fg"
                  />
                  <button type="submit" className="btn btn-outline" disabled={applying || !code.trim()} aria-busy={applying}>
                    {applying ? "Aplicando…" : "Aplicar"}
                  </button>
                </form>
                {couponError && (
                  <p className="err" role="alert">
                    {couponError}
                  </p>
                )}
              </>
            )}
            {offered.length > 0 && !applied && (
              <div className="flex flex-col gap-2">
                <span className="mono">Meus cupons</span>
                {offered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => void applyCoupon(c.code)}
                    disabled={applying}
                    className="flex min-h-14 cursor-pointer items-center gap-3 border border-dashed border-amber bg-transparent p-3 text-left text-fg"
                  >
                    <Icon name="gift" size={18} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <strong className="text-[15px] leading-5">
                        {c.code} · {c.label}
                      </strong>
                      <span className="mono">{c.source || "Cupom para você"}</span>
                    </span>
                    <span className="tag tag-key flex-none">Usar</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-[15px] leading-5">
            <dt className="text-fg-muted">Subtotal</dt>
            <dd className="num m-0 text-right text-fg">{formatBRL(subtotal)}</dd>
            {discount > 0 && (
              <>
                <dt className="text-fg-muted">Desconto ({applied?.coupon})</dt>
                <dd className="num m-0 text-right text-fg">− {formatBRL(discount)}</dd>
              </>
            )}
            <dt className="border-t border-line pt-2 text-[17px] font-bold text-fg">Total</dt>
            <dd className="num m-0 border-t border-line pt-2 text-right text-[22px] font-black text-amber-text" aria-live="polite">
              {formatBRL(total)}
            </dd>
          </dl>

          <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="mono mb-1 p-0">Forma de pagamento</legend>
            {METHODS.map((mt) => (
              <label
                key={mt.key}
                className={`flex min-h-12 cursor-pointer items-center gap-3 border p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber ${
                  method === mt.key ? "border-amber bg-raised" : "border-line bg-night"
                }`}
              >
                <input type="radio" name="pagamento" className="size-5 accent-amber" checked={method === mt.key} onChange={() => setMethod(mt.key)} />
                <span className="flex flex-1 flex-col">
                  <strong className="text-[15px] leading-5 text-fg">{mt.label}</strong>
                  <span className="mono">{mt.key === "pix" ? "Aprovação na hora" : `Em até 6x de ${formatBRL(Math.ceil(total / 6))} sem juros`}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <span className="tag tag-demo self-start">Simulação</span>
          {error && (
            <p className="err" role="alert">
              {error}
            </p>
          )}
          <button type="button" className="btn btn-primary btn-block" onClick={paid} disabled={paying} aria-busy={paying}>
            {paying ? "Confirmando…" : `Pagar ${formatBRL(total)}`}
          </button>
          <button type="button" className="btn btn-ghost" data-close>
            Cancelar
          </button>
        </>
      )}

      {step === "done" && (
        <>
          <p>
            Pagamento de <strong>{formatBRL(paidTotal)}</strong> confirmado. O ingresso já está em <strong>Meus ingressos</strong> e você ganhou{" "}
            <strong>1 tentativa na roleta</strong>, que já está na sua lista de giros.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              close();
              router.push(`${base}/pickap`);
            }}
            data-autofocus
          >
            Tentar
          </button>
          <button type="button" className="btn btn-outline" data-close>
            Agora não
          </button>
        </>
      )}
    </Sheet>
  );
}
