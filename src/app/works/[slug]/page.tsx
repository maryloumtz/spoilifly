import WorkDetailView from "@/views/WorkDetailView";

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WorkDetailView slug={slug} />;
}
