import React from 'react';
import { useForm } from '@tanstack/react-form';
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
import DatePicker from './ui/datepicker';
import type { JobStatus } from './job-kanban-board';
import z from 'zod';
import { cn } from '@/lib/utils';

export interface JobFormData {
  companyName: string;
  positionTitle: string;
  status?: JobStatus;
  appliedDate: string;
  jobPostUrl?: string;
  notes?: string;
}

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showStatus?: boolean;
}

export function JobForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Simpan',
  showStatus = true,
}: JobFormProps) {
  const form = useForm({
    defaultValues: {
      companyName: initialData?.companyName ?? '',
      positionTitle: initialData?.positionTitle ?? '',
      status: initialData?.status ?? 'applied',
      appliedDate:
        initialData?.appliedDate ?? new Date().toISOString().split('T')[0],
      jobPostUrl: initialData?.jobPostUrl ?? '',
      notes: initialData?.notes ?? '',
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
    validators: {
      onSubmit: z.object({
        companyName: z.string().min(1, 'Nama perusahaan tidak boleh kosong'),
        positionTitle: z
          .string()
          .min(1, 'Posisi yang dilamar tidak boleh kosong'),
        status: z.enum([
          'applied',
          'interviewing',
          'offering',
          'accepted',
          'rejected',
          'withdrawn',
        ]),
        appliedDate: z.string().min(1, 'Tanggal melamar tidak boleh kosong'),
        jobPostUrl: z.string(),
        notes: z.string(),
      }),
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field name="companyName">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Nama Perusahaan *</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Masukkan nama perusahaan"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="positionTitle">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Posisi yang dilamar *</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Masukkan posisi yang dilamar"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div className={
        cn(
          showStatus ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-1'
        )
      }>
        {showStatus && (
          <form.Field name="status">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Status</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as JobStatus)
                  }
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
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        )}

        <form.Field name="appliedDate">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                {showStatus ? 'Tanggal Melamar' : 'Tanggal Lamaran'} *
              </Label>
              <DatePicker
                date={
                  field.state.value ? new Date(field.state.value) : undefined
                }
                onDateChange={(date) =>
                  field.handleChange(
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
                  date
                    ? date.toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Pilih tanggal'
                }
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-destructive">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="jobPostUrl">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>URL Lowongan Pekerjaan</Label>
            <Input
              id={field.name}
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://company.com/jobs/position"
            />
            {field.state.meta.errors.map((error) => (
              <p key={error?.message} className="text-xs text-destructive">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Catatan</Label>
            <textarea
              id={field.name}
              className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Tambahkan catatan atau informasi tambahan tentang lamaran ini..."
            />
            {field.state.meta.errors.map((error) => (
              <p key={error?.message} className="text-xs text-destructive">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sedang menyimpan...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
