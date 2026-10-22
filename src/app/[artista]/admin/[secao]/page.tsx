import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { ResourceManager, type Item } from "@/components/admin/ResourceManager";
import { AdminNotice } from "@/components/admin/ui";
import { apiEnabled, getArtist, getFeed, getManaged } from "@/lib/api";
import { MuralAdmin } from "./MuralAdmin";
import { eventFields, giftFields, sections, vendorFields } from "./sections";

type Params = Promise<{ artista: string; secao: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { secao } = await params;
  return { title: sections[secao]?.title ?? "Admin" };
}

export default async function ClubContentPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ evento?: string }>;
}) {
  const { artista, secao } = await params;
  const section = sections[secao];
  if (!section) notFound();
  const artist = await getArtist(artista);
  if (!artist) notFound();

  if (secao === "mural") {
    const [drops, galera] = await Promise.all([getFeed(artist.slug, "drop"), getFeed(artist.slug, "galera")]);
    return (
      <ClubAdminShell artist={artist} active="mural">
        {!apiEnabled() && <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para publicar e ver as métricas.</AdminNotice>}
        <MuralAdmin slug={artist.slug} artistName={artist.name} drops={drops} galera={galera} />
      </ClubAdminShell>
    );
  }

  const items = await getManaged<Item>(artist.slug, section.resource);
  const { evento } = await searchParams;
  const event = secao === "agenda" && evento ? items.find((e) => e.id === evento) : undefined;
  const [vendors, gifts] = event
    ? await Promise.all([
        getManaged<Item>(artist.slug, "vendors", `?event_id=${event.id}`),
        getManaged<Item>(artist.slug, "gifts", `?event_id=${event.id}`),
      ])
    : [[], []];

  return (
    <ClubAdminShell artist={artist} active={secao}>
      {!apiEnabled() && <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para salvar conteúdo.</AdminNotice>}

      {event ? (
        <>
          <nav aria-label="Caminho">
            <Link href={`/${artist.slug}/admin/agenda`} className="text-sm font-semibold text-adm-blue">
              ← Todos os shows
            </Link>
          </nav>
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-[28px] font-bold">{String(event.city)}</h1>
            <p className="m-0 text-[15px] text-adm-muted">
              {String(event.date).split("-").reverse().join("/")} · {String(event.venue || "Local a definir")}
            </p>
          </div>
          <ResourceManager
            section
            slug={artist.slug}
            resource="events"
            title="Dados do show"
            description="Data, local e situação dos ingressos."
            singular="show"
            fields={eventFields}
            items={[event]}
            allowAdd={false}
          />
          <ResourceManager
            section
            slug={artist.slug}
            resource="vendors"
            title="Onde comprar"
            description="Ingressos, pacotes e excursões que aparecem na tela do evento."
            singular="opção de compra"
            feminine
            fields={vendorFields}
            items={vendors}
            fixed={{ eventId: event.id }}
          />
          <ResourceManager
            section
            slug={artist.slug}
            resource="gifts"
            title="Brindes da sorte"
            description="Brindes sorteados entre os fãs que entram na sorte do evento."
            singular="brinde"
            fields={giftFields}
            items={gifts}
            fixed={{ eventId: event.id }}
          />
        </>
      ) : (
        <ResourceManager
          slug={artist.slug}
          resource={section.resource}
          title={section.title}
          description={section.description}
          singular={section.singular}
          feminine={section.feminine}
          fields={section.fields}
          items={items}
          rowLink={secao === "agenda" ? { label: "Compra e brindes", href: `/${artist.slug}/admin/agenda?evento={id}` } : undefined}
        />
      )}
    </ClubAdminShell>
  );
}
