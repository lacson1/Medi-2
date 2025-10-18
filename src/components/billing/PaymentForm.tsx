import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentFormProps {
  invoice: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function PaymentForm({ invoice, onSubmit, onCancel, isSubmitting }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    invoice_id: invoice?.id || "",
    invoice_number: invoice?.invoice_number || "",
    patient_name: invoice?.patient_name || "",
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    if (!formData.amount || formData.amount.trim() === '') {
      newErrors.amount = "Payment amount is required";
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "Payment amount must be a valid number greater than 0";
      } else if (amount > invoice.balance) {
        newErrors.amount = `Payment amount cannot exceed balance of $${invoice.balance.toFixed(2)}`;
      } else if (amount < 0.01) {
        newErrors.amount = "Payment amount must be at least $0.01";
      }
    }

    // Payment method validation
    if (!formData.payment_method) {
      newErrors.payment_method = "Please select a payment method";
    }

    // Payment date validation
    if (!formData.payment_date) {
      newErrors.payment_date = "Please select a payment date";
    } else {
      const paymentDate = new Date(formData.payment_date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      if (paymentDate > today) {
        newErrors.payment_date = "Payment date cannot be in the future";
      } else if (paymentDate < oneYearAgo) {
        newErrors.payment_date = "Payment date cannot be more than one year ago";
      }
    }

    // Notes validation (optional but with length limit)
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Notes must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    onSubmit(paymentData);
  };

  const handleAmountChange = (value: any) => {
    setFormData({ ...formData, amount: value });
    if (errors.amount) {
      setErrors({ ...errors, amount: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      {/* Invoice Details */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Invoice Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Invoice #:</span>
              <span className="font-medium ml-2">{invoice.invoice_number}</span>
            </div>
            <div>
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium ml-2">{invoice.patient_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium ml-2 text-green-600">${invoice.total_amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium ml-2 text-blue-600">${invoice.amount_paid.toFixed(2)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Balance Due:</span>
              <span className="font-bold ml-2 text-red-600 text-lg">${invoice.balance.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{"Payment Amount *"}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={invoice.balance}
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{"Payment Method *"}</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
          >
            <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="debit_card">Debit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.payment_method && (
            <p className="text-sm text-red-600">{errors.payment_method}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{"Payment Date *"}</Label>
          <Input
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            className={errors.payment_date ? 'border-red-500' : ''}
          />
          {errors.payment_date && (
            <p className="text-sm text-red-600">{errors.payment_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{"Notes"}</Label>
          <Textarea
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Optional payment notes..."
            rows={3}
          />
        </div>
      </div>

      {/* Payment Summary */}
      {formData.amount && parseFloat(formData.amount) > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-900 mb-2">Payment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <span>${invoice.balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Amount:</span>
                <span>${parseFloat(formData.amount || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-semibold">
                <span>Remaining Balance:</span>
                <span className={invoice.balance - parseFloat(formData.amount || 0) <= 0 ? 'text-green-600' : 'text-orange-600'}>
                  ${(invoice.balance - parseFloat(formData.amount || 0)).toFixed(2)}
                </span>
              </div>
              {invoice.balance - parseFloat(formData.amount || 0) <= 0 && (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This payment will fully settle the invoice.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
