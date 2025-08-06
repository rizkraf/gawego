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
import { Plus } from 'lucide-react';
import { JobForm, type JobFormData } from './job-form';

interface AddJobDialogProps {
  onSuccess: () => void;
}

export function AddJobDialog({ onSuccess }: AddJobDialogProps) {
  const [open, setOpen] = useState(false);

  const createJobMutation = useMutation(
    trpc.application.create.mutationOptions({
      onSuccess: () => {
        onSuccess();
        setOpen(false);
      },
    })
  );

  const handleSubmit = (data: JobFormData) => {
    createJobMutation.mutate({
      ...data,
      status: data.status!,
    });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Lamaran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah Lamaran Kerja</DialogTitle>
          <DialogDescription>
            Isi detail lamaran kerja baru kamu di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <JobForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createJobMutation.isPending}
          submitButtonText="Tambah Lamaran"
          showStatus={true}
        />
      </DialogContent>
    </Dialog>
  );
}
