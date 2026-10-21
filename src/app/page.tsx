import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { PlatformBrand } from "@/components/PlatformBrand";
import { AdminEmpty } from "@/components/admin/ui";
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

        {artists.length > 0 ? (
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            {artists.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/${a.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-adm-line bg-white p-5 text-adm-ink no-underline hover:border-adm-blue"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-14 flex-none items-center justify-center rounded-2xl text-[26px] text-white"
                    style={{ background: a.brandColor, fontFamily: a.theme.fontDisplay }}
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
        ) : (
          <AdminEmpty
            title="Nenhum fã clube no ar ainda"
            text={
              !session || role === "master"
                ? "Crie o primeiro artista no admin da plataforma para abrir um ambiente com fã clubes."
                : "Assim que um fã clube estiver no ar, ele aparece aqui."
            }
            action={
              !session || role === "master" ? (
                <Link href="/admin/fas-clubes" className="rounded-lg border border-adm-line bg-white px-4 py-3 text-sm font-semibold text-adm-ink no-underline">
                  Abrir admin da plataforma
                </Link>
              ) : undefined
            }
          />
        )}

        {(panels.length > 0 || session) && (
          <section aria-labelledby="paineis-titulo" className="flex flex-col gap-3">
            <h2 id="paineis-titulo" className="m-0 text-base font-bold">
              Painéis e conta
            </h2>
            {panels.length === 0 && (
              <AdminEmpty title="Nenhum painel para você" text="Sua conta não administra nenhum fã clube. Use a área do fã normalmente." />
            )}
            <nav aria-label="Painéis e conta" className="flex flex-wrap gap-3">
              {panels.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="inline-flex min-h-11 items-center rounded-lg border border-adm-line bg-white px-4 text-sm font-semibold text-adm-ink no-underline"
                >
                  {p.label}
                </Link>
              ))}
              {session && (
                <>
                  <Link
                    href="/conta"
                    className="inline-flex min-h-11 items-center rounded-lg border border-adm-line bg-white px-4 text-sm font-semibold text-adm-ink no-underline"
                  >
                    Minha conta
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-4 font-adm text-sm font-semibold text-adm-danger"
                    >
                      Sair
                    </button>
                  </form>
                </>
              )}
            </nav>
          </section>
        )}
      </div>
    </main>
  );
}
