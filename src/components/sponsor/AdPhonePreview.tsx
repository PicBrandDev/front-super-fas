/* eslint-disable @next/next/no-img-element -- a arte vem de um arquivo local escolhido agora (blob:) */
import type { CSSProperties, ReactNode } from "react";

export type PhoneAd = {
  sponsor: string;
  title: string;
  text: string;
  cta: string;
  art: string | null;
  /** Vídeo da vitrine "pickup_video" (arquivo local blob: ou link). */
  video?: string | null;
};

type Screen = "home" | "mural" | "evento" | "pickup" | "loja" | "drops" | "entrada" | "pickup_video" | "pickup_resgate";

const SCREENS: Record<Screen, string> = {
  home: "Início",
  mural: "Mural",
  evento: "Tela do evento",
  pickup: "PicKup",
  loja: "Loja",
  drops: "Drops Hits",
  entrada: "Início",
  pickup_video: "PicKup",
  pickup_resgate: "PicKup",
};

/** Momento da tela em que o anúncio aparece (para as vitrines em janela). */
const MOMENTS: Partial<Record<Screen, string>> = {
  entrada: "ao abrir o app",
  pickup_video: "antes de girar",
  pickup_resgate: "ao ganhar um prêmio",
};

/** A vitrine "oficial.home" ou "home" aponta para a tela "home". */
const screenOf = (slotId: string | null): Screen => {
  const k = (slotId ?? "").split(".").pop() as Screen;
  return k in SCREENS ? k : "home";
};

const block = "rounded-lg bg-fg/10";

function Line({ w = "100%", h = 6 }: { w?: string; h?: number }) {
  return <span className="block rounded-full bg-fg/15" style={{ width: w, height: h }} />;
}

/** Marca o lugar do anúncio na tela. */
function Mark({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-xl outline outline-2 outline-offset-2 outline-[#3b82f6]">
      <span className="absolute -top-2.5 left-2 z-10 rounded-full bg-[#3b82f6] px-1.5 py-px text-[8px] font-bold uppercase text-white">Seu anúncio</span>
      {children}
    </div>
  );
}

function Art({ ad, className }: { ad: PhoneAd; className: string }) {
  return ad.art ? (
    <img src={ad.art} alt="" className={`${className} object-cover`} />
  ) : (
    <span className={`${className} flex items-center justify-center bg-fg/15 text-[10px] font-bold`}>{ad.sponsor.slice(0, 2).toUpperCase()}</span>
  );
}

function AdCardMini({ ad }: { ad: PhoneAd }) {
  return (
    <div className="flex flex-col gap-1.5 overflow-hidden rounded-xl bg-fg/10 p-2.5">
      <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase text-fg-muted">
        Patrocinado <span className="font-medium normal-case">· {ad.sponsor}</span>
      </span>
      <Art ad={ad} className="aspect-[16/9] w-full rounded-lg" />
      <strong className="text-[11px] leading-[13px]">{ad.title}</strong>
      <span className="text-[9px] leading-[11px] text-fg-muted">{ad.text}</span>
      <span className="self-start rounded-full bg-fg px-2.5 py-1 text-[9px] font-bold text-night">{ad.cta}</span>
    </div>
  );
}

function AdStrip({ ad }: { ad: PhoneAd }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-fg/10 p-2">
      <Art ad={ad} className="size-9 flex-none rounded-lg" />
      <span className="min-w-0 flex-1">
        <span className="block text-[8px] font-bold uppercase text-fg-muted">{ad.sponsor} apresenta</span>
        <strong className="block truncate text-[10px]">{ad.title}</strong>
      </span>
    </div>
  );
}

/** Linha patrocinada pequena entre os cartazes do Mural. */
function AdRowMini({ ad }: { ad: PhoneAd }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-fg/10 p-2">
      <Art ad={ad} className="size-16 flex-none rounded-lg" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[8px] font-bold uppercase text-fg-muted">Patrocinado</span>
        <span className="truncate text-[9px] font-semibold text-fg-muted">{ad.sponsor}</span>
        <strong className="truncate text-[10px] leading-3">{ad.title}</strong>
        <span className="text-[9px] font-bold underline">{ad.cta} →</span>
      </span>
    </div>
  );
}

