import { WithSeal } from "@/components/VerifiedSeal";
import { initialsOf } from "@/lib/format";
import { thumb } from "@/lib/thumb";

/** Foto redonda de um fã clube (ou a inicial). O fã clube oficial do artista leva o selo no canto da foto. */
export function ClubDot({ name, avatar, size = 56, official = false }: { name: string; avatar: string | null | undefined; size?: number; official?: boolean }) {
  const box = { width: size, height: size };
  const face = avatar ? (
    // eslint-disable-next-line @next/next/no-img-element -- foto de perfil do fã clube
    <img src={thumb(avatar, size * 2)} alt="" width={size} height={size} style={box} className="block flex-none rounded-full border border-line object-cover" />
  ) : (
    <span aria-hidden="true" style={{ ...box, fontSize: size * 0.4 }} className="flex flex-none items-center justify-center rounded-full border border-line bg-raised font-display font-black text-fg-muted">
      {initialsOf(name).charAt(0)}
    </span>
  );
  // Selo pequeno: um visto grande no canto parecia o fã clube estar selecionado no feed.
  return (
    <WithSeal size={size} verified={official} label="Fã clube oficial" ratio={0.24} min={11}>
      {face}
    </WithSeal>
  );
}
