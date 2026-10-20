/** Formatação compartilhada (pode ser usada em componentes de cliente). */
export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatCount = (n: number) => n.toLocaleString("pt-BR");
