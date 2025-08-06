import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table';
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
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
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
  Search,
  X,
  ArrowUpDown,
} from 'lucide-react';
import type { Job } from './job-kanban-board';
import { useDebounce } from '@/hooks/use-debounce';

interface ArchiveTableProps {
  isPending: boolean;
}

export function ArchiveTable({ isPending }: ArchiveTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, refetch, isLoading } = useQuery(
    trpc.application.getAll.queryOptions({
      archived: true,
      search: debouncedSearchTerm || undefined,
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
    })
  );

  const jobs = data?.data || [];
  const paginationInfo = data?.pagination || {
    page: 0,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  };

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
    accepted: 'bg-purple-100 text-purple-800',
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

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const columns = useMemo<ColumnDef<Job>[]>(
    () => [
      {
        accessorKey: 'position_title',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-medium hover:bg-transparent"
            >
              Posisi
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="line-clamp-1 font-medium">
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
          );
        },
      },
      {
        accessorKey: 'companyName',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-medium hover:bg-transparent"
            >
              Perusahaan
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{row.getValue('companyName')}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string || 'applied';
          return (
            <Badge
              variant="secondary"
              className={`${statusColors[status as keyof typeof statusColors]}`}
            >
              {translateStatus(status)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'appliedDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-medium hover:bg-transparent"
            >
              Tanggal Lamar
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{row.getValue('appliedDate')}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'notes',
        header: 'Catatan',
        cell: ({ row }) => {
          const notes = row.getValue('notes') as string;
          return notes ? (
            <span className="text-sm text-muted-foreground line-clamp-2">
              {notes}
            </span>
          ) : null;
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const job = row.original;
          return (
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
                  onClick={() => {
                    setSelectedJob(job);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [statusColors, translateStatus]
  );

  const table = useReactTable({
    data: jobs,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: paginationInfo.totalPages,
  });

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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Arsip Lamaran Kerja</h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama perusahaan, posisi, atau catatan..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results Info */}
      {debouncedSearchTerm && (
        <div className="text-sm text-gray-600">
          {paginationInfo.totalCount === 0 ? (
            <span>Tidak ada hasil untuk "{debouncedSearchTerm}"</span>
          ) : (
            <span>
              Menampilkan {paginationInfo.totalCount} hasil untuk "{debouncedSearchTerm}"
            </span>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending || isLoading ? (
              renderSkeletonRows()
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {debouncedSearchTerm
                    ? `Tidak ada hasil untuk "${debouncedSearchTerm}"`
                    : "Tidak ada lamaran kerja yang diarsipkan."
                  }
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalCount={paginationInfo.totalCount}
        totalPages={paginationInfo.totalPages}
        onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
        onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
      />

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
