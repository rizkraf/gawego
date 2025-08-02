import { JobKanbanBoard } from '@/components/job-kanban-board';
import { authClient } from '@/lib/auth-client';

export default function DashboardApplication() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Please log in to view your job applications.</p>
      </div>
    );
  }

  return <JobKanbanBoard />;
}
