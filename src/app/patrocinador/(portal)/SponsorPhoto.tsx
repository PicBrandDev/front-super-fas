"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { setMySponsorLogo } from "@/app/actions/admin";
import { SponsorAvatar } from "@/components/admin/vitrines/SponsorAvatar";

/** A marca no canto superior direito: clicar na foto abre o seletor para trocar a foto de perfil. */
export function SponsorPhoto({ name, src, editable }: { name: string; src?: string | null; editable: boolean }) {
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [busy, start] = useTransition();

  const pick = (f: File | undefined) => {
    if (file.current) file.current.value = "";
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return setMsg("Envie JPG, PNG ou WebP.");
    if (f.size > 5 * 1024 * 1024) return setMsg("A foto pode ter no máximo 5 MB.");
    const form = new FormData();
    form.set("image", f);
    start(async () => {
      const res = await setMySponsorLogo(form);
      setMsg(res.ok ? "Foto atualizada." : res.error);
      if (res.ok) router.refresh();
    });
  };

  if (!editable) return <SponsorAvatar name={name} src={src} size={40} />;
  return (
    <span className="relative flex">
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label="Escolher a foto de perfil" onChange={(e) => pick(e.target.files?.[0])} />
      <button
        type="button"
        onClick={() => file.current?.click()}
        disabled={busy}
        title="Trocar foto de perfil"
        className="group relative flex cursor-pointer rounded-full border-0 bg-transparent p-0 disabled:opacity-60"
      >
        <SponsorAvatar name={name} src={src} size={40} />
        <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full border-2 border-white bg-adm-ink text-[10px] text-white">
          ✎
        </span>
        <span className="sr-only">Trocar foto de perfil de {name}</span>
      </button>
      <span role="status" aria-live="polite" className={msg ? "absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded-md bg-adm-ink px-2 py-1 text-xs text-white" : "sr-only"}>
        {msg}
      </span>
    </span>
  );
}
