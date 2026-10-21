"use client";

import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { ShowStub } from "@/components/fan/ShowStub";
import { EmptyState } from "@/components/fan/states";
import { Tabs } from "@/components/fan/Tabs";
import { isPastEvent } from "@/lib/events";
import type { ShowEvent } from "@/lib/types";

type Tab = "next" | "gift" | "past";

const tabs: { id: Tab; label: string }[] = [
  { id: "next", label: "Próximos" },
  { id: "gift", label: "Com brinde" },
  { id: "past", label: "Passados" },
];

const empty: Record<Tab, { title: string; text: string }> = {
  next: { title: "Nenhuma data marcada.", text: "Quando sair um show, ele aparece aqui com ingressos e brindes." },
  gift: { title: "Nenhum show com brinde por enquanto.", text: "Os brindes de cada evento aparecem aqui quando a sorte abrir." },
  past: { title: "Nenhum show passado.", text: "Depois do primeiro show, as fotos oficiais ficam aqui." },
};

export function AgendaView({ events, demo }: { events: ShowEvent[]; demo: boolean }) {
  const { base } = useArtist();
  const [tab, setTab] = useState<Tab>("next");
  const index = tabs.findIndex((t) => t.id === tab);

  const list = events.filter((e) => {
    const past = isPastEvent(e);
    if (tab === "past") return past;
    if (tab === "gift") return !past && e.giftsCount > 0;
    return !past;
  });

  return (
    <>
      <Masthead word="Agenda" tone="amber" steps={3} index={index} />
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Agenda" />
      <div role="tabpanel" aria-label={tabs[index].label}>
        {list.length === 0 ? (
          <EmptyState className="px-4" title={empty[tab].title} text={empty[tab].text} />
        ) : (
          list.map((e) => (
            <ShowStub
              key={e.id}
              event={e}
              demo={demo}
              href={isPastEvent(e) ? `${base}/photo-finder?evento=${e.id}` : `${base}/eventos/${e.id}`}
            />
          ))
        )}
      </div>
    </>
  );
}
