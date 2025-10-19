import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Edit, Calendar, Clock, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from "prop-types";

const statusConfig = {
  scheduled: { color: "bg-blue-100 text-blue-800" },
  in_progress: { color: "bg-purple-100 text-purple-800" },
  completed: { color: "bg-gray-100 text-gray-800" },
  cancelled: { color: "bg-red-100 text-red-800" },
};

export default function PatientTelemedicine({ sessions, isLoading, onEdit, onJoin }: any) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }
  if (!sessions || sessions.length === 0) {
    return <div className="text-center py-12"><Video className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No telemedicine sessions scheduled</p></div>;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session: any) => {
        const config = statusConfig[session.status] || {};
        const date = parseISO(session.session_date);
        return (
          <div key={session.id} className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-lg">{session.session_topic}</h4>
                  <Badge className={config.color}>{session.status?.replace('_', ' ') || session.status || 'Unknown'}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(date, "MMM d, yyyy")}</div>
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{format(date, "h:mm a")}</div>
                </div>
                {session.notes && <p className="text-sm italic text-gray-600 mt-2">{session.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                {session.status === 'scheduled' && session.meeting_link && (
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Call
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(session)}><Edit className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}

PatientTelemedicine.propTypes = {
  sessions: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onJoin: PropTypes.func.isRequired
};