import type { ReactNode } from "react";
import { FALLBACK_BRAND as FALLBACK, brandStyle } from "@/lib/brand-style";
import type { VitrineBooking } from "@/lib/types";

/** O desenho de posição das vitrines usa pixels de um celular de 96 px de altura: aqui vira porcentagem da tela. */
const pct = (px: number) => Math.round((px / 96) * 100);

/** O anúncio em si: a arte da marca (ou o fundo na cor dela), o título, o texto e o botão. */
export function AdBanner({ b, compact = false }: { b: VitrineBooking; compact?: boolean }) {
  const st = brandStyle(b.brand);
  return (
    <div className="relative overflow-hidden rounded-[7px]" style={{ background: st.bg, color: st.fg }}>
      {b.art && (
        // eslint-disable-next-line @next/next/no-img-element -- arte da campanha
        <img src={b.art} alt="" className={`block w-full object-cover ${compact ? "h-[44px]" : "h-[84px]"}`} />
      )}
      <div className="flex flex-col gap-[2px] p-[6px]">
        {!b.art && <strong className="text-[11px] font-black uppercase leading-[11px] tracking-wide">{b.brand}</strong>}
        <strong className="text-[8.5px] font-extrabold leading-[10px]">{b.title}</strong>
        {!compact && b.text && <span className="text-[7px] leading-[9px] opacity-90">{b.text}</span>}
        {b.cta && (
          <span className="mt-[2px] inline-block self-start rounded-full px-[6px] py-[2px] text-[7px] font-bold" style={{ background: st.accent, color: st.bg }}>
            {b.cta}
          </span>
        )}
      </div>
      <span className="absolute right-[4px] top-[4px] rounded-[3px] bg-black/55 px-[3px] py-[1px] text-[5.5px] font-semibold uppercase tracking-wider text-white">Patrocinado</span>
    </div>
  );
}

/** Marcador da vitrine livre: "Sua marca aqui". */
function Empty({ label = "Sua marca aqui" }: { label?: string }) {
  return (
    <div className="flex h-[58px] items-center justify-center rounded-[7px] border border-dashed border-white/35 text-[8px] font-semibold uppercase tracking-wider text-white/60">{label}</div>
  );
}

const Skeleton = ({ tall = false }: { tall?: boolean }) => (
  <div className="flex flex-col gap-[4px] rounded-[6px] bg-white/[0.07] p-[6px]">
    <div className="flex items-center gap-[4px]">
      <span className="size-[10px] rounded-full bg-white/25" />
      <span className="h-[3px] w-[40px] rounded bg-white/25" />
    </div>
    <div className={`${tall ? "h-[46px]" : "h-[24px]"} rounded-[4px] bg-white/10`} />
    <span className="h-[3px] w-[80%] rounded bg-white/20" />
  </div>
);

