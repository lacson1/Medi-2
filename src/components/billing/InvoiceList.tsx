import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Edit,
  Trash2,
  CreditCard,
  Search,
  AlertCircle,
  Plus
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
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

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partially_paid: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

interface InvoiceListProps {
  invoices: any[];
  isLoading: boolean;
  onEditInvoice: (invoice: any) => void;
  onDeleteInvoice: (invoice: any) => void;
  onMakePayment: (invoice: any) => void;
  onCreateInvoice: () => void;
}

export default function InvoiceList({
  invoices,
  isLoading,
  onEditInvoice,
  onDeleteInvoice,
  onMakePayment,
  onCreateInvoice
}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = invoice.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
          <p className="text-gray-600 text-sm">Manage patient invoices and billing</p>
        </div>
        <Button onClick={onCreateInvoice} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Search and Filter */}
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
            <TabsTrigger value="partially_paid">Partial</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice: any) => {
          const isOverdue = invoice.status === 'pending' && isPast(parseISO(invoice.due_date));

          return (
            <Card key={invoice.id} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{invoice.invoice_number}</h3>
                        <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                          {invoice.status.replace('_', ' ')}
                        </Badge>
                        {isOverdue && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{invoice.patient_name}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Service:</span>
                          <strong className="ml-1">{invoice.service_type.replace('_', ' ')}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <strong className="ml-1">{format(parseISO(invoice.invoice_date), "MMM d, yyyy")}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500">Due:</span>
                          <strong className={`ml-1 ${isOverdue ? 'text-red-600' : ''}`}>
                            {format(parseISO(invoice.due_date), "MMM d, yyyy")}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500">Method:</span>
                          <strong className="ml-1">{invoice.payment_method || 'N/A'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">${invoice.total_amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Paid: ${invoice.amount_paid.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-red-600">Balance: ${invoice.balance.toFixed(2)}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      {invoice.balance > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMakePayment(invoice)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pay
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditInvoice(invoice)}
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
                            <AlertDialogTitle>{"Delete Invoice"}</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete invoice {invoice.invoice_number}?
                              This action cannot be undone and will also remove all associated payments.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteInvoice(invoice.id)}
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
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && !isLoading && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No invoices found</p>
            <p className="text-gray-400 text-sm mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first invoice to get started"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={onCreateInvoice} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
