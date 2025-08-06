import { JobKanbanBoard } from '@/components/job-kanban-board';
import { authClient } from '@/lib/auth-client';

export default function DashboardApplication() {
  const { isPending } = authClient.useSession();

  return <JobKanbanBoard isPending={isPending} />;
}
