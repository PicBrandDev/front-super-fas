import { logout } from "@/app/actions/auth";
import { authEnabled } from "@/lib/auth";
import { getMySponsor, getSession } from "@/lib/api";
import { initialsOf } from "@/lib/shell";
import { SponsorNav } from "./SponsorNav";

export default async function SponsorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // O admin master também pode abrir o portal (sem marca própria).
  const sponsor = !session || session.role === "sponsor" ? await getMySponsor() : null;
  const name = sponsor?.brand && sponsor.brand !== "—" ? sponsor.brand : (session?.name ?? "[Marca A]");

  return (
    <div className="flex min-h-dvh flex-col bg-adm-bg font-adm text-adm-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-adm-line bg-white px-4 py-3.5 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="flex size-[34px] items-center justify-center rounded-lg bg-adm-blue font-bold text-white">
            S
          </span>
          <span className="flex flex-col">
            <strong className="text-sm">Super Fãs · Mídia</strong>
            <span className="font-adm-mono text-[11px] text-adm-muted">Portal do patrocinador</span>
          </span>
        </div>
        <nav aria-label="Conta" className="flex flex-wrap items-center gap-1.5">
          <SponsorNav />
          <span className="ml-2 flex items-center gap-2 border-l border-adm-line pl-3">
            <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-adm-ink text-xs font-bold text-white">
              {initialsOf(name)}
            </span>
            <span className="text-sm font-semibold">{name}</span>
          </span>
          {authEnabled() && (
            <form action={logout}>
              <button
                type="submit"
                className="flex min-h-11 cursor-pointer items-center rounded-lg border-0 bg-transparent px-3 font-adm text-sm font-medium text-adm-muted hover:bg-adm-bg hover:text-adm-ink"
              >
                Sair
              </button>
            </form>
          )}
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-6 px-4 pb-10 pt-7 sm:px-7">{children}</main>
    </div>
  );
}
