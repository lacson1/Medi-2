import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { differenceInYears, parseISO, format } from 'date-fns';
import { mockApiClient } from '@/api/mockApiClient';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

// Local type-relaxing aliases for UI components with strict/incorrect prop typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DMContent = DropdownMenuContent as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DMItem = DropdownMenuItem as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DMTrigger = DropdownMenuTrigger as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AvatarC = Avatar as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AvatarImg = AvatarImage as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AvatarFb = AvatarFallback as unknown as React.FC<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Scroll = ScrollArea as unknown as React.FC<any>;

// Icons
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Pill,
  TestTube,
  Heart,
  Activity,
  Edit,
  Save,
  X,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  User,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';

interface VitalSign {
  id: string;
  type: string;
  value: string;
  unit: string;
  date: string;
  status?: 'normal' | 'abnormal' | 'critical';
}

interface ClinicalNote {
  id: string;
  date: string;
  provider: string;
  type: string;
  content: string;
  tags: string[];
  summary?: string;
}

type AppointmentItem = {
  id: string;
  appointment_date?: string;
  appointment_type?: string;
  provider?: string;
};

type PrescriptionItem = {
  id: string;
  medication: string;
  dosage: string;
  instructions: string;
  status: string;
  refills?: number;
};

type LabOrderItem = {
  id: string;
  test_name?: string;
  created_at?: string;
  status: string;
};

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  blood_type?: string;
  date_of_birth?: string;
  gender?: string;
  status?: string;
  allergies?: string[];
  medical_conditions?: string[];
};

// Loading Skeleton Component
const PatientWorkspaceSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50" aria-busy="true" aria-live="polite">
    <div className="max-w-[1920px] mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <Card className="p-6" aria-hidden="true">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" aria-hidden="true" />
            <Skeleton className="h-4 w-96" aria-hidden="true" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" aria-hidden="true" />
            <Skeleton className="h-10 w-32" aria-hidden="true" />
            <Skeleton className="h-10 w-32" aria-hidden="true" />
          </div>
        </div>
      </Card>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6" aria-hidden="true">
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" aria-hidden="true" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" aria-hidden="true" />
              <Skeleton className="h-4 w-3/4" aria-hidden="true" />
              <Skeleton className="h-4 w-full" aria-hidden="true" />
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6" aria-hidden="true">
          <Card className="p-6">
            <Skeleton className="h-10 w-64 mb-4" aria-hidden="true" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" aria-hidden="true" />
              <Skeleton className="h-32 w-full" aria-hidden="true" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

// Patient Information Item Component
const InfoItem: React.FC<{
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
  editable?: boolean;
}> = ({ label, value, icon, editable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value || '');

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-2 group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && <div className="text-muted-foreground flex-shrink-0">{icon}</div>}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          {isEditing ? (
            <Input
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="mt-1 h-8"
              autoFocus
              aria-label={label}
            />
          ) : (
            <p className="text-sm font-medium text-foreground truncate">{value || 'N/A'}</p>
          )}
        </div>
      </div>
      {editable && !isEditing && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
          aria-label={`Edit ${label}`}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      )}
      {isEditing && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleSave}
            aria-label={`Save ${label}`}
          >
            <Save className="h-3.5 w-3.5 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setIsEditing(false);
              setEditedValue(value || '');
            }}
            aria-label={`Cancel editing ${label}`}
          >
            <X className="h-3.5 w-3.5 text-red-600" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Medical History Tag Component
const MedicalTag: React.FC<{ label: string; type?: 'condition' | 'allergy' | 'surgery' }> = ({
  label,
  type = 'condition',
}) => {
  const colors = {
    condition: 'bg-blue-100 text-blue-700 border-blue-200',
    allergy: 'bg-red-100 text-red-700 border-red-200',
    surgery: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <Badge
      variant="outline"
      className={`${colors[type]} border font-normal px-3 py-1 rounded-full`}
    >
      {label}
    </Badge>
  );
};

