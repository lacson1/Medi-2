import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingStats({ billings, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  const totalRevenue = billings.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
  const totalCollected = billings.reduce((sum, bill) => sum + (bill.amount_paid || 0), 0);
  const totalOutstanding = billings.reduce((sum, bill) => sum + (bill.balance || 0), 0);
  const overdueCount = billings.filter(b => b.status === 'overdue').length;

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-600",
      subtitle: `${billings.length} invoices`
    },
    {
      title: "Collected",
      value: `$${totalCollected.toFixed(2)}`,
      icon: CheckCircle,
      gradient: "from-blue-500 to-cyan-600",
      subtitle: `${Math.round((totalCollected/totalRevenue)*100)}% collected`
    },
    {
      title: "Outstanding",
      value: `$${totalOutstanding.toFixed(2)}`,
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-600",
      subtitle: "Pending payment"
    },
    {
      title: "Overdue",
      value: overdueCount,
      icon: AlertCircle,
      gradient: "from-red-500 to-pink-600",
      subtitle: "Requires attention"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <Card key={idx} className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}