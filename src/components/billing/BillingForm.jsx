import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function BillingForm({ billing, patient, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(billing || {
    patient_id: patient?.id || "",
    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_date: new Date().toISOString().split('T')[0],
    service_type: "consultation",
    description: "",
    line_items: [{ item: "", quantity: 1, unit_price: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total_amount: 0,
    amount_paid: 0,
    balance: 0,
    status: "pending",
    payment_method: "",
    insurance_claim_number: "",
    insurance_coverage: 0,
    notes: ""
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
    initialData: [],
    enabled: !patient, // Only fetch if no patient provided
  });

  const calculateTotals = (items, tax, discount) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const total_amount = subtotal + tax - discount;
    const balance = total_amount - (formData.amount_paid || 0);
    return { subtotal, total_amount, balance };
  };

  const updateLineItem = (index, field, value) => {
    const newItems = [...formData.line_items];
    newItems[index][field] = field === 'item' ? value : parseFloat(value) || 0;
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    const totals = calculateTotals(newItems, formData.tax, formData.discount);
    setFormData({ ...formData, line_items: newItems, ...totals });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [...formData.line_items, { item: "", quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const removeLineItem = (index) => {
    const newItems = formData.line_items.filter((_, i) => i !== index);
    const totals = calculateTotals(newItems, formData.tax, formData.discount);
    setFormData({ ...formData, line_items: newItems, ...totals });
  };

  const updateTaxOrDiscount = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const totals = calculateTotals(formData.line_items, field === 'tax' ? numValue : formData.tax, field === 'discount' ? numValue : formData.discount);
    setFormData({ ...formData, [field]: numValue, ...totals });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patient_id) {
      alert("Please select a patient");
      return;
    }
    
    if (!formData.service_type) {
      alert("Please select a service type");
      return;
    }
    
    if (formData.total_amount <= 0) {
      alert("Total amount must be greater than 0");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      {!patient && (
        <div className="space-y-2">
          <Label>Patient *</Label>
          <Select 
            required 
            value={formData.patient_id} 
            onValueChange={v => {
              const selectedPatient = patients.find(p => p.id === v);
              setFormData({
                ...formData, 
                patient_id: v,
                patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : ""
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Invoice Number</Label>
          <Input value={formData.invoice_number} onChange={e => setFormData({...formData, invoice_number: e.target.value})} readOnly className="bg-gray-50" />
        </div>
        <div className="space-y-2">
          <Label>Service Type *</Label>
          <Select required value={formData.service_type} onValueChange={v => setFormData({...formData, service_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="procedure">Procedure</SelectItem>
              <SelectItem value="lab_test">Lab Test</SelectItem>
              <SelectItem value="imaging">Imaging</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="medication">Medication</SelectItem>
              <SelectItem value="telemedicine">Telemedicine</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Invoice Date *</Label>
          <Input type="date" required value={formData.invoice_date} onChange={e => setFormData({...formData, invoice_date: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Service Date *</Label>
          <Input type="date" required value={formData.service_date} onChange={e => setFormData({...formData, service_date: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Due Date *</Label>
          <Input type="date" required value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description of services..." rows={2} />
      </div>

      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <Label className="text-base font-semibold">Line Items</Label>
            <Button type="button" size="sm" onClick={addLineItem}><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
          </div>
          <div className="space-y-3">
            {formData.line_items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5"><Input placeholder="Item/Service" value={item.item} onChange={e => updateLineItem(index, 'item', e.target.value)} /></div>
                <div className="col-span-2"><Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateLineItem(index, 'quantity', e.target.value)} /></div>
                <div className="col-span-2"><Input type="number" step="0.01" placeholder="Price" value={item.unit_price} onChange={e => updateLineItem(index, 'unit_price', e.target.value)} /></div>
                <div className="col-span-2"><Input type="number" step="0.01" value={item.total.toFixed(2)} readOnly className="bg-gray-50" /></div>
                <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)} disabled={formData.line_items.length === 1}><Trash2 className="w-4 h-4 text-red-500" /></Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={formData.payment_method} onValueChange={v => setFormData({...formData, payment_method: v})}>
              <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Insurance Claim #</Label>
            <Input value={formData.insurance_claim_number} onChange={e => setFormData({...formData, insurance_claim_number: e.target.value})} />
          </div>
        </div>

        <Card className="bg-slate-50 border-2">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">${formData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Tax:</span>
              <Input type="number" step="0.01" value={formData.tax} onChange={e => updateTaxOrDiscount('tax', e.target.value)} className="w-24 h-8 text-right" />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Discount:</span>
              <Input type="number" step="0.01" value={formData.discount} onChange={e => updateTaxOrDiscount('discount', e.target.value)} className="w-24 h-8 text-right" />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Insurance Coverage:</span>
              <Input type="number" step="0.01" value={formData.insurance_coverage} onChange={e => setFormData({...formData, insurance_coverage: parseFloat(e.target.value) || 0})} className="w-24 h-8 text-right" />
            </div>
            <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">${formData.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Amount Paid:</span>
              <Input type="number" step="0.01" value={formData.amount_paid} onChange={e => {
                const paid = parseFloat(e.target.value) || 0;
                setFormData({...formData, amount_paid: paid, balance: formData.total_amount - paid});
              }} className="w-24 h-8 text-right" />
            </div>
            <div className="flex justify-between text-base font-semibold text-red-600">
              <span>Balance Due:</span>
              <span>${formData.balance.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Additional notes..." rows={2} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : billing ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}