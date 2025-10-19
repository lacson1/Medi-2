import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Workflow,
    Clock,
    Users,
    Calendar,
    Bell,
    CheckCircle,
    AlertTriangle,
    Settings,
    Play,
    Pause,
    RotateCcw,
    Zap,
    ArrowRight,
    Mail,
    MessageSquare,
    FileText,
    UserCheck
} from 'lucide-react';
import { mockSpecialtyConsultations, mockSpecialists, mockConsultationTemplates } from '@/data/consultationData';

interface WorkflowRule {
    id: string;
    name: string;
    description: string;
    trigger: string;
    conditions: Array<{
        field: string;
        operator: string;
        value: string;
    }>;
    actions: Array<{
        type: string;
        config: Record<string, any>;
    }>;
    isActive: boolean;
    priority: number;
}

interface WorkflowExecution {
    id: string;
    ruleId: string;
    ruleName: string;
    consultationId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt: string;
    completedAt?: string;
    result?: string;
    error?: string;
}

export default function ConsultationWorkflowAutomation() {
    const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([
        {
            id: 'rule-1',
            name: 'Auto-assign Cardiology Consultations',
            description: 'Automatically assign cardiology consultations to available cardiologists',
            trigger: 'consultation_created',
            conditions: [
                { field: 'specialty', operator: 'equals', value: 'cardiology' },
                { field: 'priority', operator: 'equals', value: 'urgent' }
            ],
            actions: [
                { type: 'assign_specialist', config: { specialty: 'cardiology' } },
                { type: 'send_notification', config: { recipient: 'specialist', message: 'New urgent cardiology consultation assigned' } }
            ],
            isActive: true,
            priority: 1
        },
        {
            id: 'rule-2',
            name: 'Follow-up Reminder',
            description: 'Send follow-up reminders for completed consultations',
            trigger: 'consultation_completed',
            conditions: [
                { field: 'follow_up_required', operator: 'equals', value: 'true' }
            ],
            actions: [
                { type: 'schedule_reminder', config: { days: 7, message: 'Follow-up consultation reminder' } },
                { type: 'send_notification', config: { recipient: 'patient', message: 'Follow-up consultation scheduled' } }
            ],
            isActive: true,
            priority: 2
        },
        {
            id: 'rule-3',
            name: 'Template Auto-fill',
            description: 'Auto-fill consultation forms based on patient history',
            trigger: 'consultation_started',
            conditions: [
                { field: 'patient_has_history', operator: 'equals', value: 'true' }
            ],
            actions: [
                { type: 'auto_fill_form', config: { source: 'patient_history' } },
                { type: 'suggest_tests', config: { based_on: 'symptoms' } }
            ],
            isActive: false,
            priority: 3
        }
    ]);

    const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowExecution[]>([
        {
            id: 'exec-1',
            ruleId: 'rule-1',
            ruleName: 'Auto-assign Cardiology Consultations',
            consultationId: 'consultation-1',
            status: 'completed',
            startedAt: '2024-01-15T10:00:00Z',
            completedAt: '2024-01-15T10:05:00Z',
            result: 'Successfully assigned to Dr. Sarah Chen'
        },
        {
            id: 'exec-2',
            ruleId: 'rule-2',
            ruleName: 'Follow-up Reminder',
            consultationId: 'consultation-2',
            status: 'running',
            startedAt: '2024-01-16T14:00:00Z'
        },
        {
            id: 'exec-3',
            ruleId: 'rule-1',
            ruleName: 'Auto-assign Cardiology Consultations',
            consultationId: 'consultation-3',
            status: 'failed',
            startedAt: '2024-01-17T09:00:00Z',
            completedAt: '2024-01-17T09:02:00Z',
            error: 'No available cardiologists found'
        }
    ]);

    const [isCreatingRule, setIsCreatingRule] = useState(false);
    const [newRule, setNewRule] = useState<Partial<WorkflowRule>>({
        name: '',
        description: '',
        trigger: 'consultation_created',
        conditions: [],
        actions: [],
        isActive: true,
        priority: 1
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'running': return 'bg-blue-100 text-blue-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'running': return <Play className="w-4 h-4" />;
            case 'failed': return <AlertTriangle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const handleToggleRule = (ruleId: string) => {
        setWorkflowRules(rules =>
            rules.map(rule =>
                rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
            )
        );
    };

    const handleCreateRule = () => {
        if (newRule.name && newRule.description) {
            const rule: WorkflowRule = {
                id: Date.now().toString(),
                name: newRule.name,
                description: newRule.description,
                trigger: newRule.trigger || 'consultation_created',
                conditions: newRule.conditions || [],
                actions: newRule.actions || [],
                isActive: newRule.isActive || true,
                priority: newRule.priority || 1
            };
            setWorkflowRules([...workflowRules, rule]);
            setNewRule({
                name: '',
                description: '',
                trigger: 'consultation_created',
                conditions: [],
                actions: [],
                isActive: true,
                priority: 1
            });
            setIsCreatingRule(false);
        }
    };

    const handleDeleteRule = (ruleId: string) => {
        setWorkflowRules(rules => rules.filter(rule => rule.id !== ruleId));
    };

    const getTriggerLabel = (trigger: string) => {
        switch (trigger) {
            case 'consultation_created': return 'Consultation Created';
            case 'consultation_started': return 'Consultation Started';
            case 'consultation_completed': return 'Consultation Completed';
            case 'consultation_cancelled': return 'Consultation Cancelled';
            case 'follow_up_due': return 'Follow-up Due';
            default: return trigger;
        }
    };

    const getActionLabel = (action: any) => {
        switch (action.type) {
            case 'assign_specialist': return 'Assign Specialist';
            case 'send_notification': return 'Send Notification';
            case 'schedule_reminder': return 'Schedule Reminder';
            case 'auto_fill_form': return 'Auto-fill Form';
            case 'suggest_tests': return 'Suggest Tests';
            default: return action.type;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Consultation Workflow Automation</h2>
                    <p className="text-gray-600">Automate consultation processes and improve efficiency</p>
                </div>
                <Button onClick={() => setIsCreatingRule(true)} className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Create Rule
                </Button>
            </div>

            {/* Workflow Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {workflowRules.filter(rule => rule.isActive).length}
                                </p>
                            </div>
                            <Workflow className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Executions Today</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {workflowExecutions.filter(exec =>
                                        new Date(exec.startedAt).toDateString() === new Date().toDateString()
                                    ).length}
                                </p>
                            </div>
                            <Play className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {workflowExecutions.length > 0 ?
                                        Math.round((workflowExecutions.filter(exec => exec.status === 'completed').length / workflowExecutions.length) * 100) : 0}%
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {workflowExecutions.filter(exec => exec.status === 'completed').length * 15}m
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Workflow Management */}
            <Tabs defaultValue="rules" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rules">Workflow Rules</TabsTrigger>
                    <TabsTrigger value="executions">Executions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="rules" className="space-y-6">
                    {/* Create New Rule */}
                    {isCreatingRule && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Workflow Rule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="rule-name">Rule Name</Label>
                                        <Input
                                            id="rule-name"
                                            value={newRule.name}
                                            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                            placeholder="Enter rule name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rule-trigger">Trigger</Label>
                                        <Select value={newRule.trigger} onValueChange={(value) => setNewRule({ ...newRule, trigger: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="consultation_created">Consultation Created</SelectItem>
                                                <SelectItem value="consultation_started">Consultation Started</SelectItem>
                                                <SelectItem value="consultation_completed">Consultation Completed</SelectItem>
                                                <SelectItem value="consultation_cancelled">Consultation Cancelled</SelectItem>
                                                <SelectItem value="follow_up_due">Follow-up Due</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="rule-description">Description</Label>
                                    <Input
                                        id="rule-description"
                                        value={newRule.description}
                                        onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                        placeholder="Enter rule description"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={newRule.isActive}
                                            onCheckedChange={(checked) => setNewRule({ ...newRule, isActive: checked })}
                                        />
                                        <Label>Active</Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" onClick={() => setIsCreatingRule(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCreateRule}>
                                            Create Rule
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Workflow Rules List */}
                    <div className="space-y-4">
                        {workflowRules.map((rule) => (
                            <Card key={rule.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">{rule.name}</h3>
                                                <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {rule.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge variant="outline">Priority {rule.priority}</Badge>
                                            </div>

                                            <p className="text-gray-600 mb-4">{rule.description}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Trigger</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Bell className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm">{getTriggerLabel(rule.trigger)}</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                                                    <div className="space-y-1">
                                                        {rule.actions.map((action, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                                <span className="text-sm">{getActionLabel(action)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleRule(rule.id)}
                                            >
                                                {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="executions" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Executions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {workflowExecutions.map((execution) => (
                                    <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(execution.status)}
                                            <div>
                                                <p className="font-medium">{execution.ruleName}</p>
                                                <p className="text-sm text-gray-600">
                                                    Consultation: {execution.consultationId}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Started: {new Date(execution.startedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Badge className={getStatusColor(execution.status)}>
                                                {execution.status}
                                            </Badge>

                                            {execution.result && (
                                                <div className="text-sm text-gray-600">
                                                    {execution.result}
                                                </div>
                                            )}

                                            {execution.error && (
                                                <div className="text-sm text-red-600">
                                                    {execution.error}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workflow Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Enable Workflow Automation</h4>
                                    <p className="text-sm text-gray-600">Allow automatic execution of workflow rules</p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Email Notifications</h4>
                                    <p className="text-sm text-gray-600">Send email notifications for workflow events</p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Execution Logging</h4>
                                    <p className="text-sm text-gray-600">Keep detailed logs of workflow executions</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
