"use client";

import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { ShowStub } from "@/components/fan/ShowStub";
import Link from "next/link";
import { ResaleTicketStub, TicketStub } from "@/components/fan/TicketStub";
import { Icon } from "@/components/icons";
import { EmptyState } from "@/components/fan/states";
import { Tabs } from "@/components/fan/Tabs";
import { isPastEvent } from "@/lib/events";
import type { Order } from "@/lib/resale";
import type { MyTicket, ShowEvent } from "@/lib/types";

type Tab = "next" | "tickets";

const tabs: { id: Tab; label: string }[] = [
  { id: "next", label: "Próximos" },
  { id: "tickets", label: "Meus ingressos" },
];

const empty: Record<Tab, { title: string; text: string }> = {
  next: { title: "Nenhuma data marcada.", text: "Quando sair um show, ele aparece aqui com ingressos e brindes." },
  tickets: { title: "Você ainda não comprou ingressos.", text: "Escolha um show em Próximos. O ingresso que você comprar fica aqui, com o Photo Finder para achar suas fotos depois do show." },
};

export function AgendaView({
  events,
  tickets = [],
  resaleTickets = [],
  demo,
}: {
  events: ShowEvent[];
  tickets?: MyTicket[];
  /** Compras da revenda já transferidas ou confirmadas: também são ingressos do fã. */
  resaleTickets?: Order[];
  demo: boolean;
}) {
  const { base } = useArtist();
  const [tab, setTab] = useState<Tab>("next");
  const index = tabs.findIndex((t) => t.id === tab);

  const upcoming = events.filter((e) => !isPastEvent(e));

  return (
    <>
      <Masthead word="Agenda" tone="amber" steps={2} index={index} />
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Agenda" />
      <div role="tabpanel" aria-label={tabs[index].label}>
        {tab === "next" ? (
          upcoming.length === 0 ? (
            <EmptyState className="px-4" title={empty.next.title} text={empty.next.text} />
          ) : (
            upcoming.map((e) => <ShowStub key={e.id} event={e} demo={demo} href={`${base}/eventos/${e.id}`} />)
          )
        ) : tickets.length + resaleTickets.length === 0 ? (
          <EmptyState className="px-4" title={empty.tickets.title} text={empty.tickets.text} />
        ) : (
          <div className="flex flex-col gap-8 px-4 pb-8 pt-5">
            {tickets.map((t) => (
              <TicketStub key={t.id} ticket={t} />
            ))}
            {resaleTickets.map((o) => (
              <ResaleTicketStub key={o.id} order={o} />
            ))}
            <Link href={`${base}/revenda`} className="go self-start">
              Comprar ou vender na revenda entre fãs <Icon name="arrow" size={16} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
