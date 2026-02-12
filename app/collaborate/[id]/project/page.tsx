import { client, queries } from "@/lib/sanity/client";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { Navigation } from "@/components/layout/Navigation";
import { notFound } from "next/navigation";

export default async function WorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const collaboration = await client.fetch(queries.getCollaborationById(id));

  if (!collaboration) {
    return notFound();
  }

  return (
    <>
      <Navigation />
      <main className="h-[calc(100vh-80px)] overflow-hidden bg-[#FFF8F3]">
        <WorkspaceLayout collaboration={collaboration} />
      </main>
    </>
  );
}
