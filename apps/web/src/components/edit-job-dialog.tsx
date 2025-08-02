import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface EditJobDialogProps {
  job: Job;
  children: React.ReactNode;
  onSuccess: () => void;
}

export function EditJobDialog({
  job,
  children,
  onSuccess,
}: EditJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: job.companyName,
    positionTitle: job.position_title,
    appliedDate: job.appliedDate,
    jobPostUrl: job.jobPostUrl || '',
    notes: job.notes || '',
  });

  const updateJobMutation = useMutation(
    trpc.application.update.mutationOptions({
      onSuccess: () => {
        onSuccess();
        setOpen(false);
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobMutation.mutate({
      id: job.id,
      companyName: formData.companyName,
      positionTitle: formData.positionTitle,
      appliedDate: formData.appliedDate,
      jobPostUrl: formData.jobPostUrl,
      notes: formData.notes,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ubah Lamaran Kerja</DialogTitle>
          <DialogDescription>
            Ubah detail lamaran kerja kamu di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-companyName">Nama Perusahaan *</Label>
              <Input
                id="edit-companyName"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange('companyName', e.target.value)
                }
                placeholder="Masukkan nama perusahaan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-positionTitle">Posisi yang dilamar *</Label>
              <Input
                id="edit-positionTitle"
                value={formData.positionTitle}
                onChange={(e) =>
                  handleInputChange('positionTitle', e.target.value)
                }
                placeholder="Masukkan posisi yang dilamar"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-appliedDate">Tanggal Lamaran *</Label>
            <Input
              id="edit-appliedDate"
              type="date"
              value={formData.appliedDate}
              onChange={(e) => handleInputChange('appliedDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-jobPostUrl">URL Lowongan Pekerjaan</Label>
            <Input
              id="edit-jobPostUrl"
              type="url"
              value={formData.jobPostUrl}
              onChange={(e) => handleInputChange('jobPostUrl', e.target.value)}
              placeholder="https://company.com/jobs/position"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Catatan</Label>
            <textarea
              id="edit-notes"
              className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Tambahkan catatan atau informasi tambahan tentang lamaran ini..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateJobMutation.isPending ||
                !formData.companyName ||
                !formData.positionTitle
              }
            >
              {updateJobMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
