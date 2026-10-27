/** Selo "ao vivo" em verde suave: o ranking muda a cada compartilhamento confirmado. O pontinho só pisca para quem não pediu menos movimento. */
export function AoVivo() {
  return (
    <span
      className="inline-flex flex-none items-center gap-1 rounded-full px-1.5 py-0.5 font-adm-mono text-[9px] font-semibold uppercase leading-none tracking-wider"
      style={{ color: "#7FD6A0", background: "rgba(74, 190, 120, 0.12)" }}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full motion-safe:animate-pulse" style={{ background: "#5CCB8A" }} />
      Ao vivo
    </span>
  );
}
