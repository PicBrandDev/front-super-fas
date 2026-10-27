import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { MyAvatar } from "@/app/conta/MyAvatar";
import { Masthead } from "@/components/fan/Masthead";
import { Icon } from "@/components/icons";
import { apiEnabled, getArtist, getClubs, getMyTickets, getProfile, getRanking, getSpinCredits, getViewer } from "@/lib/api";
import { authEnabled, roleLabel, type Role } from "@/lib/auth";
import { isPastEvent } from "@/lib/events";
import { formatBRL, formatPoints } from "@/lib/format";

export const metadata: Metadata = { title: "Meu perfil" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-5">
      <h2 className="poster m-0 mb-3 text-lg leading-6">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
      <dt className="mono flex-none">{label}</dt>
      <dd className="m-0 min-w-0 break-words text-right text-[15px]">{value || "—"}</dd>
    </div>
  );
}

/** Perfil do fã: foto, dados, endereço, assinatura, fã clubes, ingressos, giros, ranking e a conta. */
export default async function PerfilPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, viewer, profile, clubs, tickets, credits, ranking] = await Promise.all([
    getArtist(artista),
    getViewer(artista),
    getProfile(),
    getClubs(artista),
    getMyTickets(artista),
    getSpinCredits(artista),
    getRanking(artista),
  ]);
  if (!artist) notFound();
  if (authEnabled() && !profile) redirect(`/${artista}/login`);
  const base = `/${artista}`;
  const myClubs = clubs.filter((c) => c.joined || !!c.myRole);
  const freeSpins = credits.filter((c) => !c.used).length || viewer.spins;
  const address = profile
    ? [
        [profile.street, profile.number].filter(Boolean).join(", "),
        profile.complement,
        profile.neighborhood,
        [profile.city, profile.state].filter(Boolean).join("/"),
        profile.zipCode,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <>
      <Masthead word="Perfil" label="Meu perfil" tone="night" />
      <div className="px-4 pb-10">
        <Link href={base} className="back">
          <Icon name="back" size={18} />
          Início
        </Link>

        <div className="flex flex-col gap-3 py-5">
          <MyAvatar avatar={profile?.avatar ?? null} name={profile?.name ?? viewer.name} />
          <div className="flex flex-col gap-1">
            <h1 className="poster m-0 text-[32px] leading-8">{profile?.name ?? viewer.name}</h1>
            <span className="mono">{profile?.handle || viewer.handle}</span>
            <span className="flex flex-wrap gap-2 pt-1">
              {profile && <span className="tag">{roleLabel[profile.role as Role] ?? profile.role}</span>}
              {viewer.isMember && <span className="tag tag-key">Membro</span>}
            </span>
          </div>
        </div>

        {myClubs.some((c) => c.myRole) && (
          <Section title="Meu fandom">
            <p className="m-0 mb-3 text-fg-muted">
              Você administra {myClubs.filter((c) => c.myRole).map((c) => c.name).join(", ")}. Veja os números e as publicações do seu fã clube.
            </p>
            <Link href={`${base}/meu-fandom`} className="btn btn-primary btn-sm no-underline">
              Abrir o meu fandom
            </Link>
          </Section>
        )}

        <Section title="Dados">
          <dl className="m-0">
            <Row label="E-mail" value={profile?.email} />
            <Row label="Instagram" value={profile?.handle || viewer.handle} />
            <Row label="Endereço" value={address} />
            <Row label="Conta criada em" value={profile?.since} />
          </dl>
        </Section>

        <Section title="Assinatura">
          {viewer.isMember ? (
            <p className="m-0 text-fg-muted">Você é membro do fã clube de {artist.name}.</p>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="m-0 text-fg-muted">Drops exclusivos, giros extras e brindes no fã clube.</p>
              <Link href={`${base}/membro`} className="btn btn-primary btn-sm">
                Tornar membro
              </Link>
            </div>
          )}
        </Section>

        <Section title="Fã clubes que sigo">
          {myClubs.length === 0 ? (
            <Link href={`${base}/comunidade`} className="go min-h-11">
              Ver os fã clubes
              <Icon name="arrow" size={14} />
            </Link>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {myClubs.map((c) => (
                <li key={c.slug} className="flex items-center gap-3 border-b border-line py-2.5">
                  {c.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- foto de perfil do fã clube
                    <img src={c.avatar} alt="" width={32} height={32} className="size-8 flex-none rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="avatar flex-none">
                      {c.name.charAt(0)}
                    </span>
                  )}
                  <Link href={`${base}/clubes/${c.slug}`} className="min-w-0 flex-1 truncate text-fg no-underline">
                    {c.name}
                  </Link>
                  {c.myRole && <span className="tag">{c.myRole === "owner" ? "Dono" : "Equipe"}</span>}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Meus ingressos">
          {tickets.length === 0 ? (
            <p className="m-0 text-fg-muted">Você ainda não comprou ingressos.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {tickets.map((t) => (
                <li key={t.id} className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
                  <span className="flex min-w-0 flex-col">
                    <strong className="truncate text-[15px]">
                      {t.event.city} · {t.event.day} {t.event.month}
                    </strong>
                    <span className="mono truncate">{t.label}</span>
                  </span>
                  <span className="flex flex-none flex-col items-end">
                    <span className="num text-[15px]">{formatBRL(t.priceCents)}</span>
                    <span className="mono">{isPastEvent(t.event) ? "Encerrado" : "Garantido"}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href={`${base}/agenda`} className="go mt-2 min-h-11">
            Abrir a agenda
            <Icon name="arrow" size={14} />
          </Link>
        </Section>

        <Section title="Giros e pontos">
          <dl className="m-0">
            <Row label="Giros disponíveis" value={String(freeSpins)} />
            <Row label="Pontos da sorte" value={viewer.luckPoints.toLocaleString("pt-BR")} />
          </dl>
          <Link href={`${base}/pickup`} className="go mt-2 min-h-11">
            Ir para o PicKup
            <Icon name="arrow" size={14} />
          </Link>
        </Section>

        {ranking && (
          <Section title="Fã Super do Vintage">
            <dl className="m-0">
              <Row label="Posição no ranking" value={ranking.me.position ? `${ranking.me.position}º` : "—"} />
              <Row label="Pontos no ranking" value={formatPoints(ranking.me.points ?? ranking.me.shares)} />
              <Row label="Compartilhamentos confirmados" value={String(ranking.me.shares)} />
              <Row label="Aguardando confirmação" value={String(ranking.me.pending)} />
              <Row label="Seu código" value={ranking.myCode} />
            </dl>
            <Link href={`${base}/comunidade?aba=ranking`} className="go mt-2 min-h-11">
              Ver o ranking
              <Icon name="arrow" size={14} />
            </Link>
          </Section>
        )}

        <Section title="Conta">
          <div className="flex flex-col items-start gap-2">
            {apiEnabled() && (
              <Link href={`${base}/conta/senha`} className="btn btn-outline btn-sm">
                Trocar senha
              </Link>
            )}
            {authEnabled() && (
              <form action={logout}>
                <button type="submit" className="btn btn-ghost btn-sm">
                  Sair
                </button>
              </form>
            )}
          </div>
        </Section>
      </div>
    </>
  );
}
