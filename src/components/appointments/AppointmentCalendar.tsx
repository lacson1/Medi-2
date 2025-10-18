import { useState, useMemo } from 'react';
import { format, startOfDay, endOfDay, isSameDay, isToday, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    User,
    MapPin,
    Plus,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appointment {
    id: string;
    patient_name: string;
    appointment_date: string;
    appointment_time: string;
    type: string;
    reason: string;
    status: string;
    provider: string;
    notes?: string;
    priority?: string;
    duration?: number;
    location?: string;
}

interface AppointmentCalendarProps {
    appointments: Appointment[];
    onEdit: (appointment: Appointment) => void;
    onDelete: (appointmentId: string) => void;
    onStatusChange: (appointment: Appointment, status: string) => void;
    onCreateNew: (date: Date) => void;
    isLoading?: boolean;
}

type ViewMode = 'month' | 'week' | 'day';

const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
    scheduled: Clock,
    confirmed: CheckCircle2,
    in_progress: TrendingUp,
    completed: CheckCircle2,
    cancelled: XCircle
};

export default function AppointmentCalendar({
    appointments,
    onEdit,
    onDelete,
    onStatusChange,
    onCreateNew,
    isLoading = false
}: AppointmentCalendarProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Get appointments for the selected date
    const selectedDateAppointments = useMemo(() => {
        return appointments.filter(apt =>
            isSameDay(new Date(apt.appointment_date), selectedDate)
        ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    }, [appointments, selectedDate]);

    // Get appointments for the current view period
    const viewAppointments = useMemo(() => {
        let startDate: Date;
        let endDate: Date;

        switch (viewMode) {
            case 'week':
                startDate = startOfWeek(selectedDate);
                endDate = endOfWeek(selectedDate);
                break;
            case 'day':
                startDate = startOfDay(selectedDate);
                endDate = endOfDay(selectedDate);
                break;
            default: // month
                startDate = startOfMonth(selectedDate);
                endDate = endOfMonth(selectedDate);
        }

        return appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return isWithinInterval(aptDate, { start: startDate, end: endDate });
        });
    }, [appointments, selectedDate, viewMode]);

    // Group appointments by date for calendar display
    const appointmentsByDate = useMemo(() => {
        const grouped: { [key: string]: Appointment[] } = {};
        viewAppointments.forEach(apt => {
            const dateKey = format(new Date(apt.appointment_date), 'yyyy-MM-dd');
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(apt);
        });
        return grouped;
    }, [viewAppointments]);

    // Calendar modifiers for styling
    const modifiers = useMemo(() => {
        const modifiers: any = {
            today: isToday,
            selected: selectedDate,
        };

        // Add appointment dates as modifiers
        Object.keys(appointmentsByDate).forEach(dateKey => {
            const date = new Date(dateKey);
            modifiers[`appointment-${dateKey}`] = date;
        });

        return modifiers;
    }, [appointmentsByDate, selectedDate]);

    const modifiersClassNames = useMemo(() => {
        const classNames: any = {
            today: 'bg-blue-50 text-blue-900 font-semibold',
            selected: 'bg-blue-600 text-white hover:bg-blue-700',
        };

        // Style appointment dates
        Object.keys(appointmentsByDate).forEach(dateKey => {
            classNames[`appointment-${dateKey}`] = 'bg-green-50 text-green-900 font-medium';
        });

        return classNames;
    }, [appointmentsByDate]);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleCreateAppointment = () => {
        onCreateNew(selectedDate);
    };

    const getStatusIcon = (status: string) => {
        const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock;
        return <IconComponent className="w-3 h-3" />;
    };

    const renderAppointmentCard = (appointment: Appointment) => {
        const statusColor = statusColors[appointment.status as keyof typeof statusColors] || statusColors.scheduled;

        return (
            <Card
                key={appointment.id}
                className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedAppointment(appointment)}
            >
                <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className={cn("text-xs", statusColor)}>
                                    {getStatusIcon(appointment.status)}
                                    <span className="ml-1">{appointment.status}</span>
                                </Badge>
                                {appointment.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs">
                                        High Priority
                                    </Badge>
                                )}
                            </div>

                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                                {appointment.patient_name}
                            </h4>

                            <p className="text-xs text-gray-600 mb-1">
                                {appointment.appointment_time} • {appointment.type}
                            </p>

                            <p className="text-xs text-gray-500 truncate">
                                {appointment.reason}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span>{appointment.provider}</span>
                                {appointment.location && (
                                    <>
                                        <MapPin className="w-3 h-3" />
                                        <span>{appointment.location}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(appointment);
                                }}
                            >
                                <Edit className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderMonthView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    className="rounded-md border"
                    classNames={{}}
                />
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                {format(selectedDate, 'EEEE, MMMM d')}
                            </CardTitle>
                            <Button
                                size="sm"
                                onClick={handleCreateAppointment}
                                className="h-8 w-8 p-0"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-96 overflow-y-auto">
                            {selectedDateAppointments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No appointments scheduled</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCreateAppointment}
                                        className="mt-2"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Schedule Appointment
                                    </Button>
                                </div>
                            ) : (
                                selectedDateAppointments.map(renderAppointmentCard)
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderWeekView = () => {
        const weekStart = startOfWeek(selectedDate);
        const weekDays = eachDayOfInterval({
            start: weekStart,
            end: endOfWeek(selectedDate)
        });

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        Week of {format(weekStart, 'MMM d')} - {format(endOfWeek(selectedDate), 'MMM d, yyyy')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(subDays(selectedDate, 7))}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(day => {
                        const dayAppointments = appointments.filter(apt =>
                            isSameDay(new Date(apt.appointment_date), day)
                        );

                        return (
                            <Card key={day.toISOString()} className="min-h-32">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className={cn(
                                            "text-sm",
                                            isToday(day) ? "text-blue-600 font-semibold" : "text-gray-700"
                                        )}>
                                            {format(day, 'EEE')}
                                        </CardTitle>
                                        <span className={cn(
                                            "text-xs",
                                            isToday(day) ? "text-blue-600 font-semibold" : "text-gray-500"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="h-20 overflow-y-auto">
                                        {dayAppointments.slice(0, 3).map(apt => (
                                            <div
                                                key={apt.id}
                                                className="text-xs p-1 mb-1 rounded bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
                                                onClick={() => setSelectedAppointment(apt)}
                                            >
                                                <div className="truncate">{apt.appointment_time}</div>
                                                <div className="truncate font-medium">{apt.patient_name}</div>
                                            </div>
                                        ))}
                                        {dayAppointments.length > 3 && (
                                            <div className="text-xs text-gray-500 text-center">
                                                +{dayAppointments.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayAppointments = selectedDateAppointments;
        const timeSlots = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Timeline View</CardTitle>
                                <Button
                                    size="sm"
                                    onClick={handleCreateAppointment}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Schedule
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 overflow-y-auto">
                                <div className="space-y-1">
                                    {timeSlots.map(hour => {
                                        const hourAppointments = dayAppointments.filter(apt => {
                                            const aptHour = parseInt(apt.appointment_time.split(':')[0]);
                                            return aptHour === hour;
                                        });

                                        return (
                                            <div key={hour} className="flex items-center border-b border-gray-100 py-2">
                                                <div className="w-16 text-sm text-gray-500 font-mono">
                                                    {hour.toString().padStart(2, '0')}:00
                                                </div>
                                                <div className="flex-1 ml-4">
                                                    {hourAppointments.length === 0 ? (
                                                        <div className="h-8 flex items-center">
                                                            <span className="text-gray-300 text-sm">Available</span>
                                                        </div>
                                                    ) : (
                                                        hourAppointments.map(apt => (
                                                            <div
                                                                key={apt.id}
                                                                className="mb-1 p-2 rounded bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100"
                                                                onClick={() => setSelectedAppointment(apt)}
                                                            >
                                                                <div className="text-sm font-medium">{apt.patient_name}</div>
                                                                <div className="text-xs text-gray-600">{apt.appointment_time} • {apt.type}</div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments ({dayAppointments.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 overflow-y-auto">
                                {dayAppointments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No appointments scheduled</p>
                                    </div>
                                ) : (
                                    dayAppointments.map(renderAppointmentCard)
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* View Mode Tabs */}
            <Card>
                <CardContent className="p-4">
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="month" className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                Month
                            </TabsTrigger>
                            <TabsTrigger value="week" className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                Week
                            </TabsTrigger>
                            <TabsTrigger value="day" className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Day
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Calendar Content */}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <Card className="fixed inset-4 z-50 bg-white shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Appointment Details</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAppointment(null)}
                            >
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Patient</label>
                                    <p className="text-lg font-semibold">{selectedAppointment.patient_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Provider</label>
                                    <p className="text-lg">{selectedAppointment.provider}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                    <p className="text-lg">
                                        {format(new Date(selectedAppointment.appointment_date), 'MMM d, yyyy')} at {selectedAppointment.appointment_time}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                    <p className="text-lg">{selectedAppointment.type}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <Badge className={cn("text-sm", statusColors[selectedAppointment.status as keyof typeof statusColors])}>
                                        {getStatusIcon(selectedAppointment.status)}
                                        <span className="ml-1">{selectedAppointment.status}</span>
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Duration</label>
                                    <p className="text-lg">{selectedAppointment.duration || 30} minutes</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Reason</label>
                                <p className="text-lg">{selectedAppointment.reason}</p>
                            </div>

                            {selectedAppointment.notes && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Notes</label>
                                    <p className="text-lg">{selectedAppointment.notes}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-4">
                                <Button
                                    onClick={() => {
                                        onEdit(selectedAppointment);
                                        setSelectedAppointment(null);
                                    }}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Appointment
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onDelete(selectedAppointment.id);
                                        setSelectedAppointment(null);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Cancel Appointment
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
