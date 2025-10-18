import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    TrendingUp,
    GitMerge,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Target,
    Zap,
    Shield,
    Activity
} from 'lucide-react';

// Type definitions
interface Task {
    id: string;
    name: string;
    status: string;
    progress: number;
}

interface Agent {
    id: string;
    name: string;
    type: string;
    status: string;
    progress: number;
    tasks: Task[];
    dependencies: string[];
    blockers: string[];
}

const AgentProgressTracker = () => {
    const [progressData, setProgressData] = useState<Record<string, Agent>>({});
    const [integrationPoints, setIntegrationPoints] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>({});

    // Mock data - in real implementation, this would come from the coordination system
    const mockProgressData = {
        backend: {
            current: 75,
            previous: 60,
            trend: 'up',
            tasks: [
                { id: 1, name: 'API Client Setup', status: 'completed', progress: 100 },
                { id: 2, name: 'Authentication Endpoints', status: 'in_progress', progress: 80 },
                { id: 3, name: 'Data Validation', status: 'pending', progress: 0 },
                { id: 4, name: 'Error Handling', status: 'pending', progress: 0 }
            ],
            velocity: 15, // story points per day
            quality_score: 92
        },
        frontend: {
            current: 60,
            previous: 45,
            trend: 'up',
            tasks: [
                { id: 1, name: 'Patient Forms', status: 'in_progress', progress: 70 },
                { id: 2, name: 'Form Validation', status: 'in_progress', progress: 40 },
                { id: 3, name: 'UI Components', status: 'completed', progress: 100 },
                { id: 4, name: 'Responsive Design', status: 'pending', progress: 0 }
            ],
            velocity: 12,
            quality_score: 88
        },
        security: {
            current: 90,
            previous: 85,
            trend: 'up',
            tasks: [
                { id: 1, name: 'Auth Context', status: 'completed', progress: 100 },
                { id: 2, name: 'Protected Routes', status: 'completed', progress: 100 },
                { id: 3, name: 'Permission Matrix', status: 'in_progress', progress: 90 },
                { id: 4, name: 'Security Testing', status: 'pending', progress: 0 }
            ],
            velocity: 18,
            quality_score: 95
        },
        testing: {
            current: 40,
            previous: 25,
            trend: 'up',
            tasks: [
                { id: 1, name: 'Unit Tests', status: 'in_progress', progress: 60 },
                { id: 2, name: 'Integration Tests', status: 'pending', progress: 0 },
                { id: 3, name: 'E2E Tests', status: 'pending', progress: 0 },
                { id: 4, name: 'Test Coverage', status: 'in_progress', progress: 30 }
            ],
            velocity: 8,
            quality_score: 85
        },
        performance: {
            current: 30,
            previous: 20,
            trend: 'up',
            tasks: [
                { id: 1, name: 'Code Splitting', status: 'in_progress', progress: 50 },
                { id: 2, name: 'Lazy Loading', status: 'pending', progress: 0 },
                { id: 3, name: 'Bundle Optimization', status: 'pending', progress: 0 },
                { id: 4, name: 'Performance Monitoring', status: 'pending', progress: 0 }
            ],
            velocity: 6,
            quality_score: 90
        },
        devops: {
            current: 85,
            previous: 80,
            trend: 'up',
            tasks: [
                { id: 1, name: 'Docker Setup', status: 'completed', progress: 100 },
                { id: 2, name: 'CI/CD Pipeline', status: 'completed', progress: 100 },
                { id: 3, name: 'Production Config', status: 'in_progress', progress: 70 },
                { id: 4, name: 'Monitoring Setup', status: 'pending', progress: 0 }
            ],
            velocity: 20,
            quality_score: 93
        }
    };

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
            description: 'Complete authentication flow with JWT tokens and role-based access'
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
            description: 'Patient CRUD operations with form validation and data persistence'
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
            description: 'Billing system with payment processing and invoice generation'
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
            description: 'Laboratory test ordering and result management system'
        }
    ];

    const mockMetrics = {
        overall_progress: 65,
        velocity_trend: 'up',
        quality_trend: 'up',
        integration_health: 85,
        team_collaboration: 92,
        code_quality: 89,
        test_coverage: 75,
        performance_score: 82
    };

    useEffect(() => {
        setProgressData(mockProgressData);
        setIntegrationPoints(mockIntegrationPoints);
        setMetrics(mockMetrics);
    }, []);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
            case 'stable': return <TrendingUp className="h-4 w-4 text-gray-500" />;
            default: return <TrendingUp className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'blocked': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAgentIcon = (agentType: string) => {
        switch (agentType) {
            case 'backend': return <Activity className="h-4 w-4" />;
            case 'frontend': return <Users className="h-4 w-4" />;
            case 'security': return <Shield className="h-4 w-4" />;
            case 'testing': return <CheckCircle2 className="h-4 w-4" />;
            case 'performance': return <Zap className="h-4 w-4" />;
            case 'devops': return <GitMerge className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    const calculateOverallProgress = () => {
        const agents = Object.values(progressData);
        if (agents.length === 0) return 0;

        const totalProgress = agents.reduce((sum: any, agent: any) => sum + agent.current, 0);
        return Math.round(totalProgress / agents.length);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Agent Progress Tracker</h1>
                <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Last updated: {new Date().toLocaleString()}</span>
                    </Badge>
                </div>
            </div>

            {/* Overall Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{calculateOverallProgress()}%</div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            {getTrendIcon(metrics.velocity_trend)}
                            <span>+5% from last week</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Integration Health</CardTitle>
                        <GitMerge className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.integration_health}%</div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>Healthy</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.code_quality}%</div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            {getTrendIcon(metrics.quality_trend)}
                            <span>+2% from last week</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.test_coverage}%</div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                            <span>Needs improvement</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="agents" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="agents">Agent Progress</TabsTrigger>
                    <TabsTrigger value="integration">Integration Points</TabsTrigger>
                    <TabsTrigger value="comparison">Progress Comparison</TabsTrigger>
                    <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="agents" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Object.entries(progressData).map(([agentType, agent]) => (
                            <Card key={agentType}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="flex items-center space-x-2">
                                        {getAgentIcon(agentType)}
                                        <span className="capitalize">{agentType} Agent</span>
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        {getTrendIcon(agent.trend)}
                                        <Badge variant="outline">{agent.velocity} pts/day</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Overall Progress</span>
                                            <span>{agent.current}%</span>
                                        </div>
                                        <Progress value={agent.current} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium">Quality Score</p>
                                            <p className="text-green-600">{agent.quality_score}%</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Velocity</p>
                                            <p className="text-blue-600">{agent.velocity} pts/day</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium mb-2">Current Tasks:</p>
                                        <div className="space-y-2">
                                            {agent.tasks.map((task: any) => (
                                                <div key={task.id} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={getStatusColor(task.status)}>
                                                            {task.status}
                                                        </Badge>
                                                        <span className="text-sm">{task.name}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {task.progress}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

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
                                        <Badge className={getStatusColor(integration.status)}>
                                            {integration.status}
                                        </Badge>
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
                                            View Details
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Coordinate
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{"Progress Comparison"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(progressData).map(([agentType, agent]) => (
                                    <div key={agentType} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getAgentIcon(agentType)}
                                                <span className="text-sm font-medium capitalize">{agentType}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm">{agent.current}%</span>
                                                {getTrendIcon(agent.trend)}
                                            </div>
                                        </div>
                                        <Progress value={agent.current} className="h-1" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{"Velocity Comparison"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(progressData).map(([agentType, agent]) => (
                                    <div key={agentType} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getAgentIcon(agentType)}
                                                <span className="text-sm font-medium capitalize">{agentType}</span>
                                            </div>
                                            <span className="text-sm font-bold">{agent.velocity} pts/day</span>
                                        </div>
                                        <Progress value={(agent.velocity / 25) * 100} className="h-1" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{"Quality Metrics"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Code Quality</span>
                                        <span className="text-sm font-bold">{metrics.code_quality}%</span>
                                    </div>
                                    <Progress value={metrics.code_quality} className="h-2" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Test Coverage</span>
                                        <span className="text-sm font-bold">{metrics.test_coverage}%</span>
                                    </div>
                                    <Progress value={metrics.test_coverage} className="h-2" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Performance Score</span>
                                        <span className="text-sm font-bold">{metrics.performance_score}%</span>
                                    </div>
                                    <Progress value={metrics.performance_score} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{"Collaboration Metrics"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Team Collaboration</span>
                                        <span className="text-sm font-bold">{metrics.team_collaboration}%</span>
                                    </div>
                                    <Progress value={metrics.team_collaboration} className="h-2" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Integration Health</span>
                                        <span className="text-sm font-bold">{metrics.integration_health}%</span>
                                    </div>
                                    <Progress value={metrics.integration_health} className="h-2" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Overall Progress</span>
                                        <span className="text-sm font-bold">{calculateOverallProgress()}%</span>
                                    </div>
                                    <Progress value={calculateOverallProgress()} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AgentProgressTracker;
