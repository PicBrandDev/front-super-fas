import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { PlatformBrand } from "@/components/PlatformBrand";
import { getSession, listArtists } from "@/lib/api";

/** Entrada da plataforma: lista os fã clubes e os painéis. */
export default async function PlatformHome() {
  const [artists, session] = await Promise.all([listArtists(), getSession()]);
  // Sem login (modo exemplo) mostra todos os painéis; logado, só os da pessoa.
  const role = session?.role;
  const panels: { href: string; label: string }[] = [];
  if (!session || role === "master") panels.push({ href: "/admin/fas-clubes", label: "Admin master" });
  for (const a of artists) {
    if (!session ? a === artists[0] : role === "master" || session.artists.includes(a.slug))
      panels.push({ href: `/${a.slug}/admin`, label: `Admin do fã clube ${a.name}` });
  }
  if (!session || role === "master" || role === "sponsor") panels.push({ href: "/patrocinador", label: "Portal do patrocinador" });
  return (
    <main className="min-h-dvh bg-adm-bg font-adm text-adm-ink">
      <div className="mx-auto flex max-w-[960px] flex-col gap-8 px-4 py-12 sm:px-8">
        <header className="flex flex-col gap-4">
          <PlatformBrand size="lg" />
          {session && (
            <span className="font-adm-mono text-xs font-semibold uppercase tracking-widest text-adm-muted">
              Olá, {session.name}
            </span>
          )}
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

        {artists.length === 0 && <p className="m-0 text-sm text-adm-muted">Nenhum fã clube no ar ainda.</p>}

        {(panels.length > 0 || session) && (
          <nav aria-label="Painéis e conta" className="flex flex-wrap gap-3">
            {panels.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-lg border border-adm-line bg-white px-4 py-3 text-sm font-semibold text-adm-ink no-underline"
              >
                {p.label}
              </Link>
            ))}
            {session && (
              <>
                <Link href="/conta" className="rounded-lg border border-adm-line bg-white px-4 py-3 text-sm font-semibold text-adm-ink no-underline">
                  Minha conta
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg border border-adm-line bg-white px-4 py-3 font-adm text-sm font-semibold text-adm-danger"
                  >
                    Sair
                  </button>
                </form>
              </>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
