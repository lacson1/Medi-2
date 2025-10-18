import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Edit,
  Trash2,
  Search,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const paymentMethodColors = {
  cash: "bg-green-100 text-green-800",
  credit_card: "bg-blue-100 text-blue-800",
  debit_card: "bg-purple-100 text-purple-800",
  bank_transfer: "bg-orange-100 text-orange-800",
  check: "bg-gray-100 text-gray-800",
  insurance: "bg-cyan-100 text-cyan-800",
  other: "bg-gray-100 text-gray-800",
};

interface PaymentListProps {
  payments: any[];
  isLoading: boolean;
  onEditPayment: (payment: any) => void;
  onDeletePayment: (payment: any) => void;
}

export default function PaymentList({
  payments,
  isLoading,
  onEditPayment,
  onDeletePayment
}: PaymentListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = payments.filter((payment: any) => {
    return payment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPayments = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-2">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
        <p className="text-gray-600 text-sm">All payments made to date</p>
      </div>

      {/* Total Payments Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Revenue Generated</h3>
                <p className="text-gray-600 text-sm">All payments received</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">${totalPayments.toFixed(2)}</p>
              <p className="text-sm text-gray-500">USD</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search by patient or invoice number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {filteredPayments.map((payment: any) => (
          <Card key={payment.id} className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{payment.invoice_number}</h3>
                      <Badge className={paymentMethodColors[payment.payment_method]}>
                        {payment.payment_method.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{payment.patient_name}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Payment Date:</span>
                        <strong className="ml-1">{format(parseISO(payment.payment_date), "MMM d, yyyy")}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Method:</span>
                        <strong className="ml-1">{payment.payment_method.replace('_', ' ')}</strong>
                      </div>
                      {payment.notes && (
                        <div className="col-span-2 md:col-span-1">
                          <span className="text-gray-500">Notes:</span>
                          <strong className="ml-1">{payment.notes}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-green-600">${payment.amount.toFixed(2)}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPayment(payment)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{"Delete Payment"}</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this payment of ${payment.amount.toFixed(2)}
                            for invoice {payment.invoice_number}? This will restore the invoice balance
                            and may change the invoice status.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeletePayment(payment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && !isLoading && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No payments found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "No payments have been recorded yet"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
