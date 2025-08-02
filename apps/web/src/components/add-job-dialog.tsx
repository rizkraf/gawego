import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { JobStatus } from './job-kanban-board';
import DatePicker from './ui/datepicker';

interface AddJobDialogProps {
  onSuccess: () => void;
}

export function AddJobDialog({ onSuccess }: AddJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    positionTitle: '',
    status: 'applied' as JobStatus,
    appliedDate: new Date().toISOString().split('T')[0],
    jobPostUrl: '',
    notes: '',
  });

  const createJobMutation = useMutation(
    trpc.application.create.mutationOptions({
      onSuccess: () => {
        onSuccess();
        setOpen(false);
        setFormData({
          companyName: '',
          positionTitle: '',
          status: 'applied',
          appliedDate: new Date().toISOString().split('T')[0],
          jobPostUrl: '',
          notes: '',
        });
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nama Perusahaan *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange('companyName', e.target.value)
                }
                placeholder="Masukkan nama perusahaan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionTitle">Posisi yang dilamar *</Label>
              <Input
                id="positionTitle"
                value={formData.positionTitle}
                onChange={(e) =>
                  handleInputChange('positionTitle', e.target.value)
                }
                placeholder="Masukkan posisi yang dilamar"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Dilamar</SelectItem>
                  <SelectItem value="interviewing">Wawancara</SelectItem>
                  <SelectItem value="offering">Tawaran</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="withdrawn">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appliedDate">Tanggal Melamar *</Label>
              <DatePicker
                date={
                  formData.appliedDate
                    ? new Date(formData.appliedDate)
                    : undefined
                }
                onDateChange={(date) =>
                  handleInputChange(
                    'appliedDate',
                    date
                      ? new Date(
                          Date.UTC(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate()
                          )
                        )
                          .toISOString()
                          .split('T')[0]
                      : ''
                  )
                }
                className="w-full"
                format={(date) =>
                  date ? date.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Pilih tanggal'
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobPostUrl">URL Lowongan Kerja</Label>
            <Input
              id="jobPostUrl"
              type="url"
              value={formData.jobPostUrl}
              onChange={(e) => handleInputChange('jobPostUrl', e.target.value)}
              placeholder="https://company.com/jobs/position"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <textarea
              id="notes"
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
              disabled={createJobMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                createJobMutation.isPending ||
                !formData.companyName ||
                !formData.positionTitle
              }
            >
              {createJobMutation.isPending
                ? 'Sedang menambahkan...'
                : 'Tambah Lamaran'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
