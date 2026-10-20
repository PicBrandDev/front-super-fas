import Link from "next/link";
import { listArtists } from "@/lib/api";

/** Entrada da plataforma: lista os fã clubes e os painéis. */
export default async function PlatformHome() {
  const artists = await listArtists();
  return (
    <main className="min-h-dvh bg-adm-bg font-adm text-adm-ink">
      <div className="mx-auto flex max-w-[960px] flex-col gap-8 px-4 py-12 sm:px-8">
        <header className="flex flex-col gap-2">
          <span className="font-adm-mono text-xs font-semibold uppercase tracking-widest text-adm-muted">[Sua plataforma]</span>
          <h1 className="m-0 text-4xl font-bold">Fã clubes</h1>
          <p className="m-0 text-[15px] text-adm-muted">Escolha um fã clube para entrar.</p>
        </header>

        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
          {artists.map((a) => (
            <li key={a.id}>
              <Link
                href={`/${a.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-adm-line bg-white p-5 text-adm-ink no-underline hover:border-adm-blue"
              >
                <span
                  className="flex size-14 flex-none items-center justify-center rounded-2xl font-display text-[26px] text-white"
                  style={{ background: a.brandColor, fontFamily: "var(--font-shrikhand)" }}
                >
                  {a.initial}
                </span>
                <span className="flex flex-col gap-0.5">
                  <strong className="text-lg">{a.name}</strong>
                  <span className="text-sm text-adm-muted">/{a.slug}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <nav aria-label="Painéis" className="flex flex-wrap gap-3">
          <Link href="/admin/fas-clubes" className="rounded-lg border border-adm-line bg-white px-4 py-3 text-sm font-semibold text-adm-ink no-underline">
            Admin master
          </Link>
          {artists[0] && (
            <Link
              href={`/${artists[0].slug}/admin/membros`}
              className="rounded-lg border border-adm-line bg-white px-4 py-3 text-sm font-semibold text-adm-ink no-underline"
            >
              Admin do fã clube {artists[0].name}
            </Link>
          )}
          <Link href="/patrocinador" className="rounded-lg border border-adm-line bg-white px-4 py-3 text-sm font-semibold text-adm-ink no-underline">
            Portal do patrocinador
          </Link>
        </nav>
      </div>
    </main>
  );
}
