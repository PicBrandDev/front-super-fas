import { redirect } from "next/navigation";

export default async function ClubAdminIndex({ params }: { params: Promise<{ artista: string; clube: string }> }) {
  const { artista, clube } = await params;
  redirect(`/${artista}/clubes/${clube}/admin/membros`);
}
