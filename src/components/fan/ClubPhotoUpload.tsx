"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { setClubAvatar } from "@/app/actions/admin";
import { useToast } from "./Toast";

/** Troca a foto do fã clube (dono e equipe). JPG, PNG ou WebP, até 5 MB. */
export function ClubPhotoUpload({ slug, club, hasPhoto }: { slug: string; club: string; hasPhoto: boolean }) {
  const router = useRouter();
  const toast = useToast();
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
      const res = await setClubAvatar(slug, club, form);
      if (!res.ok) return setError(res.error);
      toast.show("Foto do fã clube atualizada");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button type="button" className="btn btn-outline btn-sm" onClick={() => input.current?.click()} disabled={pending} aria-busy={pending || undefined}>
        {pending ? "Enviando…" : hasPhoto ? "Trocar a foto do fã clube" : "Adicionar foto do fã clube"}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Foto do fã clube"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="err m-0" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
