import Link from "next/link";
import { notFound } from "next/navigation";
import { AvatarUpload } from "@/components/admin/AvatarUpload";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { DayBars, HBars } from "@/components/admin/charts";
import { PhoneFeed } from "@/components/admin/PhoneFeed";
import { Badge } from "@/components/admin/ui";
import { getClubAnalytics, getClubFeed } from "@/lib/api";
import { formatCount } from "@/lib/format";

/** Variação contra os 30 dias anteriores, em texto (o ícone/cor não carregam o sentido sozinhos). */
function delta(now: number, prev: number) {
  if (prev === 0) return now === 0 ? "igual aos 30 dias anteriores" : `+${formatCount(now)} contra 0 nos 30 dias anteriores`;
  const pct = Math.round(((now - prev) / prev) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% contra os 30 dias anteriores`;
}

/** Visão geral de um fã clube: números, gráficos e o feed dele num celular. Usada no admin do ambiente e no painel do dono. */
export async function ClubAnalyticsView({ artistSlug, clube, back }: { artistSlug: string; clube: string; back?: { href: string; label: string } }) {
  const [data, feed] = await Promise.all([getClubAnalytics(artistSlug, clube), getClubFeed(artistSlug, clube)]);
  if (!data) notFound();
  const { club } = data;
  const kpis = [
    { label: "Membros", value: club.members, note: `${formatCount(data.subscribers)} são assinantes` },
    { label: "Novos membros (30d)", value: club.newMembersMonth, note: delta(club.newMembersMonth, data.newMembersPrevMonth) },
    { label: "Posts da galera", value: club.posts, note: `${formatCount(club.postsMonth)} nos últimos 30 dias` },
    {
      label: "Interações nos posts",
      value: data.likes + data.comments + data.reposts,
      note: `${formatCount(data.likes)} curtidas · ${formatCount(data.comments)} comentários · ${formatCount(data.reposts)} reposts`,
    },
    { label: "Equipe", value: club.staff, note: data.staffNames.join(", ") || "Sem equipe" },
    { label: "Anúncios no ar", value: data.approvedCampaigns, note: `${formatCount(data.activeSlots)} vitrines ativas` },
  ];

  return (
    <>
      {back && (
        <Link href={back.href} className="text-sm font-semibold text-adm-blue-dark no-underline">
          {back.label}
        </Link>
      )}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <ClubAvatar src={club.avatar} name={club.name} size={72} />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 id="analytics-title" className="m-0 text-[28px] font-bold leading-8">
              {club.name}
            </h1>
            <p className="m-0 text-[15px] text-adm-muted">
              {club.isMaster ? "Fã clube master" : club.city || "Fã clube"} · Dono: {club.ownerName ?? "ainda sem dono"}
              {club.ownerEmail ? ` (${club.ownerEmail})` : ""}
            </p>
            <div>
              <Badge tone={club.status === "active" ? "ok" : "warn"}>{club.status === "active" ? "No ar" : "Em configuração"}</Badge>
            </div>
          </div>
        </div>
        <AvatarUpload slug={artistSlug} club={club.slug} />
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <section aria-labelledby="g-feed" className="flex flex-col gap-2 lg:sticky lg:top-6">
          <h2 id="g-feed" className="m-0 text-sm font-bold">
            Feed do fã clube
          </h2>
          <PhoneFeed clubName={club.name} avatar={club.avatar} items={feed} />
        </section>

        <div className="flex min-w-0 flex-col gap-5">
        <section aria-label="Números" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((k) => (
            <div key={k.label} className="flex flex-col gap-0.5 rounded-xl border border-adm-line bg-white px-3.5 py-3">
              <span className="font-adm-mono text-xs font-semibold text-adm-muted">{k.label}</span>
              <strong className="text-[22px] leading-7">{formatCount(k.value)}</strong>
              <span className="text-[13px] text-adm-muted">{k.note}</span>
            </div>
          ))}
        </section>

        <div className="grid gap-3 xl:grid-cols-2">
          <section aria-labelledby="g-membros" className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white px-4 py-3">
            <h2 id="g-membros" className="m-0 text-sm font-bold">
              Novos membros por dia
            </h2>
            <DayBars title="Novos membros por dia" unit="novos membros" points={data.series.map((d) => ({ day: d.day, value: d.newMembers }))} />
          </section>
          <section aria-labelledby="g-posts" className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white px-4 py-3">
            <h2 id="g-posts" className="m-0 text-sm font-bold">
              Posts da galera por dia
            </h2>
            <DayBars title="Posts da galera por dia" unit="posts" points={data.series.map((d) => ({ day: d.day, value: d.posts }))} />
          </section>
        </div>

        <div className="grid gap-3">
          <section aria-labelledby="g-cidades" className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white px-4 py-3">
            <h2 id="g-cidades" className="m-0 text-sm font-bold">
              Cidades dos membros
            </h2>
            {data.topCities.length ? (
              <HBars rows={data.topCities.map((c) => ({ label: c.city, value: c.members }))} />
            ) : (
              <p className="m-0 text-sm text-adm-muted">Ainda não há membros neste fã clube.</p>
            )}
          </section>

        </div>
        </div>
      </div>
    </>
  );
}
