
import { useState } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, Database, FileText, CreditCard, BarChart3 } from "lucide-react";

import BillingForm from "../components/billing/BillingForm";
import PaymentForm from "../components/billing/PaymentForm";
import InvoiceList from "../components/billing/InvoiceList";
import PaymentList from "../components/billing/PaymentList";
import BillingStats from "../components/dashboard/BillingStats";

export default function BillingPage() {
  const [modalContent, setModalContent] = useState(null);
  const queryClient = useQueryClient();

  // Fetch invoices and payments
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['billings'],
    queryFn: () => mockApiClient.entities.Billing.list("-invoice_date"),
    initialData: [],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => mockApiClient.entities.Payment.list("-payment_date"),
    initialData: [],
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
    initialData: [],
  });

  // Mutations
  const invoiceMutation = useMutation({
    mutationFn: (data: any) => data.id ? mockApiClient.entities.Billing.update(data.id, data) : mockApiClient.entities.Billing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings'] });
      setModalContent(null);
      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Payment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings', 'payments'] });
      setModalContent(null);
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: any) => mockApiClient.entities.Billing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings', 'payments'] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: any) => mockApiClient.entities.Payment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings', 'payments'] });
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }) => mockApiClient.entities.Payment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings', 'payments'] });
      setModalContent(null);
      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive",
      });
    },
  });

  // Export functions
  const exportToJSON = (data: any, filename: any) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `${filename} exported to JSON successfully`,
    });
  };

  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers,
      ...data.map(item => headers.map(header => {
        const value = item[header.toLowerCase().replace(/\s+/g, '_')] || '';
        return `"${value}"`;
      }))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `${filename} exported to CSV successfully`,
    });
  };

  const handleExportInvoices = (format = 'json') => {
    if (format === 'json') {
      exportToJSON(invoices, 'invoices');
    } else if (format === 'csv') {
      const headers = ['Invoice Number', 'Patient Name', 'Invoice Date', 'Total Amount', 'Amount Paid', 'Balance', 'Status'];
      exportToCSV(invoices, 'invoices', headers);
    }
  };

  const handleExportPayments = (format = 'json') => {
    if (format === 'json') {
      exportToJSON(payments, 'payments');
    } else if (format === 'csv') {
      const headers = ['Payment ID', 'Invoice Number', 'Patient Name', 'Payment Date', 'Amount', 'Payment Method', 'Status'];
      exportToCSV(payments, 'payments', headers);
    }
  };

  const handleExportAllData = () => {
    const allData = {
      exportDate: new Date().toISOString(),
      invoices: invoices || [],
      payments: payments || [],
      summary: {
        totalInvoices: invoices?.length || 0,
        totalPayments: payments?.length || 0,
        totalRevenue: invoices?.reduce((sum: any, inv: any) => sum + (parseFloat(inv.total_amount) || 0), 0) || 0,
        totalCollected: payments?.reduce((sum: any, pay: any) => sum + (parseFloat(pay.amount) || 0), 0) || 0
      }
    };
    exportToJSON(allData, 'billing-complete-data');
  };

  // Modal handlers
  const openInvoiceModal = (invoice = null) => {
    setModalContent({
      title: invoice ? "Edit Invoice" : "Create Invoice",
      form: (
        <BillingForm
          billing={invoice}
          onSubmit={(data) => {
            if (!invoice && !data.patient_id) {
              toast({
                title: "Error",
                description: "Please select a patient",
                variant: "destructive",
              });
              return;
            }

            if (!invoice) {
              const patient = patients.find(p => p.id === data.patient_id);
              if (patient) {
                data.patient_name = `${patient.first_name} ${patient.last_name}`;
              }
            }

            invoiceMutation.mutate(data);
          }}
          onCancel={() => setModalContent(null)}
          isSubmitting={invoiceMutation.isPending}
        />
      )
    });
  };

  const openPaymentModal = (invoice: any) => {
    setModalContent({
      title: "Make Payment",
      form: (
        <PaymentForm
          invoice={invoice}
          onSubmit={(data) => {
            paymentMutation.mutate(data);
          }}
          onCancel={() => setModalContent(null)}
          isSubmitting={paymentMutation.isPending}
        />
      )
    });
  };

  const openEditPaymentModal = (payment: any) => {
    setModalContent({
      title: "Edit Payment",
      form: (
        <PaymentForm
          invoice={{
            id: payment.invoice_id,
            invoice_number: payment.invoice_number,
            patient_name: payment.patient_name,
            total_amount: 0, // Not needed for edit
            amount_paid: 0, // Not needed for edit
            balance: 0 // Not needed for edit
          }}
          onSubmit={(data) => {
            updatePaymentMutation.mutate({ id: payment.id, data });
          }}
          onCancel={() => setModalContent(null)}
          isSubmitting={updatePaymentMutation.isPending}
        />
      )
    });
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Invoicing</h1>
            <p className="text-gray-600 mt-1">Manage patient billing, payments, and financial analytics</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExportInvoices('json')}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Export Invoices (JSON)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportInvoices('csv')}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Invoices (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportPayments('json')}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Export Payments (JSON)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportAllData()}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </Button>
          </div>
        </div>

        <BillingStats billings={invoices} isLoading={invoicesLoading} />

        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invoices" colorScheme="FINANCIAL" icon={"FileText"}>
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" colorScheme="FINANCIAL" icon={"CreditCard"}>
              Payments
            </TabsTrigger>
            <TabsTrigger value="analytics" colorScheme="ANALYTICS" icon={BarChart3}>
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-6">
            <InvoiceList
              invoices={invoices}
              isLoading={invoicesLoading}
              onEditInvoice={openInvoiceModal}
              onDeleteInvoice={(id) => deleteInvoiceMutation.mutate(id)}
              onMakePayment={openPaymentModal}
              onCreateInvoice={() => openInvoiceModal()}
            />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentList
              payments={payments}
              isLoading={paymentsLoading}
              onEditPayment={openEditPaymentModal}
              onDeletePayment={(id) => deletePaymentMutation.mutate(id)}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Analytics</h3>
              <p className="text-gray-600 mb-4">Advanced analytics and AI insights coming soon!</p>
              <p className="text-sm text-gray-500">
                Navigate to the dedicated Financial Analytics page for comprehensive reporting.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          {modalContent?.form}
        </DialogContent>
      </Dialog>
    </div>
  );
}
