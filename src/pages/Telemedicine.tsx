import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Video,
  Calendar,
  Plus,
  Settings,
  Users,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import TelemedicineSessionManager from '@/components/telemedicine/TelemedicineSessionManager';
import VideoRoom from '@/components/telemedicine/VideoRoom';
import TelemedicineForm from '@/components/telemedicine/TelemedicineForm';

export default function Telemedicine() {
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [viewMode, setViewMode] = useState('sessions'); // 'sessions', 'video', 'analytics'
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch telemedicine sessions
  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['telemedicine-sessions'],
    queryFn: () => mockApiClient.entities.Telemedicine.list(),
    initialData: []
  });

  // Fetch patients for form
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
    initialData: []
  });

  // Fetch users for provider selection
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => mockApiClient.entities.User.list(),
    initialData: []
  });

  // Create/Update session mutation
  const sessionMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return mockApiClient.entities.Telemedicine.update(data.id, data);
      } else {
        return mockApiClient.entities.Telemedicine.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telemedicine-sessions'] });
      setShowForm(false);
      setEditingSession(null);
      toast({
        title: "Success",
        description: editingSession ? "Session updated successfully!" : "Session created successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: (id: any) => mockApiClient.entities.Telemedicine.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telemedicine-sessions'] });
      toast({
        title: "Success",
        description: "Session deleted successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStartSession = (session: any) => {
    setActiveSession(session);
    setViewMode('video');
  };

  const handleEditSession = (session = null) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleDeleteSession = (session: any) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      deleteMutation.mutate(session.id);
    }
  };

  const handleViewSession = (session: any) => {
    // This would open a playback view for completed sessions
    console.log('View session:', session);
  };

  const handleSessionEnd = () => {
    setActiveSession(null);
    setViewMode('sessions');
    queryClient.invalidateQueries({ queryKey: ['telemedicine-sessions'] });
  };

  const handleFormSubmit = (data: any) => {
    sessionMutation.mutate(data);
  };

  // Calculate statistics
  const stats = {
    total: sessions.length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    inProgress: sessions.filter(s => s.status === 'in_progress').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length
  };

  // If in video mode, show the video room
  if (viewMode === 'video' && activeSession) {
    return (
      <VideoRoom
        sessionId={activeSession.id}
        patientId={activeSession.patient_id}
        patientName={activeSession.patient_name}
        onSessionEnd={handleSessionEnd}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Video className="w-8 h-8 text-blue-600" />
              Telemedicine
            </h1>
            <p className="text-gray-600 mt-2">
              Manage video consultations and virtual patient visits
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setViewMode('analytics')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => handleEditSession()}>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Video className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <Users className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions" colorScheme="blue">
              Sessions
            </TabsTrigger>
            <TabsTrigger value="analytics" colorScheme="purple">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" colorScheme="green">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-6">
            <TelemedicineSessionManager
              sessions={sessions}
              isLoading={loadingSessions}
              onStartSession={handleStartSession}
              onEditSession={handleEditSession}
              onDeleteSession={handleDeleteSession}
              onViewSession={handleViewSession}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{"Telemedicine Analytics"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Analytics dashboard will be implemented in a future phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{"Telemedicine Settings"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Settings panel will be implemented in a future phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? "Edit Telemedicine Session" : "New Telemedicine Session"}
              </DialogTitle>
            </DialogHeader>
            <TelemedicineForm
              session={editingSession}
              patients={patients}
              users={users}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingSession(null);
              }}
              isSubmitting={sessionMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
