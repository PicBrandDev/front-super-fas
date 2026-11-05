"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { inviteSponsor as inviteSponsorAction, setSponsorLogo, type SponsorInvited } from "@/app/actions/admin";
import { TempPasswordNotice } from "@/components/admin/TempPasswordNotice";
import { AdminEmpty, AdminNotice, Badge, btnPrimary, btnSecondary, inputClass, tdClass, thClass } from "@/components/admin/ui";
import { SponsorAvatar } from "@/components/admin/vitrines/SponsorAvatar";
import type { Sponsor } from "@/lib/types";

type Row = Sponsor & { local?: boolean };

/** Os patrocinadores da plataforma e o acesso de cada um ao portal, com o convite por e-mail (a senha provisória aparece uma vez). */
export function PatrocinadoresAcessos({ sponsors, exampleMode = false }: { sponsors: Sponsor[]; exampleMode?: boolean }) {
  const router = useRouter();
  const [invited, setInvited] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [created, setCreated] = useState<SponsorInvited | null>(null);
  const [target, setTarget] = useState<string | null>(null); // patrocinador que vai trocar a foto
  const file = useRef<HTMLInputElement>(null);
  const [, start] = useTransition();
  const rows: Row[] = [...invited, ...sponsors];

  const pickPhoto = (f: File | undefined) => {
    const id = target;
    if (file.current) file.current.value = "";
    setTarget(null);
    if (!f || !id) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return setError("Envie o logo em JPG, PNG ou WebP.");
    if (f.size > 5 * 1024 * 1024) return setError("O logo pode ter no máximo 5 MB.");
    const form = new FormData();
    form.set("image", f);
    start(async () => {
      const res = await setSponsorLogo(id, form);
      if (!res.ok) return setError(res.error);
      setError("");
      setAnnounce("Logo atualizado.");
      router.refresh();
    });
  };

  const invite = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Digite um e-mail válido.");
      return;
    }
    start(async () => {
      const res = await inviteSponsorAction({ email: value });
      if (!res.ok && res.status !== 0) {
        setError(res.error);
        return;
      }
      if (res.ok) {
        setCreated(res.data);
        router.refresh();
      } else {
        setInvited((cur) => [{ id: `inv-${Date.now()}`, brand: "—", email: value, campaigns: 0, status: "invited", local: true }, ...cur]);
      }
      setEmail("");
      setError("");
      setAnnounce(`Conta criada para ${value}.`);
    });
  };

  return (
    <section aria-labelledby="acessos-title" className="flex flex-col gap-3">
      <h2 id="acessos-title" className="m-0 font-display text-3xl font-black">
        Patrocinadores e acessos
      </h2>
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {exampleMode && <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para convidar patrocinadores de verdade.</AdminNotice>}
      {created && <TempPasswordNotice email={created.sponsor.email} password={created.tempPassword} onClose={() => setCreated(null)} />}

      <form onSubmit={invite} noValidate className="flex flex-wrap items-end gap-2.5 rounded-xl border border-adm-line bg-white p-4">
        <div className="flex flex-[1_1_260px] flex-col gap-1.5">
          <label htmlFor="sp-email" className="text-[13px] font-semibold">
            Convidar patrocinador
          </label>
          <input
            id="sp-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="contato@marca.com"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "sp-email-error" : undefined}
            className={inputClass}
          />
        </div>
        <button type="submit" className={btnPrimary}>
          Enviar convite
        </button>
        {error && (
          <span id="sp-email-error" role="alert" className="basis-full text-xs font-semibold text-adm-danger">
            {error}
          </span>
        )}
      </form>

      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label="Escolher o logo do patrocinador" onChange={(e) => pickPhoto(e.target.files?.[0])} />
      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-adm-bg">
              <th scope="col" className={thClass}>Marca</th>
              <th scope="col" className={thClass}>Contato</th>
              <th scope="col" className={thClass}>Campanhas</th>
              <th scope="col" className={thClass}>Acesso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className={`${tdClass} font-semibold`}>
                  <span className="flex items-center gap-3">
                    <SponsorAvatar name={s.brand} src={s.logo} size={36} />
                    {s.brand}
                    {!s.local && (
                      <button
                        type="button"
                        className={`${btnSecondary} !min-h-8 !px-2.5 text-xs`}
                        onClick={() => {
                          setTarget(s.id);
                          file.current?.click();
                        }}
                      >
                        {s.logo ? "Trocar logo" : "Colocar logo"}
                        <span className="sr-only"> de {s.brand}</span>
                      </button>
                    )}
                  </span>
                </td>
                <td className={`${tdClass} font-adm-mono text-[13px]`}>{s.email}</td>
                <td className={tdClass}>{s.campaigns}</td>
                <td className={tdClass}>
                  <Badge tone={s.status === "active" ? "ok" : "warn"}>{s.status === "active" ? "Ativo" : "Convite pendente"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-4">
            <AdminEmpty title="Nenhum patrocinador ainda" text="Convide o primeiro pelo e-mail acima. A senha provisória aparece uma única vez." />
          </div>
        )}
      </div>
    </section>
  );
}
