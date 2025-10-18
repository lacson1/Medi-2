import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Beaker,
  Edit,
  Calendar,
  CheckCircle,
  FileClock,
  Download,
  Eye,
  AlertTriangle,
  Clock,
  Activity,
  TestTube,
  Microscope,
  Plus,
  Search,
  Printer
} from "lucide-react";
import { format, parseISO, differenceInDays, isAfter } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PrintableLabOrderForm from "../labs/PrintableLabOrderForm";
import PropTypes from "prop-types";

const WORKFLOW_STAGES = {
  requested: { icon: FileClock, color: "bg-blue-100 text-blue-800", label: "Requested" },
  ordered: { icon: FileClock, color: "bg-gray-100 text-gray-800", label: "Ordered" },
  specimen_collected: { icon: TestTube, color: "bg-purple-100 text-purple-800", label: "Specimen Collected" },
  in_progress: { icon: Activity, color: "bg-orange-100 text-orange-800", label: "In Progress" },
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  completed: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Completed" },
  reviewed: { icon: Eye, color: "bg-indigo-100 text-indigo-800", label: "Reviewed" },
  cancelled: { icon: AlertTriangle, color: "bg-red-100 text-red-800", label: "Cancelled" }
};

const PRIORITY_LEVELS = {
  stat: { color: "bg-red-200 text-red-900", label: "STAT" },
  urgent: { color: "bg-orange-100 text-orange-800", label: "Urgent" },
  routine: { color: "bg-blue-100 text-blue-800", label: "Routine" },
  low: { color: "bg-gray-100 text-gray-800", label: "Low" }
};

const TEST_CATEGORIES = {
  hematology: { icon: TestTube, color: "bg-red-100 text-red-800", label: "Hematology" },
  chemistry: { icon: Beaker, color: "bg-blue-100 text-blue-800", label: "Chemistry" },
  microbiology: { icon: Microscope, color: "bg-green-100 text-green-800", label: "Microbiology" },
  immunology: { icon: Activity, color: "bg-purple-100 text-purple-800", label: "Immunology" },
  pathology: { icon: Eye, color: "bg-orange-100 text-orange-800", label: "Pathology" },
  other: { icon: Beaker, color: "bg-gray-100 text-gray-800", label: "Other" }
};

// LabOrderCard component
const LabOrderCard = ({ order, onEdit, onPrint }: any) => {
  const getStatusConfig = (status: any) => {
    return WORKFLOW_STAGES[status] || WORKFLOW_STAGES.ordered;
  };

  const getPriorityConfig = (priority: any) => {
    return PRIORITY_LEVELS[priority] || PRIORITY_LEVELS.routine;
  };

  const getCategoryConfig = (category: any) => {
    return TEST_CATEGORIES[category] || TEST_CATEGORIES.other;
  };

  const isOverdue = (order: any) => {
    if (!order.due_date) return false;
    return isAfter(new Date(), parseISO(order.due_date)) && order.status !== 'completed';
  };

  const getTimeInStage = (order: any) => {
    if (!order.stage_start_time) return 'Unknown';
    const days = differenceInDays(new Date(), parseISO(order.stage_start_time));
    if (days === 0) return '< 1 day';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const statusConfig = getStatusConfig(order.status);
  const priorityConfig = getPriorityConfig(order.priority);
  const categoryConfig = getCategoryConfig(order.test_category);
  const overdue = isOverdue(order);
  const timeInStage = getTimeInStage(order);
  const StatusIcon = statusConfig.icon;
  const CategoryIcon = categoryConfig.icon;

  return (
    <Card className={`hover:shadow-md transition-shadow ${overdue ? 'border-red-300 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-lg">{order.test_name}</h4>
              <Badge className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
              {overdue && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Ordered: {format(parseISO(order.date_ordered), "MMM d, yyyy")}
              </div>
              {order.due_date && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Due: {format(parseISO(order.due_date), "MMM d, yyyy")}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                In stage: {timeInStage}
              </div>
            </div>

            {order.ordering_doctor && (
              <p className="text-sm text-gray-600 mb-2">By: Dr. {order.ordering_doctor}</p>
            )}

            {order.clinical_indication && (
              <p className="text-sm italic text-gray-600 mb-2">
                <span className="font-medium">Indication:</span> {order.clinical_indication}
              </p>
            )}

            {order.results_summary && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Results Summary:</p>
                <p className="text-sm text-gray-600">{order.results_summary}</p>
              </div>
            )}

            {order.workflow_notes && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Workflow Notes:</span> {order.workflow_notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint(order)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Print Lab Order"
            >
              <Printer className="w-4 h-4" />
            </Button>
            {order.result_file_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={order.result_file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4" />
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onEdit(order)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function PatientLabOrders({ labOrders, isLoading, onEdit, onAddNew, patient }: any) {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  });
  const [showPrintableForm, setShowPrintableForm] = useState(false);
  const [selectedLabOrder, setSelectedLabOrder] = useState(null);

  const handlePrintLabOrder = (labOrder: any) => {
    setSelectedLabOrder(labOrder);
    setShowPrintableForm(true);
  };

  const handleClosePrintableForm = () => {
    setShowPrintableForm(false);
    setSelectedLabOrder(null);
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (!labOrders || labOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <Beaker className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">No lab orders found</p>
        {onAddNew && (
          <Button onClick={onAddNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Lab Order
          </Button>
        )}
      </div>
    );
  }

  // Filter lab orders based on current filters
  const filteredLabOrders = labOrders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.priority !== 'all' && order.priority !== filters.priority) return false;
    if (filters.category !== 'all' && order.test_category !== filters.category) return false;
    if (filters.search && !order.test_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Group orders by status for tabs
  const ordersByStatus = {
    all: filteredLabOrders,
    pending: filteredLabOrders.filter(order => ['requested', 'ordered', 'specimen_collected', 'in_progress', 'pending'].includes(order.status)),
    completed: filteredLabOrders.filter(order => order.status === 'completed'),
    reviewed: filteredLabOrders.filter(order => order.status === 'reviewed')
  };

  // Helper functions removed - now handled by LabOrderCard component

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-blue-600" />
              Lab Orders ({filteredLabOrders.length})
            </CardTitle>
            {onAddNew && (
              <Button onClick={onAddNew} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Lab Order
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(WORKFLOW_STAGES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {Object.entries(PRIORITY_LEVELS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(TEST_CATEGORIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tests..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lab Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({ordersByStatus.all.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({ordersByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({ordersByStatus.completed.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({ordersByStatus.reviewed.length})</TabsTrigger>
        </TabsList>

        {Object.entries(ordersByStatus).map(([tab, orders]) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Beaker className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No lab orders in this category</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <LabOrderCard
                  key={order.id}
                  order={order}
                  onEdit={onEdit}
                  onPrint={handlePrintLabOrder}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Printable Lab Order Form Modal */}
      {showPrintableForm && selectedLabOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <PrintableLabOrderForm
              labOrder={selectedLabOrder}
              patient={patient}
              onClose={handleClosePrintableForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

PatientLabOrders.propTypes = {
  labOrders: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onAddNew: PropTypes.func,
  patient: PropTypes.object.isRequired,
};