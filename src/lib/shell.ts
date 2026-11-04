import { roleLabel } from "./auth";
import { getMe, getSession } from "./api";
import { initialsOf } from "./format";

export type ShellUser = { initials: string; name: string; role: string; email?: string; avatar?: string | null; verified?: boolean };

export { initialsOf };

/** Nome e papel de quem está logado, para o rodapé dos painéis. Sem login (modo exemplo) usa o fallback. */
export async function shellUser(fallback: ShellUser): Promise<ShellUser> {
  const s = await getSession();
  if (!s) return fallback;
  // A foto de perfil de quem está logado aparece no rodapé; se a API falhar, fica só a inicial.
  const me = await getMe().catch(() => null);
  // O nome vem da API (o cookie guarda o do login e não acompanha uma troca de nome).
  const name = me?.name ?? s.name;
  return { initials: initialsOf(name), name, role: roleLabel[s.role], email: me?.email, avatar: me?.avatar ?? null, verified: me?.verified ?? false };
}