/** Cartaz do Mural (bloco cinza). */
function Poster() {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`${block} h-28`} />
      <Line w="60%" h={6} />
    </div>
  );
}

/** Janela de baixo sobre a tela escurecida ("entrada" e "pickup_resgate"). */
function AdSheet({ ad }: { ad: PhoneAd }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/55">
      <div className="rounded-t-2xl bg-night px-3 pb-4 pt-2">
        <span className="mx-auto mb-2 block h-1 w-8 rounded-full bg-fg/25" />
        <Mark>
          <div className="flex flex-col gap-1.5 rounded-xl p-1.5">
            <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase text-fg-muted">
              Patrocinado <span className="font-medium normal-case">· {ad.sponsor}</span>
            </span>
            <Art ad={ad} className="aspect-[16/9] w-full rounded-lg" />
            <strong className="text-[12px] leading-[14px]">{ad.title}</strong>
            <span className="text-[9px] leading-[11px] text-fg-muted">{ad.text}</span>
            <span className="mt-1 block rounded-full bg-fg py-1.5 text-center text-[10px] font-bold text-night">{ad.cta}</span>
            <span className="text-center text-[9px] font-semibold text-fg-muted">Fechar</span>
          </div>
        </Mark>
      </div>
    </div>
  );
}

/** Vídeo obrigatório de 30 s em tela cheia antes do giro ("pickup_video"). */
function AdVideoOverlay({ ad }: { ad: PhoneAd }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col gap-2 bg-black/90 px-3 pb-4 pt-8 text-white">
      <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase text-white/70">
        Patrocinado <span className="font-medium normal-case">· {ad.sponsor}</span>
      </span>
      <Mark>
        <div className="relative overflow-hidden rounded-xl bg-white/10">
          {ad.video ? (
            <video src={ad.video} muted autoPlay loop playsInline aria-hidden="true" className="aspect-[9/12] w-full object-cover" />
          ) : (
            <Art ad={ad} className="aspect-[9/12] w-full" />
          )}
          <span className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-1.5 py-px font-adm-mono text-[8px] font-bold">0:30</span>
          <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <span className="block h-full w-1/3 bg-white" />
          </span>
        </div>
      </Mark>
      <strong className="text-[11px] leading-[13px]">{ad.title}</strong>
      <span className="mt-auto block rounded-full bg-white/15 py-1.5 text-center text-[10px] font-bold text-white/50">Seu giro libera em 30s</span>
      <span className="block rounded-full border border-white py-1.5 text-center text-[10px] font-bold">{ad.cta}</span>
    </div>
  );
}

function HomeScreen({ ad }: { ad?: PhoneAd }) {
  return (
    <>
      <div className={`${block} h-24 p-2.5`}>
        <Line w="40%" h={5} />
        <span className="mt-9 block"><Line w="75%" h={8} /></span>
      </div>
      {ad ? <Mark><AdCardMini ad={ad} /></Mark> : <span className={`${block} h-28`} />}
      <div className={`${block} flex flex-col gap-1.5 p-2.5`}>
        <Line w="35%" h={5} />
        <Line />
        <Line w="80%" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <span className={`${block} h-16`} />
        <span className={`${block} h-16`} />
      </div>
    </>
  );
}

function PickupScreen({ prize }: { prize?: ReactNode }) {
  return (
    <>
      <Line w="40%" h={8} />
      <div className="mx-auto size-32 rounded-full border-4 border-fg/20" style={{ background: "conic-gradient(#ffffff22 0 60deg, #ffffff10 60deg 120deg, #3b82f6 120deg 180deg, #ffffff22 180deg 240deg, #ffffff10 240deg 300deg, #ffffff22 300deg 360deg)" }} />
      {prize ?? <span className={`${block} h-14`} />}
      <span className={`${block} h-9`} />
    </>
  );
}

