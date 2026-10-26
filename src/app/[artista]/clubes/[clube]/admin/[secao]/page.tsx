import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AnunciosClient } from "@/components/admin/AnunciosClient";
import { ClubDataForm } from "@/components/admin/ClubPanels";
import { FanClubShell } from "@/components/admin/FanClubShell";
import { ResourceManager, type FieldDef, type Item } from "@/components/admin/ResourceManager";
import { StaffClient } from "@/components/admin/StaffClient";
import {
  getArtist,
  getClub,
  getClubAdSlots,
  getClubCampaigns,
  getClubFeed,
  getClubManaged,
  getClubStaff,
  getSession,
} from "@/lib/api";
import { ClubFeedAdmin } from "./ClubFeedAdmin";

type Params = Promise<{ artista: string; clube: string; secao: string }>;

const titles: Record<string, string> = {
  mural: "Posts do fã clube",
  pickup: "PicKup",
  anuncios: "Anúncios",
  equipe: "Equipe",
  dados: "Dados do clube",
};

const prizeFields: FieldDef[] = [
  { name: "label", label: "Texto da fatia", type: "text", required: true, column: true, placeholder: "Camiseta" },
  { name: "points", label: "Pontos da sorte", type: "number", column: true, hint: "Ex.: 50 para “+50 pts”." },
  { name: "isRetry", label: "É “Tente de novo” (devolve o giro)", type: "checkbox", column: true },
  { name: "position", label: "Ordem na roleta", type: "number", column: true },
];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { secao } = await params;
  return { title: titles[secao] ?? "Painel do fã clube" };
}

export default async function ClubAdminSection({ params }: { params: Params }) {
  const { artista, clube, secao } = await params;
  // A antiga lista de membros virou a Visão geral (números e cidades, sem listar pessoas).
  if (secao === "membros") redirect(`/${artista}/clubes/${clube}/admin`);
  if (!titles[secao]) notFound();
  const [artist, club, session] = await Promise.all([getArtist(artista), getClub(artista, clube), getSession()]);
  if (!artist || !club) notFound();
  // Administração do ambiente (ou a plataforma) escolhe o dono e coloca o clube no ar.
  const envAdmin = !session || session.role === "master" || session.artists.includes(artist.slug);

  let body: React.ReactNode;
  switch (secao) {
    case "mural":
      body = <ClubFeedAdmin slug={artist.slug} club={club.slug} clubName={club.name} items={await getClubFeed(artist.slug, club.slug)} />;
      break;
    case "pickup":
      body = (
        <ResourceManager
          slug={artist.slug}
          club={club.slug}
          resource="prizes"
          title="PicKup do clube"
          description={`Fatias da roleta do ${club.name}. O sorteio acontece no servidor; fatias com pontos somam nos pontos da sorte do fã.`}
          singular="prêmio"
          fields={prizeFields}
          items={await getClubManaged<Item>(artist.slug, club.slug, "prizes")}
        />
      );
      break;
    case "anuncios": {
      const [slots, campaigns] = await Promise.all([getClubAdSlots(artist.slug, club.slug), getClubCampaigns(artist.slug, club.slug)]);
      body = (
        <AnunciosClient
          artist={artist.slug}
          title="Anúncios do clube"
          description={`Vitrines que aparecem só para o ${club.name}. Você aprova as campanhas que os patrocinadores mandam para cá.`}
          slots={slots}
          campaigns={campaigns}
        />
      );
      break;
    }
    case "equipe":
      body = (
        <StaffClient
          artist={artist.slug}
          club={club.slug}
          clubName={club.name}
          staff={await getClubStaff(artist.slug, club.slug)}
          canSetOwner={envAdmin}
        />
      );
      break;
    default:
      body = <ClubDataForm artist={artist.slug} club={club} canPublish={envAdmin} />;
  }

  return (
    <FanClubShell artist={artist} club={club} active={secao}>
      {body}
    </FanClubShell>
  );
}
