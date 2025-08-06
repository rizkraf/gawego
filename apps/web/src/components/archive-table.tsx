import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EditJobDialog } from './edit-job-dialog';
import {
  MoreHorizontal,
  Edit,
  RotateCcw,
  Trash,
  ExternalLink,
  Building2,
  Calendar,
} from 'lucide-react';
import type { Job } from './job-kanban-board';

interface ArchiveTableProps {
  isPending: boolean;
}

export function ArchiveTable({ isPending }: ArchiveTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs = [], refetch, isLoading } = useQuery(
    trpc.application.getAll.queryOptions({
      archived: true,
    })
  );

  const deleteJobMutation = useMutation(
    trpc.application.delete.mutationOptions({
      onSuccess: () => {
        refetch();
        setIsDeleteDialogOpen(false);
        setSelectedJob(null);
      },
    })
  );

  const unarchiveJobMutation = useMutation(
    trpc.application.archive.mutationOptions({
      onSuccess: () => {
        refetch();
        setIsUnarchiveDialogOpen(false);
        setSelectedJob(null);
      },
    })
  );

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
      accepted: 'Diterima',
      rejected: 'Ditolak',
      withdrawn: 'Dibatalkan',
    };

    return (
      statusTranslations[status as keyof typeof statusTranslations] || status
    );
  };

  const handleDelete = () => {
    if (selectedJob) {
      deleteJobMutation.mutate({ id: selectedJob.id });
    }
  };

  const handleUnarchive = () => {
    if (selectedJob) {
      unarchiveJobMutation.mutate({
        id: selectedJob.id,
        isArchived: false,
      });
    }
  };

  const handleJobUpdated = () => {
    refetch();
    setIsEditDialogOpen(false);
    setSelectedJob(null);
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-48" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20 rounded-full" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-40" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-8" />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-bold">Arsip Lamaran Kerja</h1>
      <p className="text-muted-foreground">
        Kelola lamaran kerja yang telah diarsipkan
      </p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posisi</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Lamar</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead className="w-[50px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending || isLoading ? (
              renderSkeletonRows()
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada lamaran kerja yang diarsipkan.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job: Job) => {
                const status = job.status || 'applied';
                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span className="line-clamp-1">
                          {job.position_title}
                        </span>
                        {job.jobPostUrl && (
                          <a
                            href={job.jobPostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Lihat Posting
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{job.companyName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[status as keyof typeof statusColors]}`}
                      >
                        {translateStatus(status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{job.appliedDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.notes && (
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {job.notes}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedJob(job);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            Ubah
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedJob(job);
                              setIsUnarchiveDialogOpen(true);
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Pulihkan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setSelectedJob(job);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedJob && (
        <>
          <EditJobDialog
            job={selectedJob}
            onSuccess={handleJobUpdated}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />

          <ConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Hapus Lamaran Kerja"
            description="Apakah Anda yakin ingin menghapus lamaran kerja ini? Tindakan ini tidak dapat dibatalkan."
            confirmText="Hapus"
            onConfirm={handleDelete}
            variant="destructive"
          />

          <ConfirmDialog
            open={isUnarchiveDialogOpen}
            onOpenChange={setIsUnarchiveDialogOpen}
            title="Pulihkan Lamaran Kerja"
            description="Apakah Anda yakin ingin memulihkan lamaran kerja ini dari arsip?"
            confirmText="Pulihkan"
            onConfirm={handleUnarchive}
          />
        </>
      )}
    </div>
  );
}
