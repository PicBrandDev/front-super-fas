import { initialsOf } from "@/lib/format";

/** Foto do fã (ou as iniciais, sem foto). Decorativa: o nome sempre aparece ao lado. */
export function ChatAvatar({ name, avatar, size = 40 }: { name: string; avatar: string | null | undefined; size?: number }) {
  const style = { width: size, height: size };
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto do fã vem do /uploads do back, tamanho fixo e pequeno
      <img src={avatar} alt="" width={size} height={size} style={style} className="flex-none rounded-full border border-line-strong object-cover" />
    );
  }
  return (
    <span aria-hidden="true" style={{ ...style, fontSize: Math.round(size * 0.36) }} className="avatar font-bold text-chrome">
      {initialsOf(name)}
    </span>
  );
}
