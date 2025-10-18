import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  FileText,
  TestTube,
  Microscope,
  Calendar,
  User,
  Activity,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { format, parseISO, differenceInHours, isAfter, addHours } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WORKFLOW_STAGES = {
  requested: {
    label: 'Requested',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
    description: 'Lab test has been requested by physician'
  },
  ordered: {
    label: 'Ordered',
    color: 'bg-gray-100 text-gray-800',
    icon: FileText,
    description: 'Lab order has been placed and confirmed'
  },
  specimen_collected: {
    label: 'Specimen Collected',
    color: 'bg-purple-100 text-purple-800',
    icon: TestTube,
    description: 'Specimen has been collected from patient'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-orange-100 text-orange-800',
    icon: Activity,
    description: 'Test is being processed in the laboratory'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Test has been completed and results are ready'
  },
  reviewed: {
    label: 'Reviewed',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Eye,
    description: 'Results have been reviewed by physician'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    description: 'Test has been cancelled'
  }
};

const WORKFLOW_TRANSITIONS = {
  requested: ['ordered', 'cancelled'],
  ordered: ['specimen_collected', 'cancelled'],
  specimen_collected: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['reviewed'],
  reviewed: [],
  cancelled: []
};

export default function LabWorkflowManager({ labOrders = [], patients = [] }: any) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [workflowNotes, setWorkflowNotes] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Update lab order workflow
  const updateWorkflowMutation = useMutation({
    mutationFn: ({ orderId, updates }) => mockApiClient.entities.LabOrder.update(orderId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labOrders'] });
      setSelectedOrder(null);
      setWorkflowNotes('');
      setEstimatedCompletion('');
      setSelectedStage('');
      setError(null);
    },
    onError: (error: any) => {
      console.error('Failed to update workflow:', error);
      setError(error.message || 'Failed to update workflow status');
    }
  });

  // Group orders by workflow stage
  const ordersByStage = React.useMemo(() => {
    const grouped = {};
    Object.keys(WORKFLOW_STAGES).forEach(stage => {
      grouped[stage] = labOrders.filter(order => order.status === stage);
    });
    return grouped;
  }, [labOrders]);

  const handleStageTransition = (orderId: any, newStage: any) => {
    const updates = {
      status: newStage,
      workflow_notes: workflowNotes,
      estimated_completion: estimatedCompletion,
      last_updated: new Date().toISOString(),
      updated_by: 'current_user' // This should come from auth context
    };

    updateWorkflowMutation.mutate({ orderId, updates });
  };

  const getOrderPriority = (order: any) => {
    if (order.priority === 'stat') return { color: 'bg-red-200 text-red-900', label: 'STAT' };
    if (order.priority === 'urgent') return { color: 'bg-red-100 text-red-800', label: 'Urgent' };
    if (order.priority === 'routine') return { color: 'bg-blue-100 text-blue-800', label: 'Routine' };
    return { color: 'bg-gray-100 text-gray-800', label: 'Low' };
  };

  const isOverdue = (order: any) => {
    if (!order.due_date) return false;
    return isAfter(new Date(), parseISO(order.due_date)) && order.status !== 'completed';
  };

  const getTimeInStage = (order: any) => {
    if (!order.stage_start_time) return 'Unknown';
    const hours = differenceInHours(new Date(), parseISO(order.stage_start_time));
    if (hours < 1) return '< 1 hour';
    if (hours < 24) return `${hours} hours`;
    return `${Math.floor(hours / 24)} days`;
  };

  const OrderCard = ({ order, stage }: any) => {
    const patient = patients.find(p => p.id === order.patient_id);
    const priority = getOrderPriority(order);
    const overdue = isOverdue(order);
    const timeInStage = getTimeInStage(order);
    const canTransition = WORKFLOW_TRANSITIONS[stage]?.length > 0;

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${overdue ? 'border-red-300 bg-red-50' : ''}`}
        onClick={() => setSelectedOrder(order)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{order.test_name}</h4>
              <p className="text-xs text-gray-600">{patient?.name || 'Unknown Patient'}</p>
            </div>
            <div className="flex gap-1">
              <Badge className={priority.color} variant="outline">
                {priority.label}
              </Badge>
              {overdue && (
                <Badge className="bg-red-100 text-red-800" variant="outline">
                  Overdue
                </Badge>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Ordered: {format(parseISO(order.date_ordered), 'MMM d, HH:mm')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              In stage: {timeInStage}
            </div>
            {order.ordering_doctor && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Dr. {order.ordering_doctor}
              </div>
            )}
          </div>

          {canTransition && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="flex gap-1">
                {WORKFLOW_TRANSITIONS[stage].map(nextStage => (
                  <Button
                    key={nextStage}
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setSelectedStage(nextStage);
                    }}
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    {WORKFLOW_STAGES[nextStage].label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setError(null)}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Lab Workflow Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ordersByStage).map(([stage, orders]) => {
              const stageConfig = WORKFLOW_STAGES[stage];
              const StageIcon = stageConfig.icon;

              return (
                <div key={stage} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <StageIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{stageConfig.label}</h3>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{stageConfig.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(WORKFLOW_STAGES).map(([stage, config]) => {
          const orders = ordersByStage[stage];
          const StageIcon = config.icon;

          return (
            <Card key={stage}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <StageIcon className="w-4 h-4" />
                  {config.label}
                  <Badge className={config.color} variant="outline">
                    {orders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No orders in this stage</p>
                ) : (
                  orders.map(order => (
                    <OrderCard key={order.id} order={order} stage={stage} />
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lab Order Details</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Test Name</Label>
                  <p className="text-sm">{selectedOrder.test_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm">{patients.find(p => p.id === selectedOrder.patient_id)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <Badge className={WORKFLOW_STAGES[selectedOrder.status]?.color}>
                    {WORKFLOW_STAGES[selectedOrder.status]?.label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getOrderPriority(selectedOrder).color}>
                    {getOrderPriority(selectedOrder).label}
                  </Badge>
                </div>
              </div>

              {selectedStage && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Transition to {WORKFLOW_STAGES[selectedStage]?.label}</h4>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="workflow-notes">Workflow Notes</Label>
                      <Textarea
                        id="workflow-notes"
                        value={workflowNotes}
                        onChange={(e) => setWorkflowNotes(e.target.value)}
                        placeholder="Add notes about this transition..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="estimated-completion">Estimated Completion</Label>
                      <Input
                        id="estimated-completion"
                        type="datetime-local"
                        value={estimatedCompletion}
                        onChange={(e) => setEstimatedCompletion(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStageTransition(selectedOrder.id, selectedStage)}
                        disabled={updateWorkflowMutation.isPending}
                      >
                        {updateWorkflowMutation.isPending ? 'Updating...' : 'Confirm Transition'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedStage('');
                          setWorkflowNotes('');
                          setEstimatedCompletion('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Workflow History */}
              {selectedOrder.workflow_history && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Workflow History</h4>
                  <div className="space-y-2">
                    {selectedOrder.workflow_history.map((entry, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <span className="font-medium">{entry.stage}</span>
                          <span className="text-gray-500 ml-2">
                            {format(parseISO(entry.timestamp), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        <span className="text-gray-500">{entry.updated_by}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
