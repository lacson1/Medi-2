// Enhanced Patient Profile with Comprehensive Data Access Control
import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Calendar, Edit, Plus, Pill, Beaker, Syringe, Phone, Mail,
  AlertTriangle, Activity, Search, Video, FileHeart, ArrowUpRightSquare,
  HeartPulse, UserCog, FileSignature, Scissors, Calculator, FileText,
  ChevronLeft, ChevronRight, DollarSign, Shield, Eye, EyeOff, Lock
} from "lucide-react";
import { differenceInYears, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import the new data access control components
import DataAccessControl, { ConsentManagement, withDataAccessControl } from "@/components/DataAccessControl";
import { consentManager } from "@/utils/consentManager";
import { auditLogger, AUDIT_ACTIONS } from "@/utils/auditLogger.tsx";
import { notificationScheduler, NOTIFICATION_TYPES } from "@/utils/notificationSystem";

// Import existing patient profile components
import PatientAppointments from "../components/patient-profile/PatientAppointments";
import PatientEncounters from "../components/patient-profile/PatientEncounters";
import PatientPrescriptions from "../components/patient-profile/PatientPrescriptions";
import PatientLabOrders from "../components/patient-profile/PatientLabOrders";
import PatientTelemedicine from "../components/patient-profile/PatientTelemedicine";
import PatientVaccinations from "../components/patient-profile/PatientVaccinations";
import PatientSpecialtyConsultations from "../components/patient-profile/PatientSpecialtyConsultations";
import PatientConsents from "../components/patient-profile/PatientConsents";
import PatientSurgeries from "../components/patient-profile/PatientSurgeries";
import PatientProcedures from "../components/patient-profile/PatientProcedures";
import PatientDischargeSummaries from "../components/patient-profile/PatientDischargeSummaries";
import ClinicalCalculators from "../components/patient-profile/ClinicalCalculators";
import PatientReferrals from "../components/patient-profile/PatientReferrals";
import PatientDocuments from "../components/patient-profile/PatientDocuments";
import PatientBilling from "../components/patient-profile/PatientBilling";
import PatientMedicalDocuments from "../components/patient-profile/PatientMedicalDocuments";
import PatientTimeline from "../components/patient-profile/PatientTimeline";
import ClinicalAlerts from "../components/patient-profile/ClinicalAlerts";

import PatientForm from "../components/patients/PatientForm";
import AppointmentForm from "../components/appointments/AppointmentForm";
import EncounterForm from "../components/encounters/EncounterForm";
import PrescriptionForm from "../components/prescriptions/PrescriptionForm";
import EnhancedPrescriptionForm from "../components/prescriptions/EnhancedPrescriptionForm";
import ConsentForm from "../components/consents/ConsentForm";

export default function EnhancedPatientProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const patientId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [accessLog, setAccessLog] = useState([]);

  // Fetch patient data with access control
  const { data: patient, isLoading: loadingPatient, error: patientError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      if (!patientId) return null;

      // Log patient access
      await auditLogger.logPatientAccess(
        patientId,
        'Patient Profile',
        AUDIT_ACTIONS.PATIENT_VIEW,
        {
          accessReason: 'routine_care',
          userRole: user.role,
          dataType: 'patient_profile'
        }
      );

      return await mockApiClient.patients.get(patientId);
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch patient consents
  const { data: consents, isLoading: loadingConsents } = useQuery({
    queryKey: ["patient-consents", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      return await consentManager.getPatientConsents(patientId);
    },
    enabled: !!patientId,
  });

  // Fetch patient privacy preferences
  const { data: privacyPreferences } = useQuery({
    queryKey: ["patient-privacy", patientId],
    queryFn: async () => {
      if (!patientId) return null;
      return await consentManager.getPrivacyPreferences(patientId);
    },
    enabled: !!patientId,
  });

  // Log access events
  useEffect(() => {
    if (patient && user) {
      const logAccess = async () => {
        await auditLogger.logPatientAccess(
          patientId,
          patient.name,
          AUDIT_ACTIONS.PATIENT_VIEW,
          {
            accessReason: 'patient_profile_view',
            userRole: user.role,
            dataType: 'patient_profile',
            timestamp: new Date().toISOString()
          }
        );
      };
      logAccess();
    }
  }, [patient, user, patientId]);

  // Handle data access events
  const handleAccessGranted = useCallback((accessInfo) => {
    console.log('Access granted:', accessInfo);
    setAccessLog(prev => [...prev, {
      timestamp: new Date(),
      action: 'access_granted',
      ...accessInfo
    }]);
  }, []);

  const handleAccessDenied = useCallback((accessInfo) => {
    console.log('Access denied:', accessInfo);
    setAccessLog(prev => [...prev, {
      timestamp: new Date(),
      action: 'access_denied',
      ...accessInfo
    }]);
  }, []);

  // Handle consent updates
  const handleConsentUpdate = useCallback(async () => {
    // Refresh consents
    await queryClient.invalidateQueries({ queryKey: ["patient-consents", patientId] });

    // Log consent update
    await auditLogger.log({
      action: AUDIT_ACTIONS.CONSENT_UPDATE,
      level: 'info',
      resource: 'consent',
      resourceId: patientId,
      resourceType: 'consent',
      patientId,
      patientName: patient?.name,
      details: {
        updatedBy: user.name,
        userRole: user.role
      }
    });
  }, [patientId, patient?.name, user, queryClient]);

  // Handle emergency access
  const handleEmergencyAccess = useCallback(async (reason) => {
    try {
      await consentManager.requestEmergencyAccess({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        patientId,
        patientName: patient?.name,
        reason,
        dataType: 'patient_profile',
        urgency: 'high'
      });

      // Send notification
      await notificationScheduler.scheduleNotification({
        type: NOTIFICATION_TYPES.BREAK_GLASS_ACCESS,
        priority: 'critical',
        channels: ['email', 'sms', 'in_app'],
        recipients: ['admin@organization.com', 'security@organization.com'],
        data: {
          patient_name: patient?.name,
          user_name: user.name,
          user_role: user.role,
          reason,
          timestamp: new Date().toISOString()
        },
        patientId,
        patientName: patient?.name
      });

      alert('Emergency access request submitted. Administrators have been notified.');
    } catch (error) {
      console.error('Failed to request emergency access:', error);
      alert('Failed to request emergency access. Please try again.');
    }
  }, [user, patientId, patient?.name]);

  // Open modal with proper access control
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);

    // Log modal access
    auditLogger.log({
      action: `modal_${type}_open`,
      level: 'info',
      resource: 'modal',
      resourceId: patientId,
      resourceType: 'patient_interaction',
      patientId,
      patientName: patient?.name,
      details: {
        modalType: type,
        userRole: user.role
      }
    });

    switch (type) {
      case "edit":
        setShowEditModal(true);
        break;
      case "appointment":
        setShowAppointmentModal(true);
        break;
      case "encounter":
        setShowEncounterModal(true);
        break;
      case "prescription":
        setShowPrescriptionModal(true);
        break;
      case "consent":
        setShowConsentModal(true);
        break;
    }
  };

  if (loadingPatient) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load patient data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const age = patient.date_of_birth ? differenceInYears(new Date(), parseISO(patient.date_of_birth)) : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Access Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>ID: {patient.id}</span>
              {age && <span>Age: {age}</span>}
              <span>DOB: {patient.date_of_birth}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Access Control Badge */}
          <DataAccessControl
            patientId={patientId}
            patientName={patient.name}
            dataType="patient_profile"
            showAccessInfo={false}
            onAccessGranted={handleAccessGranted}
            onAccessDenied={handleAccessDenied}
          >
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Access Controlled
            </Badge>
          </DataAccessControl>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal("edit")}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Patient Overview with Data Masking */}
      <DataAccessControl
        patientId={patientId}
        patientName={patient.name}
        dataType="patient_demographics"
        requireConsent={true}
        showAccessInfo={true}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Patient Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Contact Information</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Medical Information</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.blood_type || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.allergies?.length || 0} allergies</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Privacy Settings</h3>
                <div className="space-y-1">
                  {privacyPreferences ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Privacy Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Default Settings
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DataAccessControl>

      {/* Main Content Tabs with Access Control */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview" colorScheme="MEDICAL" icon={"Activity"}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="appointments" colorScheme="COMMUNICATION" icon={"Calendar"}>
            Appointments
          </TabsTrigger>
          <TabsTrigger value="prescriptions" colorScheme="PHARMACY" icon={"Pill"}>
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="labs" colorScheme="LABORATORY" icon={"Beaker"}>
            Labs
          </TabsTrigger>
          <TabsTrigger value="consents" colorScheme="PATIENT" icon={"FileSignature"}>
            Consents
          </TabsTrigger>
          <TabsTrigger value="billing" colorScheme="FINANCIAL" icon={"DollarSign"}>
            Billing
          </TabsTrigger>
          <TabsTrigger value="documents" colorScheme="ADMIN" icon={"FileText"}>
            Documents
          </TabsTrigger>
          <TabsTrigger value="timeline" colorScheme="PATIENT" icon={"Activity"}>
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clinical Alerts with Access Control */}
            <DataAccessControl
              patientId={patientId}
              patientName={patient.name}
              dataType="clinical_alerts"
              requireConsent={true}
            >
              <ClinicalAlerts patientId={patientId} />
            </DataAccessControl>

            {/* Patient Timeline with Access Control */}
            <DataAccessControl
              patientId={patientId}
              patientName={patient.name}
              dataType="patient_timeline"
              requireConsent={true}
            >
              <PatientTimeline patientId={patientId} />
            </DataAccessControl>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <DataAccessControl
            patientId={patientId}
            patientName={patient.name}
            dataType="appointments"
            requireConsent={true}
          >
            <PatientAppointments
              patientId={patientId}
              onEdit={(appointment) => openModal("appointment", appointment)}
            />
          </DataAccessControl>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <DataAccessControl
            patientId={patientId}
            patientName={patient.name}
            dataType="prescriptions"
            requireConsent={true}
          >
            <PatientPrescriptions
              patientId={patientId}
              onEdit={(prescription) => openModal("prescription", prescription)}
            />
          </DataAccessControl>
        </TabsContent>

        {/* Labs Tab */}
        <TabsContent value="labs" className="space-y-6">
          <DataAccessControl
            patientId={patientId}
            patientName={patient.name}
            dataType="lab_results"
            requireConsent={true}
          >
            <PatientLabOrders patientId={patientId} />
          </DataAccessControl>
        </TabsContent>

        {/* Consents Tab */}
        <TabsContent value="consents" className="space-y-6">
          <ConsentManagement
            patientId={patientId}
            patientName={patient.name}
            onConsentUpdate={handleConsentUpdate}
          />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <DataAccessControl
            patientId={patientId}
            patientName={patient.name}
            dataType="billing"
            requireConsent={false}
          >
            <PatientBilling patientId={patientId} />
          </DataAccessControl>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <DataAccessControl
            patientId={patientId}
            patientName={patient.name}
            dataType="medical_documents"
            requireConsent={true}
          >
            <PatientMedicalDocuments patientId={patientId} />
          </DataAccessControl>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <DataAccessControl
            patientId={patientId}
            patientName={patient.name}
            dataType="patient_timeline"
            requireConsent={true}
          >
            <PatientTimeline patientId={patientId} />
          </DataAccessControl>
        </TabsContent>
      </Tabs>

      {/* Modals with Access Control */}
      {showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{"Edit Patient"}</DialogTitle>
            </DialogHeader>
            <DataAccessControl
              patientId={patientId}
              patientName={patient.name}
              dataType="patient_edit"
              requireConsent={true}
            >
              <PatientForm
                patient={selectedItem || patient}
                onSubmit={async (data) => {
                  // Log edit action
                  await auditLogger.log({
                    action: AUDIT_ACTIONS.PATIENT_UPDATE,
                    level: 'info',
                    resource: 'patient',
                    resourceId: patientId,
                    resourceType: 'patient',
                    patientId,
                    patientName: patient.name,
                    details: {
                      editedBy: user.name,
                      userRole: user.role,
                      changes: Object.keys(data)
                    }
                  });

                  // Update patient
                  await mockApiClient.patients.update(patientId, data);
                  queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
                  setShowEditModal(false);
                }}
                onCancel={() => setShowEditModal(false)}
              />
            </DataAccessControl>
          </DialogContent>
        </Dialog>
      )}

      {showAppointmentModal && (
        <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? "Edit Appointment" : "New Appointment"}
              </DialogTitle>
            </DialogHeader>
            <DataAccessControl
              patientId={patientId}
              patientName={patient.name}
              dataType="appointments"
              requireConsent={true}
            >
              <AppointmentForm
                appointment={selectedItem}
                patientId={patientId}
                onSubmit={async (data) => {
                  // Log appointment action
                  await auditLogger.log({
                    action: selectedItem ? AUDIT_ACTIONS.APPOINTMENT_UPDATE : AUDIT_ACTIONS.APPOINTMENT_CREATE,
                    level: 'info',
                    resource: 'appointment',
                    resourceId: selectedItem?.id || 'new',
                    resourceType: 'appointment',
                    patientId,
                    patientName: patient.name,
                    details: {
                      action: selectedItem ? 'update' : 'create',
                      userRole: user.role
                    }
                  });

                  if (selectedItem) {
                    await mockApiClient.appointments.update(selectedItem.id, data);
                  } else {
                    await mockApiClient.appointments.create({ ...data, patient_id: patientId });
                  }

                  queryClient.invalidateQueries({ queryKey: ["patient-appointments", patientId] });
                  setShowAppointmentModal(false);
                }}
                onCancel={() => setShowAppointmentModal(false)}
              />
            </DataAccessControl>
          </DialogContent>
        </Dialog>
      )}

      {showConsentModal && (
        <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? "Edit Consent" : "New Consent"}
              </DialogTitle>
            </DialogHeader>
            <DataAccessControl
              patientId={patientId}
              patientName={patient.name}
              dataType="consents"
              requireConsent={true}
            >
              <ConsentForm
                consent={selectedItem}
                patient={patient}
                onSubmit={async (data) => {
                  // Log consent action
                  await auditLogger.logConsentChange(
                    patientId,
                    patient.name,
                    data.consent_type,
                    selectedItem ? 'update' : 'create',
                    {
                      consentId: selectedItem?.id || 'new',
                      obtainedBy: data.obtained_by,
                      witnessName: data.witness_name
                    }
                  );

                  if (selectedItem) {
                    await consentManager.updateConsent(selectedItem.id, data);
                  } else {
                    await consentManager.createConsent({
                      ...data,
                      patientId,
                      patientName: patient.name
                    });
                  }

                  queryClient.invalidateQueries({ queryKey: ["patient-consents", patientId] });
                  setShowConsentModal(false);
                }}
                onCancel={() => setShowConsentModal(false)}
              />
            </DataAccessControl>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
