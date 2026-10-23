import { redirect } from "next/navigation";

/** O endereço antigo das campanhas: agora é a entrada do portal. */
export default function CampanhasRedirect() {
  redirect("/patrocinador");
}
