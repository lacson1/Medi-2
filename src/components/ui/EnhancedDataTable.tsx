import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronUp,
    ChevronDown,
    MoreHorizontal,
    Filter,
    Download,
    RefreshCw,
    Search,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Column<T> {
    key: keyof T | string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface EnhancedDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    error?: string;
    onRowClick?: (row: T) => void;
    onRowSelect?: (selectedRows: T[]) => void;
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    onFilter?: (filters: Record<string, string>) => void;
    onExport?: (data: T[]) => void;
    onRefresh?: () => void;
    searchable?: boolean;
    selectable?: boolean;
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (pageSize: number) => void;
    };
    actions?: Array<{
        label: string;
        icon: React.ReactNode;
        onClick: (row: T) => void;
        variant?: 'default' | 'destructive';
    }>;
    className?: string;
}

export default function EnhancedDataTable<T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    error,
    onRowClick,
    onRowSelect,
    onSort,
    onFilter,
    onExport,
    onRefresh,
    searchable = true,
    selectable = false,
    pagination,
    actions = [],
    className
}: EnhancedDataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [filters, setFilters] = useState<Record<string, string>>({});

    // Filter and sort data
    const processedData = useMemo(() => {
        let filtered = data;

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(row =>
                columns.some(col => {
                    const value = row[col.key as keyof T];
                    return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
                })
            );
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                filtered = filtered.filter(row => {
                    const rowValue = row[key];
                    return rowValue?.toString().toLowerCase().includes(value.toLowerCase());
                });
            }
        });

        // Apply sorting
        if (sortColumn) {
            filtered = [...filtered].sort((a, b) => {
                const aValue = a[sortColumn as keyof T];
                const bValue = b[sortColumn as keyof T];

                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, filters, sortColumn, sortDirection, columns]);

    const handleSort = (column: string) => {
        if (!columns.find(col => col.key === column)?.sortable) return;

        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);
        onSort?.(column, newDirection);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(processedData);
            onRowSelect?.(processedData);
        } else {
            setSelectedRows([]);
            onRowSelect?.([]);
        }
    };

    const handleSelectRow = (row: T, checked: boolean) => {
        let newSelectedRows;
        if (checked) {
            newSelectedRows = [...selectedRows, row];
        } else {
            newSelectedRows = selectedRows.filter(r => r !== row);
        }
        setSelectedRows(newSelectedRows);
        onRowSelect?.(newSelectedRows);
    };

    const handleFilterChange = (column: string, value: string) => {
        const newFilters = { ...filters, [column]: value };
        setFilters(newFilters);
        onFilter?.(newFilters);
    };

    const renderCell = (column: Column<T>, row: T) => {
        const value = row[column.key as keyof T];

        if (column.render) {
            return column.render(value, row);
        }

        return value?.toString() || '';
    };

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ?
            <ChevronUp className="w-4 h-4" /> :
            <ChevronDown className="w-4 h-4" />;
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-center">
                    <div className="text-red-600 mb-2">Error loading data</div>
                    <p className="text-red-500 text-sm">{error}</p>
                    {onRefresh && (
                        <Button variant="outline" size="sm" onClick={onRefresh} className="mt-2">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">Data Table</h3>
                        {selectedRows.length > 0 && (
                            <Badge variant="secondary">
                                {selectedRows.length} selected
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {onRefresh && (
                            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                            </Button>
                        )}

                        {onExport && (
                            <Button variant="outline" size="sm" onClick={() => onExport(processedData)}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search */}
                {searchable && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {selectable && (
                                <th className="px-4 py-3 text-left">
                                    <Checkbox
                                        checked={selectedRows.length === processedData.length && processedData.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </th>
                            )}

                            {columns.map((column) => (
                                <th
                                    key={column.key as string}
                                    className={cn(
                                        'px-4 py-3 text-sm font-medium text-gray-700',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right',
                                        column.sortable && 'cursor-pointer hover:bg-gray-100'
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(column.key as string)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.title}</span>
                                        {column.sortable && getSortIcon(column.key as string)}
                                    </div>
                                </th>
                            ))}

                            {actions.length > 0 && (
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-4 py-8 text-center">
                                    <div className="flex items-center justify-center">
                                        <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                                        <span className="text-gray-500">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : processedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-4 py-8 text-center">
                                    <div className="text-gray-500">No data available</div>
                                </td>
                            </tr>
                        ) : (
                            processedData.map((row, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        'hover:bg-gray-50 transition-colors',
                                        onRowClick && 'cursor-pointer'
                                    )}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {selectable && (
                                        <td className="px-4 py-3">
                                            <Checkbox
                                                checked={selectedRows.includes(row)}
                                                onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                    )}

                                    {columns.map((column) => (
                                        <td
                                            key={column.key as string}
                                            className={cn(
                                                'px-4 py-3 text-sm text-gray-900',
                                                column.align === 'center' && 'text-center',
                                                column.align === 'right' && 'text-right'
                                            )}
                                        >
                                            {renderCell(column, row)}
                                        </td>
                                    ))}

                                    {actions.length > 0 && (
                                        <td className="px-4 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {actions.map((action, actionIndex) => (
                                                        <DropdownMenuItem
                                                            key={actionIndex}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                action.onClick(row);
                                                            }}
                                                            className={cn(
                                                                action.variant === 'destructive' && 'text-red-600'
                                                            )}
                                                        >
                                                            {action.icon}
                                                            <span className="ml-2">{action.label}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    )}
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                        {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            Previous
                        </Button>

                        <span className="text-sm text-gray-700">
                            Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
