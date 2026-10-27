"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { offerRide } from "@/app/actions/carpool";

const field = "min-h-12 w-full border border-line bg-night px-3 text-[15px] text-fg";

const toCents = (s: string) => {
  const n = Number(s.trim().replace(/[R$\s.]/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

/** "Oferecer carona": cidade e ponto de saída, dia e hora, vagas e preço de cada vaga. */
export function OfferRideForm({ artist, eventId, onDone }: { artist: string; eventId: string; onDone: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({ originCity: "", meetingPoint: "", departAt: "", seats: "3", price: "", car: "", notes: "" });
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cents = toCents(f.price);
    if (f.originCity.trim().length < 2) return setError("Diga de que cidade você sai.");
    if (!f.departAt) return setError("Escolha o dia e a hora da saída.");
    if (cents === null) return setError("O preço de cada vaga precisa ser um valor em reais.");
    start(async () => {
      const res = await offerRide(artist, eventId, {
        originCity: f.originCity.trim(),
        meetingPoint: f.meetingPoint.trim(),
        departAt: new Date(f.departAt).toISOString(),
        seats: Number(f.seats),
        priceCents: cents,
        car: f.car.trim(),
        notes: f.notes.trim(),
      });
      if (!res.ok) return setError(res.error);
      setError("");
      router.refresh();
      onDone();
    });
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Oferecer carona" className="flex flex-col gap-3 border border-amber bg-raised p-4">
      <strong className="text-[17px]">Oferecer carona</strong>
      {error && (
        <p className="err m-0" role="alert">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-[14px]">
        Sai de (cidade) *
        <input className={field} value={f.originCity} onChange={set("originCity")} placeholder="Ex.: Anápolis" />
      </label>
      <label className="flex flex-col gap-1 text-[14px]">
        Ponto de encontro
        <input className={field} value={f.meetingPoint} onChange={set("meetingPoint")} placeholder="Ex.: Posto Shell da BR-153" />
      </label>
      <label className="flex flex-col gap-1 text-[14px]">
        Dia e hora da saída *
        <input className={field} type="datetime-local" value={f.departAt} onChange={set("departAt")} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-[14px]">
          Vagas no carro *
          <select className={field} value={f.seats} onChange={set("seats")}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[14px]">
          Preço por vaga (R$) *
          <input className={field} inputMode="decimal" value={f.price} onChange={set("price")} placeholder="0,00" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-[14px]">
        Carro
        <input className={field} value={f.car} onChange={set("car")} placeholder="Ex.: Gol branco, placa final 4" />
      </label>
      <label className="flex flex-col gap-1 text-[14px]">
        Observações
        <input className={field} value={f.notes} onChange={set("notes")} maxLength={300} placeholder="Ex.: volta depois do show, aceito malas pequenas" />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending} aria-busy={pending}>
          {pending ? "Publicando…" : "Publicar carona"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
