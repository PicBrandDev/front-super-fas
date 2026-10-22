"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { setClubAvatar } from "@/app/actions/admin";
import { AdminNotice } from "@/components/admin/ui";

/** Botão "Trocar foto" do fã clube (JPG, PNG ou WebP, até 5 MB). */
export function AvatarUpload({ slug, club }: { slug: string; club: string }) {
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
      const res = await setClubAvatar(slug, club, form);
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={pending}
        className="min-h-10 cursor-pointer rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-ink disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Trocar foto"}
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Foto de perfil do fã clube" onChange={(e) => pick(e.target.files?.[0])} />
      {error && <AdminNotice tone="error">{error}</AdminNotice>}
    </div>
  );
}
