import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Beaker, Edit, Calendar, CheckCircle, FileClock, Download } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  ordered: { icon: FileClock, color: "bg-gray-100 text-gray-800", label: "Ordered" },
  pending: { icon: FileClock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  completed: { icon: CheckCircle, color: "bg-blue-100 text-blue-800", label: "Completed" },
  reviewed: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Reviewed" },
};

export default function PatientLabOrders({ labOrders, isLoading, onEdit }) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }
  if (!labOrders || labOrders.length === 0) {
    return <div className="text-center py-12"><Beaker className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No lab orders found</p></div>;
  }

  return (
    <div className="space-y-4">
      {labOrders.map((order) => {
        const config = statusConfig[order.status] || statusConfig.ordered;
        return (
          <div key={order.id} className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-lg">{order.test_name}</h4>
                  <Badge className={config.color}>{config.label}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />Ordered: {format(parseISO(order.date_ordered), "MMM d, yyyy")}</div>
                    {order.ordering_doctor && <p>By: Dr. {order.ordering_doctor}</p>}
                </div>
                {order.results_summary && <p className="text-sm italic text-gray-600 mt-2">{order.results_summary}</p>}
              </div>
              <div className="flex gap-2">
                {order.result_file_url && (
                    <Button variant="outline" size="icon" asChild>
                        <a href={order.result_file_url} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4"/></a>
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(order)}><Edit className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}