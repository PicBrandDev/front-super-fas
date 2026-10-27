import type { ReactNode } from "react";
import { AdminShell, clubNav } from "@/components/admin/AdminShell";
import type { Artist } from "@/lib/types";
import { getRankingLeaders, getSession } from "@/lib/api";
import { LideresRanking } from "@/components/admin/LideresRanking";
import { shellUser } from "@/lib/shell";
import { themeStyle } from "@/lib/themes";

/** Casca da administração do ambiente do cantor (marca do artista + menu do ambiente). */
export async function ClubAdminShell({ artist, active, children }: { artist: Artist; active: string; children: ReactNode }) {
  const session = await getSession();
  // O menu lateral mostra quem lidera o ranking de cada fã clube; se a API falhar, o painel abre sem o bloco.
  const leaders = await getRankingLeaders(artist.slug).catch(() => []);
  return (
    <AdminShell
      className="adm-noite"
      passwordHref={`/${artist.slug}/conta/senha`}
      style={themeStyle(artist.theme)}
      brand={{
        // Vintage Culture usa o símbolo oficial (public/logo-vc.png, traço branco sobre transparente); os outros artistas, a inicial.
        mark:
          artist.slug === "vintage-culture" ? (
            <span className="flex size-full items-center justify-center rounded-hair border border-adm-side-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- símbolo estático do artista */}
              <img src="/logo-vc.png" alt="" width={34} height={34} className="size-[26px] object-contain" />
            </span>
          ) : (
            <span
              className="flex size-full items-center justify-center rounded-hair text-lg font-black"
              style={{ background: artist.brandColor, color: artist.theme.text, fontFamily: artist.theme.fontDisplay }}
            >
              {artist.initial}
            </span>
          ),
        markClass: "bg-transparent",
        title: artist.name,
        subtitle: artist.status === "active" ? "Administração do ambiente" : "Ambiente em configuração",
      }}
      nav={clubNav(artist.slug)}
      extraLink={session?.role === "master" ? { label: "Voltar ao admin master", href: "/admin/fas-clubes" } : undefined}
      active={active}
      sidebarExtra={<LideresRanking artist={artist.slug} scopes={leaders} />}
      user={await shellUser({ initials: "EQ", name: "Equipe do fã clube", role: "Administração do ambiente" })}
    >
      {children}
    </AdminShell>
  );
}
