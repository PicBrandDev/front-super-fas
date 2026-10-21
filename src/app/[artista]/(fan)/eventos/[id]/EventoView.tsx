"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { joinEventLuck } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet, SheetOption } from "@/components/fan/Sheet";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { eventName, isPastEvent, statusLabel, statusTagClass } from "@/lib/events";
import type { Gift, ShowEvent, Vendor } from "@/lib/types";
import s from "./EventoView.module.css";

const CODE_MIN = 6;

export function EventoView({
  artistName,
  event,
  vendors,
  gifts,
  demo,
}: {
  artistName: string;
  event: ShowEvent;
  vendors: Vendor[];
  gifts: Gift[];
  demo: boolean;
}) {
  const { base, slug } = useArtist();
  const toast = useToast();
  const past = isPastEvent(event);
  const title = eventName(artistName, event);
  const photosHref = `${base}/photo-finder?evento=${event.id}`;

  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [validated, setValidated] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);

  const before = gifts.filter((g) => g.phase === "before");
  const after = gifts.filter((g) => g.phase === "after");
  const hasLuck = !past && (event.giftsCount > 0 || gifts.length > 0);

  // Line-up: a API manda um texto livre; "[a definir]" vira a linha padrão do protótipo.
  const lineup = event.lineup && !/^\[.*\]$/.test(event.lineup.trim()) ? event.lineup : "";

  async function join() {
    if (joining) return;
    setJoining(true);
    // Sem API (modo exemplo, status 0) só marca na tela.
    const res = await joinEventLuck(slug, event.id);
    setJoining(false);
    if (res.ok || res.status === 0) {
      setJoined(true);
      toast.show("Você está concorrendo ao brinde");
    } else {
      toast.show(res.error ?? "Não deu para entrar na sorte agora");
    }
  }

  function validate(e: FormEvent) {
    e.preventDefault();
    const v = code.trim();
    if (v.length < CODE_MIN) {
      setCodeErr(`Código curto demais. Ele tem pelo menos ${CODE_MIN} caracteres e está no e-mail da agência.`);
      return;
    }
    // Simulado: a validação do ingresso ainda não existe na API.
    setCodeErr("");
    setValidated(true);
    toast.show("Ingresso validado");
  }

  return (
    <>
      <header className={s.hd}>
        <Link href={`${base}/agenda`} className="back">
          <Icon name="back" size={18} />
          Agenda
        </Link>
        {demo && <span className="tag tag-demo">Exemplo</span>}
      </header>

      <div className={`${s.ehero} ${past ? s.past : ""}`}>
        <div className={s.d} aria-hidden="true">
          {event.day}
        </div>
        <div className={s.r}>
          <span className={s.m}>{event.month}</span>
          <span className="mono">{event.city}</span>
          {past ? (
            <span className="tag tag-demo">Encerrado</span>
          ) : (
            <span className={statusTagClass[event.status]}>{statusLabel[event.status]}</span>
          )}
        </div>
      </div>

      <div className={s.etitle}>
        <h1>{title}</h1>
        <div className={`mono ${s.where}`}>
          <Icon name="pin" size={13} />
          <span>
            {event.city} · {event.venue} · {event.day} {event.month}
          </span>
        </div>
      </div>

      <dl className={s.info}>
        <dt className="mono">Portões</dt>
        <dd className="num">{event.doorsOpen}</dd>
        <dt className="mono">Classificação</dt>
        <dd>{event.ageRating}</dd>
        <dt className="mono">Endereço</dt>
        <dd>{event.address}</dd>
      </dl>

      <section className={s.sect} aria-labelledby="lineup-h">
        <h2 id="lineup-h">Line-up</h2>
        <div className={s.lineup}>
          <div>
            <span className={s.h}>{artistName}</span>
            <span className="mono">Headliner</span>
          </div>
          <div>
            <span>{lineup || "Convidados a anunciar"}</span>
            <span className="mono">—</span>
          </div>
        </div>
      </section>

      {past && (
        <section className={s.sect} aria-labelledby="fotos-h">
          <h2 id="fotos-h">Fotos do evento</h2>
          <p>As fotos oficiais já estão na fanzone. Envie uma selfie e encontre as suas.</p>
          <Link href={photosHref} className="btn btn-outline">
            <Icon name="camera" size={18} />
            Encontrar minhas fotos
          </Link>
        </section>
      )}

      {hasLuck && (
        <section className={s.sect} aria-labelledby="sorte-h">
          <h2 id="sorte-h">A sorte do evento</h2>

          <div className={s.gift}>
            <Icon name="gift" size={22} />
            <div>
              <h3>Brinde antes da compra</h3>
              <p>Concorra a um brinde do evento antes de garantir o ingresso.</p>
              {before.length > 0 && (
                <ul>
                  {before.map((g) => (
                    <li key={g.id}>
                      <span>{g.name}</span>
                      {g.qtyLabel && <span className="mono num">{g.qtyLabel}</span>}
                    </li>
                  ))}
                </ul>
              )}
              <div aria-live="polite">
                {joined ? (
                  <div className="ok">
                    <Icon name="check" size={16} />
                    Você está concorrendo
                  </div>
                ) : (
                  <button type="button" className="btn btn-outline btn-sm" onClick={join} aria-busy={joining}>
                    Concorrer
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={s.gift}>
            <Icon name="gift" size={22} />
            <div>
              <h3>Brinde depois da compra</h3>
              <p>Já comprou? Informe o código do ingresso e concorra a mais um brinde.</p>
              {after.length > 0 && (
                <ul>
                  {after.map((g) => (
                    <li key={g.id}>
                      <span>{g.name}</span>
                      {g.qtyLabel && <span className="mono num">{g.qtyLabel}</span>}
                    </li>
                  ))}
                </ul>
              )}
              <div aria-live="polite">
                {validated ? (
                  <div className="ok">
                    <Icon name="check" size={16} />
                    Ingresso validado · concorrendo
                  </div>
                ) : (
                  <>
                    <form onSubmit={validate} noValidate>
                      <label className="sr-only" htmlFor="tcode">
                        Código do ingresso
                      </label>
                      <input
                        id="tcode"
                        className="field"
                        placeholder="Código do ingresso"
                        autoComplete="off"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        aria-invalid={codeErr ? true : undefined}
                        aria-describedby={codeErr ? "tcode-err" : undefined}
                      />
                      <button type="submit" className="btn btn-outline btn-sm">
                        Validar
                      </button>
                    </form>
                    {codeErr && (
                      <p id="tcode-err" className="err" role="alert">
                        {codeErr}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className={s.buybar}>
        {past ? (
          <>
            <span className="mono">Evento encerrado</span>
            <Link href={photosHref} className="btn btn-primary">
              Minhas fotos
            </Link>
          </>
        ) : (
          <>
            <span className="mono">Venda nas agências parceiras</span>
            <button type="button" className="btn btn-primary" onClick={() => setBuyOpen(true)}>
              Comprar ingresso
            </button>
          </>
        )}
      </div>

      <Sheet open={buyOpen} onClose={() => setBuyOpen(false)} title="Onde comprar">
        <p>A compra acontece no site do parceiro. A fanzone leva você até lá e guarda o seu brinde.</p>
        <div className="opts">
          {vendors.map((v) => (
            <SheetOption
              key={v.id}
              title={v.name}
              sub={`${v.type} · ${v.priceLabel}`}
              href={v.url && v.url !== "#" ? v.url : undefined}
              onClick={v.url && v.url !== "#" ? undefined : () => toast.show("Link do parceiro em breve")}
            />
          ))}
        </div>
        <button type="button" className="btn btn-outline" data-close>
          Ficar na fanzone
        </button>
      </Sheet>
    </>
  );
}
