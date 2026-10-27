import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { Icon, type IconName } from "@/components/icons";
import { PlatformBrand } from "@/components/PlatformBrand";
import { authEnabled } from "@/lib/auth";

export type AdminNavItem = { key: string; label: string; href: string; icon: IconName };

/**
 * Casca dos painéis administrativos (visual neutro da plataforma, white label).
 * Sem `brand`, mostra a marca da plataforma (admin master); os painéis de
 * artista e de fã clube passam a marca deles.
 */
export function AdminShell({
  brand,
  subtitle,
  nav,
  active,
  extraLink,
  user,
  className = "",
  style,
  passwordHref = "/conta/senha",
  children,
}: {
  brand?: { mark: ReactNode; title: string; subtitle: string; markClass?: string };
  subtitle?: string; // legenda da marca da plataforma (quando não há `brand`)
  nav: AdminNavItem[];
  active: string;
  extraLink?: { label: string; href: string };
  user: { initials: string; name: string; role: string };
  className?: string; // ex.: "adm-noite" para o visual do artista
  style?: CSSProperties; // variáveis do tema do artista
  passwordHref?: string; // trocar senha (dentro do ambiente do artista, quando houver)
  children: ReactNode;
}) {
  return (
    <div style={style} className={`flex min-h-dvh flex-wrap bg-adm-bg font-adm text-adm-ink ${className}`}>
      <aside className="flex flex-[1_1_220px] flex-col gap-[22px] bg-adm-side px-3.5 py-5 text-adm-side-text lg:sticky lg:top-0 lg:h-dvh lg:max-w-[260px]">
        <div className="px-1.5">
          {brand ? (
            <div className="flex items-center gap-2.5">
              <span
                className={`flex size-[34px] items-center justify-center rounded-lg font-bold ${brand.markClass ?? "bg-adm-blue text-white"}`}
              >
                {brand.mark}
              </span>
              <span className="flex flex-col">
                <strong className="text-sm">{brand.title}</strong>
                <span className="font-adm-mono text-[11px] text-adm-side-muted">{brand.subtitle}</span>
              </span>
            </div>
          ) : (
            <PlatformBrand tone="dark" subtitle={subtitle ?? "Admin da plataforma"} />
          )}
        </div>
        <nav aria-label="Menu do painel" className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const on = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm no-underline ${
                  on ? "bg-adm-blue font-semibold text-white" : "font-medium text-adm-side-text hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {extraLink && (
          <Link
            href={extraLink.href}
            className="flex min-h-11 items-center gap-2.5 rounded-lg border border-adm-side-line px-3 text-[13px] text-adm-side-text no-underline hover:bg-white/5"
          >
            <Icon name="external" size={16} />
            {extraLink.label}
          </Link>
        )}
        <div className="mt-auto flex flex-col gap-1 border-t border-adm-side-line pt-2.5">
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <span className="flex size-8 flex-none items-center justify-center rounded-full bg-adm-side-line text-[13px] font-semibold">
              {user.initials}
            </span>
            <span className="flex min-w-0 flex-col">
              <strong className="truncate text-[13px]">{user.name}</strong>
              <span className="font-adm-mono text-[11px] text-adm-side-muted">{user.role}</span>
            </span>
          </div>
          {authEnabled() && <AccountLinks passwordHref={passwordHref} />}
        </div>
      </aside>
      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-5 px-4 pb-10 pt-7 sm:px-8">{children}</main>
    </div>
  );
}

/** Cabeçalho de página do admin. */
export function AdminPageHeader({
  title,
  description,
  actions,
  headingId,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  headingId?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 id={headingId} className="m-0 text-[28px] font-bold">
          {title}
        </h1>
        <p className="m-0 max-w-[640px] text-[15px] text-adm-muted">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export const masterNav: AdminNavItem[] = [
  { key: "fas-clubes", label: "Fã clubes", href: "/admin/fas-clubes", icon: "users" },
  { key: "midia", label: "Plataforma de mídia", href: "/admin/midia", icon: "megaphone" },
];

/** Menu da administração do ambiente do cantor (equipe do fã clube master). */
export function clubNav(slug: string): AdminNavItem[] {
  const base = `/${slug}/admin`;
  return [
    { key: "painel", label: "Painel dos fã clubes", href: base, icon: "star" },
    { key: "destaques", label: "Destaques dos clubes", href: `${base}/destaques`, icon: "chart" },
    { key: "membros", label: "Assinantes", href: `${base}/membros`, icon: "users" },
    { key: "mural", label: "Drop News", href: `${base}/mural`, icon: "news" },
    { key: "agenda", label: "Agenda e eventos", href: `${base}/agenda`, icon: "calendar" },
    { key: "loja", label: "Loja", href: `${base}/loja`, icon: "bag" },
    { key: "drops", label: "Drops Hits", href: `${base}/drops`, icon: "music" },
    { key: "vitrines", label: "Vitrines alugadas", href: `${base}/vitrines`, icon: "megaphone" },
    { key: "ranking", label: "Ranking Fã Super", href: `${base}/ranking`, icon: "star" },
  ];
}

/** Menu do painel de um fã clube (dono e ajudantes). */
export function fanClubNav(slug: string, club: string): AdminNavItem[] {
  const base = `/${slug}/clubes/${club}/admin`;
  return [
    { key: "visao", label: "Visão geral", href: base, icon: "chart" },
    { key: "mural", label: "Posts do fã clube", href: `${base}/mural`, icon: "news" },
    { key: "pickup", label: "PicKup", href: `${base}/pickup`, icon: "wheel" },
    { key: "anuncios", label: "Anúncios", href: `${base}/anuncios`, icon: "megaphone" },
    { key: "equipe", label: "Equipe", href: `${base}/equipe`, icon: "user" },
    { key: "dados", label: "Dados do clube", href: `${base}/dados`, icon: "settings" },
  ];
}

/** Trocar senha e sair (só quando o login está ligado). */
function AccountLinks({ passwordHref }: { passwordHref: string }) {
  const item = "flex min-h-10 flex-1 items-center justify-center rounded-lg px-2 text-[13px] text-adm-side-text no-underline hover:bg-white/5";
  return (
    <div className="flex gap-1">
      <Link href={passwordHref} className={item}>
        Trocar senha
      </Link>
      <form action={logout} className="flex flex-1">
        <button type="submit" className={`${item} cursor-pointer border-0 bg-transparent font-adm`}>
          Sair
        </button>
      </form>
    </div>
  );
}
