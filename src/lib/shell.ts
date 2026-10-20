import { roleLabel } from "./auth";
import { getSession } from "./api";

export type ShellUser = { initials: string; name: string; role: string };

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

/** Nome e papel de quem está logado, para o rodapé dos painéis. Sem login (modo exemplo) usa o fallback. */
export async function shellUser(fallback: ShellUser): Promise<ShellUser> {
  const s = await getSession();
  if (!s) return fallback;
  return { initials: initialsOf(s.name), name: s.name, role: roleLabel[s.role] };
}
