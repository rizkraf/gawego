import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Building2, GripVertical, Trash } from 'lucide-react';
import { EditJobDialog } from './edit-job-dialog';
import type { Job } from './job-kanban-board';
import { useMutation } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';

interface JobCardProps {
  job: Job;
  isDragging?: boolean;
  onJobUpdated: () => void;
}

export function JobCard({
  job,
  isDragging = false,
  onJobUpdated,
}: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: job.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const statusColors = {
    applied: 'bg-blue-100 text-blue-800',
    interviewing: 'bg-yellow-100 text-yellow-800',
    offering: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  const translateStatus = (status: string): string => {
    const statusTranslations = {
      applied: 'Dilamar',
      interviewing: 'Wawancara',
      offering: 'Tawaran',
      rejected: 'Ditolak',
      withdrawn: 'Dibatalkan',
    };

    return statusTranslations[status as keyof typeof statusTranslations] || status;
  };

  const status = job.status || 'applied';

  const deleteJobMutation = useMutation(
      trpc.application.delete.mutationOptions({
        onSuccess: () => {
          onJobUpdated();
          setNodeRef(null);
        },
      })
    );

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this job application?')) {
      deleteJobMutation.mutate({ id: job.id });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <EditJobDialog job={job} onSuccess={onJobUpdated}>
        <Card className="cursor-pointer group">
          <div className="p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 cursor-grab active:cursor-grabbing "
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className='size-6 hover:bg-red-100 hover:text-red-600'
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <CardHeader className="pb-2 pt-0">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium line-clamp-2 flex-1 pr-2">
                {job.position_title}
              </CardTitle>
              <Badge
                variant="secondary"
                className={`text-xs ${statusColors[status as keyof typeof statusColors]}`}
              >
                {translateStatus(status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{job.companyName}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{job.appliedDate}</span>
            </div>

            {job.jobPostUrl && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <ExternalLink className="h-3 w-3" />
                <a
                  href={job.jobPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Job Post
                </a>
              </div>
            )}

            {job.notes && (
              <div className="text-xs text-muted-foreground line-clamp-2 mt-2">
                {job.notes}
              </div>
            )}
          </CardContent>
        </Card>
      </EditJobDialog>
    </div>
  );
}
