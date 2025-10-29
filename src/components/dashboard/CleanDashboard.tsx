import { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, Clipboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from '@/hooks/useAuth';

const data = [
  { name: "Mon", patients: 120 },
  { name: "Tue", patients: 150 },
  { name: "Wed", patients: 170 },
  { name: "Thu", patients: 190 },
  { name: "Fri", patients: 220 },
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
    <div className="space-y-6 p-6 bg-white min-h-screen">
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} />} label="Active Patients" value="1,210" trend={4} />
        <StatCard icon={<Calendar size={18} />} label="Appointments Today" value="24" trend={2} />
        <StatCard icon={<DollarSign size={18} />} label="Monthly Revenue" value="$45,095" trend={8} />
        <StatCard icon={<Clipboard size={18} />} label="Active Prescriptions" value="154" trend={3} />
      </div>

      {/* Chart */}
      <Card className="p-4 border border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900 mb-3">Weekly Patient Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="patients" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={{ fill: '#2563eb', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* AI Summary Placeholder */}
      <Card className="p-4 border border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900 mb-2">AI Summary</h2>
        <p className="text-gray-600 text-sm">
          🧠 "24 appointments scheduled today — 3 are chronic follow-ups. Revenue up 8% week-over-week."
        </p>
      </Card>
    </div>
  );
}