// Vital Sign Card Component
const VitalCard: React.FC<{ vital: VitalSign }> = ({ vital }) => {
  const statusColors = {
    normal: 'text-green-600 bg-green-50 border-green-200',
    abnormal: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <Card className={`border-2 ${statusColors[vital.status || 'normal']}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {vital.type}
            </p>
            <p className="text-2xl font-bold mt-1">
              {vital.value}
              <span className="text-sm font-normal ml-1">{vital.unit}</span>
            </p>
          </div>
          {vital.status === 'critical' && (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {format(parseISO(vital.date), 'MMM dd, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
};

// Clinical Note Card Component
const ClinicalNoteCard: React.FC<{ note: ClinicalNote }> = ({ note }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base">{note.type}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {note.date}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-2">
              <User className="h-3 w-3" />
              {note.provider}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DMTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Clinical note actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DMTrigger>
            <DMContent align="end">
              <DMItem>View Details</DMItem>
              <DMItem>Edit</DMItem>
              <DMItem>Delete</DMItem>
            </DMContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground mb-3 line-clamp-3">{note.content}</p>
        {note.summary && (
          <div className="bg-muted/50 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <p className="text-xs font-medium text-muted-foreground">AI Summary</p>
            </div>
            <p className="text-xs text-foreground">{note.summary}</p>
          </div>
        )}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Timeline Component
const TimelineItem: React.FC<{
  date: string;
  title: string;
  description: string;
  type: 'visit' | 'note' | 'lab' | 'prescription';
  icon: React.ReactNode;
}> = ({ date, title, description, type, icon }) => {
  const typeColors = {
    visit: 'bg-blue-500',
    note: 'bg-green-500',
    lab: 'bg-purple-500',
    prescription: 'bg-orange-500',
  };

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <div className={`${typeColors[type]} rounded-full p-2 text-white z-10`}>
          {icon}
        </div>
        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-xs font-medium text-muted-foreground mb-1">{date}</p>
        <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default function ModernPatientWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [darkMode, setDarkMode] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fabMenuRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Fetch patient data
  const { data: patient, isLoading, error } = useQuery<Patient | null>({
    queryKey: ['patient', id],
    queryFn: () => mockApiClient.entities.Patient.get(id || ''),
    enabled: !!id,
  });

  // Fetch related data
  const { data: appointments } = useQuery<AppointmentItem[]>({
    queryKey: ['patient-appointments', id],
    queryFn: () => mockApiClient.entities.Appointment.list(),
    enabled: !!id,
  });

  const { data: prescriptionsRaw } = useQuery({
    queryKey: ['patient-prescriptions', id],
    queryFn: () => mockApiClient.entities.Prescription.list(),
    enabled: !!id,
  });

  const { data: labOrdersRaw } = useQuery({
    queryKey: ['patient-lab-orders', id],
    queryFn: () => mockApiClient.entities.LabOrder.list(),
    enabled: !!id,
  });

  const prescriptions: PrescriptionItem[] = useMemo(() => {
    const list = (prescriptionsRaw as unknown[] | undefined) ?? [];
    return list.map((p) => {
      const r = p as Record<string, unknown>;
      return {
        id:
          typeof r.id === 'string'
            ? r.id
            : typeof r.id === 'number'
              ? String(r.id)
              : '',
        medication:
          typeof r.medication === 'string'
            ? r.medication
            : typeof r.medication_name === 'string'
              ? r.medication_name
              : 'Medication',
        dosage: typeof r.dosage === 'string' ? r.dosage : '',
        instructions:
          typeof r.instructions === 'string'
            ? r.instructions
            : typeof r.frequency === 'string'
              ? r.frequency
              : '',
        status: typeof r.status === 'string' ? r.status : 'active',
        refills: typeof r.refills === 'number' ? r.refills : undefined,
      };
    });
  }, [prescriptionsRaw]);

  const labOrders: LabOrderItem[] = useMemo(() => {
    const list = (labOrdersRaw as unknown[] | undefined) ?? [];
    return list.map((l) => {
      const r = l as Record<string, unknown>;
      return {
        id:
          typeof r.id === 'string'
            ? r.id
            : typeof r.id === 'number'
              ? String(r.id)
              : '',
        test_name: typeof r.test_name === 'string' ? r.test_name : undefined,
        created_at: typeof r.created_at === 'string' ? r.created_at : undefined,
        status: typeof r.status === 'string' ? r.status : 'pending',
      };
    });
  }, [labOrdersRaw]);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  // Manage focus when FAB opens
  useEffect(() => {
    if (fabOpen && fabMenuRef.current) {
      const firstButton = fabMenuRef.current.querySelector('button');
      if (firstButton instanceof HTMLButtonElement) {
        firstButton.focus();
      }
    }
  }, [fabOpen]);

  // Mock data generators for demonstration
  const recentVitals: VitalSign[] = useMemo(() => {
    if (!patient) return [];
    return [
      {
        id: '1',
        type: 'Blood Pressure',
        value: '120/80',
        unit: 'mmHg',
        date: new Date().toISOString(),
        status: 'normal',
      },
      {
        id: '2',
        type: 'Heart Rate',
        value: '72',
        unit: 'bpm',
        date: new Date().toISOString(),
        status: 'normal',
      },
      {
        id: '3',
        type: 'Temperature',
        value: '98.6',
        unit: '°F',
        date: new Date().toISOString(),
        status: 'normal',
      },
    ];
  }, [patient]);

  const clinicalNotes: ClinicalNote[] = useMemo(() => {
    return [
      {
        id: '1',
        date: format(new Date(), 'MMM dd, yyyy'),
        provider: 'Dr. Sarah Johnson',
        type: 'Follow-up Visit',
        content:
          'Patient presents with stable condition. Blood pressure well-controlled. Continue current medication regimen. Advised lifestyle modifications.',
        tags: ['Hypertension', 'Follow-up'],
        summary: 'Stable condition, medication effective',
      },
      {
        id: '2',
        date: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
        provider: 'Dr. Michael Chen',
        type: 'Initial Consultation',
        content:
          'New patient consultation. Full medical history reviewed. Recommended lab work and follow-up in 2 weeks.',
        tags: ['New Patient', 'Consultation'],
        summary: 'Initial assessment completed, labs ordered',
      },
    ];
  }, []);

  type TimelineEvent = {
    id: string;
    date: string;
    title: string;
    description: string;
    type: 'visit' | 'note' | 'lab' | 'prescription';
    icon: React.ReactNode;
  };

  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    const events: TimelineEvent[] = [];

    appointments?.forEach((apt) => {
      events.push({
        id: `apt-${apt.id}`,
        date: format(parseISO(apt.appointment_date || new Date().toISOString()), 'MMM dd, yyyy'),
        title: apt.appointment_type || 'Appointment',
        description: `Scheduled with ${apt.provider || 'Provider'}`,
        type: 'visit',
        icon: <Calendar className="h-4 w-4" />,
      });
    });

    clinicalNotes.forEach((note) => {
      events.push({
        id: `note-${note.id}`,
        date: note.date,
        title: note.type,
        description: note.content.substring(0, 60) + '...',
        type: 'note',
        icon: <FileText className="h-4 w-4" />,
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, clinicalNotes]);

  // Calculate patient age
  const patientAge = useMemo(() => {
    if (!patient?.date_of_birth) return null;
    return differenceInYears(new Date(), parseISO(patient.date_of_birth));
  }, [patient]);

  // Generate AI summary
  const aiSummary = useMemo(() => {
    if (!patient) return '';
    const conditions = patient.allergies?.join(', ') || 'None documented';
    return `Patient condition is stable. ${patient.status === 'active' ? 'Active patient with regular follow-ups.' : ''} Allergies: ${conditions}. Recent vitals within normal ranges.`;
  }, [patient]);

  if (isLoading) {
    return <PatientWorkspaceSkeleton />;
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Patient Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The patient you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
            </p>
            <Button onClick={() => { void navigate('/patients'); }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const patientName = `${patient.first_name} ${patient.last_name}`;
  const initials = `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100/50'}`}>
      <div className="max-w-[1920px] mx-auto">
        {/* Top Bar - Sticky Header */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm"
        >
          <div className="max-w-[1920px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { void navigate('/patients'); }}
                  className="flex-shrink-0"
                  aria-label="Go back to patients"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <AvatarC className="h-14 w-14 border-2 border-blue-500">
                  <AvatarImg src={undefined} alt={`${patientName} avatar`} />
                  <AvatarFb className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-semibold">
                    {initials}
                  </AvatarFb>
                </AvatarC>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {patientName}
                    {patientAge && `, ${patientAge}`}
                    {patient.gender && ` • ${patient.gender}`}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">
                    Patient ID: {patient.id} {patient.address && `| ${patient.address}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="hidden sm:flex"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  New Note
                </Button>
                <Button variant="outline" size="sm">
                  <Pill className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Patient Snapshot */}
            <div className="lg:col-span-1 space-y-6">
              {/* Patient Information Card */}
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              >
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <InfoItem
                      label="Phone"
                      value={patient.phone}
                      icon={<Phone className="h-4 w-4" />}
                      editable
                    />
                    <InfoItem
                      label="Email"
                      value={patient.email}
                      icon={<Mail className="h-4 w-4" />}
                      editable
                    />
                    <InfoItem
                      label="Address"
                      value={patient.address}
                      icon={<MapPin className="h-4 w-4" />}
                      editable
                    />
                    <InfoItem
                      label="Blood Type"
                      value={patient.blood_type || 'Not recorded'}
                      icon={<Heart className="h-4 w-4" />}
                    />
                    {patient.date_of_birth && (
                      <InfoItem
                        label="Date of Birth"
                        value={format(parseISO(patient.date_of_birth), 'MMM dd, yyyy')}
                        icon={<Calendar className="h-4 w-4" />}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Medical History Card */}
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : 0.1 }}
              >
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Allergies
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {patient.allergies.map((allergy: string, idx: number) => (
                              <MedicalTag key={idx} label={allergy} type="allergy" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No allergies documented</p>
                    )}
                    {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Conditions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {patient.medical_conditions.map((condition, idx) => (
                            <MedicalTag key={idx} label={condition} type="condition" />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Status Card */}
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : 0.2 }}
              >
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          patient.status === 'active'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }
                      >
                        {patient.status === 'active' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    {appointments && appointments.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Last Visit
                        </p>
                        <p className="text-sm font-medium">
                          {format(
                            parseISO(appointments[0]?.appointment_date || new Date().toISOString()),
                            'MMM dd, yyyy'
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Dynamic Tabs */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Summary Panel */}
              {aiSummary && (
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
                >
                  <Card className="rounded-2xl shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200" role="status" aria-live="polite">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500 rounded-full p-2">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-900 uppercase tracking-wide mb-1">
                            AI Patient Summary
                          </p>
                          <p className="text-sm text-blue-800">{aiSummary}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Tabs */}
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : 0.1 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" aria-label="Patient workspace tabs">
                  <TabsList className="grid w-full grid-cols-5 bg-muted/50 rounded-xl p-1" role="tablist">
                    <TabsTrigger value="overview" className="rounded-lg">
                      <Activity className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="clinical" className="rounded-lg">
                      <FileText className="h-4 w-4 mr-2" />
                      Clinical Notes
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions" className="rounded-lg">
                      <Pill className="h-4 w-4 mr-2" />
                      Prescriptions
                    </TabsTrigger>
                    <TabsTrigger value="labs" className="rounded-lg">
                      <TestTube className="h-4 w-4 mr-2" />
                      Labs
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="rounded-lg">
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recentVitals.map((vital) => (
                        <VitalCard key={vital.id} vital={vital} />
                      ))}
                    </div>

                    <Card className="rounded-2xl shadow-sm">
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Button variant="outline" className="h-20 flex-col">
                            <FileText className="h-5 w-5 mb-2" />
                            New Note
                          </Button>
                          <Button variant="outline" className="h-20 flex-col">
                            <Pill className="h-5 w-5 mb-2" />
                            Prescription
                          </Button>
                          <Button variant="outline" className="h-20 flex-col">
                            <TestTube className="h-5 w-5 mb-2" />
                            Lab Order
                          </Button>
                          <Button variant="outline" className="h-20 flex-col">
                            <Calendar className="h-5 w-5 mb-2" />
                            Appointment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Clinical Notes Tab */}
                  <TabsContent value="clinical" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Clinical Notes</h3>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    <Scroll className="h-[600px] pr-4" aria-label="Clinical notes list">
                      <div className="space-y-4" role="list">
                        <AnimatePresence mode="popLayout">
                          {clinicalNotes.map((note) => (
                            <div role="listitem" key={note.id}>
                              <ClinicalNoteCard note={note} />
                            </div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </Scroll>
                  </TabsContent>

                  {/* Prescriptions Tab */}
                  <TabsContent value="prescriptions" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Prescriptions</h3>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Prescription
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {prescriptions && prescriptions.length > 0 ? (
                        prescriptions.map((prescription: PrescriptionItem) => (
                          <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{prescription.medication}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {prescription.dosage} • {prescription.instructions}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                                      {prescription.status}
                                    </Badge>
                                    {prescription.refills !== undefined && (
                                      <Badge variant="outline">Refills: {prescription.refills}</Badge>
                                    )}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DMTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Prescription actions menu">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DMTrigger>
                                  <DMContent align="end">
                                    <DMItem>Renew</DMItem>
                                    <DMItem>Discontinue</DMItem>
                                    <DMItem>Edit</DMItem>
                                  </DMContent>
                                </DropdownMenu>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No prescriptions found</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Labs Tab */}
                  <TabsContent value="labs" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Lab Results</h3>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Order Lab
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {labOrders && labOrders.length > 0 ? (
                        labOrders.map((lab: LabOrderItem) => (
                          <Card key={lab.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{lab.test_name || 'Lab Test'}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {format(parseISO(lab.created_at || new Date().toISOString()), 'MMM dd, yyyy')}
                                  </p>
                                  <Badge
                                    variant={
                                      lab.status === 'completed'
                                        ? 'default'
                                        : lab.status === 'pending'
                                          ? 'secondary'
                                          : 'outline'
                                    }
                                    className="mt-2"
                                  >
                                    {lab.status}
                                  </Badge>
                                </div>
                                <Button variant="outline" size="sm">
                                  View Results
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No lab results found</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Timeline Tab */}
                  <TabsContent value="timeline" className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Patient Timeline</h3>
                    <Card className="rounded-2xl shadow-sm">
                      <CardContent className="p-6">
                        <Scroll className="h-[600px]" aria-label="Patient timeline">
                          <div className="space-y-0" role="list">
                            {timelineEvents.length > 0 ? (
                              timelineEvents.map((event) => (
                                <div role="listitem" key={event.id}>
                                  <TimelineItem
                                    date={event.date}
                                    title={event.title}
                                    description={event.description}
                                    type={event.type}
                                    icon={event.icon}
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12">
                                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No timeline events found</p>
                              </div>
                            )}
                          </div>
                        </Scroll>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-6 right-6 z-50 space-y-3"
              id="fab-menu"
              ref={fabMenuRef}
              role="menu"
              aria-label="Quick actions"
            >
              <motion.div
                initial={prefersReducedMotion ? undefined : { scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
              >
                <Button
                  size="lg"
                  className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
                  role="menuitem"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Appointment
                </Button>
              </motion.div>
              <motion.div
                initial={prefersReducedMotion ? undefined : { scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.05 }}
              >
                <Button
                  size="lg"
                  className="rounded-full shadow-lg bg-green-600 hover:bg-green-700"
                  role="menuitem"
                >
                  <Pill className="h-5 w-5 mr-2" />
                  Prescription
                </Button>
              </motion.div>
              <motion.div
                initial={prefersReducedMotion ? undefined : { scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
              >
                <Button
                  size="lg"
                  className="rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
                  role="menuitem"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Note
                </Button>
              </motion.div>
            </motion.div>
          )}
          <motion.button
            onClick={() => setFabOpen(!fabOpen)}
            className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center ${fabOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
            aria-label={fabOpen ? 'Close quick actions' : 'Open quick actions'}
            aria-expanded={fabOpen}
            aria-controls="fab-menu"
          >
            {fabOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}

