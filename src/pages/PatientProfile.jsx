
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Calendar, Edit, Plus, Pill, Beaker, Syringe, Phone, Mail,
  AlertTriangle, Activity, Search, Video, FileHeart, ArrowUpRightSquare,
  HeartPulse, UserCog, FileSignature, Scissors, Calculator, FileText,
  ChevronLeft, ChevronRight, DollarSign
} from
"lucide-react";
import { differenceInYears, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";

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
import LabOrderForm from "../components/labs/LabOrderForm";
import TelemedicineForm from "../components/telemedicine/TelemedicineForm";
import VaccinationForm from "../components/vaccinations/VaccinationForm";
import SpecialtyConsultationForm from "../components/specialty-consultations/SpecialtyConsultationForm";
import ConsentForm from "../components/consents/ConsentForm";
import SurgeryForm from "../components/surgeries/SurgeryForm";
import ProcedureForm from "../components/procedures/ProcedureForm";
import DischargeSummaryForm from "../components/discharge/DischargeSummaryForm";
import ReferralForm from "../components/referrals/ReferralForm";
import DocumentForm from "../components/documents/DocumentForm";
import BillingForm from "../components/billing/BillingForm";
import MedicalDocumentForm from "../components/medical-documents/MedicalDocumentForm";

export default function PatientProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get("id");
  const queryClient = useQueryClient();

  const [modalContent, setModalContent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => (await base44.entities.Patient.filter({ id: patientId }))[0],
    enabled: !!patientId
  });

  const usePatientDataQuery = (entityName, queryKey) => useQuery({
    queryKey: [queryKey, patientId],
    queryFn: () => base44.entities[entityName].filter({ patient_id: patientId }),
    initialData: [],
    enabled: !!patientId
  });

  const { data: appointments, isLoading: loadingAppointments } = usePatientDataQuery('Appointment', 'patient_appointments');
  const { data: encounters, isLoading: loadingEncounters } = usePatientDataQuery('Encounter', 'patient_encounters');
  const { data: prescriptions, isLoading: loadingPrescriptions } = usePatientDataQuery('Prescription', 'patient_prescriptions');
  const { data: labOrders, isLoading: loadingLabOrders } = usePatientDataQuery('LabOrder', 'patient_lab_orders');
  const { data: telemedicineSessions, isLoading: loadingTelemedicine } = usePatientDataQuery('Telemedicine', 'patient_telemedicine');
  const { data: vaccinations, isLoading: loadingVaccinations } = usePatientDataQuery('Vaccination', 'patient_vaccinations');
  const { data: specialtyConsultations, isLoading: loadingSpecialtyConsultations } = usePatientDataQuery('SpecialtyConsultation', 'patient_specialty_consultations');
  const { data: consents, isLoading: loadingConsents } = usePatientDataQuery('Consent', 'patient_consents');
  const { data: surgeries, isLoading: loadingSurgeries } = usePatientDataQuery('Surgery', 'patient_surgeries');
  const { data: procedures, isLoading: loadingProcedures } = usePatientDataQuery('Procedure', 'patient_procedures');
  const { data: dischargeSummaries, isLoading: loadingDischargeSummaries } = usePatientDataQuery('DischargeSummary', 'patient_discharge_summaries');
  const { data: referrals, isLoading: loadingReferrals } = usePatientDataQuery('Referral', 'patient_referrals');
  const { data: documents, isLoading: loadingDocuments } = usePatientDataQuery('PatientDocument', 'patient_documents');
  const { data: billings, isLoading: loadingBillings } = usePatientDataQuery('Billing', 'patient_billings');
  const { data: medicalDocuments, isLoading: loadingMedicalDocuments } = usePatientDataQuery('GeneratedMedicalDocument', 'patient_medical_documents');

  const { data: consultationTemplates = [] } = useQuery({
    queryKey: ['consultation_templates'],
    queryFn: () => base44.entities.ConsultationTemplate.list(),
    initialData: [],
    enabled: !!patientId
  });

  const useMutationWithInvalidation = (mutationFn, queryKeysToInvalidate) => useMutation({
    mutationFn,
    onSuccess: () => {
      queryKeysToInvalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: [key, patientId] }));
      queryClient.invalidateQueries({ queryKey: [queryKeysToInvalidate[0].split('_')[0] + 's'] });
      setModalContent(null);
    }
  });

  const updatePatientMutation = useMutationWithInvalidation(
    ({ id, data }) => base44.entities.Patient.update(id, data),
    ['patient']
  );

  const appointmentMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Appointment.update(data.id, data) : base44.entities.Appointment.create(data),
    ['patient_appointments']
  );

  const encounterMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Encounter.update(data.id, data) : base44.entities.Encounter.create(data),
    ['patient_encounters']
  );

  const prescriptionMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Prescription.update(data.id, data) : base44.entities.Prescription.create(data),
    ['patient_prescriptions']
  );

  const labOrderMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.LabOrder.update(data.id, data) : base44.entities.LabOrder.create(data),
    ['patient_lab_orders']
  );

  const telemedicineMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Telemedicine.update(data.id, data) : base44.entities.Telemedicine.create(data),
    ['patient_telemedicine']
  );

  const vaccinationMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Vaccination.update(data.id, data) : base44.entities.Vaccination.create(data),
    ['patient_vaccinations']
  );

  const specialtyConsultationMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.SpecialtyConsultation.update(data.id, data) : base44.entities.SpecialtyConsultation.create(data),
    ['patient_specialty_consultations']
  );

  const consentMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Consent.update(data.id, data) : base44.entities.Consent.create(data),
    ['patient_consents']
  );

  const surgeryMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Surgery.update(data.id, data) : base44.entities.Surgery.create(data),
    ['patient_surgeries']
  );

  const procedureMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Procedure.update(data.id, data) : base44.entities.Procedure.create(data),
    ['patient_procedures']
  );

  const dischargeSummaryMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.DischargeSummary.update(data.id, data) : base44.entities.DischargeSummary.create(data),
    ['patient_discharge_summaries']
  );

  const referralMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Referral.update(data.id, data) : base44.entities.Referral.create(data),
    ['patient_referrals']
  );

  const documentMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.PatientDocument.update(data.id, data) : base44.entities.PatientDocument.create(data),
    ['patient_documents']
  );

  const billingMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.Billing.update(data.id, data) : base44.entities.Billing.create(data),
    ['patient_billings']
  );

  const medicalDocumentMutation = useMutationWithInvalidation(
    (data) => data.id ? base44.entities.GeneratedMedicalDocument.update(data.id, data) : base44.entities.GeneratedMedicalDocument.create(data),
    ['patient_medical_documents']
  );

  // Prepare timeline events
  const timelineEvents = React.useMemo(() => {
    const events = [];
    
    appointments?.forEach(apt => {
      events.push({
        type: 'appointment',
        title: `${apt.type} Appointment`,
        description: apt.reason,
        date: apt.appointment_date,
        id: apt.id,
        item: apt,
        onEdit: () => openModal('appointment', apt)
      });
    });
    
    encounters?.forEach(enc => {
      events.push({
        type: 'encounter',
        title: 'Clinical Encounter',
        description: enc.chief_complaint,
        date: enc.visit_date,
        id: enc.id,
        item: enc,
        onEdit: () => openModal('encounter', enc)
      });
    });
    
    prescriptions?.forEach(rx => {
      events.push({
        type: 'prescription',
        title: `Prescribed ${rx.medication_name}`,
        description: `${rx.dosage} - ${rx.frequency}`,
        date: rx.start_date,
        id: rx.id,
        item: rx,
        onEdit: () => openModal('prescription', rx)
      });
    });
    
    // Sort by date descending
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, encounters, prescriptions]);

  const handleFormSubmit = (mutation, data, editingItem = null) => {
    const payload = {
      ...data,
      patient_id: patientId,
      patient_name: `${patient.first_name} ${patient.last_name}`
    };
    if (editingItem) payload.id = editingItem.id;
    mutation.mutate(payload);
  };

  const openModal = (type, item = null) => {
    const commonProps = { patient, onCancel: () => setModalContent(null) };
    switch (type) {
      case 'editPatient':
        setModalContent({
          title: "Edit Patient",
          form: <PatientForm patient={patient} onSubmit={(data) => updatePatientMutation.mutate({ id: patientId, data })} onCancel={() => setModalContent(null)} isSubmitting={updatePatientMutation.isPending} />
        });
        break;
      case 'appointment':
        setModalContent({
          title: item ? "Edit Appointment" : "New Appointment",
          form: <AppointmentForm appointment={item} patients={[patient]} onSubmit={(data) => handleFormSubmit(appointmentMutation, data, item)} {...commonProps} isSubmitting={appointmentMutation.isPending} />
        });
        break;
      case 'encounter':
        setModalContent({
          title: item ? "Edit Encounter" : "New Encounter",
          form: <EncounterForm note={item} patients={[patient]} onSubmit={(data) => handleFormSubmit(encounterMutation, data, item)} {...commonProps} isSubmitting={encounterMutation.isPending} />
        });
        break;
      case 'prescription':
        setModalContent({
          title: item ? "Edit Prescription" : "New Prescription",
          form: <PrescriptionForm prescription={item} onSubmit={(data) => handleFormSubmit(prescriptionMutation, data, item)} {...commonProps} isSubmitting={prescriptionMutation.isPending} />
        });
        break;
      case 'labOrder':
        setModalContent({
          title: item ? "Edit Lab Order" : "New Lab Order",
          form: <LabOrderForm labOrder={item} onSubmit={(data) => handleFormSubmit(labOrderMutation, data, item)} {...commonProps} isSubmitting={labOrderMutation.isPending} />
        });
        break;
      case 'telemedicine':
        setModalContent({
          title: item ? "Edit Telemedicine Session" : "New Telemedicine Session",
          form: <TelemedicineForm session={item} onSubmit={(data) => handleFormSubmit(telemedicineMutation, data, item)} {...commonProps} isSubmitting={telemedicineMutation.isPending} />
        });
        break;
      case 'vaccination':
        setModalContent({
          title: item ? "Edit Vaccination Record" : "New Vaccination Record",
          form: <VaccinationForm vaccination={item} onSubmit={(data) => handleFormSubmit(vaccinationMutation, data, item)} {...commonProps} isSubmitting={vaccinationMutation.isPending} />
        });
        break;
      case 'specialtyConsultation':
        setModalContent({
          title: item ? "Edit Specialty Consultation" : "New Specialty Consultation",
          form: <SpecialtyConsultationForm consultation={item} patient={patient} onSubmit={(data) => handleFormSubmit(specialtyConsultationMutation, data, item)} {...commonProps} isSubmitting={specialtyConsultationMutation.isPending} />
        });
        break;
      case 'consent':
        setModalContent({
          title: item ? "Edit Consent" : "New Consent Form",
          form: <ConsentForm consent={item} onSubmit={(data) => handleFormSubmit(consentMutation, data, item)} {...commonProps} isSubmitting={consentMutation.isPending} />
        });
        break;
      case 'surgery':
        setModalContent({
          title: item ? "Edit Surgery" : "New Surgery Record",
          form: <SurgeryForm surgery={item} onSubmit={(data) => handleFormSubmit(surgeryMutation, data, item)} {...commonProps} isSubmitting={surgeryMutation.isPending} />
        });
        break;
      case 'procedure':
        setModalContent({
          title: item ? "Edit Procedure" : "New Procedure Record",
          form: <ProcedureForm procedure={item} onSubmit={(data) => handleFormSubmit(procedureMutation, data, item)} {...commonProps} isSubmitting={procedureMutation.isPending} />
        });
        break;
      case 'dischargeSummary':
        setModalContent({
          title: item ? "Edit Discharge Summary" : "New Discharge Summary",
          form: <DischargeSummaryForm summary={item} onSubmit={(data) => handleFormSubmit(dischargeSummaryMutation, data, item)} {...commonProps} isSubmitting={dischargeSummaryMutation.isPending} />
        });
        break;
      case 'referral':
        setModalContent({
          title: item ? "Edit Referral" : "New Referral",
          form: <ReferralForm referral={item} onSubmit={(data) => handleFormSubmit(referralMutation, data, item)} {...commonProps} isSubmitting={referralMutation.isPending} />
        });
        break;
      case 'document':
        setModalContent({
          title: item ? "Edit Document" : "Upload Document",
          form: <DocumentForm document={item} onSubmit={(data) => handleFormSubmit(documentMutation, data, item)} {...commonProps} isSubmitting={documentMutation.isPending} />
        });
        break;
      case 'billing':
        setModalContent({
          title: item ? "Edit Invoice" : "New Invoice",
          form: <BillingForm billing={item} patient={patient} onSubmit={(data) => handleFormSubmit(billingMutation, data, item)} {...commonProps} isSubmitting={billingMutation.isPending} />
        });
        break;
      case 'medicalDocument':
        setModalContent({
          title: item ? "Edit Medical Document" : "Generate Medical Document",
          form: <MedicalDocumentForm document={item} patient={patient} onSubmit={(data) => handleFormSubmit(medicalDocumentMutation, data, item)} {...commonProps} isSubmitting={medicalDocumentMutation.isPending} />
        });
        break;
      default: break;
    }
  };

  const handleDragEnd = (event, info) => {
    // If dragged more than 100px to the right, close the sidebar
    if (info.offset.x > 100) {
      setSidebarOpen(false);
    }
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8 bg-slate-50">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Search className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Patient</h2>
        <p className="text-gray-600 max-w-md mb-6">
          To view a patient's workspace, please first select a patient from the main list.
        </p>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
          <a href={createPageUrl("Patients")}>
            <Search className="w-4 h-4 mr-2" />
            Go to Patients List
          </a>
        </Button>
      </div>);

  }

  if (loadingPatient) return <div className="p-8"><Skeleton className="h-screen w-full" /></div>;
  if (!patient) return <div className="p-8 text-center">Patient not found</div>;

  const age = patient.date_of_birth ? differenceInYears(new Date(), parseISO(patient.date_of_birth)) : null;

  const latestVitals = encounters && encounters.length > 0 ?
    encounters.
      filter((e) => e.vital_signs && Object.keys(e.vital_signs).length > 0).
      sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())[0]?.vital_signs :
    null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex gap-6 relative">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="flex items-start gap-4 flex-1">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="mt-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                  {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 text-sm mt-1">
                      <span>{age} years old • {patient.gender} • ID: {patient.id.slice(0, 8)}</span>
                      {patient.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {patient.phone}</span>}
                      {patient.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {patient.email}</span>}
                    </div>
                  </div>

                  {latestVitals && Object.keys(latestVitals).length > 0 &&
                    <Card className="border-2 border-blue-100 bg-blue-50/50 shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-1 mb-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-900">Latest Vital Signs</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {latestVitals.blood_pressure &&
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600">BP</span>
                              <span className="font-bold text-sm text-gray-900">{latestVitals.blood_pressure}</span>
                            </div>
                          }
                          {latestVitals.heart_rate &&
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600">HR</span>
                              <span className="font-bold text-sm text-gray-900">{latestVitals.heart_rate} bpm</span>
                            </div>
                          }
                          {latestVitals.temperature &&
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600">Temp</span>
                              <span className="font-bold text-sm text-gray-900">{latestVitals.temperature}°F</span>
                            </div>
                          }
                          {latestVitals.respiratory_rate &&
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600">RR</span>
                              <span className="font-bold text-sm text-gray-900">{latestVitals.respiratory_rate}/min</span>
                            </div>
                          }
                          {latestVitals.oxygen_saturation &&
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600">SpO₂</span>
                              <span className={cn(
                                "font-bold text-sm",
                                latestVitals.oxygen_saturation >= 95 ? "text-green-600" :
                                  latestVitals.oxygen_saturation >= 90 ? "text-yellow-600" : "text-red-600"
                              )}>
                                {latestVitals.oxygen_saturation}%
                              </span>
                            </div>
                          }
                        </div>
                      </CardContent>
                    </Card>
                  }
                </div>
              </div>
            </div>

            <div className="flex gap-1 bg-white p-1 rounded-lg border shadow-sm">
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openModal('editPatient')}><Edit className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>Edit Patient</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openModal('appointment')}><Calendar className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>New Appointment</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openModal('encounter')}><FileHeart className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>New Encounter</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openModal('prescription')}><Pill className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>New Prescription</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openModal('labOrder')}><Beaker className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>New Lab Order</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openModal('telemedicine')}><Video className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>New Telemedicine Session</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openModal('vaccination')}><Syringe className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>New Vaccination</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openModal('specialtyConsultation')}><UserCog className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent><p>New Specialty Consultation</p></TooltipContent></Tooltip>
            </div>
          </div>

          {/* Clinical Alerts */}
          <ClinicalAlerts patient={patient} />

          <Card className="border-none shadow-xl bg-white">
            <Tabs defaultValue="visits" className="w-full">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <TabsList className="inline-flex h-10 items-center justify-start rounded-xl bg-muted p-1 text-muted-foreground w-full overflow-x-auto gap-1">
                  <TabsTrigger value="timeline" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <Calendar className="w-4 h-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="visits" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <Calendar className="w-4 h-4 mr-2" />
                    Visits & Care
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <Pill className="w-4 h-4 mr-2" />
                    Orders & Rx
                  </TabsTrigger>
                  <TabsTrigger value="procedures" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-red-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <Activity className="w-4 h-4 mr-2" />
                    Procedures & Treatments
                  </TabsTrigger>
                  <TabsTrigger value="specialty" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-cyan-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <UserCog className="w-4 h-4 mr-2" />
                    Specialty Care
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-slate-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <FileSignature className="w-4 h-4 mr-2" />
                    Documents & Legal
                  </TabsTrigger>
                  <TabsTrigger value="medical-docs" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <FileText className="w-4 h-4 mr-2" />
                    Medical Docs
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-amber-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <Calculator className="w-4 h-4 mr-2" />
                    Clinical Tools
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="rounded-lg px-4 py-2 text-sm font-normal transition-all data-[state=active]:bg-background data-[state=active]:text-green-600 data-[state=active]:shadow-sm data-[state=active]:font-medium whitespace-nowrap">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Billing
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="timeline" className="p-6">
                <PatientTimeline events={timelineEvents} isLoading={loadingAppointments || loadingEncounters || loadingPrescriptions} />
              </TabsContent>

              <TabsContent value="visits" className="p-6">
                <Tabs defaultValue="appointments" className="w-full">
                  <TabsList className="w-full border-b mb-4 flex-wrap h-auto">
                    <TabsTrigger value="appointments" className="flex-1 min-w-[120px] data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Appointments
                    </TabsTrigger>
                    <TabsTrigger value="encounters" className="flex-1 min-w-[120px] data-[state=active]:border-b-2 data-[state=active]:border-green-600">
                      <FileHeart className="w-4 h-4 mr-2" />
                      Clinical Notes
                    </TabsTrigger>
                    <TabsTrigger value="telemedicine" className="flex-1 min-w-[120px] data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">
                      <Video className="w-4 h-4 mr-2" />
                      Telemedicine
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="appointments" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => openModal('appointment')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Schedule Appointment</p></TooltipContent>
                    </Tooltip>
                    <PatientAppointments appointments={appointments} isLoading={loadingAppointments} onEdit={(apt) => openModal('appointment', apt)} onStatusChange={(apt, status) => appointmentMutation.mutate({ ...apt, status })} />
                  </TabsContent>

                  <TabsContent value="encounters" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100" onClick={() => openModal('encounter')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Clinical Note</p></TooltipContent>
                    </Tooltip>
                    <PatientEncounters notes={encounters} isLoading={loadingEncounters} onEdit={(note) => openModal('encounter', note)} />
                  </TabsContent>

                  <TabsContent value="telemedicine" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100" onClick={() => openModal('telemedicine')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Schedule Telemedicine</p></TooltipContent>
                    </Tooltip>
                    <PatientTelemedicine sessions={telemedicineSessions} isLoading={loadingTelemedicine} onEdit={(session) => openModal('telemedicine', session)} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="orders" className="p-6">
                <Tabs defaultValue="prescriptions" className="w-full">
                  <TabsList className="w-full border-b mb-4">
                    <TabsTrigger value="prescriptions" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
                      <Pill className="w-4 h-4 mr-2" />
                      Prescriptions
                    </TabsTrigger>
                    <TabsTrigger value="labs" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-amber-600">
                      <Beaker className="w-4 h-4 mr-2" />
                      Lab Orders
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="prescriptions" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="absolute top-0 right-0 bg-purple-50 text-purple-600 hover:bg-purple-100" onClick={() => openModal('prescription')}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Rx
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Prescription</p></TooltipContent>
                    </Tooltip>
                    <PatientPrescriptions prescriptions={prescriptions} isLoading={loadingPrescriptions} onEdit={(rx) => openModal('prescription', rx)} onStatusChange={(rx, status) => prescriptionMutation.mutate({ ...rx, status })} />
                  </TabsContent>

                  <TabsContent value="labs" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100" onClick={() => openModal('labOrder')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Order Lab Test</p></TooltipContent>
                    </Tooltip>
                    <PatientLabOrders labOrders={labOrders} isLoading={loadingLabOrders} onEdit={(order) => openModal('labOrder', order)} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="procedures" className="p-6">
                <Tabs defaultValue="procedures" className="w-full">
                  <TabsList className="w-full border-b mb-4 flex-wrap h-auto">
                    <TabsTrigger value="procedures" className="flex-1 min-w-[100px] data-[state=active]:border-b-2 data-[state=active]:border-green-600">
                      <Activity className="w-4 h-4 mr-2" />
                      Procedures
                    </TabsTrigger>
                    <TabsTrigger value="surgeries" className="flex-1 min-w-[100px] data-[state=active]:border-b-2 data-[state=active]:border-red-600">
                      <Scissors className="w-4 h-4 mr-2" />
                      Surgeries
                    </TabsTrigger>
                    <TabsTrigger value="vaccinations" className="flex-1 min-w-[100px] data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">
                      <Syringe className="w-4 h-4 mr-2" />
                      Vaccinations
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="procedures" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100" onClick={() => openModal('procedure')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Procedure</p></TooltipContent>
                    </Tooltip>
                    <PatientProcedures procedures={procedures} isLoading={loadingProcedures} onEdit={(proc) => openModal('procedure', proc)} />
                  </TabsContent>

                  <TabsContent value="surgeries" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100" onClick={() => openModal('surgery')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Surgery</p></TooltipContent>
                    </Tooltip>
                    <PatientSurgeries surgeries={surgeries} isLoading={loadingSurgeries} onEdit={(surgery) => openModal('surgery', surgery)} />
                  </TabsContent>

                  <TabsContent value="vaccinations" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-cyan-50 text-cyan-600 hover:bg-cyan-100" onClick={() => openModal('vaccination')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Vaccination</p></TooltipContent>
                    </Tooltip>
                    <PatientVaccinations vaccinations={vaccinations} isLoading={loadingVaccinations} onEdit={(vax) => openModal('vaccination', vax)} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="specialty" className="p-6">
                <Tabs defaultValue="consultations" className="w-full">
                  <TabsList className="w-full border-b mb-4">
                    <TabsTrigger value="consultations" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">
                      <UserCog className="w-4 h-4 mr-2" />
                      Specialty Consultations
                    </TabsTrigger>
                    <TabsTrigger value="referrals" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-pink-600">
                      <ArrowUpRightSquare className="w-4 h-4 mr-2" />
                      Referrals
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="consultations" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-cyan-50 text-cyan-600 hover:bg-cyan-100" onClick={() => openModal('specialtyConsultation')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Specialty Consultation</p></TooltipContent>
                    </Tooltip>
                    <PatientSpecialtyConsultations
                      consultations={specialtyConsultations}
                      templates={consultationTemplates}
                      isLoading={loadingSpecialtyConsultations}
                      onEdit={(consult) => openModal('specialtyConsultation', consult)} />

                  </TabsContent>

                  <TabsContent value="referrals" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100" onClick={() => openModal('referral')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Referral</p></TooltipContent>
                    </Tooltip>
                    <PatientReferrals referrals={referrals} isLoading={loadingReferrals} onEdit={(ref) => openModal('referral', ref)} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="documents" className="p-6">
                <Tabs defaultValue="consents" className="w-full">
                  <TabsList className="w-full border-b mb-4 flex-wrap h-auto">
                    <TabsTrigger value="consents" className="flex-1 min-w-[100px] data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">
                      <FileSignature className="w-4 h-4 mr-2" />
                      Consents
                    </TabsTrigger>
                    <TabsTrigger value="discharge" className="flex-1 min-w-[100px] data-[state=active]:border-b-2 data-[state=active]:border-slate-600">
                      <FileText className="w-4 h-4 mr-2" />
                      Discharge Summaries
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex-1 min-w-[100px] data-[state=active]:border-b-2 data-[state=active]:border-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      Patient Files
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="consents" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100" onClick={() => openModal('consent')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Consent Form</p></TooltipContent>
                    </Tooltip>
                    <PatientConsents consents={consents} isLoading={loadingConsents} onEdit={(consent) => openModal('consent', consent)} />
                  </TabsContent>

                  <TabsContent value="discharge" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100" onClick={() => openModal('dischargeSummary')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>New Discharge Summary</p></TooltipContent>
                    </Tooltip>
                    <PatientDischargeSummaries summaries={dischargeSummaries} isLoading={loadingDischargeSummaries} onEdit={(summary) => openModal('dischargeSummary', summary)} />
                  </TabsContent>

                  <TabsContent value="files" className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100" onClick={() => openModal('document')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Upload Document</p></TooltipContent>
                    </Tooltip>
                    <PatientDocuments documents={documents} isLoading={loadingDocuments} onEdit={(doc) => openModal('document', doc)} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="medical-docs" className="p-6">
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100" onClick={() => openModal('medicalDocument')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Generate Medical Document</p></TooltipContent>
                  </Tooltip>
                  <PatientMedicalDocuments documents={medicalDocuments} isLoading={loadingMedicalDocuments} onEdit={(doc) => openModal('medicalDocument', doc)} />
                </div>
              </TabsContent>

              <TabsContent value="tools" className="p-6">
                <ClinicalCalculators />
              </TabsContent>

              <TabsContent value="billing" className="p-6">
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100" onClick={() => openModal('billing')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>New Invoice</p></TooltipContent>
                  </Tooltip>
                  <PatientBilling billings={billings} isLoading={loadingBillings} onEdit={(bill) => openModal('billing', bill)} />
                </div>
              </TabsContent>

            </Tabs>
          </Card>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 195 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : 195,
            opacity: sidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'pan-y', width: '195px' }}>

          <div className="w-full relative">
            {/* Drag handle indicator */}
            {sidebarOpen && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-r from-blue-400 to-transparent rounded-r-full opacity-50 z-10 pointer-events-none" />
            )}

            <Card className="bg-white text-card-foreground rounded-lg border shadow-xl sticky top-4">
              <CardHeader className="border-b border-gray-100 p-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-blue-600" />
                    <span className="whitespace-nowrap">Medical History</span>
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(false)}
                      className="h-6 w-6">
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-2 py-2 space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)]">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
                    <h4 className="font-semibold text-xs text-gray-700">Allergies</h4>
                  </div>
                  {patient.allergies && patient.allergies.length > 0 ?
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, idx) =>
                        <Badge key={idx} className="bg-orange-50 text-orange-700 border border-orange-200 text-[10px] px-1.5 py-0.5">
                          {allergy}
                        </Badge>
                      )}
                    </div> :
                    <p className="text-[10px] text-gray-500">No known allergies</p>
                  }
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <HeartPulse className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <h4 className="font-semibold text-xs text-gray-700">Conditions</h4>
                  </div>
                  {patient.medical_conditions && patient.medical_conditions.length > 0 ?
                    <div className="flex flex-wrap gap-1">
                      {patient.medical_conditions.map((condition, idx) =>
                        <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 text-[10px] px-1.5 py-0.5">
                          {condition}
                        </Badge>
                      )}
                    </div> :
                    <p className="text-[10px] text-gray-500">No conditions</p>
                  }
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Pill className="w-3 h-3 text-purple-500 flex-shrink-0" />
                    <h4 className="font-semibold text-xs text-gray-700">Medications</h4>
                  </div>
                  {patient.medications && patient.medications.length > 0 ?
                    <ul className="space-y-1">
                      {patient.medications.map((med, idx) =>
                        <li key={idx} className="text-[10px]">
                          <strong className="text-gray-900">{med.name}</strong>
                          <span className="text-gray-600 block">{med.dosage}</span>
                        </li>
                      )}
                    </ul> :
                    <p className="text-[10px] text-gray-500">No medications</p>
                  }
                </div>

                {patient.blood_type && patient.blood_type !== 'unknown' &&
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Activity className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <h4 className="font-semibold text-xs text-gray-700">Blood Type</h4>
                    </div>
                    <Badge className="bg-red-50 text-red-700 border border-red-200 text-[10px]">
                      {patient.blood_type}
                    </Badge>
                  </div>
                }

                {patient.emergency_contact && patient.emergency_contact.name &&
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Phone className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <h4 className="font-semibold text-xs text-gray-700">Emergency</h4>
                    </div>
                    <div className="text-[10px] space-y-0.5">
                      <p className="text-gray-900 font-medium">{patient.emergency_contact.name}</p>
                      {patient.emergency_contact.relationship &&
                        <p className="text-gray-600">{patient.emergency_contact.relationship}</p>
                      }
                      {patient.emergency_contact.phone &&
                        <p className="text-gray-600">{patient.emergency_contact.phone}</p>
                      }
                    </div>
                  </div>
                }
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {!sidebarOpen &&
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="fixed right-4 top-24 z-50 h-10 w-10 rounded-full shadow-lg bg-white hover:bg-blue-50 border-2 border-blue-200 animate-pulse">

            <ChevronLeft className="w-5 h-5 text-blue-600" />
          </Button>
        }
      </div>

      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>{modalContent?.title}</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {modalContent?.form}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>);

}
