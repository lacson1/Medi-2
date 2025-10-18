import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Video,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    Settings,
    Users,
    MessageCircle,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PatientSession() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [session, setSession] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [providerStatus, setProviderStatus] = useState('connecting');

    useEffect(() => {
        void loadSession();
        void initializeVideoCall();
    }, [sessionId]);

    const loadSession = () => {
        try {
            // Load session from localStorage (set by SessionJoinLink)
            const currentSession = localStorage.getItem('current_session');
            if (currentSession) {
                setSession(JSON.parse(currentSession));
            } else {
                // Fallback: create mock session
                setSession({
                    id: sessionId,
                    session_topic: 'Telemedicine Consultation',
                    patient_name: 'Patient User',
                    provider_name: 'Dr. Smith',
                    session_date: new Date().toISOString(),
                    duration_minutes: 30,
                    status: 'active'
                });
            }
        } catch (error) {
            console.error('Failed to load session:', error);
            setError('Failed to load session data');
        }
    };

    const initializeVideoCall = () => {
        try {
            setIsLoading(true);

            // Simulate connection process
            setTimeout(() => {
                setProviderStatus('connected');
                setIsConnected(true);
                setIsLoading(false);

                toast({
                    title: "Connected",
                    description: "You're now connected to your healthcare provider.",
                });
            }, 2000);

        } catch (error) {
            console.error('Failed to initialize video call:', error);
            setError('Failed to connect to the session');
            setIsLoading(false);
        }
    };

    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn);
        toast({
            title: isVideoOn ? "Video Off" : "Video On",
            description: `Camera ${isVideoOn ? 'disabled' : 'enabled'}`,
        });
    };

    const toggleAudio = () => {
        setIsAudioOn(!isAudioOn);
        toast({
            title: isAudioOn ? "Microphone Off" : "Microphone On",
            description: `Microphone ${isAudioOn ? 'disabled' : 'enabled'}`,
        });
    };

    const endCall = () => {
        setIsConnected(false);
        toast({
            title: "Call Ended",
            description: "Your session has been ended.",
        });

        // Clear session data
        localStorage.removeItem('current_session');

        // Navigate back to dashboard
        setTimeout(() => {
            navigate('/patient-portal/dashboard');
        }, 1000);
    };

    const goBack = () => {
        navigate('/patient-portal/dashboard');
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="space-y-3">
                            <Button onClick={goBack} className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Video className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting...</h2>
                        <p className="text-gray-600 mb-4">Establishing connection with your healthcare provider</p>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-100"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-200"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 text-white p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={goBack} className="text-white hover:bg-gray-700">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">{session?.session_topic}</h1>
                            <p className="text-sm text-gray-300">with {session?.provider_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${providerStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span>{providerStatus === 'connected' ? 'Connected' : 'Connecting'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 flex">
                {/* Video Container */}
                <div className="flex-1 relative bg-gray-800">
                    {/* Provider Video */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-12 h-12" />
                                </div>
                                <p className="text-lg font-medium">{session?.provider_name}</p>
                                <p className="text-sm text-gray-300">Healthcare Provider</p>
                            </div>
                        </div>
                    </div>

                    {/* Patient Video (Picture-in-Picture) */}
                    <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Users className="w-6 h-6" />
                                </div>
                                <p className="text-sm">You</p>
                            </div>
                        </div>
                    </div>

                    {/* Connection Status */}
                    {!isConnected && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-center text-white">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                                <p className="text-lg">Waiting for provider to join...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Sidebar (Optional) */}
                <div className="w-80 bg-white border-l border-gray-200 hidden lg:block">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Session Chat</h3>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            <div className="text-sm text-gray-500 text-center py-8">
                                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p>Chat messages will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 p-6">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
                    {/* Audio Control */}
                    <Button
                        onClick={toggleAudio}
                        size="lg"
                        className={`w-12 h-12 rounded-full ${isAudioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
                    >
                        {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    {/* Video Control */}
                    <Button
                        onClick={toggleVideo}
                        size="lg"
                        className={`w-12 h-12 rounded-full ${isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
                    >
                        {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>

                    {/* Settings */}
                    <Button
                        size="lg"
                        className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500"
                    >
                        <Settings className="w-6 h-6" />
                    </Button>

                    {/* End Call */}
                    <Button
                        onClick={endCall}
                        size="lg"
                        className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Session Info */}
            <div className="bg-gray-100 p-4">
                <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
                    <p>Session ID: {sessionId} • Duration: {session?.duration_minutes || 30} minutes</p>
                </div>
            </div>
        </div>
    );
}
