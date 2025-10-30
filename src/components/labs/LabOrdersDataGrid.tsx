import React, { useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Eye, Edit, FilePlus2, Trash2 } from 'lucide-react';

type LabOrdersDataGridProps = {
  orders: any[];
  isLoading?: boolean;
  search: string;
  onNavigateToPatient?: (patientId: string) => void;
};

export default function LabOrdersDataGrid({ orders, isLoading, search, onNavigateToPatient }: LabOrdersDataGridProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((o: any) =>
      [o?.id, o?.patient_name, o?.test_name, o?.doctor_name, o?.status]
        .filter(Boolean)
        .some((v: any) => String(v).toLowerCase().includes(term))
    );
  }, [orders, search]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: 'id', header: sortableHeader('Order ID') },
    { accessorKey: 'patient_name', header: sortableHeader('Patient') },
    { accessorKey: 'test_name', header: sortableHeader('Test Name') },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = String(getValue() ?? '').toLowerCase();
        const variant = statusVariant(status);
        return <Badge variant={variant}>{statusLabel(status)}</Badge>;
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ getValue }) => <span className="capitalize">{String(getValue() ?? 'normal')}</span>,
    },
    { accessorKey: 'doctor_name', header: sortableHeader('Doctor') },
    { accessorKey: 'due_date', header: sortableHeader('Due Date') },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="icon" onClick={() => onNavigateToPatient?.(row.original.patient_id)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <FilePlus2 className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [onNavigateToPatient]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading lab orders…</div>;
  }

  if (!filtered?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">🧪</div>
        <p className="text-muted-foreground">No lab orders yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'flex items-center gap-1 cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header as any, header.getContext())}
                        {header.column.getCanSort() ? <ArrowUpDown className="w-3.5 h-3.5" /> : null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className={rowClass(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <div className="group">{flexRender(cell.column.columnDef.cell as any, cell.getContext())}</div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="text-xs text-muted-foreground">
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          -
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filtered.length)}
          {' '}of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function sortableHeader(label: string) {
  return () => <div className="inline-flex items-center gap-1">{label}</div>;
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'completed') return 'secondary';
  if (status === 'overdue') return 'destructive';
  if (status === 'in_process' || status === 'pending') return 'default';
  return 'outline';
}

function statusLabel(status: string) {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function rowClass(order: any) {
  if (order?.status === 'completed') return 'bg-muted/40';
  if (order?.status === 'pending' || order?.status === 'in_process') return 'bg-amber-50 dark:bg-amber-950/20';
  if (order?.status === 'overdue') return 'bg-red-50 dark:bg-red-950/20';
  return '';
}


