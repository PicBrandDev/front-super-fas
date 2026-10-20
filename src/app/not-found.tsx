import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-adm-bg px-4 text-center font-adm text-adm-ink">
      <h1 className="m-0 text-3xl font-bold">Página não encontrada</h1>
      <p className="m-0 text-adm-muted">Esse endereço não existe ou o fã clube ainda não foi criado.</p>
      <Link href="/" className="mt-2 font-semibold text-adm-blue">
        Voltar para o início
      </Link>
    </main>
  );
}
