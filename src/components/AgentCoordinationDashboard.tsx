import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    GitBranch,
    FileText,
    Shield,
    Zap,
    TestTube
} from 'lucide-react';

// Type definitions
interface Agent {
    id: string;
    name: string;
    type: string;
    status: string;
    lastSeen: string;
    tasks: number;
    conflicts: number;
}

interface AgentStatus {
    [key: string]: Agent;
}

interface Conflict {
    id: string;
    type: string;
    severity: string;
    description: string;
    agents: string[];
    timestamp: string;
}

interface FileLock {
    id: string;
    file: string;
    agent: string;
    timestamp: string;
    type: string;
}

const AgentCoordinationDashboard = () => {
    const [agentStatus, setAgentStatus] = useState<AgentStatus>({});
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [fileLocks, setFileLocks] = useState<FileLock[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Mock data - in real implementation, this would come from the coordination system
    const mockData = {
        agents: {
            backend: {
                task: "API Integration",
                progress: 75,
                files_modified: "src/api/apiClient.js, src/hooks/useApi.ts",
                blockers: "None",
                next_steps: "Complete authentication endpoints",
                coordination_needed: "security",
                last_updated: "2024-01-15T10:30:00Z",
                status: "active"
            },
            frontend: {
                task: "Patient Forms Enhancement",
                progress: 60,
                files_modified: "src/components/patients/, src/pages/PatientProfile.jsx",
                blockers: "Waiting for API endpoints",
                next_steps: "Implement form validation",
                coordination_needed: "backend",
                last_updated: "2024-01-15T10:25:00Z",
                status: "active"
            },
            security: {
                task: "Authentication Implementation",
                progress: 90,
                files_modified: "src/contexts/AuthContext.tsx, src/components/ProtectedRoute.jsx",
                blockers: "None",
                next_steps: "Final testing",
                coordination_needed: "backend",
                last_updated: "2024-01-15T10:35:00Z",
                status: "review"
            },
            testing: {
                task: "E2E Test Suite",
                progress: 40,
                files_modified: "src/tests/e2e/, playwright.config.js",
                blockers: "None",
                next_steps: "Write integration tests",
                coordination_needed: "all",
                last_updated: "2024-01-15T10:20:00Z",
                status: "active"
            },
            performance: {
                task: "Code Splitting Optimization",
                progress: 30,
                files_modified: "vite.config.js, src/pages/index.tsx",
                blockers: "None",
                next_steps: "Implement lazy loading",
                coordination_needed: "frontend",
                last_updated: "2024-01-15T10:15:00Z",
                status: "active"
            },
            devops: {
                task: "Docker Configuration",
                progress: 85,
                files_modified: "Dockerfile, docker-compose.yml",
                blockers: "None",
                next_steps: "Production deployment",
                coordination_needed: "all",
                last_updated: "2024-01-15T10:40:00Z",
                status: "active"
            }
        },
        conflicts: [
            {
                id: 1,
                type: "file_conflict",
                files: ["src/api/apiClient.js"],
                agents: ["backend", "security"],
                severity: "medium",
                description: "Both agents modifying authentication logic",
                status: "pending",
                created_at: "2024-01-15T10:00:00Z"
            }
        ],
        fileLocks: {
            "src/api/apiClient.js": {
                agent: "backend",
                locked_at: "2024-01-15T10:30:00Z",
                expires_at: "2024-01-15T11:30:00Z"
            },
            "src/contexts/AuthContext.tsx": {
                agent: "security",
                locked_at: "2024-01-15T10:35:00Z",
                expires_at: "2024-01-15T11:35:00Z"
            }
        }
    };

    useEffect(() => {
        // Simulate real-time updates
        setAgentStatus(mockData.agents);
        setConflicts(mockData.conflicts);
        setFileLocks(mockData.fileLocks);
        setLastUpdated(new Date().toISOString());

        // In real implementation, this would poll the coordination system
        const interval = setInterval(() => {
            setLastUpdated(new Date().toISOString());
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'review': return 'bg-yellow-100 text-yellow-800';
            case 'blocked': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAgentIcon = (agentType: string) => {
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

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Agent Coordination Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="agents">Agent Status</TabsTrigger>
                    <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                    <TabsTrigger value="locks">File Locks</TabsTrigger>
                    <TabsTrigger value="integration">Integration Status</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Object.values(agentStatus).filter(agent => agent.status === 'active').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    of {Object.keys(agentStatus).length} total agents
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Conflicts</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {conflicts.filter(conflict => conflict.status === 'pending').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    requiring attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">File Locks</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Object.keys(fileLocks).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    files currently locked
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Integration Health</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">85%</div>
                                <p className="text-xs text-muted-foreground">
                                    integration success rate
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{"Recent Activity"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(agentStatus).slice(0, 3).map(([agentType, agent]) => (
                                    <div key={agentType} className="flex items-center space-x-3">
                                        {getAgentIcon(agentType)}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{agentType} Agent</p>
                                            <p className="text-xs text-muted-foreground">{agent.task}</p>
                                        </div>
                                        <Badge className={getStatusColor(agent.status)}>
                                            {agent.status}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{"Critical Alerts"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {conflicts.length > 0 ? (
                                    <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            {conflicts.length} conflict(s) require immediate attention
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            No critical conflicts detected
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="agents" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Object.entries(agentStatus).map(([agentType, agent]) => (
                            <Card key={agentType}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="flex items-center space-x-2">
                                        {getAgentIcon(agentType)}
                                        <span className="capitalize">{agentType} Agent</span>
                                    </CardTitle>
                                    <Badge className={getStatusColor(agent.status)}>
                                        {agent.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium">{agent.task}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Last updated: {new Date(agent.last_updated).toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Progress</span>
                                            <span>{agent.progress}%</span>
                                        </div>
                                        <Progress value={agent.progress} className="h-2" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Files Modified:</p>
                                        <p className="text-xs">{agent.files_modified}</p>
                                    </div>

                                    {agent.blockers !== "None" && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Blockers:</p>
                                            <p className="text-xs text-red-600">{agent.blockers}</p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Next Steps:</p>
                                        <p className="text-xs">{agent.next_steps}</p>
                                    </div>

                                    {agent.coordination_needed && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Coordination Needed:</p>
                                            <Badge variant="outline" className="text-xs">
                                                {agent.coordination_needed}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="conflicts" className="space-y-4">
                    {conflicts.length > 0 ? (
                        <div className="space-y-4">
                            {conflicts.map((conflict: any) => (
                                <Card key={conflict.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center space-x-2">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                <span>Conflict #{conflict.id}</span>
                                            </CardTitle>
                                            <Badge className={getSeverityColor(conflict.severity)}>
                                                {conflict.severity}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium">Description:</p>
                                            <p className="text-sm text-muted-foreground">{conflict.description}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">Affected Files:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {conflict.files.map((file: any) => (
                                                    <Badge key={file} variant="outline" className="text-xs">
                                                        {file}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">Involved Agents:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {conflict.agents.map((agent: any) => (
                                                    <Badge key={agent} variant="secondary" className="text-xs">
                                                        {agent}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline">
                                                Resolve Conflict
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                Request Coordination
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No Conflicts Detected</h3>
                                    <p className="text-muted-foreground">
                                        All agents are working without conflicts
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="locks" className="space-y-4">
                    {Object.keys(fileLocks).length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(fileLocks).map(([file, lock]) => (
                                <Card key={file}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{file}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium">Locked by:</p>
                                                <Badge variant="outline">{lock.agent}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Expires at:</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(lock.expires_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">Locked since:</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(lock.locked_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No File Locks</h3>
                                    <p className="text-muted-foreground">
                                        No files are currently locked by agents
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="integration" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{"Integration Status"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Authentication</span>
                                        <Badge className="bg-green-100 text-green-800">Complete</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Patient Management</span>
                                        <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Billing System</span>
                                        <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Lab Orders</span>
                                        <Badge className="bg-blue-100 text-blue-800">Testing</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{"Integration Health"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Overall Health</span>
                                        <span>85%</span>
                                    </div>
                                    <Progress value={85} className="h-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium">Successful Integrations</p>
                                        <p className="text-green-600">12</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Failed Integrations</p>
                                        <p className="text-red-600">2</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AgentCoordinationDashboard;
