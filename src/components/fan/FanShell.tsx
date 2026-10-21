import { themeStyle } from "@/lib/themes";
import type { Artist, Viewer } from "@/lib/types";
import { formatBRL } from "@/lib/api";
import { authEnabled } from "@/lib/auth";
import { ArtistProvider } from "./ArtistContext";
import { FanFrame } from "./FanFrame";
import { FanSidebar } from "./FanSidebar";

/**
 * Casca da área do fã: aplica o tema do artista, menu lateral no desktop
 * e, no celular, a faixa de membro + menu de baixo fixos (ver FanFrame).
 */
export function FanShell({
  artist,
  viewer,
  otherFandoms,
  children,
}: {
  artist: Artist;
  viewer: Viewer;
  otherFandoms: string[];
  children: React.ReactNode;
}) {
  return (
    <ArtistProvider
      value={{
        slug: artist.slug,
        name: artist.name,
        initial: artist.initial,
        base: `/${artist.slug}`,
        priceLabel: formatBRL(artist.memberPriceCents),
        viewer,
        otherFandoms,
        loggedIn: authEnabled(),
      }}
    >
      <div style={themeStyle(artist.theme)} className="min-h-dvh bg-paper font-body text-ink lg:flex">
        <FanSidebar />
        <FanFrame>{children}</FanFrame>
      </div>
    </ArtistProvider>
  );
}
