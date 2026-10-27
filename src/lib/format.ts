/** Formatação compartilhada (pode ser usada em componentes de cliente). */
export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Pontos do ranking: sempre com 3 casas (ex.: 12,372), para quase não haver empate. */
export const formatPoints = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
export const formatCount = (n: number) => n.toLocaleString("pt-BR");

/** Iniciais de um nome ("Marina Costa" → "MC"); vale em cliente e servidor. */
export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

/** Contador curto do protótipo: 2400 → "2,4 mil", 318 → "318". */
export const formatShort = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "").replace(".", ",")} mil` : String(n);
