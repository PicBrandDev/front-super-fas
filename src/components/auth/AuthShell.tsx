import Link from "next/link";
import type { ReactNode } from "react";
import { PlatformBrand } from "@/components/PlatformBrand";
import { Mark } from "@/components/fan/Mark";
import { platform } from "@/lib/platform";
import { themeStyle } from "@/lib/themes";
import type { Artist } from "@/lib/types";
import { AuthLookProvider } from "./look";
import { authUi } from "./ui";

export { Field, FormError } from "./look";

/**
 * Moldura das telas de login, cadastro, minha conta e senha.
 *
 * Com `artist`, usa o tema do fã clube (a pessoa veio do ambiente daquele artista):
 * sistema Noite, plano e angular, âmbar só no título e no botão primário.
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
          className="fan flex min-h-dvh flex-col items-center bg-night px-4 py-8 font-grotesk text-base leading-6 text-fg scheme-dark sm:justify-center sm:py-12"
        >
          <div className="flex w-full max-w-[420px] flex-col gap-8">
            <Link href={`/${artist.slug}`} className="flex min-h-11 items-center gap-3 self-start text-fg no-underline">
              <Mark size={44} className="flex-none text-amber" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="poster text-[28px] leading-7">{artist.name}</span>
                <span className="mono">Fã clube</span>
              </span>
            </Link>

            <div className="flex flex-col gap-3">
              <h1 className="m-0 font-display text-[56px] leading-[52px] font-black text-amber-text [overflow-wrap:anywhere]">
                {title}
              </h1>
              <p className="m-0 max-w-[34ch] text-[15px] leading-[22px] text-fg-muted">{description}</p>
            </div>

            <section className="border-t border-line pt-6">{children}</section>

            {footer && <div className="flex flex-col items-start gap-3 text-[14px] leading-5 text-fg-muted">{footer}</div>}
            <p className="mono m-0">{platform.name}</p>
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
