"use client";

import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { ShowStub } from "@/components/fan/ShowStub";
import { TicketStub } from "@/components/fan/TicketStub";
import { EmptyState } from "@/components/fan/states";
import { Tabs } from "@/components/fan/Tabs";
import { isPastEvent } from "@/lib/events";
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

export function AgendaView({ events, tickets = [], demo }: { events: ShowEvent[]; tickets?: MyTicket[]; demo: boolean }) {
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
        ) : tickets.length === 0 ? (
          <EmptyState className="px-4" title={empty.tickets.title} text={empty.tickets.text} />
        ) : (
          tickets.map((t) => <TicketStub key={t.id} ticket={t} />)
        )}
      </div>
    </>
  );
}
