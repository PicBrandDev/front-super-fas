import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { ResourceManager, type Item } from "@/components/admin/ResourceManager";
import { AdminNotice } from "@/components/admin/ui";
import type { AgencyAdmin, PackageAdmin } from "@/lib/types";
import { apiEnabled, getArtist, getEventPhotos, getEvents, getExperiencesOverview, getFeed, getManaged } from "@/lib/api";
import { productImage } from "@/lib/media";
import { themeStyle } from "@/lib/themes";
import { AgendaMosaico } from "./AgendaMosaico";
import { DropsAdmin, type DropTrack } from "./DropsAdmin";
import { LojaAdmin, type LojaProduct } from "./LojaAdmin";
import { MuralAdmin } from "./MuralAdmin";
import { EventPhotosManager } from "./EventPhotosManager";
import { CompradoresExperiencias } from "./CompradoresExperiencias";
import { PackagesManager } from "./PackagesManager";
import { agencyFields, eventFields, giftFields, sections, vendorFields } from "./sections";

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
    const raw = await getManaged<Item>(artist.slug, "products");
    const brl = (c: unknown) => (typeof c === "number" ? (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ [PREÇO]");
    const products: LojaProduct[] = raw.map((it, i) => {
      const base = { id: it.id, name: String(it.name), category: String(it.category) as "roupas" | "acessorios" | "musica", color: String(it.color || "#E0A526") };
      return { ...it, ...base, priceLabel: brl(it.priceCents), photo: productImage(artist.slug, { ...base, priceLabel: "" }, i) };
    });
    return (
      <ClubAdminShell artist={artist} active="loja">
        {!apiEnabled() && <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para salvar conteúdo.</AdminNotice>}
        <LojaAdmin slug={artist.slug} themeVars={themeStyle(artist.theme)} fields={section.fields} products={products} />
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
          <PackagesManager slug={artist.slug} eventId={event.id} agencies={agencies} packages={packages} />
          <CompradoresExperiencias slug={artist.slug} eventId={event.id} overview={overview} />
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
        </>
      ) : (
        secao === "agenda" ? (
          <>
            <AdminPageHeader title={section.title} description={section.description} />
            <section aria-labelledby="ag-fa" className="flex flex-col gap-2">
              <h2 id="ag-fa" className="m-0 text-sm font-bold">
                Próximos shows e passados
              </h2>
              <AgendaMosaico artist={artist} events={await getEvents(artist.slug)} />
            </section>
            <ResourceManager
              section
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
