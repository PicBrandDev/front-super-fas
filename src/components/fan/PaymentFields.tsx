"use client";

import { formatBRL } from "@/lib/format";

/**
 * Forma de pagamento do carrinho (ingresso e loja): Pix ou cartão de crédito. Com cartão, abre número, nome,
 * validade, CVV e parcelas. O pagamento é simulado: os dados do cartão ficam só na tela do fã.
 */
export type Method = "pix" | "card";
export type Card = { number: string; name: string; exp: string; cvv: string };
export const NO_CARD: Card = { number: "", name: "", exp: "", cvv: "" };
export const MAX_INSTALLMENTS = 6;

const METHODS: { key: Method; label: string }[] = [
  { key: "pix", label: "Pix" },
  { key: "card", label: "Cartão de crédito" },
];

const input = "min-h-12 w-full min-w-0 border border-line bg-night px-3 font-mono text-[15px] text-fg";

/** Número do cartão em grupos de 4 (até 19 dígitos). */
const maskNumber = (v: string) => v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
/** Validade em MM/AA. */
const maskExp = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/** Confere o dígito verificador do número do cartão (algoritmo de Luhn). */
function luhn(num: string) {
  let sum = 0;
  [...num].reverse().forEach((ch, i) => {
    let n = Number(ch);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  });
  return sum % 10 === 0;
}

/** Primeiro erro dos dados do cartão, ou "" se estão certos. */
export function cardError(c: Card): string {
  const num = c.number.replace(/\D/g, "");
  if (num.length < 13 || !luhn(num)) return "Confira o número do cartão.";
  if (c.name.trim().split(/\s+/).length < 2) return "Digite o nome como está no cartão.";
  const [mm, yy] = c.exp.split("/").map(Number);
  const now = new Date();
  if (!mm || mm < 1 || mm > 12 || !yy || c.exp.length < 5) return "Confira a validade do cartão (MM/AA).";
  if (2000 + yy < now.getFullYear() || (2000 + yy === now.getFullYear() && mm < now.getMonth() + 1)) return "Cartão vencido.";
  if (c.cvv.length < 3) return "Digite o código de segurança (CVV).";
  return "";
}

export function PaymentFields({
  method,
  onMethod,
  card,
  onCard,
  installments,
  onInstallments,
  total,
  name = "pagamento",
}: {
  method: Method;
  onMethod: (m: Method) => void;
  card: Card;
  onCard: (c: Card) => void;
  installments: number;
  onInstallments: (n: number) => void;
  total: number;
  name?: string;
}) {
  return (
    <>
      <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
        <legend className="mono mb-1 p-0">Forma de pagamento</legend>
        {METHODS.map((mt) => (
          <label
            key={mt.key}
            className={`flex min-h-12 cursor-pointer items-center gap-3 border p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber ${
              method === mt.key ? "border-amber bg-raised" : "border-line bg-night"
            }`}
          >
            <input type="radio" name={name} className="size-5 accent-amber" checked={method === mt.key} onChange={() => onMethod(mt.key)} />
            <span className="flex flex-1 flex-col">
              <strong className="text-[15px] leading-5 text-fg">{mt.label}</strong>
              <span className="mono">{mt.key === "pix" ? "Aprovação na hora" : `Em até ${MAX_INSTALLMENTS}x de ${formatBRL(Math.ceil(total / MAX_INSTALLMENTS))} sem juros`}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {method === "card" && (
        <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0" aria-label="Dados do cartão de crédito">
          <legend className="mono mb-1 p-0">Dados do cartão</legend>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cc-number" className="mono">
              Número do cartão
            </label>
            <input
              id="cc-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={card.number}
              onChange={(e) => onCard({ ...card, number: maskNumber(e.target.value) })}
              className={input}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cc-name" className="mono">
              Nome impresso no cartão
            </label>
            <input
              id="cc-name"
              autoComplete="cc-name"
              autoCapitalize="characters"
              placeholder="NOME COMO NO CARTÃO"
              value={card.name}
              onChange={(e) => onCard({ ...card, name: e.target.value.toUpperCase().slice(0, 40) })}
              className={input}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cc-exp" className="mono">
                Validade
              </label>
              <input
                id="cc-exp"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                value={card.exp}
                onChange={(e) => onCard({ ...card, exp: maskExp(e.target.value) })}
                className={input}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cc-csc" className="mono">
                CVV
              </label>
              <input
                id="cc-csc"
                inputMode="numeric"
                type="password"
                autoComplete="cc-csc"
                placeholder="123"
                value={card.cvv}
                onChange={(e) => onCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                className={input}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cc-parcelas" className="mono">
              Parcelas
            </label>
            <select id="cc-parcelas" value={installments} onChange={(e) => onInstallments(Number(e.target.value))} className={input}>
              {Array.from({ length: MAX_INSTALLMENTS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x de {formatBRL(Math.ceil(total / n))} sem juros
                </option>
              ))}
            </select>
          </div>
          <p>Pagamento simulado: os dados do cartão ficam só nesta tela e não são enviados nem guardados.</p>
        </fieldset>
      )}
    </>
  );
}

/** Texto do botão de pagar: "Pagar R$ …" ou, no cartão parcelado, "Pagar 3x de R$ …". */
export const payLabel = (method: Method, installments: number, total: number) =>
  method === "card" && installments > 1 ? `Pagar ${installments}x de ${formatBRL(Math.ceil(total / installments))}` : `Pagar ${formatBRL(total)}`;
