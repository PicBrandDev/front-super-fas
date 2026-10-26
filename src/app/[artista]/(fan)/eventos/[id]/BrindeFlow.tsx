"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buyTicket } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet } from "@/components/fan/Sheet";

type Step = "intro" | "pay" | "done";

/**
 * Fluxo de compra com brinde: avisa que comprar o ingresso dá um prêmio, simula o pagamento e,
 * depois de pagar, o fã ganha 1 tentativa na roleta (com o motivo registrado). O botão "Tentar"
 * abre o PicKap, onde ele gira. O pagamento é uma simulação: acontece fora do app.
 */
export function BrindeFlow({
  open,
  onClose,
  label,
  eventId,
  packageId,
  item,
  addons = [],
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  eventId: string;
  packageId: string;
  item: number;
  addons?: string[];
}) {
  const { base, slug } = useArtist();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setStep("intro");
    setError("");
    onClose();
  };

  async function paid() {
    if (paying) return;
    setPaying(true);
    setError("");
    const res = await buyTicket(slug, eventId, packageId, item, addons);
    setPaying(false);
    // Sem API (modo exemplo, status 0) só avança na tela.
    if (!res.ok && res.status !== 0) return setError(res.error);
    setStep("done");
  }

  const titles: Record<Step, string> = { intro: "Concorra a um brinde", pay: "Finalize o pagamento", done: "Você ganhou 1 tentativa!" };

  return (
    <Sheet open={open} onClose={close} title={titles[step]}>
      {step === "intro" && (
        <>
          <p>
            Comprando este ingresso você ganha um prêmio: <strong>depois do pagamento, o seu brinde é liberado aqui</strong>.
          </p>
          <p className="mono">{label}</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setStep("pay")}>
            Ir para o pagamento
          </button>
          <button type="button" className="btn btn-outline" data-close>
            Voltar
          </button>
        </>
      )}

      {step === "pay" && (
        <>
          <p>Confirme o pagamento do ingresso para liberar o seu brinde.</p>
          <p className="mono">{label}</p>
          <span className="tag tag-demo self-start">Simulação</span>
          {error && (
            <p className="err" role="alert">
              {error}
            </p>
          )}
          <button type="button" className="btn btn-primary btn-block" onClick={paid} disabled={paying} aria-busy={paying}>
            {paying ? "Confirmando…" : "Já paguei"}
          </button>
          <button type="button" className="btn btn-ghost" data-close>
            Cancelar
          </button>
        </>
      )}

      {step === "done" && (
        <>
          <p>
            Pagamento confirmado. O ingresso já está em <strong>Meus ingressos</strong> e você ganhou <strong>1 tentativa na roleta</strong>, que já está na sua lista de giros.
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
