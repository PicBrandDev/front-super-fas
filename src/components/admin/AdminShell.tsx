import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

export type AdminNavItem = { key: string; label: string; href: string; icon: IconName };

/**
 * Casca dos painéis administrativos (visual neutro da plataforma).
 * Usada pelo admin master e pelo admin de cada fã clube.
 */
export function AdminShell({
  brand,
  nav,
  active,
  extraLink,
  user,
  children,
}: {
  brand: { mark: ReactNode; title: string; subtitle: string; markClass?: string };
  nav: AdminNavItem[];
  active: string;
  extraLink?: { label: string; href: string };
  user: { initials: string; name: string; role: string };
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-wrap bg-adm-bg font-adm text-adm-ink">
      <aside className="flex flex-[1_1_220px] flex-col gap-[22px] bg-adm-side px-3.5 py-5 text-adm-side-text lg:sticky lg:top-0 lg:h-dvh lg:max-w-[260px]">
        <div className="flex items-center gap-2.5 px-1.5">
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
        <div className="mt-auto flex items-center gap-2.5 border-t border-adm-side-line px-1.5 py-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-adm-side-line text-[13px] font-semibold">
            {user.initials}
          </span>
          <span className="flex flex-col">
            <strong className="text-[13px]">{user.name}</strong>
            <span className="font-adm-mono text-[11px] text-adm-side-muted">{user.role}</span>
          </span>
        </div>
      </aside>
      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-5 px-4 pb-10 pt-7 sm:px-8">{children}</main>
    </div>
  );
}

/** Cabeçalho de página do admin. */
export function AdminPageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[28px] font-bold">{title}</h1>
        <p className="m-0 max-w-[640px] text-[15px] text-adm-muted">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export const masterNav: AdminNavItem[] = [
  { key: "fas-clubes", label: "Fã clubes", href: "/admin/fas-clubes", icon: "users" },
  { key: "midia", label: "Plataforma de mídia", href: "/admin/midia", icon: "megaphone" },
  { key: "usuarios", label: "Usuários", href: "#", icon: "user" },
  { key: "financeiro", label: "Financeiro", href: "#", icon: "chart" },
  { key: "config", label: "Configurações", href: "#", icon: "settings" },
];

export function clubNav(slug: string): AdminNavItem[] {
  return [
    { key: "geral", label: "Visão geral", href: "#", icon: "home" },
    { key: "membros", label: "Membros", href: `/${slug}/admin/membros`, icon: "users" },
    { key: "mural", label: "Drop News e mural", href: "#", icon: "news" },
    { key: "agenda", label: "Agenda e eventos", href: "#", icon: "calendar" },
    { key: "pickap", label: "PicKap e sorteios", href: "#", icon: "wheel" },
    { key: "loja", label: "Loja", href: "#", icon: "bag" },
  ];
}
