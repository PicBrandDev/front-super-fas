"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { deleteContent, removeClubMember, updateClub } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SearchField } from "@/components/admin/controls";
import { Badge, btnPrimary, btnSecondary, inputClass, tdClass, thClass } from "@/components/admin/ui";
import type { ClubMemberRow, FanClub, Post } from "@/lib/types";

function useAction() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [pending, start] = useTransition();
  const run = (call: () => Promise<{ ok: boolean; error?: string }>, done: string, after?: () => void) =>
    start(async () => {
      const res = await call();
      if (!res.ok) {
        setError(res.error ?? "Não deu certo.");
        return;
      }
      setError("");
      setAnnounce(done);
      after?.();
      router.refresh();
    });
  return { error, announce, pending, run };
}

function Feedback({ error, announce }: { error: string; announce: string }) {
  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {error && (
        <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
          {error}
        </p>
      )}
    </>
  );
}

/** Membros do fã clube (fãs que entraram). A equipe pode tirar alguém do clube. */
export function ClubMembersClient({ artist, club, clubName, members }: { artist: string; club: string; clubName: string; members: ClubMemberRow[] }) {
  const { error, announce, pending, run } = useAction();
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const query = q.trim().toLowerCase();
  const rows = members.filter((m) => !query || `${m.name} ${m.handle} ${m.city}`.toLowerCase().includes(query));
  const subs = members.filter((m) => m.isSubscriber).length;

  return (
    <>
      <AdminPageHeader
        title="Membros"
        description={`Fãs que entraram no ${clubName}. Entrar no clube é grátis; "assinante" é quem paga a assinatura do ambiente do cantor.`}
      />
      <Feedback error={error} announce={announce} />
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
        {[
          { label: "Membros", value: members.length },
          { label: "Assinantes do cantor", value: subs },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-xl border border-adm-line bg-white p-4">
            <span className="font-adm-mono text-xs font-semibold text-adm-muted">{s.label}</span>
            <strong className="text-2xl">{s.value.toLocaleString("pt-BR")}</strong>
          </div>
        ))}
      </div>
      <SearchField id="cm-search" label="Buscar membro" value={q} onChange={setQ} placeholder="Buscar por nome, @ ou cidade" />
      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-adm-bg">
              <th scope="col" className={thClass}>Fã</th>
              <th scope="col" className={thClass}>Cidade</th>
              <th scope="col" className={thClass}>No clube desde</th>
              <th scope="col" className={thClass}>Assinatura</th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td className={tdClass}>
                  <strong>{m.name}</strong>
                  <span className="block font-adm-mono text-xs text-adm-muted">{m.handle}</span>
                </td>
                <td className={tdClass}>{m.city || "—"}</td>
                <td className={`${tdClass} font-adm-mono text-[13px]`}>{m.since}</td>
                <td className={tdClass}>{m.isSubscriber ? <Badge tone="ok">Assinante</Badge> : <span className="text-adm-muted">—</span>}</td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-2">
                    {confirm === m.id ? (
                      <>
                        <button type="button" onClick={() => setConfirm(null)} className={btnSecondary}>
                          Manter
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => removeClubMember(artist, club, m.id), `${m.name} saiu do clube.`, () => setConfirm(null))}
                          className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-adm-danger px-3 text-sm font-semibold text-white"
                        >
                          Tirar do clube
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirm(m.id)}
                        className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger"
                      >
                        Remover<span className="sr-only"> {m.name}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="m-0 px-4 py-6 text-sm text-adm-muted">Nenhum membro encontrado.</p>}
      </div>
    </>
  );
}

/** Moderação do mural da galera do fã clube. */
export function ClubPostsClient({ artist, club, clubName, posts }: { artist: string; club: string; clubName: string; posts: Post[] }) {
  const { error, announce, pending, run } = useAction();
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <>
      <AdminPageHeader title="Mural da galera" description={`Posts dos membros no ${clubName}. Apague o que não segue as regras do clube.`} />
      <Feedback error={error} announce={announce} />
      <div className="flex flex-col gap-3">
        {posts.length === 0 && <p className="m-0 text-sm text-adm-muted">Ninguém postou ainda.</p>}
        {posts.map((p) => (
          <article key={p.id} className="flex flex-wrap items-start gap-3 rounded-xl border border-adm-line bg-white p-4">
            <span
              aria-hidden="true"
              className="flex size-9 flex-none items-center justify-center rounded-full bg-adm-ink text-sm font-bold text-white"
            >
              {p.author.initial}
            </span>
            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-1">
              <span className="text-sm">
                <strong>{p.author.name}</strong> <span className="font-adm-mono text-xs text-adm-muted">{p.author.handle} · {p.timeLabel}</span>{" "}
                {p.kind === "instagram" && <Badge tone="info">Instagram</Badge>}
              </span>
              <p className="m-0 text-[15px]">{p.text}</p>
              {p.url && <span className="truncate font-adm-mono text-xs text-adm-muted">{p.url}</span>}
            </div>
            <div className="flex gap-2">
              {confirm === p.id ? (
                <>
                  <button type="button" onClick={() => setConfirm(null)} className={btnSecondary}>
                    Manter
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteContent(artist, "posts", p.id, club), "Post apagado.", () => setConfirm(null))}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-adm-danger px-3 text-sm font-semibold text-white"
                  >
                    Apagar post
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirm(p.id)}
                  className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger"
                >
                  Apagar<span className="sr-only"> post de {p.author.name}</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

/** Nome, cidade e descrição do clube; a administração do ambiente também coloca no ar. */
export function ClubDataForm({ artist, club, canPublish }: { artist: string; club: FanClub; canPublish: boolean }) {
  const { error, announce, pending, run } = useAction();
  const [name, setName] = useState(club.name);
  const [city, setCity] = useState(club.city);
  const [description, setDescription] = useState(club.description);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    run(() => updateClub(artist, club.slug, { name: name.trim(), city: city.trim(), description: description.trim() }), "Dados salvos.");
  };

  return (
    <>
      <AdminPageHeader title="Dados do clube" description="Como o fã clube aparece para os fãs." />
      <Feedback error={error} announce={announce} />
      <form onSubmit={submit} className="flex max-w-[640px] flex-col gap-4 rounded-xl border border-adm-line bg-white p-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cd-name" className="text-[13px] font-semibold">
            Nome *
          </label>
          <input id="cd-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cd-city" className="text-[13px] font-semibold">
            Cidade ou região
          </label>
          <input id="cd-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cd-desc" className="text-[13px] font-semibold">
            Descrição
          </label>
          <textarea
            id="cd-desc"
            rows={3}
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} py-2.5`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm">
            <Badge tone={club.status === "active" ? "ok" : "warn"}>{club.status === "active" ? "No ar" : "Em configuração"}</Badge>
            {canPublish && !club.isMaster && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(
                    () => updateClub(artist, club.slug, { status: club.status === "active" ? "setup" : "active" }),
                    club.status === "active" ? "Clube fora do ar." : "Clube no ar.",
                  )
                }
                className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-blue bg-white px-3 text-[13px] font-semibold text-adm-blue"
              >
                {club.status === "active" ? "Tirar do ar" : "Colocar no ar"}
              </button>
            )}
          </span>
          <button type="submit" disabled={pending} aria-busy={pending} className={btnPrimary}>
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </>
  );
}
