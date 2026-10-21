import { roleLabel } from "./auth";
import { getSession } from "./api";
import { initialsOf } from "./format";

export type ShellUser = { initials: string; name: string; role: string };

export { initialsOf };

/** Nome e papel de quem está logado, para o rodapé dos painéis. Sem login (modo exemplo) usa o fallback. */
export async function shellUser(fallback: ShellUser): Promise<ShellUser> {
  const s = await getSession();
  if (!s) return fallback;
  return { initials: initialsOf(s.name), name: s.name, role: roleLabel[s.role] };
}
