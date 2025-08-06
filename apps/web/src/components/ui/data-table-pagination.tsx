import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps) {
  const currentPage = pageIndex + 1; // Convert 0-based to 1-based for display
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalCount);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {totalCount === 0 ? (
          "Tidak ada data"
        ) : (
          <>
            Menampilkan {startItem} hingga {endItem} dari {totalCount} entri
          </>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Baris per halaman</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[150px] items-center justify-center text-sm font-medium">
          Halaman {currentPage} dari {Math.max(totalPages, 1)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(0)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Ke halaman pertama</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Ke halaman sebelumnya</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
          >
            <span className="sr-only">Ke halaman selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={pageIndex >= totalPages - 1}
          >
            <span className="sr-only">Ke halaman terakhir</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
