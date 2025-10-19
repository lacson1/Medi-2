import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Activity,
    Heart,
    Thermometer,
    Scale,
    Ruler,
    Target,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    Info,
    ArrowUp,
    ArrowDown,
    Minus,
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    Download,
    Share2,
    RefreshCw,
    Filter,
    Settings,
    Zap,
    Users,
    Pill,
    TestTube,
    Stethoscope,
    Microscope,
    FlaskConical,
    TestTube2,
    Droplets,
    Thermometer as ThermometerIcon,
    Scale as ScaleIcon,
    Ruler as RulerIcon,
    Compass,
    Map,
    Navigation,
    Route,
    AlertOctagon,
    Siren,
    Megaphone,
    PhoneCall,
    PhoneOff,
    PhoneIncoming,
    Accessibility,
    Workflow,
    GitBranch,
    GitCommit,
    GitMerge,
    GitPullRequest,
    ArrowUpDown,
    ArrowLeftRight,
    ArrowUpLeft,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowDownRight,
    Brain,
    Bone,
    Ear,
    Wrench,
    Hammer,
    Drill,
    Triangle,
    Sun,
    Moon,
    Cloud,
    CloudRain,
    CloudSnow,
    Wind,
    Car,
    Truck,
    Bus,
    Train,
    Plane,
    Ship,
    Bike,
    Motorcycle,
    Apple,
    Banana,
    Carrot,
    Broccoli,
    Fish,
    Meat,
    Egg,
    Milk,
    Coffee,
    Tea,
    Water,
    Wine,
    Beer,
    Utensils,
    UtensilsCrossed,
    Dumbbell,
    Running,
    Swimming,
    Cycling,
    Hiking,
    Skiing,
    Snowboarding,
    Tennis,
    Basketball,
    Football,
    Soccer,
    Baseball,
    Golf,
    Volleyball,
    Play,
    Pause,
    Stop,
    SkipBack,
    SkipForward,
    Luggage,
    Passport,
    Hotel,
    Restaurant
} from 'lucide-react';
import { format, parseISO, subDays, subMonths, subYears } from 'date-fns';

// Types for data visualization
interface VitalSignData {
    id: string;
    type: 'blood-pressure' | 'heart-rate' | 'temperature' | 'weight' | 'height' | 'oxygen-saturation';
    value: number;
    unit: string;
    timestamp: string;
    normalRange: { min: number; max: number };
    status: 'normal' | 'elevated' | 'critical';
    trend: 'up' | 'down' | 'stable';
}

interface LabResult {
    id: string;
    testName: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'normal' | 'abnormal' | 'critical';
    timestamp: string;
    category: 'chemistry' | 'hematology' | 'microbiology' | 'immunology';
}

interface MedicationAdherence {
    medication: string;
    prescribedDoses: number;
    takenDoses: number;
    adherenceRate: number;
    lastTaken: string;
    nextDue: string;
}

interface ClinicalMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    target: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    trend: 'improving' | 'stable' | 'declining';
    lastUpdated: string;
}

interface ChartDataPoint {
    x: string | number;
    y: number;
    label?: string;
    color?: string;
}

interface ChartConfig {
    type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    title: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showGrid?: boolean;
    showLegend?: boolean;
    colors?: string[];
    height?: number;
}

// Mock data generators
const generateVitalSignsData = (days: number = 30): VitalSignData[] => {
    const data: VitalSignData[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = subDays(now, i);
        data.push({
            id: `bp-${i}`,
            type: 'blood-pressure',
            value: 120 + Math.random() * 20,
            unit: 'mmHg',
            timestamp: date.toISOString(),
            normalRange: { min: 90, max: 140 },
            status: 'normal',
            trend: Math.random() > 0.5 ? 'up' : 'down'
        });

        data.push({
            id: `hr-${i}`,
            type: 'heart-rate',
            value: 70 + Math.random() * 20,
            unit: 'bpm',
            timestamp: date.toISOString(),
            normalRange: { min: 60, max: 100 },
            status: 'normal',
            trend: Math.random() > 0.5 ? 'up' : 'down'
        });
    }

    return data;
};

const generateLabResults = (): LabResult[] => {
    return [
        {
            id: 'glucose-1',
            testName: 'Glucose',
            value: '95',
            unit: 'mg/dL',
            referenceRange: '70-100',
            status: 'normal',
            timestamp: new Date().toISOString(),
            category: 'chemistry'
        },
        {
            id: 'creatinine-1',
            testName: 'Creatinine',
            value: '1.2',
            unit: 'mg/dL',
            referenceRange: '0.6-1.2',
            status: 'normal',
            timestamp: new Date().toISOString(),
            category: 'chemistry'
        },
        {
            id: 'hemoglobin-1',
            testName: 'Hemoglobin',
            value: '14.5',
            unit: 'g/dL',
            referenceRange: '12-16',
            status: 'normal',
            timestamp: new Date().toISOString(),
            category: 'hematology'
        }
    ];
};

