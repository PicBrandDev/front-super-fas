import type { ReactNode } from "react";
import { AdminShell, clubNav } from "@/components/admin/AdminShell";
import type { Artist } from "@/lib/types";
import { getSession } from "@/lib/api";
import { MONO_D, MONO_D_VIEWBOX } from "@/components/fan/mark-shape";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { brandFor } from "@/lib/brands";
import { shellUser } from "@/lib/shell";
import { themeStyle } from "@/lib/themes";

/** A palavra da arte do topo em cada seção (curta, como no app do fã: a arte corta a palavra na borda). */
const MAST_WORD: Record<string, string> = {
  painel: "Fã clubes",
  membros: "Assinantes",
  ranking: "Ranking",
  mural: "Drop News",
  agenda: "Agenda",
  loja: "Loja",
  drops: "Drops",
  pickup: "PicKup",
  caronas: "Caronas",
  vitrines: "Vitrines",
};

/** Casca da administração do ambiente do cantor (marca do artista + menu do ambiente). */
export async function ClubAdminShell({ artist, active, children }: { artist: Artist; active: string; children: ReactNode }) {
  const session = await getSession();
  const brand = brandFor(artist.slug);
  return (
    <AdminShell
      className="adm-noite adm-com-arte"
      passwordHref={`/${artist.slug}/conta/senha`}
      style={themeStyle(brand.adminTheme ?? artist.theme)}
      brandKey={brand.key}
      brand={{
        // Vintage Culture usa o símbolo oficial (public/logo-vc.png, traço branco sobre transparente); o Departamento,
        // o monograma D em azul no quadrado branco (o menu do Departamento é azul elétrico); os outros artistas, a inicial.
        mark:
          brand.key === "departamento" ? (
            <span className="flex size-full items-center justify-center" style={{ background: "#FFFFFF", color: "#0000FF" }}>
              <svg width={24} viewBox={MONO_D_VIEWBOX} fill="currentColor" aria-hidden="true" focusable="false">
                <path fillRule="evenodd" d={MONO_D} />
              </svg>
            </span>
          ) : artist.slug === "vintage-culture" ? (
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
      topbar={<AdminTopBar word={MAST_WORD[active] ?? artist.name} brand={brand.key} tone={brand.key === "departamento" ? "electric" : "night"} />}
      user={await shellUser({ initials: "EQ", name: "Equipe do fã clube", role: "Administração do ambiente" })}
    >
      {children}
    </AdminShell>
  );
}
