import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Pill, 
  Printer, 
  Send, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Calendar,
  FileText,
  Shield,
  Zap
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import PharmacyIntegration from "./PharmacyIntegration";
import MedicationStatusTracker from "./MedicationStatusTracker";
import PropTypes from "prop-types";

export default function MedicationFlowManager({ prescriptions = [], patient, onAction }: any) {
  const [activeTab, setActiveTab] = useState('overview');

  // Group prescriptions by status and type
  const prescriptionGroups = {
    active: prescriptions.filter(rx => rx.status === 'active'),
    acute: prescriptions.filter(rx => rx.medication_type === 'acute'),
    chronic: prescriptions.filter(rx => rx.medication_type === 'chronic'),
    pending: prescriptions.filter(rx => rx.status === 'pending'),
    expired: prescriptions.filter(rx => rx.status === 'expired')
  };

  const getMedicationTypeIcon = (type: any) => {
    switch (type) {
      case 'acute': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'chronic': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default: return <Pill className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'discontinued': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAction = (action: any, prescription: any) => {
    if (onAction) {
      onAction(action, prescription);
    }
  };

  const PrescriptionCard = ({ prescription }: any) => {
    const daysUntilExpiry = prescription.end_date ? 
      differenceInDays(parseISO(prescription.end_date), new Date()) : null;
    
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

    return (
      <Card className={`border-2 transition-all hover:shadow-md ${
        isExpired ? 'border-red-200 bg-red-50' : 
        isExpiringSoon ? 'border-orange-200 bg-orange-50' : 
        'border-gray-200 hover:border-blue-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getMedicationTypeIcon(prescription.medication_type)}
              <h4 className="font-semibold text-lg">{prescription.medication_name}</h4>
              <Badge className={getStatusColor(prescription.status)}>
                {prescription.status}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleAction('print', prescription)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleAction('send', prescription)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-sm text-gray-600">Dosage:</span>
              <p className="font-medium">{prescription.dosage} {prescription.dosage_unit}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Frequency:</span>
              <p className="font-medium">{prescription.frequency} {prescription.frequency_unit}</p>
            </div>
          </div>

          {prescription.indication && (
            <div className="mb-3">
              <span className="text-sm text-gray-600">Indication:</span>
              <p className="text-sm">{prescription.indication}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Started: {format(parseISO(prescription.start_date), "MMM d, yyyy")}</span>
            </div>
            {prescription.end_date && (
              <div className={`flex items-center gap-1 ${
                isExpired ? 'text-red-600' : 
                isExpiringSoon ? 'text-orange-600' : 
                'text-gray-600'
              }`}>
                <Clock className="w-4 h-4" />
                <span>
                  {isExpired ? 'Expired' : 
                   isExpiringSoon ? `Expires in ${daysUntilExpiry} days` : 
                   `Expires: ${format(parseISO(prescription.end_date), "MMM d, yyyy")}`}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3 pt-3 border-t">
            {prescription.status === 'active' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAction('refill', prescription)}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request Refill
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAction('modify', prescription)}
                  className="flex-1"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Modify
                </Button>
              </>
            )}
            {prescription.medication_type === 'chronic' && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleAction('recurring', prescription)}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Set Recurring
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with patient info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {patient?.first_name?.charAt(0)}{patient?.last_name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{patient?.first_name} {patient?.last_name}</h3>
                <p className="text-sm text-gray-600">Medication Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleAction('new-prescription', null)}
                className="bg-white"
              >
                <Pill className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {prescriptionGroups.expired.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {prescriptionGroups.expired.length} prescription(s) have expired and need attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Medications</TabsTrigger>
          <TabsTrigger value="tracking">Status Tracking</TabsTrigger>
          <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
          <TabsTrigger value="e-prescribe">E-Prescribe</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold">Active Medications</h4>
                <p className="text-2xl font-bold text-green-600">{prescriptionGroups.active.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold">Acute Medications</h4>
                <p className="text-2xl font-bold text-orange-600">{prescriptionGroups.acute.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold">Chronic Medications</h4>
                <p className="text-2xl font-bold text-blue-600">{prescriptionGroups.chronic.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((rx: any) => (
                  <PrescriptionCard key={rx.id} prescription={rx} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {prescriptionGroups.active.map((rx: any) => (
              <PrescriptionCard key={rx.id} prescription={rx} />
            ))}
            {prescriptionGroups.active.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No active medications</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <MedicationStatusTracker 
            prescriptions={prescriptions}
          />
        </TabsContent>

        <TabsContent value="pharmacy" className="space-y-4">
          <PharmacyIntegration 
            prescriptions={prescriptions}
            patient={patient}
            onSendPrescription={(data) => handleAction('send-prescription', data)}
            onContactPharmacy={(pharmacy) => handleAction('contact-pharmacy', pharmacy)}
          />
        </TabsContent>

        <TabsContent value="e-prescribe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Electronic Prescribing System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  E-prescribing system integration is available for future implementation. 
                  This will enable direct electronic transmission of prescriptions to pharmacies.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      E-Prescribe Ready
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Prescriptions are formatted and ready for electronic transmission
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => handleAction('e-prescribe-ready', null)}
                      className="w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View E-Prescribe Format
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      Integration Status
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      E-prescribing system integration pending
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled
                      className="w-full"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Configure Integration
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

MedicationFlowManager.propTypes = {
  prescriptions: PropTypes.array.isRequired,
  patient: PropTypes.object.isRequired,
  onAction: PropTypes.func.isRequired,
};
