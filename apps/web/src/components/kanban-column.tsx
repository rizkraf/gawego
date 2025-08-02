import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobCard } from './job-card';
import type { Job, JobStatus } from './job-kanban-board';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  id: JobStatus;
  title: string;
  color: string;
  jobs: Job[];
  onJobUpdated: () => void;
}

export function KanbanColumn({ id, title, color, jobs, onJobUpdated }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <Card
      className={`${color} ${isOver ? 'ring-2 ring-primary' : ''} min-h-[400px]`}
      variant='mixed'
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          {title}
          <Badge variant="secondary" className="ml-2">
            {jobs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2" ref={setNodeRef}>
        <SortableContext
          items={jobs.map(job => job.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onJobUpdated={onJobUpdated} />
          ))}
        </SortableContext>
        {jobs.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Tidak ada lamaran di sini
          </div>
        )}
      </CardContent>
    </Card>
  );
}
