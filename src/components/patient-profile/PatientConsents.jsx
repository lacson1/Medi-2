import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileSignature, Edit, Calendar, Clock, Download, AlertCircle } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  obtained: { color: "bg-green-100 text-green-800", icon: FileSignature },
  expired: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  revoked: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
};

const typeColors = {
  treatment: "bg-blue-100 text-blue-800",
  surgery: "bg-purple-100 text-purple-800",
  anesthesia: "bg-pink-100 text-pink-800",
  procedure: "bg-cyan-100 text-cyan-800",
  research: "bg-amber-100 text-amber-800",
  privacy: "bg-gray-100 text-gray-800",
  other: "bg-slate-100 text-slate-800",
};

export default function PatientConsents({ consents, isLoading, onEdit }) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!consents || consents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileSignature className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No consent forms recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {consents.map((consent) => {
        const config = statusConfig[consent.status] || statusConfig.obtained;
        const StatusIcon = config.icon;
        const isExpired = consent.expiry_date && isPast(parseISO(consent.expiry_date));

        return (
          <Card key={consent.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSignature className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-lg">{consent.consent_title}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={typeColors[consent.consent_type]}>
                      {consent.consent_type}
                    </Badge>
                    <Badge className={config.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {consent.status}
                    </Badge>
                    {isExpired && (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Obtained: {format(parseISO(consent.consent_date), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    {consent.expiry_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        Expires: {format(parseISO(consent.expiry_date), "MMM d, yyyy")}
                      </div>
                    )}
                    {consent.obtained_by && (
                      <p className="text-gray-600">Obtained by: {consent.obtained_by}</p>
                    )}
                    {consent.witness_name && (
                      <p className="text-gray-600">Witness: {consent.witness_name}</p>
                    )}
                    {consent.consent_details && (
                      <p className="text-gray-700 mt-2">{consent.consent_details}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {consent.consent_form_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={consent.consent_form_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => onEdit(consent)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}