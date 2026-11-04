import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { ResourceManager, type Item } from "@/components/admin/ResourceManager";
import { AdminNotice } from "@/components/admin/ui";
import type { AgencyAdmin, PackageAdmin } from "@/lib/types";
import { apiEnabled, getArtist, getEventPhotos, getEvents, getExperiencesOverview, getFeed, getManaged, getStoreAnalytics, getStoreInsights } from "@/lib/api";
import { productImage } from "@/lib/media";
import { themeStyle } from "@/lib/themes";
import { AgendaCalendario } from "./AgendaCalendario";
import { DropsAdmin, type DropTrack } from "./DropsAdmin";
import { LojaAdmin, type LojaProduct } from "./LojaAdmin";
import { MuralAdmin } from "./MuralAdmin";
import { EventPhotosManager } from "./EventPhotosManager";
import { CompradoresExperiencias } from "./CompradoresExperiencias";
import { PackagesManager } from "./PackagesManager";
import { agencyFields, eventFields, giftFields, sections, vendorFields } from "./sections";
import { VendasShow } from "./VendasShow";

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
  searchParams: Promise<{ evento?: string; aba?: string; dias?: string }>;
}) {
  const { artista, secao } = await params;
  const section = sections[secao];
  if (!section) notFound();
  const artist = await getArtist(artista);
  if (!artist) notFound();

  if (secao === "mural") {
    const drops = await getFeed(artist.slug, "drop");
    return (
      <ClubAdminShell artist={artist} active="mural">
        {!apiEnabled() && <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para publicar e ver as métricas.</AdminNotice>}
        <MuralAdmin slug={artist.slug} artistName={artist.name} drops={drops} />
      </ClubAdminShell>
    );
  }

  if (secao === "drops") {
    const raw = await getManaged<Item>(artist.slug, "tracks");
    const tracks: DropTrack[] = raw.map((it) => ({
      ...it,
      title: String(it.title ?? ""),
      meta: String(it.meta ?? ""),
      releaseLabel: String(it.releaseLabel ?? ""),
      votes: Number(it.votes ?? 0),
    }));
    return (
      <ClubAdminShell artist={artist} active="drops">
        {!apiEnabled() && <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para salvar conteúdo.</AdminNotice>}
        <DropsAdmin slug={artist.slug} themeVars={themeStyle(artist.theme)} fields={section.fields} tracks={tracks} />
      </ClubAdminShell>
    );
  }

  if (secao === "loja") {
    const q = await searchParams;
    const days = [7, 30, 90].includes(Number(q.dias)) ? Number(q.dias) : 30;
    const [raw, sales, insights] = await Promise.all([getManaged<Item>(artist.slug, "products"), getStoreAnalytics(artist.slug), getStoreInsights(artist.slug, days)]);
    const brl = (c: unknown) => (typeof c === "number" ? (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ [PREÇO]");
    const products: LojaProduct[] = raw.map((it, i) => {
      const base = { id: it.id, name: String(it.name), category: String(it.category) as "roupas" | "acessorios" | "musica", color: String(it.color || "#E0A526") };
      const imagePath = typeof it.imagePath === "string" ? it.imagePath : "";
      const image = imagePath ? { src: imagePath, alt: `Foto do produto ${base.name}` } : null;
      return { ...it, ...base, imagePath, priceLabel: brl(it.priceCents), photo: productImage(artist.slug, { ...base, priceLabel: "", image }, i) };
    });
    return (
      <ClubAdminShell artist={artist} active="loja">
        {!apiEnabled() && <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para salvar conteúdo.</AdminNotice>}
        <LojaAdmin slug={artist.slug} themeVars={themeStyle(artist.theme)} fields={section.fields} products={products} sales={sales} insights={insights} base={`/${artist.slug}/admin/loja`} initialTab={q.aba === "analise" || q.aba === "historico" ? q.aba : "produtos"} />
      </ClubAdminShell>
    );
  }

  const items = await getManaged<Item>(artist.slug, section.resource);
  const { evento } = await searchParams;
  const event = secao === "agenda" && evento ? items.find((e) => e.id === evento) : undefined;
  const [vendors, gifts, agencies, packages, photos, overview] = event
    ? await Promise.all([
        getManaged<Item>(artist.slug, "vendors", `?event_id=${event.id}`),
        getManaged<Item>(artist.slug, "gifts", `?event_id=${event.id}`),
        getManaged<AgencyAdmin>(artist.slug, "agencies"),
        getManaged<PackageAdmin>(artist.slug, "packages", `?event_id=${event.id}`),
        getEventPhotos(artist.slug, event.id),
        getExperiencesOverview(artist.slug, event.id),
      ])
    : [[], [], [], [], [], null];

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
          <h1 className="sr-only">
            {String(event.city)}, {String(event.date).split("-").reverse().join("/")}
          </h1>
          <ResourceManager
            section
            hideTitle
            layout="details"
            slug={artist.slug}
            resource="events"
            title="Dados do show"
            description="Data, local e situação dos ingressos."
            singular="show"
            fields={eventFields}
            items={[event]}
            allowAdd={false}
          />
          <VendasShow overview={overview} />
          <PackagesManager slug={artist.slug} eventId={event.id} agencies={agencies} packages={packages} />
          <CompradoresExperiencias slug={artist.slug} eventId={event.id} overview={overview} />
          <details className="group rounded-xl border border-adm-line bg-white">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-5 text-sm font-bold">
              Mais opções do show
              <span className="text-[13px] font-medium text-adm-muted">Fotos, agências, pontos de venda e brindes</span>
            </summary>
            <div className="flex flex-col gap-8 border-t border-adm-line px-5 py-5">
              <EventPhotosManager slug={artist.slug} eventId={event.id} photos={photos} />
              <ResourceManager
                section
                slug={artist.slug}
                resource="agencies"
                title="Agências parceiras"
                description="As agências do ambiente. Cada uma pode ter pacotes em vários shows."
                singular="agência"
                feminine
                fields={agencyFields}
                items={agencies as unknown as Item[]}
              />
              <ResourceManager
                section
                slug={artist.slug}
                resource="vendors"
                title="Outros pontos de venda"
                description="Links extras de compra que aparecem na tela do evento."
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
            </div>
          </details>
        </>
      ) : (
        secao === "agenda" ? (
          <>
            <AdminPageHeader title={section.title} description={section.description} />
            <section aria-label="Calendário de shows">
              <AgendaCalendario artist={artist} events={await getEvents(artist.slug)} />
            </section>
            <ResourceManager
              section
              hideTitle
              hideList
              slug={artist.slug}
              resource={section.resource}
              title="Gerenciar shows"
              description="Adicione, edite ou apague shows. Em cada um, cadastre onde comprar e os brindes."
              singular={section.singular}
              feminine={section.feminine}
              fields={section.fields}
              items={items}
              rowLink={{ label: "Compra e brindes", href: `/${artist.slug}/admin/agenda?evento={id}` }}
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
        )
      )}
    </ClubAdminShell>
  );
}
