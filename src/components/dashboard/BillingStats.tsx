import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import OptimizedStatsCard from "./OptimizedStatsCard";

interface BillingStatsProps {
  billings: any[];
  isLoading: boolean;
}

export default function BillingStats({ billings, isLoading }: BillingStatsProps) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  const totalRevenue = billings.reduce((sum: number, bill: any) => sum + (bill.total_amount || 0), 0);
  const totalCollected = billings.reduce((sum: number, bill: any) => sum + (bill.amount_paid || 0), 0);
  const totalOutstanding = billings.reduce((sum: number, bill: any) => sum + (bill.balance || 0), 0);
  const overdueCount = billings.filter((b: any) => b.status === 'overdue').length;

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-600",
      subtitle: `${billings.length} invoices`,
      valueType: 'currency' as const,
      status: 'normal' as const
    },
    {
      title: "Collected",
      value: `$${totalCollected.toFixed(2)}`,
      icon: CheckCircle,
      gradient: "from-blue-500 to-cyan-600",
      subtitle: `${Math.round((totalCollected / totalRevenue) * 100)}% collected`,
      valueType: 'currency' as const,
      status: 'normal' as const
    },
    {
      title: "Outstanding",
      value: `$${totalOutstanding.toFixed(2)}`,
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-600",
      subtitle: "Pending payment",
      valueType: 'currency' as const,
      status: totalOutstanding > 10000 ? 'warning' as const : 'normal' as const
    },
    {
      title: "Overdue",
      value: overdueCount,
      icon: AlertCircle,
      gradient: "from-red-500 to-pink-600",
      subtitle: "Requires attention",
      valueType: 'count' as const,
      status: overdueCount > 5 ? 'critical' as const : overdueCount > 0 ? 'warning' as const : 'normal' as const,
      thresholds: { low: 0, medium: 3, high: 5 }
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <OptimizedStatsCard
          key={idx}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          gradient={stat.gradient}
          subtitle={stat.subtitle}
          valueType={stat.valueType}
          status={stat.status}
          thresholds={stat.thresholds}
          priority="high"
        />
      ))}
    </div>
  );
}