import { themeStyle } from "@/lib/themes";
import type { Artist, Viewer } from "@/lib/types";
import { formatBRL } from "@/lib/api";
import { ArtistProvider } from "./ArtistContext";
import { BottomNav } from "./BottomNav";
import { FanSidebar } from "./FanSidebar";
import { MemberStrip } from "./MemberStrip";

/**
 * Casca da área do fã: aplica o tema do artista, menu lateral no desktop
 * e faixa de membro + menu de baixo fixos no celular.
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
      }}
    >
      <div style={themeStyle(artist.theme)} className="min-h-dvh bg-paper font-body text-ink lg:flex">
        <FanSidebar />
        <div className="min-w-0 flex-1 pb-[136px] lg:pb-0">{children}</div>
        <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
          <MemberStrip />
          <BottomNav />
        </div>
      </div>
    </ArtistProvider>
  );
}
