import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  patient_id: string;
  status: string;
  refills?: number;
  start_date: string;
  created_date?: string;
  prescribing_doctor?: string;
  duration_days?: string;
}

interface PrescriptionDataGridProps {
  prescriptions: Prescription[];
  patients: any[];
  onView?: (prescription: Prescription) => void;
  onEdit?: (prescription: Prescription) => void;
  onDelete?: (prescriptionId: string) => void;
  onBulkAction?: (action: string, prescriptionIds: string[]) => void;
}

// Get patient name helper
const getPatientName = (patientId: string, patients: any[]) => {
  const patient = patients.find(p => p.id === patientId);
  return patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Unknown Patient';
};

// Get status badge
const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { variant: any; color: string; icon: string }> = {
    active: { variant: 'default', color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢' },
    pending: { variant: 'default', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡' },
    completed: { variant: 'default', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔵' },
    discontinued: { variant: 'destructive', color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' },
    on_hold: { variant: 'outline', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⚪' },
  };

  const config = statusConfig[status] || statusConfig.active;
  return (
    <Badge className={config.color}>
      {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Get drug category badge
const getDrugCategoryBadge = (medicationName: string) => {
  const name = medicationName.toLowerCase();
  if (name.includes('amoxicillin') || name.includes('penicillin') || name.includes('cephalexin')) {
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Antibiotic</Badge>;
  }
  if (name.includes('lisinopril') || name.includes('metoprolol') || name.includes('warfarin')) {
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cardiovascular</Badge>;
  }
  if (name.includes('metformin') || name.includes('insulin')) {
    return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Diabetes</Badge>;
  }
  if (name.includes('ibuprofen') || name.includes('acetaminophen')) {
    return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pain Management</Badge>;
  }
  return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Other</Badge>;
};

export default function PrescriptionDataGrid({
  prescriptions,
  patients,
  onView,
  onEdit,
  onDelete,
  onBulkAction,
}: PrescriptionDataGridProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_date', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Columns definition
  const columns = useMemo<ColumnDef<Prescription>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'medication_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Medication
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{row.original.medication_name}</div>
            {getDrugCategoryBadge(row.original.medication_name)}
          </div>
        ),
      },
      {
        accessorKey: 'patient_id',
        header: 'Patient',
        cell: ({ row }) => getPatientName(row.original.patient_id, patients),
      },
      {
        accessorKey: 'dosage',
        header: 'Dosage',
        cell: ({ row }) => (
          <div>
            {row.original.dosage} {row.original.dosage_unit || 'mg'}
          </div>
        ),
      },
      {
        accessorKey: 'frequency',
        header: 'Frequency',
        cell: ({ row }) => row.original.frequency || 'N/A',
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => getStatusBadge(row.original.status),
        filterFn: (row, id, value) => {
          if (value === 'all') return true;
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'refills',
        header: 'Refills',
        cell: ({ row }) => {
          const refills = row.original.refills || 0;
          if (refills === 0) return <span className="text-gray-500">No refills</span>;
          
          // Calculate if refill is due soon
          const startDate = parseISO(row.original.start_date);
          const durationDays = parseInt(row.original.duration_days || '30');
          const nextRefillDate = addDays(startDate, durationDays);
          const daysUntilRefill = differenceInDays(nextRefillDate, new Date());
          
          if (daysUntilRefill <= 3 && daysUntilRefill >= 0) {
            return (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {refills} ({daysUntilRefill}d)
              </Badge>
            );
          }
          return <span>{refills}</span>;
        },
      },
      {
        accessorKey: 'created_date',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Prescribed
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.original.created_date || row.original.start_date;
          return date ? format(parseISO(date), 'MMM d, yyyy') : 'N/A';
        },
      },
      {
        accessorKey: 'prescribing_doctor',
        header: 'Prescribed By',
        cell: ({ row }) => row.original.prescribing_doctor || 'N/A',
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const prescription = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {onView && (
                  <DropdownMenuItem onClick={() => onView(prescription)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(prescription)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this prescription?')) {
                        onDelete(prescription.id);
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [patients, onView, onEdit, onDelete]
  );

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = prescriptions;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply global filter
    if (globalFilter) {
      filtered = filtered.filter(p =>
        p.medication_name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        getPatientName(p.patient_id, patients).toLowerCase().includes(globalFilter.toLowerCase()) ||
        p.dosage.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    return filtered;
  }, [prescriptions, statusFilter, globalFilter, patients]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Bulk actions
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(row => row.original.id);

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one prescription');
      return;
    }

    if (onBulkAction) {
      onBulkAction(action, selectedIds);
    } else {
      toast.success(`Bulk action "${action}" applied to ${selectedIds.length} prescription(s)`);
    }

    // Clear selection
    setRowSelection({});
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search medications, patients, or dosages..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedIds.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Bulk Actions ({selectedIds.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('mark_complete')}>
                  Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('renew')}>
                  Renew
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('send_alert')}>
                  Send Refill Alert
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.resetSorting()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No prescriptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedIds.length > 0 && (
            <span>
              {selectedIds.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          )}
          <span className="ml-2">
            Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s).
          </span>
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

