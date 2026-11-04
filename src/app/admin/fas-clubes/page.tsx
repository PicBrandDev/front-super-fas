import type { Metadata } from "next";
import { headers } from "next/headers";
import { shellUser } from "@/lib/shell";
import { AdminShell, masterNav } from "@/components/admin/AdminShell";
import { apiEnabled, getClubs, listArtists } from "@/lib/api";
import { FasClubesClient, type ClubRow } from "./FasClubesClient";

export const metadata: Metadata = { title: "Admin master — Fã clubes" };

export default async function FasClubesPage() {
  // Ordem da lista: os ambientes de destaque primeiro; o resto segue a ordem de criação da API.
  const PRIORITY = ["vintage-culture", "departamento"];
  const rank = (slug: string) => (PRIORITY.includes(slug) ? PRIORITY.indexOf(slug) : PRIORITY.length);
  const artists = (await listArtists()).sort((x, y) => rank(x.slug) - rank(y.slug));
  // Endereço completo de cada ambiente (o domínio pelo qual a tela foi aberta).
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : "";
  const clubs: ClubRow[] = await Promise.all(
    artists.map(async (a) => {
      // Os fã clubes do ambiente (até 10) e seus donos; o master guarda a foto de perfil.
      const own = await getClubs(a.slug);
      const master = own.find((c) => c.isMaster);
      // Nome oficial do fã clube: o cadastrado; se estiver vazio ou for o texto-modelo "[Nome do fã clube]", o nome do fã clube master.
      const official = a.fanClubName.trim().startsWith("[") ? "" : a.fanClubName.trim();
      return {
        id: a.id,
        name: a.name,
        slug: a.slug,
        url: `${origin}/${a.slug}`,
        initial: a.initial,
        color: a.brandColor,
        avatar: master?.avatar ?? null,
        masterSlug: master?.slug,
        fanClubName: official || master?.name || a.name,
        instagram: a.instagram,
        memberPriceCents: a.memberPriceCents,
        status: a.status,
        members: a.members,
        ads: a.adSlotsSummary,
        team: own.map((c) => ({
          name: c.name,
          role: `${c.isMaster ? "Master · " : ""}${c.owner ? `dono: ${c.owner.name}` : "sem dono"}`,
        })),
        modules: a.modules ?? {},
      };
    }),
  );

  return (
    <AdminShell
      subtitle="Admin da plataforma"
      nav={masterNav}
      active="fas-clubes"
      extraLink={{ label: "Ver portal do patrocinador", href: "/patrocinador" }}
      user={await shellUser({ initials: "AD", name: "Você", role: "Admin da plataforma" })}
    >
      <FasClubesClient initialClubs={clubs} exampleMode={!apiEnabled()} />
    </AdminShell>
  );
}
