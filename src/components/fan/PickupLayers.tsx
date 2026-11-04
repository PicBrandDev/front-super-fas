import type { InAppAd } from "@/lib/ads";
import { brandStyle } from "@/lib/brand-style";
import { AdTrack } from "./AdTrack";
import { adLinkProps } from "./FeedAd";

/**
 * As camadas patrocinadas da roleta: até 4 marcas, da 1ª à 4ª. Só entram as camadas alugadas (nenhuma alugada, nada na tela).
 * Cada camada é uma fatia com a marca e o prêmio ou cupom, e o toque abre a campanha em outra aba.
 */
export function PickupLayers({ ads }: { ads: InAppAd[] }) {
  if (!ads.length) return null;
  return (
    <section aria-label="Patrocinadores da roleta" className="flex flex-col gap-2">
      <span className="mono">Patrocinadores da roleta</span>
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
        {ads.slice(0, 4).map((ad, i) => {
          const st = brandStyle(ad.sponsor);
          return (
            <li key={ad.id}>
              <AdTrack id={ad.id}>
                <a
                  {...adLinkProps(ad.url)}
                  aria-label={`${ad.sponsor}: ${ad.title}. Patrocinado.`}
                  className="grid min-h-[96px] content-between gap-1 rounded-field p-3 no-underline"
                  style={{ background: st.bg, color: st.fg }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">Camada {i + 1} · Patrocinado</span>
                  <strong className="text-[15px] font-extrabold leading-[18px]">{ad.sponsor}</strong>
                  <span className="text-xs leading-4 opacity-90">{ad.title}</span>
                </a>
              </AdTrack>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
