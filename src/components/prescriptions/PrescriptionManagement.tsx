import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pill,
  Plus,
  FileText,
  BarChart3,
  Settings,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity
} from "lucide-react";
import EnhancedPrescriptionForm from "./EnhancedPrescriptionForm";
import AddNewMedication from "./AddNewMedication";
import MedicationDatabase from "./MedicationDatabase";
import PrescriptionMonitoring from "./PrescriptionMonitoring";
import PrescriptionDashboard from "./PrescriptionDashboard";
import PrescriptionRefillManager from "./PrescriptionRefillManager";
import PrescriptionNotifications from "./PrescriptionNotifications";
import PrescriptionHistory from "./PrescriptionHistory";
import PrescriptionAnalytics from "./PrescriptionAnalytics";

export default function PrescriptionManagement({
  prescriptions = [],
  patients = [],
  onPrescriptionSave,
  onPrescriptionUpdate,
  onPrescriptionDelete
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showMedicationDatabase, setShowMedicationDatabase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    activePrescriptions: 0,
    criticalAlerts: 0,
    refillsDue: 0,
    avgAdherence: 0,
    newThisWeek: 0
  });

  useEffect(() => {
    calculateStats();
  }, [prescriptions]);

  const calculateStats = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newStats = {
      totalPrescriptions: prescriptions.length,
      activePrescriptions: prescriptions.filter(rx => rx.status === 'active').length,
      criticalAlerts: prescriptions.filter(rx => {
        // Mock critical alert logic
        return rx.status === 'active' && Math.random() < 0.1; // 10% chance of critical alert
      }).length,
      refillsDue: prescriptions.filter(rx => {
        if (rx.status !== 'active' || !rx.refills) return false;
        const startDate = new Date(rx.start_date);
        const durationDays = parseInt(rx.duration_days) || 30;
        const nextRefillDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
        return nextRefillDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      }).length,
      avgAdherence: Math.round(Math.random() * 20 + 80), // Mock 80-100% adherence
      newThisWeek: prescriptions.filter(rx => new Date(rx.start_date) >= lastWeek).length
    };

    setStats(newStats);
  };

  const handlePrescriptionSave = async (prescriptionData) => {
    setIsSubmitting(true);
    try {
      if (onPrescriptionSave) {
        await onPrescriptionSave(prescriptionData);
      }
      setShowPrescriptionForm(false);
      setSelectedPrescription(null);
    } catch (error) {
      console.error("Error saving prescription:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrescriptionUpdate = async (prescriptionData) => {
    setIsSubmitting(true);
    try {
      if (onPrescriptionUpdate) {
        await onPrescriptionUpdate(selectedPrescription.id, prescriptionData);
      }
      setShowPrescriptionForm(false);
      setSelectedPrescription(null);
    } catch (error) {
      console.error("Error updating prescription:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMedicationSelect = (medication: any) => {
    setSelectedPrescription({
      medication_name: medication.name,
      indication: medication.indication,
      dosage: medication.dosage.split(',')[0],
      frequency: medication.frequency,
      route: medication.route
    });
    setShowMedicationDatabase(false);
    setShowPrescriptionForm(true);
  };

  const handleMedicationEdit = (medication: any) => {
    setShowAddMedication(true);
    // In a real app, you would pass the medication data to edit
  };

  const handleNewMedicationAdded = (newMedication: any) => {
    setShowAddMedication(false);
    // In a real app, you would update the medication database
    console.log("New medication added:", newMedication);
  };

  if (showAddMedication) {
    return (
      <AddNewMedication
        onSave={handleNewMedicationAdded}
        onCancel={() => setShowAddMedication(false)}
        existingMedications={[]} // In real app, this would come from props
      />
    );
  }

  if (showPrescriptionForm) {
    return (
      <EnhancedPrescriptionForm
        prescription={selectedPrescription}
        onSubmit={selectedPrescription?.id ? handlePrescriptionUpdate : handlePrescriptionSave}
        onCancel={() => {
          setShowPrescriptionForm(false);
          setSelectedPrescription(null);
        }}
        isSubmitting={isSubmitting}
        patient={patients[0]} // In real app, this would be the selected patient
      />
    );
  }

  if (showMedicationDatabase) {
    return (
      <MedicationDatabase
        onMedicationSelect={handleMedicationSelect}
        onMedicationEdit={handleMedicationEdit}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
          <p className="text-gray-600">Comprehensive prescription and medication management system</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowMedicationDatabase(true)}
          >
            <Database className="w-4 h-4 mr-2" />
            Medication Database
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAddMedication(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
          <Button onClick={() => setShowPrescriptionForm(true)}>
            <Pill className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalPrescriptions}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activePrescriptions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refills Due</p>
                <p className="text-2xl font-bold text-orange-600">{stats.refillsDue}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Adherence</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgAdherence}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Week</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.newThisWeek}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard" colorScheme="ANALYTICS" icon={BarChart3}>
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="monitoring" colorScheme="EMERGENCY" icon={"Activity"}>
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="refills" colorScheme="PHARMACY" icon={"RefreshCw"}>
            Refills
          </TabsTrigger>
          <TabsTrigger value="notifications" colorScheme="EMERGENCY" icon={"AlertTriangle"}>
            Alerts
          </TabsTrigger>
          <TabsTrigger value="history" colorScheme="ANALYTICS" icon={"FileText"}>
            History
          </TabsTrigger>
          <TabsTrigger value="analytics" colorScheme="ANALYTICS" icon={BarChart3}>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="database" colorScheme="ADMIN" icon={"Database"}>
            Database
          </TabsTrigger>
          <TabsTrigger value="settings" colorScheme="SETTINGS" icon={"Settings"}>
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <PrescriptionDashboard
            prescriptions={prescriptions}
            patients={patients}
          />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <PrescriptionMonitoring
            prescriptions={prescriptions}
            patients={patients}
          />
        </TabsContent>

        <TabsContent value="refills" className="space-y-4">
          <PrescriptionRefillManager
            prescriptions={prescriptions}
            patients={patients}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <PrescriptionNotifications
            prescriptions={prescriptions}
            patients={patients}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <PrescriptionHistory
            prescriptions={prescriptions}
            patients={patients}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PrescriptionAnalytics
            prescriptions={prescriptions}
            patients={patients}
          />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <MedicationDatabase
            onMedicationSelect={handleMedicationSelect}
            onMedicationEdit={handleMedicationEdit}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Prescription Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Settings panel coming soon</p>
                <p className="text-sm">Configure prescription defaults, alerts, and preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

PrescriptionManagement.propTypes = {
  prescriptions: PropTypes.array,
  patients: PropTypes.array,
  onPrescriptionSave: PropTypes.func,
  onPrescriptionUpdate: PropTypes.func,
  onPrescriptionDelete: PropTypes.func
};
