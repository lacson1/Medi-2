import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRightSquare, Edit, Calendar, User, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from "prop-types";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  accepted: { color: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { color: "bg-green-100 text-green-800 border-green-200" },
  declined: { color: "bg-red-100 text-red-800 border-red-200" },
};

export default function PatientReferrals({ referrals, isLoading, onEdit }: any) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!referrals || referrals.length === 0) {
    return (
      <div className="text-center py-12">
        <ArrowUpRightSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No referrals recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((referral: any) => {
        const config = statusConfig[referral.status] || statusConfig.pending;
        
        return (
          <Card key={referral.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRightSquare className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-lg">{referral.referred_to}</h4>
                    <Badge className={config.color}>{referral.status}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {referral.specialty && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Specialty: <strong>{referral.specialty}</strong></span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Referred: {format(parseISO(referral.date_referred), "MMM d, yyyy")}
                    </div>
                    
                    {referral.reason && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-gray-600">Reason: </span>
                          <p className="text-gray-900">{referral.reason}</p>
                        </div>
                      </div>
                    )}
                    
                    {referral.notes && (
                      <p className="text-sm italic text-gray-600 mt-2">{referral.notes}</p>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="icon" onClick={() => onEdit(referral)}>
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

PatientReferrals.propTypes = {
  referrals: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired
};