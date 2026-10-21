/** Vinil plano: disco ink, sulcos line-strong, selo sun. Decorativo. */
export function Vinyl({ className = "" }: { className?: string }) {
  const grooves: number[] = [];
  for (let r = 96; r > 40; r -= 7) grooves.push(r);
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false" className={className}>
      <circle cx="100" cy="100" r="99" fill="var(--fc-ink)" />
      {grooves.map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="var(--fc-line-strong)" strokeWidth=".6" opacity=".55" />
      ))}
      <circle cx="100" cy="100" r="34" fill="var(--fc-sun)" />
      <circle cx="100" cy="100" r="27" fill="none" stroke="var(--fc-ink)" strokeWidth=".8" />
      <circle cx="100" cy="100" r="3.5" fill="var(--fc-ink)" />
    </svg>
  );
}
