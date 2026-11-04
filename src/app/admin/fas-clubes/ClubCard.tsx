import Link from "next/link";
import { Badge } from "@/components/admin/ui";
import { thumb } from "@/lib/thumb";
import type { ClubRow } from "./FasClubesClient";

/** Foto de perfil do fã clube master; sem foto, a inicial do artista na cor da marca. */
export function ClubPhoto({ club, size }: { club: Pick<ClubRow, "avatar" | "initial" | "color" | "name">; size: number }) {
  const box = { width: size, height: size };
  return club.avatar ? (
    <img src={thumb(club.avatar, size)} alt="" width={size} height={size} style={box} className="block flex-none rounded-full object-cover" />
  ) : (
    <span
      aria-hidden="true"
      style={{ ...box, fontSize: size * 0.4, background: club.color }}
      className="flex flex-none items-center justify-center rounded-full font-display font-black text-white"
    >
      {club.initial}
    </span>
  );
}

const glassBtn =
  "flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-white/35 bg-white/15 px-3 text-[13px] font-semibold text-white no-underline backdrop-blur-sm hover:bg-white/28";

function Stat({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{label}</dt>
      <dd className={`m-0 truncate text-[15px] font-bold text-white ${mono ? "font-adm-mono" : ""}`}>{value}</dd>
    </div>
  );
}

/** Card do artista: a foto do fã clube ocupa o card inteiro e os textos ficam por cima, sobre um degradê escuro. */
export function ClubCard({ club, onEdit }: { club: ClubRow; onEdit: () => void }) {
  const active = club.status === "active";
  const ig = club.instagram?.replace(/^@/, "");
  return (
    <article className="group relative flex min-h-[440px] min-w-0 flex-col justify-end overflow-hidden rounded-2xl bg-adm-ink text-white shadow-[0_2px_8px_rgba(20,23,28,.12)] transition-shadow hover:shadow-[0_14px_36px_rgba(20,23,28,.22)]">
      {club.avatar ? (
        <img
          src={thumb(club.avatar, 360)}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 flex items-start justify-center pt-10" style={{ background: `linear-gradient(150deg, ${club.color}, ${club.color}99 60%, #14171C)` }}>
          <span className="select-none font-display text-[180px] font-black leading-none text-white/20">{club.initial}</span>
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

      <span className="absolute left-4 top-4">
        <Badge tone={active ? "ok" : "warn"}>{active ? "No ar" : "Em configuração"}</Badge>
      </span>

      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="m-0 truncate text-2xl font-extrabold leading-tight [text-shadow:0_1px_8px_rgba(0,0,0,.4)]">{club.name}</h3>
          <span className="truncate text-sm text-white/85">{club.fanClubName}</span>
          <span className="flex flex-wrap items-center gap-x-2 font-adm-mono text-xs text-white/70">
            {club.local ? (
              <span>/{club.slug}</span>
            ) : (
              <a href={club.url} target="_blank" rel="noreferrer" title="Abrir o ambiente em uma nova aba" className="max-w-full truncate font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">
                {club.url.replace(/^https?:\/\//, "")}
              </a>
            )}
            {ig && (
              <a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer" className="text-white no-underline hover:underline">
                @{ig}
              </a>
            )}
          </span>
        </div>

        <dl className="m-0 grid grid-cols-3 gap-3 rounded-xl border border-white/20 bg-white/12 px-4 py-3 backdrop-blur-md">
          <Stat label="Fã clubes" value={String(club.team.length)} />
          <Stat label="Membros" value={club.members} />
          <Stat label="Vitrines" value={club.ads.replace(" ocupadas", "")} mono={false} />
        </dl>

        <div className="flex flex-wrap gap-2">
          {club.local ? (
            <span aria-disabled="true" title="Disponível depois que o ambiente for configurado" className={`${glassBtn} cursor-not-allowed opacity-50`}>
              Abrir ambiente
            </span>
          ) : (
            <Link href={`/${club.slug}`} className={glassBtn}>
              Abrir<span className="sr-only"> ambiente de {club.name}</span>
            </Link>
          )}
          <button type="button" onClick={onEdit} disabled={club.local} className={`${glassBtn} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
            Editar<span className="sr-only"> {club.name}</span>
          </button>
          {club.local ? (
            <span aria-disabled="true" className={`${glassBtn} basis-full cursor-not-allowed opacity-50`}>
              Gerenciar
            </span>
          ) : (
            <Link
              href={`/${club.slug}/admin`}
              className="flex min-h-10 basis-full items-center justify-center rounded-lg bg-white px-3 text-[13px] font-bold text-adm-ink no-underline hover:bg-white/90"
            >
              Gerenciar<span className="sr-only"> {club.name}</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
