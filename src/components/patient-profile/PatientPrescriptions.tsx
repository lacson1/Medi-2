import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Edit, Calendar, Printer, Send, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import PropTypes from "prop-types";
import MedicationFlowManager from "../prescriptions/MedicationFlowManager";
import PrintablePrescriptionForm from "../prescriptions/PrintablePrescriptionForm";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  discontinued: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function PatientPrescriptions({ prescriptions, isLoading, onEdit, patient, onAction }: any) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('flow');
  const [showPrintableForm, setShowPrintableForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const handlePrintPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowPrintableForm(true);
  };

  const handleClosePrintableForm = () => {
    setShowPrintableForm(false);
    setSelectedPrescription(null);
  };

  // Legacy print function - kept for backward compatibility
  // eslint-disable-next-line no-unused-vars
  const printPrescription = (prescription: any) => {
    const printWindow = window.open('', '_blank');
    const organizationName = user?.organization || 'Medical Practice';
    const doctorName = prescription.prescribing_doctor || user?.name || 'Dr. Smith';
    const currentDate = new Date().toLocaleDateString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patient?.first_name} ${patient?.last_name}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; background-color: #f0f9f0; }
            .prescription-container { 
              background-color: white; 
              padding: 30px; 
              border: 2px solid #22c55e; 
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 600px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #22c55e; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .organization-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #22c55e; 
              margin-bottom: 10px;
            }
            .organization-details { 
              font-size: 14px; 
              color: #666; 
              margin-bottom: 5px;
            }
            .prescription-title { 
              font-size: 20px; 
              font-weight: bold; 
              color: #333; 
              margin: 20px 0;
            }
            .patient-info { 
              background-color: #f8f9fa; 
              padding: 15px; 
              border-radius: 5px; 
              margin-bottom: 20px;
            }
            .medication-details { 
              background-color: #f0f9f0; 
              padding: 20px; 
              border-radius: 5px; 
              margin-bottom: 20px;
            }
            .medication-name { 
              font-size: 18px; 
              font-weight: bold; 
              color: #22c55e; 
              margin-bottom: 10px;
            }
            .dosage-info { 
              font-size: 16px; 
              margin-bottom: 5px;
            }
            .instructions { 
              background-color: #fff3cd; 
              padding: 15px; 
              border-radius: 5px; 
              margin-bottom: 20px;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd;
            }
            .doctor-signature { 
              margin-top: 40px;
            }
            .date { 
              color: #666; 
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="prescription-container">
          <div class="header">
            <div class="organization-name">${organizationName}</div>
            <div class="organization-details">Medical Practice</div>
            <div class="organization-details">123 Medical Drive, City, State 12345</div>
            <div class="organization-details">Phone: (555) 123-4567 | Fax: (555) 123-4568</div>
          </div>
          
          <div class="prescription-title">PRESCRIPTION</div>
          
          <div class="patient-info">
            <strong>Patient:</strong> ${patient?.first_name} ${patient?.last_name}<br>
            <strong>DOB:</strong> ${patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}<br>
            <strong>Address:</strong> ${patient?.address || 'N/A'}<br>
            <strong>Phone:</strong> ${patient?.phone || 'N/A'}
          </div>
          
          <div class="medication-details">
            <div class="medication-name">${prescription.medication_name}</div>
            <div class="dosage-info"><strong>Dosage:</strong> ${prescription.dosage} ${prescription.dosage_unit}</div>
            <div class="dosage-info"><strong>Frequency:</strong> ${prescription.frequency} ${prescription.frequency_unit}</div>
            <div class="dosage-info"><strong>Route:</strong> ${prescription.route}</div>
            <div class="dosage-info"><strong>Quantity:</strong> ${prescription.quantity}</div>
            <div class="dosage-info"><strong>Refills:</strong> ${prescription.refills}</div>
            <div class="dosage-info"><strong>Indication:</strong> ${prescription.indication}</div>
          </div>
          
          <div class="instructions">
            <strong>Special Instructions:</strong><br>
            ${prescription.special_instructions || 'Take as directed by physician.'}
            ${prescription.lab_monitoring ? `<br><br><strong>Lab Monitoring:</strong><br>${prescription.lab_monitoring}` : ''}
            ${prescription.side_effects_to_watch ? `<br><br><strong>Side Effects to Watch:</strong><br>${prescription.side_effects_to_watch}` : ''}
          </div>
          
          <div class="footer">
            <div class="doctor-signature">
              <strong>Prescribing Physician:</strong> ${doctorName}<br>
              <strong>Date:</strong> ${currentDate}
            </div>
            <div class="date">
              Prescription printed on ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  const handleAction = (action: any, prescription: any) => {
    if (onAction) {
      onAction(action, prescription);
    } else {
      // Default actions
      switch (action) {
        case 'print':
          handlePrintPrescription(prescription);
          break;
        case 'edit':
          onEdit(prescription);
          break;
        case 'new-prescription':
          onEdit(null);
          break;
        default:
          console.log(`Action: ${action}`, prescription);
      }
    }
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flow" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Medication Flow
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Prescription List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flow">
          <MedicationFlowManager
            prescriptions={prescriptions}
            patient={patient}
            onAction={handleAction}
          />
        </TabsContent>

        <TabsContent value="list">
          {!prescriptions || prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No prescriptions on record</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((rx: any) => (
                <div key={rx.id} className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Pill className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-lg">{rx.medication_name}</h4>
                        <Badge className={statusColors[rx.status]}>{rx.status}</Badge>
                        {rx.medication_type && (
                          <Badge variant="outline" className="text-xs">
                            {rx.medication_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{rx.dosage} • {rx.frequency}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(parseISO(rx.start_date), "MMM d, yyyy")}</span>
                        {rx.end_date && <><span>-</span><span>{format(parseISO(rx.end_date), "MMM d, yyyy")}</span></>}
                      </div>
                      {rx.notes && <p className="text-sm italic text-gray-500 mt-2">{rx.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction('print', rx)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Print Prescription"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction('send', rx)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Send to Pharmacy"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction('edit', rx)}
                        title="Edit Prescription"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Printable Prescription Form Modal */}
      {showPrintableForm && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <PrintablePrescriptionForm
              prescription={selectedPrescription}
              patient={patient}
              onClose={handleClosePrintableForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

PatientPrescriptions.propTypes = {
  prescriptions: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  onAction: PropTypes.func,
};