function Body({ screen, ad }: { screen: Screen; ad: PhoneAd }) {
  switch (screen) {
    case "home":
      return <HomeScreen ad={ad} />;
    case "entrada":
      return <HomeScreen />;
    case "pickup_video":
    case "pickup_resgate":
      return <PickupScreen />;
    case "mural":
      return (
        <>
          <Poster />
          <Mark><AdRowMini ad={ad} /></Mark>
          <Poster />
        </>
      );
    case "evento":
      return (
        <>
          <div className={`${block} h-28`} />
          <Line w="70%" h={9} />
          <Line w="45%" />
          <Mark><AdStrip ad={ad} /></Mark>
          <Line w="30%" h={6} />
          <div className="flex flex-col gap-2">
            <span className={`${block} h-9`} />
            <span className={`${block} h-9`} />
          </div>
        </>
      );
    case "pickup":
      return (
        <PickupScreen
          prize={
            <Mark>
              <div className="flex items-center gap-2 rounded-xl bg-fg/10 p-2.5">
                <Art ad={ad} className="size-9 flex-none rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[8px] font-bold uppercase text-fg-muted">Prêmio de {ad.sponsor}</span>
                  <strong className="block text-[10px] leading-3">{ad.title}</strong>
                </span>
              </div>
            </Mark>
          }
        />
      );
    case "loja":
      return (
        <>
          <Mark>
            <div className="relative overflow-hidden rounded-xl">
              <Art ad={ad} className="aspect-[16/9] w-full" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] font-bold text-white">{ad.title}</span>
            </div>
          </Mark>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className={`${block} h-20`} />
                <Line w="80%" />
                <Line w="40%" />
              </div>
            ))}
          </div>
        </>
      );
    case "drops":
      return (
        <>
          <div className={`${block} flex flex-col gap-2 p-2.5`}>
            <Mark><AdStrip ad={ad} /></Mark>
            <span className="mx-auto mt-1 size-16 rounded-lg bg-fg/20" />
            <Line w="60%" h={8} />
            <Line w="40%" />
            <span className="mx-auto h-1 w-full rounded-full bg-fg/20" />
          </div>
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex items-center gap-2"><span className="size-8 rounded bg-fg/15" /><span className="flex-1"><Line w="60%" /></span></span>
          ))}
        </>
      );
  }
}

/**
 * Celular com a tela do app onde a vitrine escolhida fica, e o anúncio no lugar dele
 * (a tela é desenhada com blocos cinza, só para mostrar a posição).
 */
export function AdPhonePreview({ slotId, slotName, ad, themeStyle }: { slotId: string | null; slotName: string; ad: PhoneAd; themeStyle?: CSSProperties }) {
  const screen = screenOf(slotId);
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="w-[250px] rounded-[34px] border-[7px] border-adm-ink bg-adm-ink shadow-lg">
        <div style={themeStyle} className="fan relative h-[500px] overflow-hidden rounded-[26px] bg-night font-grotesk text-fg">
          <span className="absolute left-1/2 top-1.5 z-20 h-[14px] w-16 -translate-x-1/2 rounded-full bg-adm-ink" />
          <div className="flex items-center justify-between px-4 pb-1.5 pt-6 text-[10px] font-bold">
            <span>{SCREENS[screen]}</span>
            <span className="size-5 rounded-full bg-fg/20" />
          </div>
          <div className="flex flex-col gap-2.5 px-3 pb-3 pt-1.5" onClickCapture={(e) => e.preventDefault()}>
            <Body screen={screen} ad={ad} />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-fg/10 bg-night/95 px-3 py-2.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="size-4 rounded bg-fg/20" />
            ))}
          </div>
          {(screen === "entrada" || screen === "pickup_resgate") && <AdSheet ad={ad} />}
          {screen === "pickup_video" && <AdVideoOverlay ad={ad} />}
        </div>
      </div>
      <span className="max-w-[250px] text-center text-xs text-adm-muted">
        {slotName}: é assim que fica na tela <strong className="text-adm-ink">{SCREENS[screen]}</strong>
        {MOMENTS[screen] ? ` ${MOMENTS[screen]}` : ""}.
      </span>
    </div>
  );
}
