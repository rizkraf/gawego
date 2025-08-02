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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { JobCard } from './job-card';
import { AddJobDialog } from './add-job-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import Loader from './loader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

export type JobStatus =
  | 'applied'
  | 'interviewing'
  | 'offering'
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
  { id: 'rejected', title: 'Ditolak', color: 'bg-red-50 border-red-200' },
  { id: 'withdrawn', title: 'Dibatalkan', color: 'bg-gray-50 border-gray-200' },
];

export function JobKanbanBoard() {
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

    // If dropped on a column header or empty column
    if (statusColumns.some((col) => col.id === overId)) {
      newStatus = overId as JobStatus;
    } else {
      // If dropped on another job, get that job's status
      const targetJob = jobs.data?.find((job) => job.id.toString() === overId);
      if (!targetJob) return;
      newStatus = targetJob.status as JobStatus;
    }

    // Update the job status if it's different
    if (draggedJob.status !== newStatus) {
      updateJobMutation.mutate({
        id: draggedJob.id,
        status: newStatus,
      });
    }

    setActiveId(null);
  }

  const activeJob = jobs.data?.find((job) => job.id.toString() === activeId);

  if (jobs.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statusColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              jobs={(jobsByStatus as Record<JobStatus, Job[]>)[column.id] || []}
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
