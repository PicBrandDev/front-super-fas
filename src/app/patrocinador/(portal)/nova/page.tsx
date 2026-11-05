import type { Metadata } from "next";
import { orderArtists } from "@/lib/artist-order";
import { apiEnabled, getAdSlots, getClubAdSlots, getClubs, listArtists } from "@/lib/api";
import { brandFor, brandKeyFor } from "@/lib/brands";
import { blankTheme, type ArtistTheme } from "@/lib/themes";
import type { AdSlot } from "@/lib/types";
import { PatrocinadorClient, type SponsorClub } from "../PatrocinadorClient";

export const metadata: Metadata = { title: "Portal do patrocinador — Nova campanha" };

/** Quem ainda não tem design próprio aparece cru: papel branco, tinta preta, sem cor de marca. */
const rawTheme: ArtistTheme = {
  ...blankTheme,
  bg: "#FFFFFF",
  text: "#111111",
  textMuted: "#6B6B6B",
  line: "#E4E4E4",
  lineStrong: "#BDBDBD",
  amber: "#111111",
  amberText: "#111111",
  onAmber: "#FFFFFF",
  fontDisplay: "var(--font-archivo), 'Helvetica Neue', Arial, sans-serif",
};
/** Cantor com design: o Vintage Culture e todo cantor com pele própria (brands.ts). */
const hasDesign = (slug: string) => slug === "vintage-culture" || brandKeyFor(slug) !== "vintage";

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function NovaCampanhaPage() {
  // Anúncio de exemplo já preenchido (Coca-Cola), com início hoje e fim em 14 dias.
  const hoje = new Date();
  const fim = new Date(hoje.getTime() + 14 * 86400000);
  const all = orderArtists(await listArtists()); // Vintage Culture primeiro, Departamento em segundo
  const artists = all.filter((a) => a.status === "active");
  // Vitrines do ambiente de cada cantor ("cantor") e de cada fã clube no ar ("cantor/clube").
  const slotsByClub: Record<string, AdSlot[]> = {};
  const placesByClub: Record<string, { slug: string; name: string; avatar?: string | null; members: number }[]> = {};
  await Promise.all(
    artists.map(async (a) => {
      const [envSlots, clubs] = await Promise.all([getAdSlots(a.slug), getClubs(a.slug)]);
      slotsByClub[a.slug] = envSlots;
      const live = clubs.filter((c) => c.status === "active");
      placesByClub[a.slug] = live.map((c) => ({ slug: c.slug, name: c.name, avatar: c.avatar, members: c.members }));
      await Promise.all(
        live.map(async (c) => {
          slotsByClub[`${a.slug}/${c.slug}`] = await getClubAdSlots(a.slug, c.slug);
        }),
      );
    }),
  );
  const clubs: SponsorClub[] = all.map((a) => ({
    ready: a.status === "active",
    slug: a.slug,
    name: a.name,
    initial: a.initial,
    members: a.members,
    brandColor: a.brandColor,
    // Pele com tema de assinatura: o card usa ele (Departamento: azul elétrico; Anitta: céu azul-noite); sem design: cru.
    theme: (hasDesign(a.slug) && brandFor(a.slug).toneTheme) || (hasDesign(a.slug) ? a.theme : rawTheme),
  }));

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[28px] font-bold">Nova campanha</h1>
        <p className="m-0 text-[15px] text-adm-muted">
          Escolha o cantor, a vitrine do ambiente dele (ou de um fã clube) e monte seu anúncio. Quem administra o lugar aprova antes de ir ao ar.
        </p>
      </div>
      <PatrocinadorClient
        defaultArtUrl="/ads/coca-cola.png"
        initialTargeting={{ city: "São Paulo, SP", radiusKm: 100, views: 40000, clicks: 1200 }}
        initialForm={{
          brand: "Coca-Cola",
          cta: "Ver oferta",
          title: "Abra a felicidade no próximo show",
          text: "Gelada na pista, sempre. Resgate sua Coca-Cola grátis com o código SUPERFA.",
          link: "https://www.cocacola.com.br",
          start: iso(hoje),
          end: iso(fim),
        }}
        clubs={clubs} slotsByClub={slotsByClub} placesByClub={placesByClub} exampleMode={!apiEnabled()} />
    </>
  );
}
