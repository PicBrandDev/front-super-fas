"use client";

import { formatBRL } from "@/lib/format";
import { nextStep, stampLabel, stampTone, type Order } from "@/lib/resale";
import { useArtist } from "../ArtistContext";
import { Wallet, WalletTicket } from "./Ticket";

/** Pedidos da revenda como ingressos empilhados: o carimbo da etapa e o valor que cabe a quem vê. */
export function OrderWallet({ label, orders }: { label: string; orders: Order[] }) {
  const { base } = useArtist();
  const id = `wallet-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="grid gap-3">
      <h2 id={id} className="mono m-0">
        {label} ({orders.length})
      </h2>
      <Wallet label={label}>
        {orders.map((o) => {
          const buyer = o.role === "buyer";
          const value = buyer ? formatBRL(o.grossCents) : formatBRL(o.sellerNetCents);
          const money = buyer ? `Você ${o.paidAt ? "pagou" : "paga"} ${value}` : `Você ${o.status === "completed" ? "recebeu" : "recebe"} ${value}`;
          const next = nextStep(o);
          return (
            <li key={o.id}>
              <WalletTicket
                href={`${base}/revenda/pedidos/${o.id}`}
                title={`${o.ticketLabel} · ${o.eventCity}: ${stampLabel[o.status]}, ${value}`}
                show={{ id: o.eventId, city: o.eventCity, venue: o.eventVenue, date: o.eventDate }}
                line={`${o.eventCity} · ${o.ticketLabel}${o.qty > 1 ? ` × ${o.qty}` : ""}`}
                sub={next ? `${money} · ${next}` : money}
                stamp={{ label: stampLabel[o.status], tone: stampTone[o.status] }}
              />
            </li>
          );
        })}
      </Wallet>
    </section>
  );
}