function Screen({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div role="img" aria-label={label} className="h-[330px] w-[168px] flex-none rounded-[26px] border-[3px] border-adm-side-line bg-black p-[5px]">
        <div className="relative flex h-full flex-col gap-[6px] overflow-hidden rounded-[20px] bg-[#16120f] p-[7px] pt-[14px]">
          <span aria-hidden="true" className="absolute left-1/2 top-[4px] h-[3px] w-[28px] -translate-x-1/2 rounded-full bg-white/25" />
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Celular com o anúncio no lugar em que ele aparece: modal de entrada, card do Início, post no mural, nos fã clubes e nas notícias,
 * as 4 camadas da roleta, os vídeos antes de girar e ao pegar o brinde, o topo da loja e a tela depois da compra. Sem anúncio, o lugar aparece vazio ("Sua marca aqui").
 */
export function BannerPhone({ group, vitrineKey, booking, top, height }: { group: string; vitrineKey: string; booking: VitrineBooking | null; top: number; height: number }) {
  const base = vitrineKey.split(".").pop() ?? vitrineKey;
  const label = booking ? `Celular com o anúncio de ${booking.brand || "uma marca"}` : "Celular com a vitrine livre";
  const st = booking ? brandStyle(booking.brand) : FALLBACK;
  const shown = booking && (booking.brand || booking.title);
  const ad = shown ? <AdBanner b={booking} /> : <Empty label={booking ? "Ocupada" : "Sua marca aqui"} />;
  const adCompact = shown ? <AdBanner b={booking} compact /> : <Empty label={booking ? "Ocupada" : "Sua marca aqui"} />;

  if (group === "entrada") {
    return (
      <Screen label={label}>
        <Skeleton tall />
        <Skeleton />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[6px] bg-black/70 p-[10px]">
          <div className="w-full rounded-[10px] bg-[#201a15] p-[6px] shadow-lg">{ad}</div>
          <span className="text-[7px] font-semibold text-white/70">Fechar</span>
        </div>
      </Screen>
    );
  }

  if (base === "pickup_video") {
    return (
      <Screen label={label}>
        <div className="flex items-center justify-between text-[7px] font-semibold text-white/70">
          <span className="rounded bg-white/15 px-[4px] py-[1px] uppercase">Anúncio</span>
          <span>0:30</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-[6px] rounded-[8px] p-[8px] text-center" style={{ background: shown ? st.bg : "#2a241e", color: shown ? st.fg : "#9a8f84" }}>
          <span className="flex size-[28px] items-center justify-center rounded-full bg-black/35 text-[11px]">▶</span>
          <strong className="text-[11px] font-black uppercase leading-[11px]">{shown ? booking.brand : booking ? "Ocupada" : "Seu vídeo aqui"}</strong>
          {shown && <span className="text-[8px] font-bold leading-[10px]">{booking.title}</span>}
        </div>
        <div className="h-[3px] overflow-hidden rounded bg-white/15">
          <span className="block h-full w-[35%] bg-white/70" />
        </div>
        <span className="rounded-full bg-white/10 py-[4px] text-center text-[7px] font-semibold text-white/55">Girar em 30 s</span>
      </Screen>
    );
  }

  if (base === "pickup_resgate") {
    return (
      <Screen label={label}>
        <div className="flex items-center justify-between text-[7px] font-semibold text-white/70">
          <span className="rounded bg-white/15 px-[4px] py-[1px] uppercase">Anúncio</span>
          <span>0:30</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-[6px] rounded-[8px] p-[8px] text-center" style={{ background: shown ? st.bg : "#2a241e", color: shown ? st.fg : "#9a8f84" }}>
          <span className="flex size-[28px] items-center justify-center rounded-full bg-black/35 text-[11px]">▶</span>
          <strong className="text-[11px] font-black uppercase leading-[11px]">{shown ? booking.brand : booking ? "Ocupada" : "Seu vídeo aqui"}</strong>
          {shown && <span className="text-[8px] font-bold leading-[10px]">{booking.title}</span>}
        </div>
        <span className="text-center text-[6.5px] font-semibold uppercase tracking-wider text-[#F2C14E]">Você ganhou um brinde</span>
        <span className="rounded-full bg-[#F2C14E] py-[4px] text-center text-[7px] font-extrabold text-black">Pegar meu brinde</span>
      </Screen>
    );
  }

  const layer = /^pickup(?:_([234]))?$/.exec(base);
  if (layer) {
    const n = Number(layer[1] ?? 1);
    return (
      <Screen label={label}>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div
            className="relative size-[100px] rounded-full border-[3px] border-white/20"
            style={{ background: "conic-gradient(#3a332b 0 51deg, #2b2620 51deg 102deg, #3a332b 102deg 154deg, #2b2620 154deg 205deg, #3a332b 205deg 257deg, #2b2620 257deg 308deg, #3a332b 308deg 360deg)" }}
          >
            <span className="absolute left-1/2 top-1/2 flex size-[24px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#16120f] text-[6px] font-extrabold text-[#F2C14E]">PicKup</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[4px]">
          {[1, 2, 3, 4].map((k) => (
            <div
              key={k}
              className={`flex h-[36px] flex-col justify-center rounded-[6px] px-[5px] text-[6.5px] font-bold leading-[8px] ${k === n ? "" : "bg-white/[0.07] text-white/40"}`}
              style={k === n ? { background: shown ? st.bg : "#5c5247", color: shown ? st.fg : "#e5ded5" } : undefined}
            >
              <span className="uppercase opacity-80">Camada {k}</span>
              {k === n && <span className="text-[7.5px] font-black uppercase">{shown ? booking.brand : booking ? "Ocupada" : "Livre"}</span>}
            </div>
          ))}
        </div>
      </Screen>
    );
  }

  if (base === "home") {
    return (
      <Screen label={label}>
        <Skeleton tall />
        {ad}
        <Skeleton />
        <Skeleton />
      </Screen>
    );
  }

  if (base === "mural") {
    return (
      <Screen label={label}>
        <Skeleton />
        {adCompact}
        <Skeleton />
        {adCompact}
        <Skeleton />
      </Screen>
    );
  }

  if (base === "feed_clubes") {
    return (
      <Screen label={label}>
        <Skeleton />
        <Skeleton />
        {ad}
        <Skeleton />
        <Skeleton />
      </Screen>
    );
  }

  if (base === "noticias") {
    return (
      <Screen label={label}>
        <Skeleton />
        <Skeleton />
        {ad}
        <span className="text-center text-[6.5px] font-semibold uppercase tracking-wider text-white/50">Posição sorteada</span>
        <Skeleton />
      </Screen>
    );
  }

  if (base === "loja") {
    return (
      <Screen label={label}>
        <span className="rounded-[6px] bg-white/10 py-[3px] text-center text-[7px] font-bold uppercase tracking-wider text-white/60">Loja</span>
        {ad}
        <div className="grid grid-cols-2 gap-[5px]">
          <Skeleton tall />
          <Skeleton tall />
        </div>
        <div className="grid grid-cols-2 gap-[5px]">
          <Skeleton tall />
          <Skeleton tall />
        </div>
      </Screen>
    );
  }

  if (base === "loja_compra") {
    return (
      <Screen label={label}>
        <div className="flex flex-1 flex-col items-center justify-center gap-[4px] text-center">
          <span className="rounded-full bg-[#F2C14E] px-[7px] py-[2px] text-[7px] font-extrabold uppercase text-black">Compra confirmada</span>
          <strong className="text-[12px] font-black text-white">Pedido 4F7K2</strong>
          <span className="text-[7px] text-white/60">Camiseta · retire no show</span>
        </div>
        {ad}
        <span className="rounded-full bg-white/15 py-[4px] text-center text-[7px] font-bold text-white">Tentar a roleta</span>
      </Screen>
    );
  }

  if (group === "feed") {
    return (
      <Screen label={label}>
        <Skeleton tall />
        {ad}
        <Skeleton />
        <Skeleton />
      </Screen>
    );
  }

  // outras telas (home, evento, loja, drops): o banner no mesmo lugar do desenho de posição
  return (
    <Screen label={label}>
      <div className="relative flex-1">
        <div className="absolute inset-x-0 flex flex-col gap-[5px]" style={{ top: 0 }}>
          <Skeleton />
        </div>
        <div className="absolute inset-x-0" style={{ top: `${Math.min(pct(top), 70)}%`, minHeight: `${Math.max(pct(height), 14)}%` }}>
          {ad}
        </div>
      </div>
    </Screen>
  );
}

/** Celular com o lugar da vitrine marcado em azul (a mesma posição do desenho que o patrocinador vê ao escolher). */
export function PlacementPhone({ top, height }: { top: number; height: number }) {
  return (
    <Screen label={`Celular com a vitrine marcada a ${pct(top)}% do topo`}>
      <div className="relative flex-1">
        <div className="absolute inset-x-0 top-0 flex flex-col gap-[6px]">
          <Skeleton />
          <Skeleton tall />
          <Skeleton />
          <Skeleton />
        </div>
        <div
          className="absolute inset-x-[-2px] flex items-center justify-center rounded-[6px] border-2 border-[#5B86FF] bg-[#2F5BD3]/80 text-[8px] font-bold uppercase tracking-wider text-white"
          style={{ top: `${Math.min(pct(top), 88)}%`, height: `${Math.max(pct(height), 12)}%` }}
        >
          Vitrine
        </div>
      </div>
    </Screen>
  );
}
