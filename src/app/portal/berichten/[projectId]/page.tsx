import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/card";
import { MessageThread } from "@/components/portal/message-thread";
import { getMyProjects } from "@/lib/portal";
import type { Message } from "@/lib/types";

export const metadata = { title: "Berichten" };

export default async function ProjectMessagesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase, user, projects } = await getMyProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) notFound();

  const { data } = await supabase.from("messages").select("*").eq("project_id", projectId).order("created_at");
  await supabase.rpc("mark_messages_read", { p_project_id: projectId });

  return (
    <>
      {projects.length > 1 && (
        <Link href="/portal/berichten" className="mb-6 inline-block text-sm text-mist hover:text-bone">
          ← Alle projecten
        </Link>
      )}
      <PageHeader eyebrow="Berichten" title={project.title}>
        Ik reageer meestal binnen een werkdag. Je krijgt een mail als er een antwoord is.
      </PageHeader>
      <MessageThread projectId={projectId} initial={(data ?? []) as Message[]} currentUserId={user.id} otherName="Cheryl" />
    </>
  );
}
