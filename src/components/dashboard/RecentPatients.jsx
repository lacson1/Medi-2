import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { differenceInYears, parseISO } from "date-fns";

export default function RecentPatients({ patients, isLoading }) {
  const recentPatients = patients.slice(0, 6);

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Patients</CardTitle>
          <Link to={createPageUrl("Patients")}>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
              View All
            </Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {recentPatients.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No patients yet</p>
        ) : (
          recentPatients.map((patient) => {
            const age = patient.date_of_birth 
              ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
              : null;

            return (
              <div
                key={patient.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                  {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {age ? `${age} years` : "Age unknown"} • {patient.gender || "N/A"}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={patient.status === 'active' ? 'border-green-500 text-green-700' : 'border-gray-300'}
                >
                  {patient.status}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}