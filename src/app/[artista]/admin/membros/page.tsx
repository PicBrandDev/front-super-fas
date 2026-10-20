import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell, clubNav } from "@/components/admin/AdminShell";
import { formatBRL, getArtist, getMembers } from "@/lib/api";
import { MembrosClient } from "./MembrosClient";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Membros — ${artist.name}` : "Membros" };
}

export default async function MembrosPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const members = await getMembers(artist.slug);

  return (
    <AdminShell
      brand={{
        mark: (
          <span
            className="flex size-full items-center justify-center rounded-lg text-lg font-normal"
            style={{ background: artist.brandColor, color: artist.theme.cream, fontFamily: artist.theme.fontDisplay }}
          >
            {artist.initial}
          </span>
        ),
        markClass: "bg-transparent",
        title: artist.name,
        subtitle: "Admin do fã clube",
      }}
      nav={clubNav(artist.slug)}
      active="membros"
      extraLink={{ label: "Ver área do fã", href: `/${artist.slug}` }}
      user={{ initials: "RL", name: "Rafa Lima", role: "Dono do fã clube" }}
    >
      <MembrosClient
        slug={artist.slug}
        artistName={artist.name}
        priceCents={artist.memberPriceCents}
        priceLabel={formatBRL(artist.memberPriceCents)}
        avatarColors={[
          { bg: artist.theme.accent, fg: artist.theme.accentFg },
          { bg: "var(--color-adm-ink)", fg: "white" },
          { bg: artist.theme.accent2, fg: artist.theme.ink },
          { bg: "var(--color-adm-blue)", fg: "white" },
        ]}
        members={members}
      />
    </AdminShell>
  );
}
