import { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, Clipboard, Globe, Clock, MapPin, AlertCircle, Video, Languages } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';

// Temporarily commented out Recharts due to React hook error
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", patients: 120 },
  { name: "Tue", patients: 150 },
  { name: "Wed", patients: 170 },
  { name: "Thu", patients: 190 },
  { name: "Fri", patients: 220 },
];

// Global doctor features data
const timezones = [
  { zone: "EST", location: "New York", time: "09:30", patients: 45 },
  { zone: "GMT", location: "London", time: "14:30", patients: 32 },
  { zone: "CST", location: "Chicago", time: "08:30", patients: 28 },
  { zone: "IST", location: "Mumbai", time: "20:00", patients: 67 },
  { zone: "JST", location: "Tokyo", time: "23:30", patients: 23 },
];

const regions = [
  { name: "North America", patients: 423, consultations: 156, revenue: "$28,450", flag: "🇺🇸" },
  { name: "Europe", patients: 289, consultations: 98, revenue: "$19,200", flag: "🇪🇺" },
  { name: "Asia Pacific", patients: 512, consultations: 187, revenue: "$31,890", flag: "🇯🇵" },
  { name: "Middle East", patients: 156, consultations: 54, revenue: "$12,340", flag: "🇸🇦" },
  { name: "Africa", patients: 89, consultations: 32, revenue: "$7,120", flag: "🇿🇦" },
];

const upcomingAppointments = [
  { time: "10:00", timezone: "EST", patient: "Sarah Chen", location: "New York", type: "Follow-up", urgent: false },
  { time: "11:30", timezone: "GMT", patient: "Ahmed Hassan", location: "London", type: "Consultation", urgent: true },
  { time: "14:00", timezone: "IST", patient: "Priya Patel", location: "Mumbai", type: "Virtual", urgent: false },
  { time: "20:00", timezone: "JST", patient: "Kenji Tanaka", location: "Tokyo", type: "Check-up", urgent: false },
];

const StatCard = ({ icon, label, value, trend }: any) => (
  <Card className="p-4 flex flex-col items-start justify-center hover:shadow-md transition border border-gray-200 bg-white">
    <div className="flex items-center gap-2 text-gray-600">
      {icon}
      <span className="text-sm font-medium uppercase tracking-wide">{label}</span>
    </div>
    <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    <div className={`text-xs font-medium mt-1 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
      {trend > 0 ? `▲ +${trend}%` : `▼ ${trend}%`}
    </div>
  </Card>
);

export default function CleanDashboard() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
  }, []);

  const getPersonalizedTitle = () => {
    if (!user?.name) return 'Medical Dashboard';

    const role = user.role?.toLowerCase();
    const firstName = user.name.split(' ')[0];

    if (role === 'doctor' || role === 'physician' || role === 'clinical') {
      return `Dr. ${firstName}'s Dashboard`;
    } else if (role === 'nurse' || role === 'nursing') {
      return `${firstName}'s Dashboard`;
    } else if (role === 'admin' || role === 'super_admin') {
      return `${firstName}'s Admin Dashboard`;
    } else if (role === 'pharmacist') {
      return `Dr. ${firstName}'s Pharmacy Dashboard`;
    } else if (role === 'lab_technician' || role === 'technician') {
      return `${firstName}'s Lab Dashboard`;
    } else {
      return 'Medical Dashboard';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{getPersonalizedTitle()}</h1>
        <button
          onClick={() => {
            const newTheme = theme === "light" ? "dark" : "light";
            setTheme(newTheme);
            localStorage.setItem("theme", newTheme);
            document.documentElement.classList.toggle("dark");
          }}
          className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      {/* Stat Cards - Enhanced for Global Doctor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Globe size={18} />} label="Global Patients" value="1,469" trend={12} />
        <StatCard icon={<Clock size={18} />} label="Multi-Timezone Today" value="24" trend={8} />
        <StatCard icon={<DollarSign size={18} />} label="Global Revenue (USD)" value="$99,000" trend={15} />
        <StatCard icon={<Video size={18} />} label="Telemedicine" value="127" trend={23} />
      </div>

      {/* Multi-Timezone Overview */}
      <Card className="p-4 border border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Active Time Zones</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {timezones.map((tz) => (
            <div key={tz.zone} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 uppercase tracking-wide">{tz.zone}</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">{tz.time}</div>
              <div className="text-xs text-gray-600 mt-1">{tz.location}</div>
              <div className="text-xs text-blue-600 mt-2 font-medium">{tz.patients} patients</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Regional Distribution */}
      <Card className="p-4 border border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Patient Distribution by Region</h2>
        </div>
        <div className="space-y-3">
          {regions.map((region) => (
            <div key={region.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{region.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">{region.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{region.patients} patients • {region.consultations} consultations</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{region.revenue}</div>
                <div className="text-xs text-gray-500 mt-0.5">This month</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Global Appointments */}
      <Card className="p-4 border border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Upcoming Appointments (Global)</h2>
        </div>
        <div className="space-y-2">
          {upcomingAppointments.map((apt, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-3 border rounded-lg ${
                apt.urgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${
                  apt.urgent ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <span className="text-xs font-medium text-gray-700">{apt.time}</span>
                  <span className="text-[10px] text-gray-500">{apt.timezone}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{apt.patient}</span>
                    {apt.urgent && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {apt.location} • {apt.type}
                  </div>
                </div>
              </div>
              {apt.type === "Virtual" && (
                <Video className="h-4 w-4 text-blue-500" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Chart - Simplified bar chart */}
      <Card className="p-4 border border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900 mb-3">Weekly Patient Trend</h2>
        <div className="h-[250px] flex items-center justify-center">
          <div className="w-full space-y-3">
            {data.map((day) => (
              <div key={day.name} className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-600 font-medium">{day.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                  <div
                    className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${(day.patients / 250) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{day.patients}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Global Insights & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Languages className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Languages & Support</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">English</span>
              <span className="text-xs text-gray-500">1,250 patients</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Spanish</span>
              <span className="text-xs text-gray-500">145 patients</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Mandarin</span>
              <span className="text-xs text-gray-500">38 patients</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Arabic</span>
              <span className="text-xs text-gray-500">36 patients</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 bg-white">
          <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            🧠 AI Global Insights
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 24 appointments across 5 time zones today — 3 urgent cases flagged in London timezone.</p>
            <p>• Asia Pacific region showing highest growth (+23% consultations this month).</p>
            <p>• Telemedicine sessions up 31% week-over-week, primarily in EST and IST zones.</p>
            <p>• Revenue across all regions up 15% month-over-month.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
