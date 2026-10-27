import { FeedAd } from "@/components/fan/FeedAd";
import type { HomeAd } from "@/lib/types";

/** Anúncio patrocinado de um card da tela (vitrine "home" do ambiente ou do fã clube). */
export function AdCard({ ad }: { ad: HomeAd; variant?: "compact" | "wide" }) {
  return <FeedAd ad={ad} className="!px-0" />;
}
