import { redirect } from "next/navigation";

export default async function ClubAdminIndex({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  redirect(`/${artista}/admin/membros`);
}