const generateMedicationAdherence = (): MedicationAdherence[] => {
    return [
        {
            medication: 'Metformin',
            prescribedDoses: 30,
            takenDoses: 28,
            adherenceRate: 93.3,
            lastTaken: new Date().toISOString(),
            nextDue: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
        },
        {
            medication: 'Lisinopril',
            prescribedDoses: 30,
            takenDoses: 30,
            adherenceRate: 100,
            lastTaken: new Date().toISOString(),
            nextDue: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
        }
    ];
};

// Simple Chart Component (without external charting library)
const SimpleChart: React.FC<{
    data: ChartDataPoint[];
    config: ChartConfig;
    className?: string;
}> = ({ data, config, className = '' }) => {
    const maxY = Math.max(...data.map(d => d.y));
    const minY = Math.min(...data.map(d => d.y));
    const rangeY = maxY - minY;

    const getColor = (index: number) => {
        const colors = config.colors || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
        return colors[index % colors.length];
    };

    const renderLineChart = () => {
        if (data.length < 2) return null;

        const width = 400;
        const height = config.height || 200;
        const padding = 20;

        const points = data.map((point, index) => {
            const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((point.y - minY) / rangeY) * (height - 2 * padding);
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg width={width} height={height} className="w-full h-full">
                {config.showGrid && (
                    <g>
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                            <line
                                key={ratio}
                                x1={padding}
                                y1={padding + ratio * (height - 2 * padding)}
                                x2={width - padding}
                                y2={padding + ratio * (height - 2 * padding)}
                                stroke="#E5E7EB"
                                strokeWidth="1"
                            />
                        ))}
                    </g>
                )}
                <polyline
                    points={points}
                    fill="none"
                    stroke={getColor(0)}
                    strokeWidth="2"
                />
                {data.map((point, index) => {
                    const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
                    const y = height - padding - ((point.y - minY) / rangeY) * (height - 2 * padding);
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={getColor(0)}
                            className="hover:r-6 transition-all"
                        />
                    );
                })}
            </svg>
        );
    };

    const renderBarChart = () => {
        const width = 400;
        const height = config.height || 200;
        const padding = 20;
        const barWidth = (width - 2 * padding) / data.length * 0.8;

        return (
            <svg width={width} height={height} className="w-full h-full">
                {data.map((point, index) => {
                    const x = padding + (index * (width - 2 * padding)) / data.length;
                    const barHeight = ((point.y - minY) / rangeY) * (height - 2 * padding);
                    const y = height - padding - barHeight;

                    return (
                        <rect
                            key={index}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={getColor(index)}
                            className="hover:opacity-80 transition-opacity"
                        />
                    );
                })}
            </svg>
        );
    };

    const renderPieChart = () => {
        const total = data.reduce((sum, point) => sum + point.y, 0);
        let currentAngle = 0;

        return (
            <svg width="200" height="200" className="w-full h-full">
                {data.map((point, index) => {
                    const percentage = point.y / total;
                    const angle = percentage * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;

                    const radius = 80;
                    const centerX = 100;
                    const centerY = 100;

                    const startAngleRad = (startAngle * Math.PI) / 180;
                    const endAngleRad = (endAngle * Math.PI) / 180;

                    const x1 = centerX + radius * Math.cos(startAngleRad);
                    const y1 = centerY + radius * Math.sin(startAngleRad);
                    const x2 = centerX + radius * Math.cos(endAngleRad);
                    const y2 = centerY + radius * Math.sin(endAngleRad);

                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');

                    currentAngle += angle;

                    return (
                        <path
                            key={index}
                            d={pathData}
                            fill={getColor(index)}
                            className="hover:opacity-80 transition-opacity"
                        />
                    );
                })}
            </svg>
        );
    };

    const renderChart = () => {
        switch (config.type) {
            case 'line':
                return renderLineChart();
            case 'bar':
                return renderBarChart();
            case 'pie':
                return renderPieChart();
            default:
                return renderLineChart();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{config.title}</h3>
                <div className="flex items-center space-x-2">
                    {config.showLegend && (
                        <div className="flex items-center space-x-2">
                            {data.map((point, index) => (
                                <div key={index} className="flex items-center space-x-1">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getColor(index) }}
                                    />
                                    <span className="text-sm">{point.label || `Series ${index + 1}`}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
                {renderChart()}
            </div>
        </div>
    );
};

// Vital Signs Trend Chart
export const VitalSignsChart: React.FC<{
    data: VitalSignData[];
    type: VitalSignData['type'];
    timeRange: '7d' | '30d' | '90d' | '1y';
}> = ({ data, type, timeRange }) => {
    const filteredData = useMemo(() => {
        const now = new Date();
        let cutoffDate: Date;

        switch (timeRange) {
            case '7d':
                cutoffDate = subDays(now, 7);
                break;
            case '30d':
                cutoffDate = subDays(now, 30);
                break;
            case '90d':
                cutoffDate = subDays(now, 90);
                break;
            case '1y':
                cutoffDate = subYears(now, 1);
                break;
            default:
                cutoffDate = subDays(now, 30);
        }

        return data
            .filter(d => d.type === type && new Date(d.timestamp) >= cutoffDate)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [data, type, timeRange]);

    const chartData: ChartDataPoint[] = filteredData.map((point, index) => ({
        x: index,
        y: point.value,
        label: format(parseISO(point.timestamp), 'MMM dd')
    }));

    const getVitalIcon = (type: string) => {
        switch (type) {
            case 'blood-pressure': return Activity;
            case 'heart-rate': return Heart;
            case 'temperature': return Thermometer;
            case 'weight': return Scale;
            case 'height': return Ruler;
            case 'oxygen-saturation': return Target;
            default: return Activity;
        }
    };

    const getVitalLabel = (type: string) => {
        switch (type) {
            case 'blood-pressure': return 'Blood Pressure';
            case 'heart-rate': return 'Heart Rate';
            case 'temperature': return 'Temperature';
            case 'weight': return 'Weight';
            case 'height': return 'Height';
            case 'oxygen-saturation': return 'Oxygen Saturation';
            default: return 'Vital Sign';
        }
    };

    const IconComponent = getVitalIcon(type);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <IconComponent className="w-5 h-5" />
                    <span>{getVitalLabel(type)} Trend</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <SimpleChart
                    data={chartData}
                    config={{
                        type: 'line',
                        title: `${getVitalLabel(type)} Over Time`,
                        xAxisLabel: 'Date',
                        yAxisLabel: filteredData[0]?.unit || '',
                        showGrid: true,
                        colors: ['#3B82F6']
                    }}
                />
            </CardContent>
        </Card>
    );
};

// Lab Results Dashboard
export const LabResultsDashboard: React.FC<{
    results: LabResult[];
}> = ({ results }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['all', 'chemistry', 'hematology', 'microbiology', 'immunology'];

    const filteredResults = useMemo(() => {
        if (selectedCategory === 'all') return results;
        return results.filter(r => r.category === selectedCategory);
    }, [results, selectedCategory]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'normal': return 'text-green-600 bg-green-50 border-green-200';
            case 'abnormal': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'normal': return CheckCircle;
            case 'abnormal': return AlertTriangle;
            case 'critical': return AlertOctagon;
            default: return Info;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <TestTube className="w-5 h-5" />
                    <span>Lab Results</span>
                </CardTitle>
                <div className="flex space-x-2">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {filteredResults.map((result) => {
                        const StatusIcon = getStatusIcon(result.status);
                        return (
                            <div key={result.id} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <StatusIcon className="w-5 h-5" />
                                        <div>
                                            <h4 className="font-semibold">{result.testName}</h4>
                                            <p className="text-sm opacity-90">
                                                {result.value} {result.unit} (Ref: {result.referenceRange})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="capitalize">
                                            {result.status}
                                        </Badge>
                                        <p className="text-xs opacity-90 mt-1">
                                            {format(parseISO(result.timestamp), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// Medication Adherence Chart
export const MedicationAdherenceChart: React.FC<{
    adherence: MedicationAdherence[];
}> = ({ adherence }) => {
    const chartData: ChartDataPoint[] = adherence.map((med) => ({
        x: med.medication,
        y: med.adherenceRate,
        label: med.medication
    }));

    const getAdherenceColor = (rate: number) => {
        if (rate >= 90) return '#10B981';
        if (rate >= 80) return '#F59E0B';
        return '#EF4444';
    };

    const getAdherenceStatus = (rate: number) => {
        if (rate >= 90) return 'Excellent';
        if (rate >= 80) return 'Good';
        if (rate >= 70) return 'Fair';
        return 'Poor';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Pill className="w-5 h-5" />
                    <span>Medication Adherence</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <SimpleChart
                        data={chartData}
                        config={{
                            type: 'bar',
                            title: 'Adherence Rate by Medication',
                            xAxisLabel: 'Medication',
                            yAxisLabel: 'Adherence Rate (%)',
                            showGrid: true,
                            colors: chartData.map(d => getAdherenceColor(d.y))
                        }}
                    />

                    <div className="space-y-3">
                        {adherence.map((med) => (
                            <div key={med.medication} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-semibold">{med.medication}</h4>
                                    <p className="text-sm text-gray-600">
                                        {med.takenDoses} of {med.prescribedDoses} doses taken
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-2">
                                        <Progress value={med.adherenceRate} className="w-20" />
                                        <span className="text-sm font-semibold">{med.adherenceRate.toFixed(1)}%</span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="mt-1"
                                    >
                                        {getAdherenceStatus(med.adherenceRate)}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Clinical Metrics Dashboard
export const ClinicalMetricsDashboard: React.FC<{
    metrics: ClinicalMetric[];
}> = ({ metrics }) => {
    const [selectedMetric, setSelectedMetric] = useState<string>('all');

    const getMetricIcon = (name: string) => {
        if (name.toLowerCase().includes('blood')) return Activity;
        if (name.toLowerCase().includes('heart')) return Heart;
        if (name.toLowerCase().includes('weight')) return Scale;
        if (name.toLowerCase().includes('temperature')) return Thermometer;
        return Target;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
            case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'poor': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return TrendingUp;
            case 'declining': return TrendingDown;
            case 'stable': return Minus;
            default: return Minus;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Clinical Metrics</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metrics.map((metric) => {
                        const IconComponent = getMetricIcon(metric.name);
                        const TrendIcon = getTrendIcon(metric.trend);
                        const progressValue = (metric.value / metric.target) * 100;

                        return (
                            <div key={metric.id} className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <IconComponent className="w-4 h-4" />
                                        <span className="font-semibold text-sm">{metric.name}</span>
                                    </div>
                                    <TrendIcon className="w-4 h-4" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold">{metric.value} {metric.unit}</span>
                                        <span className="text-sm opacity-90">Target: {metric.target}</span>
                                    </div>

                                    <Progress value={Math.min(progressValue, 100)} className="h-2" />

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="capitalize">{metric.status}</span>
                                        <span className="capitalize">{metric.trend}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// Main Data Visualization Dashboard
export const PatientDataVisualization: React.FC<{
    patientId: string;
}> = ({ patientId }) => {
    const [activeTab, setActiveTab] = useState('vitals');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    // Mock data - in real implementation, this would come from API
    const vitalSignsData = generateVitalSignsData(30);
    const labResults = generateLabResults();
    const medicationAdherence = generateMedicationAdherence();
    const clinicalMetrics: ClinicalMetric[] = [
        {
            id: 'bp-control',
            name: 'Blood Pressure Control',
            value: 85,
            unit: '%',
            target: 80,
            status: 'excellent',
            trend: 'improving',
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'glucose-control',
            name: 'Glucose Control',
            value: 75,
            unit: '%',
            target: 70,
            status: 'good',
            trend: 'stable',
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'weight-management',
            name: 'Weight Management',
            value: 60,
            unit: '%',
            target: 80,
            status: 'fair',
            trend: 'declining',
            lastUpdated: new Date().toISOString()
        }
    ];

    const tabs = [
        {
            id: 'vitals',
            label: 'Vital Signs',
            icon: Activity,
            content: (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Vital Signs Trends</h3>
                        <div className="flex space-x-2">
                            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                                <Button
                                    key={range}
                                    variant={timeRange === range ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTimeRange(range)}
                                >
                                    {range}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <VitalSignsChart data={vitalSignsData} type="blood-pressure" timeRange={timeRange} />
                        <VitalSignsChart data={vitalSignsData} type="heart-rate" timeRange={timeRange} />
                        <VitalSignsChart data={vitalSignsData} type="temperature" timeRange={timeRange} />
                        <VitalSignsChart data={vitalSignsData} type="weight" timeRange={timeRange} />
                    </div>
                </div>
            )
        },
        {
            id: 'labs',
            label: 'Lab Results',
            icon: TestTube,
            content: <LabResultsDashboard results={labResults} />
        },
        {
            id: 'medications',
            label: 'Medications',
            icon: Pill,
            content: <MedicationAdherenceChart adherence={medicationAdherence} />
        },
        {
            id: 'metrics',
            label: 'Clinical Metrics',
            icon: BarChart3,
            content: <ClinicalMetricsDashboard metrics={clinicalMetrics} />
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Patient Data Visualization</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                    </Button>
                    <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Report
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                                <IconComponent className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {tabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-6">
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

// Export all components
export {
    SimpleChart,
    VitalSignsChart,
    LabResultsDashboard,
    MedicationAdherenceChart,
    ClinicalMetricsDashboard,
    PatientDataVisualization
};
