import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  LogOut,
  Bell,
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addMinutes } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { mockApiClient } from "@/api/mockApiClient";

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    loadPatientData();
    loadSessions();
  }, []);

  const loadPatientData = () => {
    const patientSession = localStorage.getItem('patient_session');
    if (patientSession) {
      setPatient(JSON.parse(patientSession));
    } else {
      navigate('/patient-portal/auth');
    }
  };

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would fetch sessions for the specific patient
      const allSessions = await mockApiClient.entities.Telemedicine.list('-session_date');
      
      // Filter sessions for this patient (in demo, show all)
      setSessions(allSessions);
      
      // Generate notifications
      generateNotifications(allSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNotifications = (sessions: any) => {
    const now = new Date();
    const newNotifications = [];

    sessions.forEach(session => {
      const sessionTime = new Date(session.session_date);
      const sessionEnd = addMinutes(sessionTime, session.duration_minutes || 30);

      if (session.status === 'scheduled') {
        // Session starting soon
        const timeUntilSession = sessionTime.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeUntilSession / (1000 * 60));

        if (minutesUntil <= 15 && minutesUntil > 0) {
          newNotifications.push({
            id: `session-starting-${session.id}`,
            type: 'info',
            title: 'Session Starting Soon',
            message: `Your session "${session.session_topic}" starts in ${minutesUntil} minutes.`,
            sessionId: session.id,
            action: 'join'
          });
        }

        // Session ready to join
        if (isAfter(now, sessionTime) && isBefore(now, sessionEnd)) {
          newNotifications.push({
            id: `session-ready-${session.id}`,
            type: 'success',
            title: 'Session Ready',
            message: 'Your healthcare provider is ready. Click to join your session.',
            sessionId: session.id,
            action: 'join'
          });
        }
      }
    });

    setNotifications(newNotifications);
  };

  const handleJoinSession = (sessionId: any) => {
    navigate(`/patient-portal/session/${sessionId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('patient_session');
    navigate('/patient-portal/auth');
  };

  const getSessionStatus = (session: any) => {
    const now = new Date();
    const sessionTime = new Date(session.session_date);
    const sessionEnd = addMinutes(sessionTime, session.duration_minutes || 30);

    if (session.status === 'completed') {
      return { status: 'completed', color: 'bg-green-100 text-green-800', label: 'Completed' };
    }
    
    if (session.status === 'cancelled') {
      return { status: 'cancelled', color: 'bg-red-100 text-red-800', label: 'Cancelled' };
    }

    if (isBefore(now, sessionTime)) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', label: 'Upcoming' };
    }

    if (isAfter(now, sessionTime) && isBefore(now, sessionEnd)) {
      return { status: 'ready', color: 'bg-green-100 text-green-800', label: 'Ready to Join' };
    }

    return { status: 'ended', color: 'bg-gray-100 text-gray-800', label: 'Ended' };
  };

  const upcomingSessions = sessions.filter(session => {
    const status = getSessionStatus(session);
    return ['upcoming', 'ready'].includes(status.status);
  });

  const pastSessions = sessions.filter(session => {
    const status = getSessionStatus(session);
    return ['completed', 'ended', 'cancelled'].includes(status.status);
  });

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Patient Portal</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </div>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {patient.name}!
          </h2>
          <p className="text-gray-600">
            Manage your telemedicine sessions and healthcare appointments
          </p>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              {notifications.map(notification => (
                <Alert key={notification.id} className={notification.type === 'success' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {notification.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      )}
                      <div>
                        <AlertDescription className="font-medium">
                          {notification.title}
                        </AlertDescription>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    {notification.action === 'join' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleJoinSession(notification.sessionId)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Join Now
                      </Button>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No upcoming sessions scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map(session => {
                const status = getSessionStatus(session);
                return (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {session.session_topic}
                            </h4>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>Provider: {session.provider_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{format(parseISO(session.session_date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{format(parseISO(session.session_date), 'h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {status.status === 'ready' ? (
                            <Button 
                              onClick={() => handleJoinSession(session.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Session
                            </Button>
                          ) : (
                            <Button variant="outline" disabled>
                              <Clock className="w-4 h-4 mr-2" />
                              Waiting
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Sessions</h3>
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No past sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastSessions.map(session => {
                const status = getSessionStatus(session);
                return (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {session.session_topic}
                            </h4>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>Provider: {session.provider_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{format(parseISO(session.session_date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{format(parseISO(session.session_date), 'h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {session.recording_url ? (
                            <Button variant="outline">
                              <Video className="w-4 h-4 mr-2" />
                              View Recording
                            </Button>
                          ) : (
                            <Button variant="outline" disabled>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
