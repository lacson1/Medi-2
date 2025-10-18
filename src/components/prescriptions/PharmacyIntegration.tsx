import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Shield,
  FileText,
  Printer,
  RefreshCw
} from "lucide-react";
import PropTypes from "prop-types";

export default function PharmacyIntegration({ prescriptions = [], patient, onSendPrescription, onContactPharmacy }: any) {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
  const [sendMethod, setSendMethod] = useState('electronic');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  // Mock pharmacy data - in real implementation, this would come from an API
  const pharmacies = [
    {
      id: 'pharmacy-1',
      name: 'CVS Pharmacy',
      address: '123 Main St, City, State 12345',
      phone: '(555) 123-4567',
      email: 'pharmacy@cvs.com',
      ePrescribeEnabled: true,
      hours: 'Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-6PM',
      distance: '0.5 miles'
    },
    {
      id: 'pharmacy-2',
      name: 'Walgreens',
      address: '456 Oak Ave, City, State 12345',
      phone: '(555) 234-5678',
      email: 'pharmacy@walgreens.com',
      ePrescribeEnabled: true,
      hours: '24/7',
      distance: '1.2 miles'
    },
    {
      id: 'pharmacy-3',
      name: 'Local Family Pharmacy',
      address: '789 Pine St, City, State 12345',
      phone: '(555) 345-6789',
      email: 'info@localfamilypharmacy.com',
      ePrescribeEnabled: false,
      hours: 'Mon-Fri: 9AM-7PM, Sat: 9AM-5PM',
      distance: '0.8 miles'
    }
  ];

  const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');

  const handleSendPrescriptions = async () => {
    if (!selectedPharmacy || selectedPrescriptions.length === 0) return;

    setIsSending(true);
    setSendStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (onSendPrescription) {
        await onSendPrescription({
          pharmacy: selectedPharmacy,
          prescriptions: selectedPrescriptions,
          method: sendMethod,
          patient: patient
        });
      }

      setSendStatus({
        type: 'success',
        message: `Successfully sent ${selectedPrescriptions.length} prescription(s) to ${selectedPharmacy.name}`
      });

      // Reset selections
      setSelectedPrescriptions([]);
    } catch {
      setSendStatus({
        type: 'error',
        message: 'Failed to send prescriptions. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleContactPharmacy = () => {
    if (!selectedPharmacy) return;

    if (onContactPharmacy) {
      onContactPharmacy(selectedPharmacy);
    }
  };

  const togglePrescriptionSelection = (prescription: any) => {
    setSelectedPrescriptions(prev =>
      prev.find(p => p.id === prescription.id)
        ? prev.filter(p => p.id !== prescription.id)
        : [...prev, prescription]
    );
  };

  const selectAllPrescriptions = () => {
    setSelectedPrescriptions(activePrescriptions);
  };

  const clearSelection = () => {
    setSelectedPrescriptions([]);
  };

  return (
    <div className="space-y-6">
      {/* Pharmacy Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Select Pharmacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {pharmacies.map((pharmacy: any) => (
              <Card
                key={pharmacy.id}
                className={`cursor-pointer transition-all ${selectedPharmacy?.id === pharmacy.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
                  }`}
                onClick={() => setSelectedPharmacy(pharmacy)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{pharmacy.name}</h4>
                        {pharmacy.ePrescribeEnabled && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Zap className="w-3 h-3 mr-1" />
                            E-Prescribe Ready
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {pharmacy.distance}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{pharmacy.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{pharmacy.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{pharmacy.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{pharmacy.hours}</span>
                        </div>
                      </div>
                    </div>

                    {selectedPharmacy?.id === pharmacy.id && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prescription Selection */}
      {selectedPharmacy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Select Prescriptions to Send
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllPrescriptions}
                  disabled={activePrescriptions.length === 0}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSelection}
                  disabled={selectedPrescriptions.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activePrescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No active prescriptions to send</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePrescriptions.map((prescription: any) => (
                  <Card
                    key={prescription.id}
                    className={`cursor-pointer transition-all ${selectedPrescriptions.find(p => p.id === prescription.id)
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                      }`}
                    onClick={() => togglePrescriptionSelection(prescription)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 ${selectedPrescriptions.find(p => p.id === prescription.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                            }`}>
                            {selectedPrescriptions.find(p => p.id === prescription.id) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">{prescription.medication_name}</h4>
                            <p className="text-sm text-gray-600">
                              {prescription.dosage} • {prescription.frequency}
                            </p>
                            {prescription.indication && (
                              <p className="text-xs text-gray-500">{prescription.indication}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle print action
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Send Options */}
      {selectedPharmacy && selectedPrescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{"Send Method"}</Label>
              <Select value={sendMethod} onValueChange={setSendMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronic" disabled={!selectedPharmacy.ePrescribeEnabled}>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Electronic (E-Prescribe)
                      {!selectedPharmacy.ePrescribeEnabled && (
                        <Badge variant="outline" className="text-xs">Not Available</Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="fax">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Fax
                    </div>
                  </SelectItem>
                  <SelectItem value="print">
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      Print & Hand Deliver
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sendMethod === 'electronic' && !selectedPharmacy.ePrescribeEnabled && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This pharmacy does not support electronic prescribing. Please select fax or print method.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSendPrescriptions}
                disabled={isSending || !selectedPharmacy || selectedPrescriptions.length === 0}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {selectedPrescriptions.length} Prescription(s)
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleContactPharmacy}
                disabled={!selectedPharmacy}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Pharmacy
              </Button>
            </div>

            {sendStatus && (
              <Alert className={sendStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {sendStatus.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={sendStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {sendStatus.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* E-Prescribing System Status */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            E-Prescribing System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                E-prescribing system integration is ready for implementation. This will enable:
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Current Capabilities</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Prescription formatting for e-transmission</li>
                  <li>• Pharmacy directory integration</li>
                  <li>• Drug interaction checking</li>
                  <li>• Prescription status tracking</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Future Integration</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Direct e-prescribing transmission</li>
                  <li>• Real-time pharmacy verification</li>
                  <li>• Automated refill management</li>
                  <li>• Insurance formulary checking</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

PharmacyIntegration.propTypes = {
  prescriptions: PropTypes.array.isRequired,
  patient: PropTypes.object.isRequired,
  onSendPrescription: PropTypes.func,
  onContactPharmacy: PropTypes.func,
};
