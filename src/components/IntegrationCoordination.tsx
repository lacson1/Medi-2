import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    GitMerge,
    Users,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Shield,
    Zap,
    Activity,
    FileText,
    TestTube,
    GitBranch,
    Target,
    Lock,
    Unlock,
    MessageSquare,
    Calendar
} from 'lucide-react';

const IntegrationCoordination = () => {
    const [integrationPoints, setIntegrationPoints] = useState([]);
    const [coordinationRequests, setCoordinationRequests] = useState([]);
    const [qualityGates, setQualityGates] = useState([]);
    const [meetings, setMeetings] = useState([]);

    // Mock data for integration coordination
    const mockIntegrationPoints = [
        {
            id: 1,
            name: 'Authentication System',
            status: 'completed',
            agents: ['backend', 'security'],
            progress: 100,
            dependencies: [],
            blockers: [],
            last_updated: '2024-01-15T10:30:00Z',
            description: 'Complete authentication flow with JWT tokens and role-based access',
            coordination_level: 'high',
            integration_tests: 'passed',
            performance_impact: 'low',
            security_review: 'approved'
        },
        {
            id: 2,
            name: 'Patient Management',
            status: 'in_progress',
            agents: ['frontend', 'backend'],
            progress: 65,
            dependencies: ['Authentication System'],
            blockers: ['API endpoints not ready'],
            last_updated: '2024-01-15T10:25:00Z',
            description: 'Patient CRUD operations with form validation and data persistence',
            coordination_level: 'high',
            integration_tests: 'pending',
            performance_impact: 'medium',
            security_review: 'pending'
        },
        {
            id: 3,
            name: 'Billing Integration',
            status: 'pending',
            agents: ['frontend', 'backend', 'security'],
            progress: 0,
            dependencies: ['Patient Management', 'Authentication System'],
            blockers: ['Waiting for patient management completion'],
            last_updated: '2024-01-15T09:00:00Z',
            description: 'Billing system with payment processing and invoice generation',
            coordination_level: 'critical',
            integration_tests: 'not_started',
            performance_impact: 'high',
            security_review: 'not_started'
        },
        {
            id: 4,
            name: 'Lab Orders System',
            status: 'in_progress',
            agents: ['frontend', 'backend', 'testing'],
            progress: 35,
            dependencies: ['Patient Management'],
            blockers: ['Test coverage incomplete'],
            last_updated: '2024-01-15T10:20:00Z',
            description: 'Laboratory test ordering and result management system',
            coordination_level: 'medium',
            integration_tests: 'in_progress',
            performance_impact: 'medium',
            security_review: 'in_progress'
        },
        {
            id: 5,
            name: 'Performance Optimization',
            status: 'in_progress',
            agents: ['performance', 'frontend'],
            progress: 30,
            dependencies: [],
            blockers: ['Frontend components not ready'],
            last_updated: '2024-01-15T10:15:00Z',
            description: 'Code splitting and lazy loading implementation',
            coordination_level: 'medium',
            integration_tests: 'pending',
            performance_impact: 'high',
            security_review: 'not_required'
        }
    ];

    const mockCoordinationRequests = [
        {
            id: 1,
            from_agent: 'backend',
            to_agent: 'security',
            type: 'integration',
            priority: 'high',
            status: 'pending',
            subject: 'API Authentication Integration',
            description: 'Need to coordinate on JWT token validation and user session management',
            created_at: '2024-01-15T10:00:00Z',
            due_date: '2024-01-15T14:00:00Z',
            files_affected: ['src/api/apiClient.js', 'src/contexts/AuthContext.tsx']
        },
        {
            id: 2,
            from_agent: 'frontend',
            to_agent: 'backend',
            type: 'dependency',
            priority: 'medium',
            status: 'in_progress',
            subject: 'Patient API Endpoints',
            description: 'Frontend needs patient CRUD endpoints to complete form implementation',
            created_at: '2024-01-15T09:30:00Z',
            due_date: '2024-01-15T16:00:00Z',
            files_affected: ['src/api/patients.js', 'src/components/patients/']
        },
        {
            id: 3,
            from_agent: 'testing',
            to_agent: 'all',
            type: 'review',
            priority: 'high',
            status: 'pending',
            subject: 'Integration Test Review',
            description: 'Need all agents to review and approve integration test scenarios',
            created_at: '2024-01-15T11:00:00Z',
            due_date: '2024-01-16T10:00:00Z',
            files_affected: ['src/tests/integration/']
        }
    ];

    const mockQualityGates = [
        {
            id: 1,
            name: 'Code Quality Gate',
            status: 'passed',
            requirements: [
                { name: 'ESLint Pass', status: 'passed', score: 100 },
                { name: 'TypeScript Check', status: 'passed', score: 100 },
                { name: 'Code Coverage', status: 'passed', score: 85 },
                { name: 'Complexity Check', status: 'passed', score: 90 }
            ],
            overall_score: 94,
            last_run: '2024-01-15T10:30:00Z'
        },
        {
            id: 2,
            name: 'Security Gate',
            status: 'in_progress',
            requirements: [
                { name: 'Vulnerability Scan', status: 'passed', score: 100 },
                { name: 'Dependency Check', status: 'passed', score: 95 },
                { name: 'Security Review', status: 'in_progress', score: 70 },
                { name: 'Permission Matrix', status: 'pending', score: 0 }
            ],
            overall_score: 66,
            last_run: '2024-01-15T10:25:00Z'
        },
        {
            id: 3,
            name: 'Performance Gate',
            status: 'pending',
            requirements: [
                { name: 'Bundle Size Check', status: 'pending', score: 0 },
                { name: 'Load Time Test', status: 'pending', score: 0 },
                { name: 'Memory Usage', status: 'pending', score: 0 },
                { name: 'Core Web Vitals', status: 'pending', score: 0 }
            ],
            overall_score: 0,
            last_run: '2024-01-15T09:00:00Z'
        },
        {
            id: 4,
            name: 'Integration Gate',
            status: 'in_progress',
            requirements: [
                { name: 'API Integration', status: 'passed', score: 100 },
                { name: 'Database Integration', status: 'passed', score: 100 },
                { name: 'Authentication Integration', status: 'in_progress', score: 80 },
                { name: 'End-to-End Tests', status: 'pending', score: 0 }
            ],
            overall_score: 70,
            last_run: '2024-01-15T10:20:00Z'
        }
    ];

    const mockMeetings = [
        {
            id: 1,
            title: 'Authentication Integration Review',
            type: 'integration',
            participants: ['backend', 'security'],
            scheduled_for: '2024-01-15T14:00:00Z',
            duration: 60,
            status: 'scheduled',
            agenda: [
                'Review JWT implementation',
                'Discuss session management',
                'Plan security testing'
            ]
        },
        {
            id: 2,
            title: 'Patient Management Coordination',
            type: 'coordination',
            participants: ['frontend', 'backend'],
            scheduled_for: '2024-01-15T16:00:00Z',
            duration: 45,
            status: 'scheduled',
            agenda: [
                'API endpoint specifications',
                'Form validation requirements',
                'Data persistence strategy'
            ]
        },
        {
            id: 3,
            title: 'Weekly Integration Sync',
            type: 'sync',
            participants: ['all'],
            scheduled_for: '2024-01-16T10:00:00Z',
            duration: 30,
            status: 'scheduled',
            agenda: [
                'Review integration progress',
                'Identify blockers',
                'Plan next week priorities'
            ]
        }
    ];

    useEffect(() => {
        setIntegrationPoints(mockIntegrationPoints);
        setCoordinationRequests(mockCoordinationRequests);
        setQualityGates(mockQualityGates);
        setMeetings(mockMeetings);
    }, []);

    const getStatusColor = (status: any) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'blocked': return 'bg-red-100 text-red-800';
            case 'passed': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: any) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAgentIcon = (agentType: any) => {
        switch (agentType) {
            case 'backend': return <Activity className="h-4 w-4" />;
            case 'frontend': return <FileText className="h-4 w-4" />;
            case 'security': return <Shield className="h-4 w-4" />;
            case 'testing': return <TestTube className="h-4 w-4" />;
            case 'performance': return <Zap className="h-4 w-4" />;
            case 'devops': return <GitBranch className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    const getCoordinationLevelColor = (level: any) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Integration Coordination</h1>
                <div className="flex items-center space-x-4">
                    <Button variant="outline" className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Schedule Meeting</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Request Coordination</span>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="integration" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="integration">Integration Points</TabsTrigger>
                    <TabsTrigger value="coordination">Coordination Requests</TabsTrigger>
                    <TabsTrigger value="quality">Quality Gates</TabsTrigger>
                    <TabsTrigger value="meetings">Meetings</TabsTrigger>
                </TabsList>

                <TabsContent value="integration" className="space-y-4">
                    <div className="space-y-4">
                        {integrationPoints.map((integration: any) => (
                            <Card key={integration.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center space-x-2">
                                            <GitMerge className="h-4 w-4" />
                                            <span>{integration.name}</span>
                                        </CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getStatusColor(integration.status)}>
                                                {integration.status}
                                            </Badge>
                                            <Badge className={getCoordinationLevelColor(integration.coordination_level)}>
                                                {integration.coordination_level}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Progress</span>
                                            <span>{integration.progress}%</span>
                                        </div>
                                        <Progress value={integration.progress} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium mb-2">Involved Agents:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {integration.agents.map((agent: any) => (
                                                    <Badge key={agent} variant="outline" className="flex items-center space-x-1">
                                                        {getAgentIcon(agent)}
                                                        <span>{agent}</span>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-2">Quality Checks:</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span>Integration Tests</span>
                                                    <Badge className={getStatusColor(integration.integration_tests)}>
                                                        {integration.integration_tests}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span>Security Review</span>
                                                    <Badge className={getStatusColor(integration.security_review)}>
                                                        {integration.security_review}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span>Performance Impact</span>
                                                    <Badge className={getPriorityColor(integration.performance_impact)}>
                                                        {integration.performance_impact}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium mb-2">Description:</p>
                                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                                    </div>

                                    {integration.dependencies.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium mb-2">Dependencies:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {integration.dependencies.map((dep: any) => (
                                                    <Badge key={dep} variant="secondary" className="text-xs">
                                                        {dep}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {integration.blockers.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium mb-2 text-red-600">Blockers:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {integration.blockers.map((blocker: any) => (
                                                    <Badge key={blocker} variant="destructive" className="text-xs">
                                                        {blocker}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            <MessageSquare className="h-3 w-3 mr-1" />
                                            Coordinate
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Schedule Meeting
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="coordination" className="space-y-4">
                    <div className="space-y-4">
                        {coordinationRequests.map((request: any) => (
                            <Card key={request.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center space-x-2">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{request.subject}</span>
                                        </CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getStatusColor(request.status)}>
                                                {request.status}
                                            </Badge>
                                            <Badge className={getPriorityColor(request.priority)}>
                                                {request.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium mb-2">From → To:</p>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline" className="flex items-center space-x-1">
                                                    {getAgentIcon(request.from_agent)}
                                                    <span>{request.from_agent}</span>
                                                </Badge>
                                                <span>→</span>
                                                <Badge variant="outline" className="flex items-center space-x-1">
                                                    {getAgentIcon(request.to_agent)}
                                                    <span>{request.to_agent}</span>
                                                </Badge>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-2">Timeline:</p>
                                            <div className="text-xs space-y-1">
                                                <div>Created: {new Date(request.created_at).toLocaleString()}</div>
                                                <div>Due: {new Date(request.due_date).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium mb-2">Description:</p>
                                        <p className="text-sm text-muted-foreground">{request.description}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium mb-2">Files Affected:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {request.files_affected.map((file: any) => (
                                                <Badge key={file} variant="outline" className="text-xs">
                                                    {file}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            Accept Request
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Schedule Meeting
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                    <div className="space-y-4">
                        {qualityGates.map((gate: any) => (
                            <Card key={gate.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center space-x-2">
                                            <Shield className="h-4 w-4" />
                                            <span>{gate.name}</span>
                                        </CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getStatusColor(gate.status)}>
                                                {gate.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {gate.overall_score}%
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Overall Score</span>
                                            <span>{gate.overall_score}%</span>
                                        </div>
                                        <Progress value={gate.overall_score} className="h-2" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium mb-2">Requirements:</p>
                                        <div className="space-y-2">
                                            {gate.requirements.map((req: any) => (
                                                <div key={req.name} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={getStatusColor(req.status)}>
                                                            {req.status}
                                                        </Badge>
                                                        <span className="text-sm">{req.name}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {req.score}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        Last run: {new Date(gate.last_run).toLocaleString()}
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            Run Gate
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="meetings" className="space-y-4">
                    <div className="space-y-4">
                        {meetings.map((meeting: any) => (
                            <Card key={meeting.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{meeting.title}</span>
                                        </CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getStatusColor(meeting.status)}>
                                                {meeting.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {meeting.duration}min
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium mb-2">Participants:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {meeting.participants.map((participant: any) => (
                                                    <Badge key={participant} variant="outline" className="flex items-center space-x-1">
                                                        {getAgentIcon(participant)}
                                                        <span>{participant}</span>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-2">Schedule:</p>
                                            <div className="text-xs space-y-1">
                                                <div>Date: {new Date(meeting.scheduled_for).toLocaleDateString()}</div>
                                                <div>Time: {new Date(meeting.scheduled_for).toLocaleTimeString()}</div>
                                                <div>Duration: {meeting.duration} minutes</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium mb-2">Agenda:</p>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            {meeting.agenda.map((item: any, index: number) => (
                                                <li key={index} className="flex items-center space-x-2">
                                                    <span className="text-xs">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            Join Meeting
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Reschedule
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default IntegrationCoordination;
