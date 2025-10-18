import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Video,
  Calendar,
  Clock,
  User,
  Search,
  Plus,
  MoreVertical,
  Play,
  Eye
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface TelemedicineSession {
  id: string;
  session_date: string;
  session_topic: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  session_type: 'consultation' | 'follow_up' | 'emergency' | 'specialty';
  patient_id: string;
  patient_name: string;
  provider_id: string;
  provider_name: string;
  duration_minutes: number;
  meeting_link?: string;
  recording_consent: boolean;
  notes?: string;
  recording_url?: string;
}

interface TelemedicineSessionManagerProps {
  sessions?: TelemedicineSession[];
  onStartSession: (session: TelemedicineSession) => void;
  onEditSession: (session: TelemedicineSession) => void;
  onDeleteSession: (session: TelemedicineSession) => void;
  onViewSession: (session: TelemedicineSession) => void;
  isLoading?: boolean;
  className?: string;
}

export default function TelemedicineSessionManager({
  sessions = [],
  onStartSession,
  onEditSession,
  onDeleteSession,
  onViewSession,
  isLoading = false,
  className
}: TelemedicineSessionManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('session_date');

  const statusConfig = {
    scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
    in_progress: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
  };

  const typeConfig = {
    consultation: { label: 'Consultation', icon: '🩺' },
    follow_up: { label: 'Follow-up', icon: '🔄' },
    emergency: { label: 'Emergency', icon: '🚨' },
    specialty: { label: 'Specialty', icon: '🏥' }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.session_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.provider_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesType = typeFilter === 'all' || session.session_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case 'session_date':
        return new Date(b.session_date) - new Date(a.session_date);
      case 'patient_name':
        return a.patient_name?.localeCompare(b.patient_name);
      case 'provider_name':
        return a.provider_name?.localeCompare(b.provider_name);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: any) => {
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: any) => {
    const config = typeConfig[type] || typeConfig.consultation;
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getSessionActions = (session: any) => {
    const actions = [];

    switch (session.status) {
      case 'scheduled':
        actions.push(
          <Button
            key="start"
            size="sm"
            onClick={() => onStartSession?.(session)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
        );
        break;

      case 'in_progress':
        actions.push(
          <Button
            key="join"
            size="sm"
            onClick={() => onStartSession?.(session)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Video className="w-4 h-4 mr-1" />
            Join
          </Button>
        );
        break;

      case 'completed':
        if (session.recording_url) {
          actions.push(
            <Button
              key="view"
              size="sm"
              variant="outline"
              onClick={() => onViewSession?.(session)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          );
        }
        break;
    }

    actions.push(
      <Button
        key="edit"
        size="sm"
        variant="ghost"
        onClick={() => onEditSession?.(session)}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
    );

    return actions;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Telemedicine Sessions</h2>
          <p className="text-gray-600">Manage your video consultation sessions</p>
        </div>
        <Button onClick={() => onEditSession?.()}>
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label="Filter by session status"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label="Filter by session type"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="specialty">Specialty</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label="Sort sessions by"
            >
              <option value="session_date">Sort by Date</option>
              <option value="patient_name">Sort by Patient</option>
              <option value="provider_name">Sort by Provider</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {sortedSessions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Create your first telemedicine session'
                }
              </p>
              <Button onClick={() => onEditSession?.()}>
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedSessions.map(session => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {session.session_topic}
                      </h3>
                      {getStatusBadge(session.status)}
                      {getTypeBadge(session.session_type)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <strong>Patient:</strong> {session.patient_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <strong>Provider:</strong> {session.provider_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <strong>Date:</strong> {format(parseISO(session.session_date), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          <strong>Time:</strong> {format(parseISO(session.session_date), 'h:mm a')}
                        </span>
                      </div>

                      {session.duration_minutes && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            <strong>Duration:</strong> {session.duration_minutes} min
                          </span>
                        </div>
                      )}

                      {session.recording_url && (
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          <span className="text-green-600 font-medium">Recording Available</span>
                        </div>
                      )}
                    </div>

                    {session.notes && (
                      <p className="text-sm text-gray-600 mt-3 italic">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {getSessionActions(session)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
