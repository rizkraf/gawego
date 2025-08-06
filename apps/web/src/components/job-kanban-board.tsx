import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { JobCard } from './job-card';
import { AddJobDialog } from './add-job-dialog';
import { Skeleton } from './ui/skeleton';
import { trpc } from '@/utils/trpc';
import Loader from './loader';
import { useQuery, useMutation } from '@tanstack/react-query';

export type JobStatus =
  | 'applied'
  | 'interviewing'
  | 'offering'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface Job {
  id: number;
  userId: string | null;
  companyName: string;
  position_title: string;
  status: JobStatus | null;
  appliedDate: string;
  jobPostUrl: string | null;
  position: number;
  isArchived: boolean | null;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
}

const statusColumns: { id: JobStatus; title: string; color: string }[] = [
  { id: 'applied', title: 'Dilamar', color: 'bg-blue-50 border-blue-200' },
  {
    id: 'interviewing',
    title: 'Wawancara',
    color: 'bg-yellow-50 border-yellow-200',
  },
  { id: 'offering', title: 'Tawaran', color: 'bg-green-50 border-green-200' },
  { id: 'accepted', title: 'Diterima', color: 'bg-purple-50 border-purple-200' },
  { id: 'rejected', title: 'Ditolak', color: 'bg-red-50 border-red-200' },
  { id: 'withdrawn', title: 'Dibatalkan', color: 'bg-gray-50 border-gray-200' },
];

export function JobKanbanBoard({
  isPending = false,
}: {
  isPending?: boolean;
}) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const jobs = useQuery(trpc.application.getListByUser.queryOptions());
  const updateJobMutation = useMutation(
    trpc.application.update.mutationOptions({
      onSuccess: () => {
        jobs.refetch();
      },
    })
  );

  const updatePositionsMutation = useMutation(
    trpc.application.updatePositions.mutationOptions({
      onSuccess: () => {
        jobs.refetch();
      },
    })
  );

  const handleJobUpdated = () => {
    jobs.refetch();
  };

  const jobsByStatus = React.useMemo(() => {
    if (!jobs.data) return {};

    return jobs.data.reduce(
      (acc: Record<JobStatus, Job[]>, job) => {
        const status = job.status as JobStatus;
        if (status && !acc[status]) {
          acc[status] = [];
        }
        if (status) {
          acc[status].push(job as Job);
        }
        return acc;
      },
      {} as Record<JobStatus, Job[]>
    );
  }, [jobs.data]);

  // Sort jobs by position within each status
  const sortedJobsByStatus = React.useMemo(() => {
    const sorted: Record<JobStatus, Job[]> = {} as Record<JobStatus, Job[]>;

    statusColumns.forEach(column => {
      const columnJobs = (jobsByStatus as Record<JobStatus, Job[]>)[column.id] || [];
      sorted[column.id] = columnJobs.sort((a: Job, b: Job) => (a.position || 0) - (b.position || 0));
    });

    return sorted;
  }, [jobsByStatus]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropping on the same item, do nothing
    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    // Find the job being dragged
    const draggedJob = jobs.data?.find((job) => job.id.toString() === activeId);
    if (!draggedJob) return;

    // Determine the new status
    let newStatus: JobStatus;
    let targetIndex: number = -1;

    // If dropped on a column header or empty column
    if (statusColumns.some((col) => col.id === overId)) {
      newStatus = overId as JobStatus;
      // Place at the end of the column
      const columnJobs = sortedJobsByStatus[newStatus] || [];
      targetIndex = columnJobs.length;
    } else {
      // If dropped on another job, get that job's status and position
      const targetJob = jobs.data?.find((job) => job.id.toString() === overId);
      if (!targetJob) return;

      newStatus = targetJob.status as JobStatus;
      const columnJobs = sortedJobsByStatus[newStatus] || [];
      targetIndex = columnJobs.findIndex(job => job.id.toString() === overId);

      // If we're moving within the same column and to a lower position,
      // we need to adjust the target index
      if (draggedJob.status === newStatus && draggedJob.position < targetJob.position) {
        targetIndex = targetIndex;
      } else if (draggedJob.status === newStatus) {
        targetIndex = targetIndex;
      }
    }

    // Calculate new positions for affected jobs
    const updates: { id: number; position: number; status?: JobStatus }[] = [];

    if (draggedJob.status === newStatus) {
      // Moving within the same column - reorder
      const columnJobs = [...sortedJobsByStatus[newStatus]];
      const oldIndex = columnJobs.findIndex(job => job.id === draggedJob.id);
      const newIndex = targetIndex === -1 ? columnJobs.length - 1 : Math.min(targetIndex, columnJobs.length - 1);

      if (oldIndex !== newIndex) {
        // Reorder the array
        const reorderedJobs = arrayMove(columnJobs, oldIndex, newIndex);

        // Update positions for all jobs in this column
        reorderedJobs.forEach((job, index) => {
          updates.push({
            id: job.id,
            position: index + 1
          });
        });
      }
    } else {
      // Moving to a different column
      const sourceColumnJobs = [...sortedJobsByStatus[draggedJob.status as JobStatus]];
      const targetColumnJobs = [...sortedJobsByStatus[newStatus]];

      // Remove from source column and update positions
      const updatedSourceJobs = sourceColumnJobs.filter(job => job.id !== draggedJob.id);
      updatedSourceJobs.forEach((job, index) => {
        updates.push({
          id: job.id,
          position: index + 1
        });
      });

      // Add to target column at the specified position
      const insertIndex = targetIndex === -1 ? targetColumnJobs.length : Math.min(targetIndex, targetColumnJobs.length);
      targetColumnJobs.splice(insertIndex, 0, { ...draggedJob, status: newStatus });

      // Update positions for target column jobs
      targetColumnJobs.forEach((job, index) => {
        updates.push({
          id: job.id,
          position: index + 1,
          status: job.id === draggedJob.id ? newStatus : undefined
        });
      });
    }

    // Apply all position updates
    if (updates.length > 0) {
      updatePositionsMutation.mutate(updates);
    }

    setActiveId(null);
  }

  const activeJob = jobs.data?.find((job) => job.id.toString() === activeId);

  const JobCardSkeleton = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-6" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );

  // Skeleton component for kanban columns
  const KanbanColumnSkeleton = ({ color }: { color: string }) => (
    <div className={`p-4 rounded-lg border-2 ${color} min-h-[200px]`}>
      <div className="mb-4">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="space-y-3">
        {[...Array(2)].map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );

  if (jobs.isLoading || isPending) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {statusColumns.map((column) => (
            <KanbanColumnSkeleton key={column.id} color={column.color} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lamaran Kerja</h2>
        <AddJobDialog onSuccess={handleJobUpdated} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {statusColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              jobs={sortedJobsByStatus[column.id] || []}
              onJobUpdated={handleJobUpdated}
            />
          ))}
        </div>

        <DragOverlay>
          {activeJob ? (
            <JobCard job={activeJob as Job} isDragging={true} onJobUpdated={handleJobUpdated} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
