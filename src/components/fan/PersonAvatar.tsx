import { initialsOf } from "@/lib/format";

/** Foto de perfil de uma pessoa (fã); sem foto, mostra as iniciais no círculo `.avatar`. */
export function PersonAvatar({ src, name, size = 32, className = "" }: { src?: string | null; name: string; size?: number; className?: string }) {
  const dim = { width: size, height: size };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto de perfil
      <img src={src} alt="" width={size} height={size} style={dim} className={`flex-none rounded-full border border-line-strong object-cover ${className}`} />
    );
  }
  return (
    <span aria-hidden="true" className={`avatar ${className}`} style={dim}>
      {initialsOf(name)}
    </span>
  );
}
