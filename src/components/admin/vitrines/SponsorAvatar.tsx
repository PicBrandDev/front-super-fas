import { brandStyle } from "@/lib/brand-style";
import { initialsOf } from "@/lib/format";
import { thumb } from "@/lib/thumb";

/** Foto de perfil do patrocinador; sem foto, a inicial da marca no círculo, com as cores dela. */
export function SponsorAvatar({ name, src, size = 32 }: { name: string; src?: string | null; size?: number }) {
  const box = { width: size, height: size };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- foto de perfil do patrocinador
    return <img src={thumb(src, size)} alt="" width={size} height={size} style={box} className="block flex-none rounded-full border border-adm-line object-cover" />;
  }
  const st = brandStyle(name);
  return (
    <span aria-hidden="true" style={{ ...box, background: st.bg, color: st.fg, fontSize: size * 0.4 }} className="flex flex-none items-center justify-center rounded-full font-black">
      {initialsOf(name).slice(0, 2)}
    </span>
  );
}
