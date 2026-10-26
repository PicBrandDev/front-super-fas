/** Experiências que um pacote pode incluir além do ingresso (o Photo Finder vem em todos os pacotes). */
export type ExperienceKey = "jantar" | "camarim" | "pre" | "after";

export const EXPERIENCES: { key: ExperienceKey; label: string; hint: string }[] = [
  { key: "jantar", label: "Jantar com o Vintage", hint: "Jantar exclusivo com o artista antes do show" },
  { key: "camarim", label: "Meet & greet no camarim", hint: "Encontro no camarim e foto com o Vintage no show" },
  { key: "pre", label: "Pré-esquenta", hint: "Festa antes da abertura dos portões" },
  { key: "after", label: "After", hint: "After party depois do show" },
];

export const experienceLabel = (key: string) => EXPERIENCES.find((e) => e.key === key)?.label ?? key;

/** Texto fixo mostrado em todos os pacotes. */
export const PHOTO_FINDER_NOTE = "Photo Finder incluso: depois do show, mande uma selfie no app e retire as suas fotos.";
