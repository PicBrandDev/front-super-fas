"use client";

import { useEffect, useState, useTransition } from "react";
import { acceptTerms } from "@/app/actions/terms";
import { TERMS_INTRO, TERMS_SECTIONS, cpfValido, maskCpf, termsKey } from "@/lib/terms";

/**
 * Porta dos ambientes de demonstração: enquanto a pessoa não aceitar o termo e informar o CPF, só o termo aparece.
 * O aceite vale para a aba aberta (sessionStorage): ao abrir o link de novo, o termo volta.
 */
export function TermsGate({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null); // null = ainda lendo o navegador
  const [cpf, setCpf] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    let saved = false;
    try {
      saved = sessionStorage.getItem(termsKey(slug)) === "1";
    } catch {}
    setOk(saved);
  }, [slug]);

  if (ok) return <>{children}</>;
  if (ok === null) return <div className="fixed inset-0 z-[100] bg-[#0b0b0f]" />;

  const valid = cpfValido(cpf);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !agree) return;
    setError("");
    start(async () => {
      const r = await acceptTerms(slug, cpf);
      if (!r.ok) return setError(r.error);
      try {
        sessionStorage.setItem(termsKey(slug), "1");
      } catch {}
      setOk(true);
    });
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0b0b0f] px-4 py-8 text-white">
      <form onSubmit={submit} className="mx-auto grid max-w-xl gap-5">
        <header className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-white/60">PicBrand · Super Fãs</span>
          <h1 className="m-0 text-2xl font-extrabold leading-8">Termo de confidencialidade e proteção da ideia</h1>
          <p className="m-0 text-sm leading-6 text-white/75">{TERMS_INTRO}</p>
        </header>

        <div tabIndex={0} aria-label="Texto do termo" className="grid max-h-[46vh] gap-4 overflow-y-auto rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-6 text-white/85">
          {TERMS_SECTIONS.map((s) => (
            <section key={s.title} className="grid gap-1.5">
              <h2 className="m-0 text-sm font-extrabold text-white">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="m-0">{p}</p>
              ))}
            </section>
          ))}
        </div>

        <label className="grid gap-1.5 text-sm font-bold">
          Seu CPF
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            aria-invalid={cpf.length === 14 && !valid}
            className="min-h-12 rounded-xl border border-white/25 bg-white/10 px-4 text-base font-semibold text-white placeholder:text-white/40"
          />
          {cpf.length === 14 && !valid && <span className="text-xs font-semibold text-[#ff8a8a]">CPF inválido. Confira os números.</span>}
        </label>

        <label className="flex items-start gap-3 text-sm leading-5">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none" />
          Li e aceito o termo. Sei que este ambiente é uma demonstração confidencial e que não posso copiar ou divulgar a ideia.
        </label>

        {error && <p role="alert" className="m-0 text-sm font-bold text-[#ff8a8a]">{error}</p>}

        <button
          type="submit"
          disabled={!valid || !agree || pending}
          className="min-h-12 rounded-full bg-white px-6 text-base font-extrabold text-black disabled:opacity-40"
        >
          {pending ? "Registrando..." : "Aceitar e continuar"}
        </button>
      </form>
    </div>
  );
}
