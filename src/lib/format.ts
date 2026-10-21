/** Formatação compartilhada (pode ser usada em componentes de cliente). */
export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
