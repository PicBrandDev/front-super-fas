/**
 * Selo verificado (círculo azul com o visto) que o dono de fã clube leva ao lado da foto de perfil.
 * Solto, mostra só o selo; sobre a foto, use `verified` no PersonAvatar ou no ClubAvatar.
 */
export function VerifiedSeal({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Dono de fã clube verificado"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`flex-none ${className}`}
    >
      <title>Dono de fã clube verificado</title>
      <circle cx="12" cy="12" r="11" fill="#1D9BF0" stroke="#fff" strokeWidth="2" />
      <path d="M7 12.4l3.2 3.2L17 8.8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Põe o selo no canto inferior direito de uma foto de `size` px. */
export function WithSeal({ size, verified, children }: { size: number; verified?: boolean; children: React.ReactNode }) {
  if (!verified) return <>{children}</>;
  const seal = Math.max(14, Math.round(size * 0.38));
  return (
    <span className="relative inline-flex flex-none" style={{ width: size, height: size }}>
      {children}
      <VerifiedSeal size={seal} className="absolute -bottom-0.5 -right-0.5" />
    </span>
  );
}
