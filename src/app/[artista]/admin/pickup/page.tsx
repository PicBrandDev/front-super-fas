import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty } from "@/components/admin/ui";
import { getArtist, getPickup, getPickupHistory } from "@/lib/api";
import { formatCount } from "@/lib/format";
import type { PickupPrize } from "@/lib/types";
import { HistoricoGiros } from "./HistoricoGiros";
import { PrizeCard } from "./PrizeCard";
import { Turntable, recordAngleFor } from "@/components/fan/Turntable";
import { kindStyle } from "./RoletaSvg";

export const metadata: Metadata = { title: "PicKup" };

/** Fatia que nasce acesa na roleta do fã: o ingresso de pista, se houver; senão a primeira que dá brinde. */
function featuredIndex(prizes: PickupPrize[]) {
  const lose = (p: PickupPrize) => p.isRetry || p.kind === "none" || p.kind === "retry";
  const ticket = prizes.findIndex((p) => p.kind === "ticket" || (!p.kind && /ingresso/i.test(p.label)));
  if (ticket >= 0) return ticket;
  const real = prizes.findIndex((p) => !lose(p));
  return real >= 0 ? real : 0;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** PicKup: a roleta ativa, quem girou, o estoque de cada brinde e quem ganhou cada um. Cada fã clube tem a sua roleta. */
export default async function PickupAdminPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const data = await getPickup(artist.slug);
  const history = data ? await getPickupHistory(artist.slug, data.wheel.slug, "", 1) : null;

  return (
    <ClubAdminShell artist={artist} active="pickup">
      <AdminPageHeader
        title="PicKup"
        headingId="pickup-title"
        description="A roleta ativa (a mesma que os fãs giram no app), quem girou, o estoque de cada brinde e quem ganhou cada um."
      />
      {!data ? (
        <AdminEmpty title="PicKup indisponível" text="Ligue o front à API para ver a roleta." />
      ) : (
        <>
          <section aria-label="Números" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Giros dados", value: formatCount(data.summary.spins), note: `${formatCount(data.summary.spinners)} ${data.summary.spinners === 1 ? "pessoa já girou" : "pessoas já giraram"}` },
              { label: "Brindes entregues", value: formatCount(data.summary.rewards), note: "cupons, ingressos e retiradas" },
              { label: "Giros guardados", value: formatCount(data.summary.spinsLeft), note: "ainda não usados, no ambiente todo" },
              {
                label: "Último a girar",
                value: data.summary.lastSpin ? data.summary.lastSpin.name : "Ninguém ainda",
                note: data.summary.lastSpin ? `${when(data.summary.lastSpin.at)} · ${data.summary.lastSpin.prize}` : "A roleta ainda não foi girada",
              },
            ].map((k) => (
              <div key={k.label} className="flex flex-col gap-0.5 rounded-xl border border-adm-line bg-white px-3.5 py-3">
                <span className="font-adm-mono text-xs font-semibold text-adm-muted">{k.label}</span>
                <strong className="break-words text-[20px] leading-6">{k.value}</strong>
                <span className="text-[13px] text-adm-muted">{k.note}</span>
              </div>
            ))}
          </section>

          <section aria-labelledby="roleta-ativa" className="flex flex-col gap-3">
            <h2 id="roleta-ativa" className="m-0 font-display text-3xl font-black">
              Roleta ativa
            </h2>
            {data.prizes.length === 0 ? (
              <AdminEmpty title="Esta roleta ainda não tem prêmios" text="Cadastre os prêmios no painel do fã clube para ela aparecer aqui." />
            ) : (
              <div className="grid items-center gap-6 rounded-xl border border-adm-line bg-white p-5 md:grid-cols-[minmax(0,340px)_1fr]">
                <div className="fan mx-auto w-full max-w-[360px] bg-transparent">
                  {/* A mesma roleta (toca-discos) que o fã vê no app. */}
                  <Turntable
                    prizes={data.prizes.map((p) => p.label)}
                    deck
                    live
                    prefix="adm"
                    on={featuredIndex(data.prizes)}
                    rot={recordAngleFor(featuredIndex(data.prizes), data.prizes.length)}
                    arm={0}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <p className="m-0 text-[13px] text-adm-muted">
                    {data.prizes.length} fatias no disco (a numeração segue o sentido horário a partir do topo), todas com a mesma chance de sair. Fatia
                    esgotada deixa de sair.
                  </p>
                  <ol className="m-0 grid list-none gap-x-4 gap-y-2 p-0 sm:grid-cols-2">
                    {data.prizes.map((p, i) => {
                      const st = kindStyle(p.kind, p.isRetry);
                      return (
                        <li key={p.id} className="flex items-center gap-2 text-sm" style={{ opacity: p.remaining === 0 ? 0.5 : 1 }}>
                          <span className="flex size-6 flex-none items-center justify-center rounded-full bg-adm-line-soft font-adm-mono text-[11px] font-semibold">{i + 1}</span>
                          <span className="flex min-w-0 flex-1 flex-col leading-4">
                            <span className="break-words font-semibold">{p.label}</span>
                            <span className="text-[11px] text-adm-muted">{st.label}</span>
                          </span>
                          <span className="font-adm-mono text-xs text-adm-muted">{p.stock === null ? "sem limite" : `${formatCount(p.remaining ?? 0)} restam`}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}
          </section>

          {data.prizes.length > 0 && (
            <section aria-labelledby="estoque-title" className="flex flex-col gap-3">
              <div>
                <h2 id="estoque-title" className="m-0 font-display text-3xl font-black">
                  Estoque e ganhadores
                </h2>
                <p className="m-0 text-[13px] text-adm-muted">
                  Defina quantas unidades de cada brinde existem (por exemplo, 100 cupons). A cada ganhador o estoque cai, e ao zerar a fatia deixa de sair.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.prizes.map((p) => (
                  <PrizeCard key={p.id} artist={artist.slug} club={data.wheel.slug} prize={p} />
                ))}
              </div>
            </section>
          )}

          <HistoricoGiros key={data.wheel.slug} artist={artist.slug} club={data.wheel.slug} initial={history} />
        </>
      )}
    </ClubAdminShell>
  );
}

