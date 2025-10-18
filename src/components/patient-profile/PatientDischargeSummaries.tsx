import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Edit, Calendar, Home, TrendingUp } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from "prop-types";

const dispositionColors = {
  home: "bg-green-100 text-green-800",
  home_with_services: "bg-blue-100 text-blue-800",
  rehab: "bg-purple-100 text-purple-800",
  nursing_facility: "bg-amber-100 text-amber-800",
  other_hospital: "bg-cyan-100 text-cyan-800",
  expired: "bg-gray-100 text-gray-800",
};

const conditionColors = {
  improved: "bg-green-100 text-green-800",
  stable: "bg-blue-100 text-blue-800",
  worsened: "bg-red-100 text-red-800",
  deceased: "bg-gray-100 text-gray-800",
};

export default function PatientDischargeSummaries({ summaries, isLoading, onEdit }: any) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!summaries || summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No discharge summaries recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary: any) => {
        const lengthOfStay = differenceInDays(
          parseISO(summary.discharge_date),
          parseISO(summary.admission_date)
        );

        return (
          <Card key={summary.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-lg">Discharge Summary</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={dispositionColors[summary.discharge_disposition]}>
                      <Home className="w-3 h-3 mr-1" />
                      {summary.discharge_disposition.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className={conditionColors[summary.condition_at_discharge]}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {summary.condition_at_discharge}
                    </Badge>
                    <Badge variant="outline">
                      {lengthOfStay} {lengthOfStay === 1 ? 'day' : 'days'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Admitted: {format(parseISO(summary.admission_date), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Discharged: {format(parseISO(summary.discharge_date), "MMM d, yyyy")}
                      </div>
                    </div>
                    {summary.attending_physician && (
                      <p className="text-gray-600">Attending: Dr. {summary.attending_physician}</p>
                    )}
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="font-semibold text-gray-700">Admitting Diagnosis:</p>
                        <p className="text-gray-600">{summary.admitting_diagnosis}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Discharge Diagnosis:</p>
                        <p className="text-gray-600">{summary.discharge_diagnosis}</p>
                      </div>
                    </div>
                    {summary.hospital_course && (
                      <div className="pt-2">
                        <p className="font-semibold text-gray-700">Hospital Course:</p>
                        <p className="text-gray-600">{summary.hospital_course}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onEdit(summary)}>
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

PatientDischargeSummaries.propTypes = {
  summaries: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired
};