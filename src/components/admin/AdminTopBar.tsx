import { Masthead, type MastTone } from "@/components/fan/Masthead";
import type { BrandKey } from "@/lib/brands";

/**
 * Cabeçalho do painel do ambiente: a mesma arte do topo do app do fã, com o nome da seção em caixa alta cortado
 * pela borda da tela (a palavra desliza ao trocar de seção).
 */
export function AdminTopBar({ word, brand, tone = "night" }: { word: string; brand: BrandKey; tone?: MastTone }) {
  return (
    <div className="-mx-4 -mt-7 sm:-mx-8">
      <Masthead word={word} brand={brand} tone={tone} heading={false} />
    </div>
  );
}
