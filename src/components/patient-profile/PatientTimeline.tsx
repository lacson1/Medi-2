import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileHeart, Pill, Beaker, Video, Syringe, Activity, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from "prop-types";

const eventIcons = {
  appointment: Calendar,
  encounter: FileHeart,
  prescription: Pill,
  lab: Beaker,
  telemedicine: Video,
  vaccination: Syringe,
  procedure: Activity,
  billing: DollarSign,
};

const eventColors = {
  appointment: "from-purple-400 to-pink-500",
  encounter: "from-green-400 to-emerald-500",
  prescription: "from-purple-400 to-indigo-500",
  lab: "from-amber-400 to-orange-500",
  telemedicine: "from-indigo-400 to-blue-500",
  vaccination: "from-cyan-400 to-teal-500",
  procedure: "from-red-400 to-rose-500",
  billing: "from-green-400 to-emerald-500",
};

export default function PatientTimeline({ events, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No timeline events</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent" />
      
      <div className="space-y-4">
        {events.map((event, idx) => {
          const Icon = eventIcons[event.type] || Calendar;
          const gradient = eventColors[event.type] || "from-gray-400 to-gray-500";
          
          return (
            <div key={idx} className="relative pl-14">
              {/* Timeline dot */}
              <div className={`absolute left-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <Card className="border-l-4 border-blue-200 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900">{event.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(parseISO(event.date), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-xs text-gray-600 mt-2">{event.description}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

PatientTimeline.propTypes = {
  events: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired
};