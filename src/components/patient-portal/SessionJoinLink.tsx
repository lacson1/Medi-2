import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format, parseISO, addMinutes } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function SessionJoinLink({ 
  sessionId, 
  token, 
  onJoinSuccess,
  onJoinError 
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [error, setError] = React.useState('');
  const [canJoin, setCanJoin] = React.useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      setError('');

      // In a real implementation, this would validate the token and fetch session
      const mockSession = {
        id: sessionId,
        session_topic: 'Follow-up Consultation',
        patient_name: 'John Doe',
        provider_name: 'Dr. Smith',
        session_date: new Date().toISOString(),
        duration_minutes: 30,
        status: 'scheduled',
        session_type: 'consultation'
      };

      setSession(mockSession);
      checkJoinAvailability(mockSession);
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('Invalid session link. Please contact your healthcare provider.');
      onJoinError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkJoinAvailability = (sessionData: any) => {
    const now = new Date();
    const sessionTime = new Date(sessionData.session_date);
    const sessionEnd = addMinutes(sessionTime, sessionData.duration_minutes || 30);

    if (now < sessionTime) {
      setCanJoin(false);
      setError('Session has not started yet. Please wait for your scheduled time.');
    } else if (now > sessionEnd) {
      setCanJoin(false);
      setError('This session has already ended.');
    } else {
      setCanJoin(true);
    }
  };

  const handleJoinSession = () => {
    if (!canJoin || !session) return;

    try {
      // Store session info for the video room
      localStorage.setItem('current_session', JSON.stringify(session));
      
      // Navigate to video room
      navigate(`/patient-portal/session/${sessionId}`);
      
      onJoinSuccess?.(session);
      
      toast({
        title: "Joining Session",
        description: "Connecting to your healthcare provider...",
      });
    } catch (error) {
      console.error('Failed to join session:', error);
      setError('Failed to join session. Please try again.');
      onJoinError?.(error);
    }
  };

  const getStatusInfo = () => {
    if (!session) return null;

    const now = new Date();
    const sessionTime = new Date(session.session_date);
    const sessionEnd = addMinutes(sessionTime, session.duration_minutes || 30);

    if (now < sessionTime) {
      return {
        status: 'upcoming',
        color: 'bg-blue-100 text-blue-800',
        label: 'Upcoming',
        icon: Clock,
        message: `Session starts at ${format(sessionTime, 'h:mm a')}`
      };
    }

    if (now > sessionTime && now < sessionEnd) {
      return {
        status: 'ready',
        color: 'bg-green-100 text-green-800',
        label: 'Ready to Join',
        icon: CheckCircle,
        message: 'Your healthcare provider is waiting'
      };
    }

    return {
      status: 'ended',
      color: 'bg-gray-100 text-gray-800',
      label: 'Ended',
      icon: AlertCircle,
      message: 'This session has ended'
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

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/patient-portal/auth')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Telemedicine Session
          </CardTitle>
          <p className="text-gray-600">
            {session?.session_topic}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Session Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Patient</span>
              <span className="text-sm text-gray-900">{session?.patient_name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Provider</span>
              <span className="text-sm text-gray-900">{session?.provider_name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Date</span>
              <span className="text-sm text-gray-900">
                {session && format(parseISO(session.session_date), 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Time</span>
              <span className="text-sm text-gray-900">
                {session && format(parseISO(session.session_date), 'h:mm a')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Duration</span>
              <span className="text-sm text-gray-900">{session?.duration_minutes} minutes</span>
            </div>
          </div>

          {/* Status */}
          {statusInfo && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <statusInfo.icon className={`w-5 h-5 ${
                statusInfo.status === 'ready' ? 'text-green-600' : 
                statusInfo.status === 'upcoming' ? 'text-blue-600' : 
                'text-gray-600'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{statusInfo.message}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {canJoin ? (
              <Button 
                onClick={handleJoinSession}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Video className="w-5 h-5 mr-2" />
                Join Session
              </Button>
            ) : (
              <Button 
                disabled
                className="w-full"
                size="lg"
              >
                <Clock className="w-5 h-5 mr-2" />
                Session Not Available
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/patient-portal/auth')}
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Before joining:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure you have a stable internet connection</li>
              <li>• Test your camera and microphone</li>
              <li>• Find a quiet, private location</li>
              <li>• Have your questions ready</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
