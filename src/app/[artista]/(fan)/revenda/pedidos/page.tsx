import type { Metadata } from "next";
import Link from "next/link";
import { DemoTag, PageHead } from "@/components/fan/resale/parts";
import { OrderWallet } from "@/components/fan/resale/OrderWallet";
import { EmptyState } from "@/components/fan/states";
import { Icon } from "@/components/icons";
import { apiEnabled, getMyResaleOrders } from "@/lib/api";
import { isOpenOrder } from "@/lib/resale";

export const metadata: Metadata = { title: "Meus pedidos da revenda" };

export default async function ResaleOrdersPage({ params, searchParams }: { params: Promise<{ artista: string }>; searchParams: Promise<{ lado?: string }> }) {
  const { artista } = await params;
  const { lado } = await searchParams;
  const role = lado === "vendendo" ? "seller" : "buyer";
  const base = `/${artista}`;
  const res = await getMyResaleOrders(artista, role);
  const orders = res.ok ? res.data : [];
  const open = orders.filter((o) => isOpenOrder(o.status));
  const closed = orders.filter((o) => !isOpenOrder(o.status));

  return (
    <div className="flex flex-col gap-5 pb-10 pt-4">
      <div className="px-4">
        <PageHead back={`${base}/revenda`} backLabel="Revenda" title="Meus pedidos" aside={!apiEnabled() ? <DemoTag /> : undefined} />
      </div>
      <nav aria-label="Comprando ou vendendo" className="tabs">
        <Link href={`${base}/revenda/pedidos`} className="tab no-underline" aria-current={role === "buyer" ? "page" : undefined}>
          Comprando
        </Link>
        <Link href={`${base}/revenda/pedidos?lado=vendendo`} className="tab no-underline" aria-current={role === "seller" ? "page" : undefined}>
          Vendendo
        </Link>
      </nav>
      <div className="flex flex-col gap-8 px-4">
        {!res.ok && (
          <p role="alert" className="err m-0">
            {res.error}
          </p>
        )}
        {res.ok && orders.length === 0 && (
          <EmptyState
            title={role === "buyer" ? "Você ainda não comprou na revenda." : "Você ainda não vendeu na revenda."}
            text={role === "buyer" ? "Escolha um show com revenda aberta e reserve um ingresso." : "Anuncie um ingresso que sobrou num show com revenda aberta."}
            action={
              <Link href={`${base}/revenda`} className="go">
                Ver shows <Icon name="arrow" size={16} />
              </Link>
            }
          />
        )}
        {open.length > 0 && <OrderWallet label="Em andamento" orders={open} />}
        {closed.length > 0 && <OrderWallet label="Encerrados" orders={closed} />}
      </div>
    </div>
  );
}
