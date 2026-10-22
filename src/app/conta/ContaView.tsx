import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { AuthShell, authLook } from "@/components/auth/AuthShell";
import { authEnabled, homeFor, roleLabel } from "@/lib/auth";
import { getMe, getSession, listArtists } from "@/lib/api";
import { MyAvatar } from "./MyAvatar";

/** Minha conta. Com `slug`, é a conta dentro do ambiente de um artista (`/{artista}/conta`). */
export async function ContaView({ slug }: { slug: string | null }) {
  const session = await getSession();
  if (!session) {
    if (authEnabled()) redirect(slug ? `/${slug}/login` : "/");
    return (
      <AuthShell title="Minha conta" description="Modo exemplo: o login só funciona com o front ligado à API.">
        <Link href="/" className={`${authLook().secondary} no-underline`}>
          Voltar
        </Link>
      </AuthShell>
    );
  }
  const [artists, me] = await Promise.all([listArtists(), getMe()]);
  const artist = artists.find((a) => a.slug === slug) ?? null;
  const ui = authLook(artist);
  const item = `${ui.secondary} justify-start no-underline`;
  const panel = homeFor(session);

  return (
    <AuthShell artist={artist} title={session.name} description={roleLabel[session.role]}>
      <div className="mb-4">
        <MyAvatar avatar={me?.avatar ?? null} name={session.name} />
      </div>
      <nav aria-label="Atalhos da conta" className="flex flex-col gap-2">
        {artist && (
          <Link href={`/${artist.slug}`} className={item}>
            Voltar para o fã clube {artist.name}
          </Link>
        )}
        {session.role !== "fan" && (
          <Link href={panel} className={item}>
            Ir para o meu painel
          </Link>
        )}
        {session.role === "artist_admin" && panel !== "/painel" && session.clubs.length > 1 && (
          <Link href="/painel" className={item}>
            Todos os meus painéis
          </Link>
        )}
        {artists
          .filter((a) => a.slug !== artist?.slug)
          .map((a) => (
            <Link key={a.slug} href={`/${a.slug}`} className={item}>
              Fã clube {a.name}
            </Link>
          ))}
        <Link href={artist ? `/${artist.slug}/conta/senha` : "/conta/senha"} className={item}>
          Trocar senha
        </Link>
        <form action={logout}>
          <button type="submit" className={`${ui.secondary} w-full justify-start ${artist ? "" : "text-adm-danger"}`}>
            Sair
          </button>
        </form>
      </nav>
    </AuthShell>
  );
}
