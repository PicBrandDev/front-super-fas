import Link from "next/link";
import { Icon } from "@/components/icons";

/** A API recusou a leitura (revenda fechada, sem permissão, indisponível): mostra o motivo dela e um caminho de volta. */
export function ResaleError({ back, backLabel, message }: { back: string; backLabel: string; message: string }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-4">
      <Link href={back} className="back">
        <Icon name="back" size={18} />
        {backLabel}
      </Link>
      <h1 className="m-0 font-display text-[32px] font-black leading-9">Não deu para abrir</h1>
      <p role="alert" className="m-0 max-w-[40ch] text-[17px] leading-6">
        {message}
      </p>
      <Link href={back} className="btn btn-outline self-start">
        Voltar
      </Link>
    </div>
  );
}
