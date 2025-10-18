import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Clock,
    Video,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function PatientWaiting() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeUntilSession, setTimeUntilSession] = useState('');
    const [canJoin, setCanJoin] = useState(false);
    const [error, setError] = useState('');

    const sessionId = searchParams.get('session');

    useEffect(() => {
        if (sessionId) {
            void loadSession();
        } else {
            setError('No session ID provided');
            setIsLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        if (session) {
            const interval = setInterval(updateTimeUntilSession, 1000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const loadSession = () => {
        try {
            setIsLoading(true);

            // In a real implementation, this would fetch the session from the API
            // For demo purposes, create a mock session
            const mockSession = {
                id: sessionId,
                session_topic: 'Follow-up Consultation',
                patient_name: 'Patient User',
                provider_name: 'Dr. Smith',
                session_date: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
                duration_minutes: 30,
                status: 'scheduled',
                session_type: 'consultation'
            };

            setSession(mockSession);
        } catch (error) {
            console.error('Failed to load session:', error);
            setError('Failed to load session information');
        } finally {
            setIsLoading(false);
        }
    };

    const updateTimeUntilSession = () => {
        if (!session) return;

        const now = new Date();
        const sessionTime = new Date(session.session_date);
        const timeDiff = sessionTime.getTime() - now.getTime();

        if (timeDiff <= 0) {
            setTimeUntilSession('Session is ready!');
            setCanJoin(true);
        } else {
            const minutes = Math.floor(timeDiff / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            if (minutes > 0) {
                setTimeUntilSession(`${minutes}m ${seconds}s`);
            } else {
                setTimeUntilSession(`${seconds}s`);
            }
            setCanJoin(false);
        }
    };

    const handleJoinSession = () => {
        if (canJoin && session) {
            // Store session info for the video room
            localStorage.setItem('current_session', JSON.stringify(session));

            // Navigate to video room
            navigate(`/patient-portal/session/${session.id}`);

            toast({
                title: "Joining Session",
                description: "Connecting to your healthcare provider...",
            });
        }
    };

    const goBack = () => {
        navigate('/patient-portal/dashboard');
    };

    const getSessionStatus = () => {
        if (!session) return null;

        const now = new Date();
        const sessionTime = new Date(session.session_date);

        if (now < sessionTime) {
            return {
                status: 'waiting',
                color: 'bg-blue-100 text-blue-800',
                label: 'Waiting for Session',
                icon: Clock,
                message: 'Your session will start soon'
            };
        }

        return {
            status: 'ready',
            color: 'bg-green-100 text-green-800',
            label: 'Ready to Join',
            icon: CheckCircle,
            message: 'Your healthcare provider is ready'
        };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">Loading session...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Error</h2>
                        <p className="text-gray-600 mb-6">{error || 'Session not found'}</p>
                        <Button onClick={goBack} className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusInfo = getSessionStatus();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Session Waiting Room
                    </CardTitle>
                    <p className="text-gray-600">
                        {session.session_topic}
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Session Details */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Patient</span>
                            <span className="text-sm text-gray-900">{session.patient_name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Provider</span>
                            <span className="text-sm text-gray-900">{session.provider_name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Scheduled Time</span>
                            <span className="text-sm text-gray-900">
                                {format(parseISO(session.session_date), 'MMM d, yyyy h:mm a')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Duration</span>
                            <span className="text-sm text-gray-900">{session.duration_minutes} minutes</span>
                        </div>
                    </div>

                    {/* Status */}
                    {statusInfo && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <statusInfo.icon className={`w-5 h-5 ${statusInfo.status === 'ready' ? 'text-green-600' : 'text-blue-600'
                                }`} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{statusInfo.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Countdown Timer */}
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {timeUntilSession}
                        </div>
                        <p className="text-sm text-blue-800">
                            {canJoin ? 'Click below to join your session' : 'until your session starts'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {canJoin ? (
                            <Button
                                onClick={handleJoinSession}
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="lg"
                            >
                                <Video className="w-5 h-5 mr-2" />
                                Join Session Now
                            </Button>
                        ) : (
                            <Button
                                disabled
                                className="w-full"
                                size="lg"
                            >
                                <Clock className="w-5 h-5 mr-2" />
                                Session Not Ready
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={goBack}
                            className="w-full"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">While you wait:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Ensure you have a stable internet connection</li>
                            <li>• Test your camera and microphone</li>
                            <li>• Find a quiet, private location</li>
                            <li>• Have your questions ready</li>
                            <li>• Keep this page open</li>
                        </ul>
                    </div>

                    {/* Auto-refresh notice */}
                    <div className="text-center text-xs text-gray-500">
                        <p>This page will automatically update when your session is ready</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
