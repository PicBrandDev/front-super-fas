import { roleLabel } from "./auth";
import { getMe, getSession } from "./api";
import { initialsOf } from "./format";

export type ShellUser = { initials: string; name: string; role: string; avatar?: string | null };

export { initialsOf };

/** Nome e papel de quem está logado, para o rodapé dos painéis. Sem login (modo exemplo) usa o fallback. */
export async function shellUser(fallback: ShellUser): Promise<ShellUser> {
  const s = await getSession();
  if (!s) return fallback;
  // A foto de perfil de quem está logado aparece no rodapé; se a API falhar, fica só a inicial.
  const me = await getMe().catch(() => null);
  return { initials: initialsOf(s.name), name: s.name, role: roleLabel[s.role], avatar: me?.avatar ?? null };
}
