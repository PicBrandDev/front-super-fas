"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { uploadMyAvatar } from "@/app/actions/fan";
import { initialsOf } from "@/lib/format";

/** Foto de perfil do fã (aparece no ranking Fã Super e nos posts). JPG, PNG ou WebP, até 5 MB. */
export function MyAvatar({ avatar, name }: { avatar: string | null; name: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return setError("Envie a foto em JPG, PNG ou WebP.");
    if (f.size > 5 * 1024 * 1024) return setError("A foto pode ter no máximo 5 MB.");
    setError("");
    const form = new FormData();
    form.set("image", f);
    start(async () => {
      const res = await uploadMyAvatar(form);
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-4">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto de perfil
        <img src={avatar} alt="Sua foto de perfil" width={72} height={72} className="size-[72px] flex-none rounded-full border border-current object-cover" />
      ) : (
        <span aria-hidden="true" className="flex size-[72px] flex-none items-center justify-center rounded-full border border-current font-display text-2xl font-black">
          {initialsOf(name)}
        </span>
      )}
      <div className="flex flex-col items-start gap-1.5">
        <button type="button" onClick={() => input.current?.click()} disabled={pending} className="btn btn-outline btn-sm">
          {pending ? "Enviando…" : avatar ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Foto de perfil" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        {error && (
          <p className="err m-0" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
