import SpoilerDetailPageView from "@/views/SpoilerDetailPageView";

export default async function SpoilerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpoilerDetailPageView id={id} />;
}
