
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, DollarSign, Edit, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";
import { format, parseISO, isPast } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import BillingForm from "../components/billing/BillingForm";
import BillingStats from "../components/dashboard/BillingStats";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partially_paid: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalContent, setModalContent] = useState(null);
  const queryClient = useQueryClient();

  const { data: billings, isLoading } = useQuery({
    queryKey: ['billings'],
    queryFn: () => base44.entities.Billing.list("-invoice_date"),
    initialData: [],
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
    initialData: [],
  });

  const billingMutation = useMutation({
    mutationFn: (data) => data.id ? base44.entities.Billing.update(data.id, data) : base44.entities.Billing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings'] });
      setModalContent(null);
    },
  });

  const openModal = (billing = null) => {
    setModalContent({
      title: billing ? "Edit Invoice" : "New Invoice",
      form: (
        <BillingForm
          billing={billing}
          onSubmit={(data) => {
            // If patient is not set (editing or new without patient), ensure we have patient info
            if (!billing && !data.patient_id) {
              alert("Please select a patient");
              return;
            }
            
            // If creating new, get patient name
            if (!billing) {
              const patient = patients.find(p => p.id === data.patient_id);
              if (patient) {
                data.patient_name = `${patient.first_name} ${patient.last_name}`;
              }
            }
            
            billingMutation.mutate(data);
          }}
          onCancel={() => setModalContent(null)}
          isSubmitting={billingMutation.isPending}
        />
      )
    });
  };

  const filteredBillings = billings.filter(bill => {
    const matchesSearch = bill.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
            <p className="text-gray-600 mt-1">Manage patient billing and payments</p>
          </div>
          <Button onClick={() => openModal()} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            <Plus className="w-5 h-5 mr-2" />
            New Invoice
          </Button>
        </div>

        <BillingStats billings={billings} isLoading={isLoading} />

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by patient or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {filteredBillings.map((bill) => {
            const isOverdue = bill.status === 'pending' && isPast(parseISO(bill.due_date));
            
            return (
              <Card key={bill.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{bill.invoice_number}</h3>
                          <Badge className={statusColors[bill.status]}>{bill.status.replace('_', ' ')}</Badge>
                          {isOverdue && <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>}
                        </div>
                        <p className="text-gray-600 mb-2">{bill.patient_name}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div><span className="text-gray-500">Service:</span> <strong>{bill.service_type.replace('_', ' ')}</strong></div>
                          <div><span className="text-gray-500">Date:</span> <strong>{format(parseISO(bill.invoice_date), "MMM d, yyyy")}</strong></div>
                          <div><span className="text-gray-500">Due:</span> <strong className={isOverdue ? 'text-red-600' : ''}>{format(parseISO(bill.due_date), "MMM d, yyyy")}</strong></div>
                          <div><span className="text-gray-500">Payment:</span> <strong>{bill.payment_method || 'N/A'}</strong></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-2xl font-bold text-gray-900">${bill.total_amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">Paid: ${bill.amount_paid.toFixed(2)}</p>
                      <p className="text-sm font-semibold text-red-600">Balance: ${bill.balance.toFixed(2)}</p>
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => openModal(bill)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBillings.length === 0 && !isLoading && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No invoices found</p>
              <p className="text-gray-400 text-sm">Create your first invoice to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{modalContent?.title}</DialogTitle></DialogHeader>
          {modalContent?.form}
        </DialogContent>
      </Dialog>
    </div>
  );
}
