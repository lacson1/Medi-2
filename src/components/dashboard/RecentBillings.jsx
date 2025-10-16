import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  partially_paid: "bg-blue-100 text-blue-800",
};

export default function RecentBillings({ billings, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  const recentBillings = billings.slice(0, 5);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Invoices</CardTitle>
          <Link to={createPageUrl("Billing")}>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">View All</Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {recentBillings.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No billing records</p>
        ) : (
          recentBillings.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{bill.patient_name}</p>
                  <p className="text-xs text-gray-500">{bill.invoice_number} • {bill.service_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${bill.total_amount.toFixed(2)}</p>
                <Badge className={`${statusColors[bill.status]} text-xs`}>{bill.status.replace('_', ' ')}</Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}