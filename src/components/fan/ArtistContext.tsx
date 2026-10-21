"use client";

import { createContext, useContext } from "react";
import type { Viewer } from "@/lib/types";

export type ArtistCtx = {
  slug: string;
  name: string;
  initial: string;
  fanClubName: string;
  base: string; // ex.: "/vintage-culture"
  priceLabel: string; // ex.: "R$ 16,90"
  viewer: Viewer;
  otherFandoms: string[];
  loggedIn: boolean; // login ligado (API) — mostra "Minha conta" e "Sair"
};

const Ctx = createContext<ArtistCtx | null>(null);

export function ArtistProvider({ value, children }: { value: ArtistCtx; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useArtist(): ArtistCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useArtist precisa estar dentro de <ArtistProvider>");
  return v;
}
