import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCard({ title, value, icon: Icon, gradient, subtitle, isLoading }) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-none shadow-lg">
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}