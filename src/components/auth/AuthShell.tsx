import Link from "next/link";
import type { ReactNode } from "react";
import { PlatformBrand } from "@/components/PlatformBrand";
import { Eyebrow, StripeBand } from "@/components/fan/decor";
import { platform } from "@/lib/platform";
import { themeStyle } from "@/lib/themes";
import type { Artist } from "@/lib/types";
import { AuthLookProvider } from "./look";
import { authUi } from "./ui";

export { Field, FormError } from "./look";

/**
 * Moldura das telas de login, cadastro, minha conta e senha.
 *
 * Com `artist`, usa o tema do fã clube (a pessoa veio do ambiente daquele artista).
 * Sem, usa o visual neutro da plataforma.
 */
export function AuthShell({
  title,
  description,
  artist,
  children,
  footer,
}: {
  title: string;
  description: string;
  artist?: Artist | null;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (artist) {
    return (
      <AuthLookProvider look="artist">
        <main
          style={themeStyle(artist.theme)}
          className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4 py-10 font-body text-ink"
        >
          <div className="flex w-full max-w-[420px] flex-col gap-6">
            <Link href={`/${artist.slug}`} className="flex items-center gap-3 self-start no-underline">
              <span className="flex size-12 flex-none items-center justify-center rounded-full border-2 border-ink bg-accent font-display text-[22px] text-accent-fg">
                {artist.initial}
              </span>
              <span className="flex flex-col gap-0.5">
                <Eyebrow className="text-ink-soft">Fã clube</Eyebrow>
                <strong className="font-display text-2xl font-normal leading-none text-ink">{artist.name}</strong>
              </span>
            </Link>

            <section className="shadow-hard flex flex-col gap-5 overflow-hidden rounded-[14px] border-2 border-ink bg-cream">
              <StripeBand className="h-2.5" />
              <div className="flex flex-col gap-5 px-6 pb-6 sm:px-7 sm:pb-7">
                <div className="flex flex-col gap-1.5">
                  <h1 className="m-0 font-display text-[30px] font-normal leading-none">{title}</h1>
                  <p className="m-0 text-[15px] leading-snug text-ink-soft">{description}</p>
                </div>
                {children}
              </div>
            </section>

            {footer && <div className="text-center text-sm text-ink-soft">{footer}</div>}
            <p className="m-0 text-center font-label text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              {platform.name}
            </p>
          </div>
        </main>
      </AuthLookProvider>
    );
  }

  return (
    <AuthLookProvider look="platform">
      <main className="flex min-h-dvh flex-col items-center justify-center bg-adm-bg px-4 py-10 font-adm text-adm-ink">
        <div className="flex w-full max-w-[420px] flex-col gap-6">
          <PlatformBrand size="lg" />

          <section className="flex flex-col gap-5 rounded-[14px] border border-adm-line bg-white p-6 shadow-[0_8px_30px_rgba(20,23,28,.06)] sm:p-7">
            <div className="flex flex-col gap-1">
              <h1 className="m-0 text-2xl font-bold">{title}</h1>
              <p className="m-0 text-[14px] text-adm-muted">{description}</p>
            </div>
            {children}
          </section>

          {footer && <div className="text-center text-sm text-adm-muted">{footer}</div>}
        </div>
      </main>
    </AuthLookProvider>
  );
}

/** Classes de link e botão secundário para componentes de servidor (que não usam o hook). */
export const authLook = (artist?: Artist | null) => authUi[artist ? "artist" : "platform"];
