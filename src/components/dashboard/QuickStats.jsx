import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function QuickStats({ title, value, subtitle, icon: Icon, gradient, trend, trendValue }) {
  return (
    <Card className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full transform translate-x-12 -translate-y-12`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{title}</p>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">{value}</h3>
            {subtitle && (
              <p className="text-xs text-gray-600">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                {trend === 'neutral' && <Minus className="w-3 h-3 text-gray-400" />}
                <span className={`text-xs font-medium ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}