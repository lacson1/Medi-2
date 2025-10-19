import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Edit, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from "prop-types";

const statusConfig = {
  draft: { color: "bg-gray-100 text-gray-800", icon: Clock },
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  paid: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  partially_paid: { color: "bg-blue-100 text-blue-800", icon: Clock },
  overdue: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  cancelled: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
};

export default function PatientBilling({ billings, isLoading, onEdit }: any) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!billings || billings.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No billing records</p>
      </div>
    );
  }

  const totalBalance = billings.reduce((sum: any, bill: any) => sum + (bill.balance || 0), 0);

  return (
    <div className="space-y-4">
      {totalBalance > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">Outstanding Balance</span>
              </div>
              <span className="text-2xl font-bold text-red-600">${totalBalance.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {billings.map((bill: any) => {
        const config = statusConfig[bill.status] || statusConfig.pending;
        const StatusIcon = config.icon;
        const isOverdue = bill.status === 'pending' && isPast(parseISO(bill.due_date));

        return (
          <Card key={bill.id} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-lg">{bill.invoice_number}</h4>
                    <Badge className={config.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {bill.status?.replace('_', ' ') || bill.status || 'Unknown'}
                    </Badge>
                    {isOverdue && <Badge className="bg-red-100 text-red-800">Overdue</Badge>}
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Service: </span>
                        <strong>{bill.service_type?.replace('_', ' ') || bill.service_type || 'Unknown'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-600">Invoice Date: </span>
                        <strong>{format(parseISO(bill.invoice_date), "MMM d, yyyy")}</strong>
                      </div>
                      <div>
                        <span className="text-gray-600">Due Date: </span>
                        <strong className={isOverdue ? 'text-red-600' : ''}>{format(parseISO(bill.due_date), "MMM d, yyyy")}</strong>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Method: </span>
                        <strong>{bill.payment_method || 'Not specified'}</strong>
                      </div>
                    </div>

                    {bill.description && (
                      <p className="text-sm text-gray-600 mt-2">{bill.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-3 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-xs text-gray-600">Total Amount</span>
                        <p className="text-lg font-bold">${bill.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Amount Paid</span>
                        <p className="text-lg font-bold text-green-600">${bill.amount_paid.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Balance</span>
                        <p className="text-lg font-bold text-red-600">${bill.balance.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => onEdit(bill)}>
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

PatientBilling.propTypes = {
  billings: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired
};