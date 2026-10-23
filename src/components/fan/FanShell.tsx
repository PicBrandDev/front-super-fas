import { themeStyle } from "@/lib/themes";
import type { Artist, Viewer } from "@/lib/types";
import type { InAppAd } from "@/lib/ads";
import { formatBRL } from "@/lib/api";
import { authEnabled } from "@/lib/auth";
import { ArtistProvider } from "./ArtistContext";
import { EntryAd } from "./EntryAd";
import { FanFrame } from "./FanFrame";
import { FanSidebar } from "./FanSidebar";
import { ToastProvider } from "./Toast";

/**
 * Casca da área do fã: aplica o tema do artista (variáveis --fc-*), o menu
 * lateral no desktop e o deck de baixo no celular (ver FanFrame).
 */
export function FanShell({
  artist,
  viewer,
  otherFandoms,
  entryAd = null,
  freshLogin = false,
  children,
}: {
  artist: Artist;
  viewer: Viewer;
  otherFandoms: string[];
  /** Anúncio de entrada no app (posição `entry`); null = nada. */
  entryAd?: InAppAd | null;
  /** Acabou de fazer login/cadastro neste artista (cookie `sf_entry_ad`). */
  freshLogin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ArtistProvider
      value={{
        slug: artist.slug,
        name: artist.name,
        initial: artist.initial,
        fanClubName: artist.fanClubName,
        base: `/${artist.slug}`,
        priceLabel: formatBRL(artist.memberPriceCents),
        viewer,
        otherFandoms,
        loggedIn: authEnabled(),
      }}
    >
      <ToastProvider>
        <div style={themeStyle(artist.theme)} className="fan min-h-dvh bg-night font-grotesk text-base leading-6 text-fg lg:flex">
          <FanSidebar />
          <FanFrame>{children}</FanFrame>
          {entryAd && <EntryAd ad={entryAd} slug={artist.slug} fresh={freshLogin} />}
        </div>
      </ToastProvider>
    </ArtistProvider>
  );
}
