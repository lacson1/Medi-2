import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Video, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import { mockApiClient } from "@/api/mockApiClient";

export default function PatientAuth() {
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'session'

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a session token in URL
    const token = searchParams.get('token');
    const session = searchParams.get('session');

    if (token && session) {
      handleSessionJoin(session, token);
    }
  }, [searchParams]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For demo purposes, we'll simulate patient authentication
      // In a real implementation, this would validate patient credentials
      const mockPatient = {
        id: 'patient-' + Date.now(),
        name: 'Patient User',
        email: email,
        role: 'patient'
      };

      // Store patient session
      localStorage.setItem('patient_session', JSON.stringify(mockPatient));

      navigate('/patient-portal/dashboard');

      toast({
        title: "Welcome!",
        description: "You've successfully logged in to the patient portal.",
      });
    } catch (error) {
      console.error('Patient auth error:', error);
      setError('Invalid email address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionJoin = async (sessionId, token) => {
    setIsLoading(true);
    setError('');

    try {
      // Validate session token
      const session = await mockApiClient.entities.Telemedicine.filter({
        id: sessionId,
        // In a real implementation, you'd validate the token
      });

      if (session.length === 0) {
        throw new Error('Invalid session');
      }

      const sessionData = session[0];

      // Check if session is still valid
      const now = new Date();
      const sessionTime = new Date(sessionData.session_date);

      if (now < sessionTime) {
        // Session hasn't started yet
        navigate(`/patient-portal/waiting?session=${sessionId}`);
      } else if (now > new Date(sessionTime.getTime() + (sessionData.duration_minutes || 30) * 60000)) {
        // Session has ended
        setError('This session has already ended.');
        return;
      } else {
        // Session is active
        navigate(`/patient-portal/session/${sessionId}`);
      }
    } catch (error) {
      console.error('Session join error:', error);
      setError('Invalid session link. Please contact your healthcare provider.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionAuth = async (e) => {
    e.preventDefault();
    await handleSessionJoin(sessionId, 'direct');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Patient Portal
            </CardTitle>
            <p className="text-gray-600">
              Access your telemedicine sessions
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Auth Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMethod === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={() => setAuthMethod('email')}
              >
                Email Login
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMethod === 'session'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={() => setAuthMethod('session')}
              >
                Join Session
              </button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Authentication */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            )}

            {/* Session Join */}
            {authMethod === 'session' && (
              <form onSubmit={handleSessionAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    placeholder="Enter session ID"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Enter the session ID provided by your healthcare provider
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Joining...' : 'Join Session'}
                </Button>
              </form>
            )}

            {/* Demo Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Demo Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Email Login:</strong> Use any email address</p>
                <p><strong>Session Join:</strong> Use session ID from provider</p>
                <p><strong>Direct Link:</strong> Click link from provider email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
