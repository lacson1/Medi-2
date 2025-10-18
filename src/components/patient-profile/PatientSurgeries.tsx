import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Edit, Calendar, Clock, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from "prop-types";

const statusConfig = {
  scheduled: { color: "bg-blue-100 text-blue-800", icon: Clock },
  in_progress: { color: "bg-purple-100 text-purple-800", icon: Scissors },
  completed: { color: "bg-green-100 text-green-800", icon: Scissors },
  cancelled: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  postponed: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
};

const typeColors = {
  elective: "bg-blue-100 text-blue-800",
  emergency: "bg-red-100 text-red-800",
  urgent: "bg-orange-100 text-orange-800",
};

export default function PatientSurgeries({ surgeries, isLoading, onEdit }: any) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!surgeries || surgeries.length === 0) {
    return (
      <div className="text-center py-12">
        <Scissors className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No surgeries recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {surgeries.map((surgery: any) => {
        const config = statusConfig[surgery.status] || statusConfig.scheduled;
        const StatusIcon = config.icon;

        return (
          <Card key={surgery.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Scissors className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-lg">{surgery.surgery_name}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={typeColors[surgery.surgery_type]}>
                      {surgery.surgery_type}
                    </Badge>
                    <Badge className={config.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {surgery.status}
                    </Badge>
                    {surgery.anesthesia_type && (
                      <Badge variant="outline">{surgery.anesthesia_type} anesthesia</Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(surgery.surgery_date), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    {surgery.surgeon_name && (
                      <p className="text-gray-600">Surgeon: Dr. {surgery.surgeon_name}</p>
                    )}
                    {surgery.pre_op_diagnosis && (
                      <p className="text-gray-700"><strong>Pre-op:</strong> {surgery.pre_op_diagnosis}</p>
                    )}
                    {surgery.post_op_diagnosis && (
                      <p className="text-gray-700"><strong>Post-op:</strong> {surgery.post_op_diagnosis}</p>
                    )}
                    {surgery.complications && (
                      <p className="text-red-700 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5" />
                        <span><strong>Complications:</strong> {surgery.complications}</span>
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onEdit(surgery)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

PatientSurgeries.propTypes = {
  surgeries: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired
};