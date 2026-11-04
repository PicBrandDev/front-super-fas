import { WithSeal } from "@/components/VerifiedSeal";
import { initialsOf } from "@/lib/format";
import { thumb } from "@/lib/thumb";

/** Foto de perfil do fã clube; sem foto, as iniciais em serifa. */
export function ClubAvatar({ src, name, size = 56, verified = false }: { src?: string | null; name: string; size?: number; verified?: boolean }) {
  const box = { width: size, height: size };
  const face = src ? (
    <img src={thumb(src, size)} alt="" width={size} height={size} style={box} className="block flex-none rounded-full border border-adm-line object-cover" />
  ) : (
    <span
      aria-hidden="true"
      style={{ ...box, fontSize: size * 0.36 }}
      className="flex flex-none items-center justify-center rounded-full border border-adm-line bg-adm-blue-soft font-display font-black text-adm-blue-dark"
    >
      {initialsOf(name)}
    </span>
  );
  return (
    <WithSeal size={size} verified={verified}>
      {face}
    </WithSeal>
  );
}
