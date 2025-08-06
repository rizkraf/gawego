import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import { useMutation } from '@tanstack/react-query';
import type { Job } from './job-kanban-board';
import { Pencil } from 'lucide-react';
import { JobForm, type JobFormData } from './job-form';

interface EditJobDialogProps {
  job: Job;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditJobDialog({ job, onSuccess, open: externalOpen, onOpenChange }: EditJobDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const updateJobMutation = useMutation(
    trpc.application.update.mutationOptions({
      onSuccess: () => {
        onSuccess();
        setOpen(false);
      },
    })
  );

  const handleSubmit = (data: JobFormData) => {
    updateJobMutation.mutate({
      id: job.id,
      companyName: data.companyName,
      positionTitle: data.positionTitle,
      appliedDate: data.appliedDate,
      jobPostUrl: data.jobPostUrl,
      notes: data.notes,
    });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const initialData: Partial<JobFormData> = {
    companyName: job.companyName,
    positionTitle: job.position_title,
    appliedDate: job.appliedDate,
    jobPostUrl: job.jobPostUrl || '',
    notes: job.notes || '',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 hover:bg-primary/10 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ubah Lamaran Kerja</DialogTitle>
          <DialogDescription>
            Ubah detail lamaran kerja kamu di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <JobForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateJobMutation.isPending}
          submitButtonText="Update"
          showStatus={false}
        />
      </DialogContent>
    </Dialog>
  );
}
