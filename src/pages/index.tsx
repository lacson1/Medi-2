import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';

// Lazy load Layout component
const Layout = lazy(() => import('./Layout'));

// Lazy load core page components
const Dashboard = lazy(() => import('./Dashboard'));
const PatientWorkspace = lazy(() => import('./PatientWorkspace'));
const StreamlinedPatientWorkspace = lazy(() => import('@/components/patients/StreamlinedPatientWorkspace'));
const Patients = lazy(() => import('./Patients'));
const PatientPortal = lazy(() => import('./PatientPortal'));
const Appointments = lazy(() => import('./Appointments'));
const Telemedicine = lazy(() => import('./Telemedicine'));
const LabOrders = lazy(() => import('./LabOrders'));
const LaboratoryManagement = lazy(() => import('./LaboratoryManagement'));
const PrescriptionManagement = lazy(() => import('./PrescriptionManagement'));
const PharmacyManagement = lazy(() => import('./PharmacyManagement'));
const Referrals = lazy(() => import('./Referrals'));
const ProceduralReports = lazy(() => import('./ProceduralReports'));
const Billing = lazy(() => import('./Billing'));
const FinancialAnalytics = lazy(() => import('./FinancialAnalytics'));
const ConsultationTemplates = lazy(() => import('./ConsultationTemplates'));
const MedicalDocumentTemplates = lazy(() => import('./MedicalDocumentTemplates'));
const UserManagement = lazy(() => import('./UserManagement'));
const Organizations = lazy(() => import('./Organizations'));
const OrganizationSettings = lazy(() => import('./OrganizationSettings'));
const Settings = lazy(() => import('./Settings'));
const Profile = lazy(() => import('./Profile'));
const Login = lazy(() => import('./Login'));
const HelpSupport = lazy(() => import('./HelpSupport'));
const StaffMessaging = lazy(() => import('./StaffMessaging'));
const ClinicalPerformance = lazy(() => import('./ClinicalPerformance'));
const ComplianceCenter = lazy(() => import('./ComplianceCenter'));
const ConsultationManagement = lazy(() => import('./ConsultationManagement'));
const SystemTester = lazy(() => import('./SystemTester'));
const AutocompleteDemoPage = lazy(() => import('./AutocompleteDemoPage'));
const DialogAlertTestPage = lazy(() => import('./DialogAlertTestPage'));

// Main Pages Component with Simplified Routing
export default function Pages() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                    <Suspense fallback={<Loading />}>
                        <Login />
                    </Suspense>
                } />

                {/* Patient Portal Routes */}
                <Route path="/patient-portal/*" element={
                    <Suspense fallback={<Loading />}>
                        <PatientPortal />
                    </Suspense>
                } />

                {/* Protected Routes */}
                <Route path="/" element={
                    <ProtectedRoute route={{}}>
                        <Suspense fallback={<Loading />}>
                            <Layout />
                        </Suspense>
                    </ProtectedRoute>
                }>
                    {/* Dashboard - Unified with view modes */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={
                        <Suspense fallback={<Loading />}>
                            <Dashboard />
                        </Suspense>
                    } />

                    {/* Patient Management - Unified with view modes */}
                    <Route path="patients" element={
                        <Suspense fallback={<Loading />}>
                            <Patients />
                        </Suspense>
                    } />
                    <Route path="patients/:id" element={
                        <Suspense fallback={<Loading />}>
                            <StreamlinedPatientWorkspace />
                        </Suspense>
                    } />
                    <Route path="patients/:id/legacy" element={
                        <Suspense fallback={<Loading />}>
                            <PatientWorkspace />
                        </Suspense>
                    } />

                    {/* Clinical Routes */}
                    <Route path="appointments" element={
                        <Suspense fallback={<Loading />}>
                            <Appointments />
                        </Suspense>
                    } />
                    <Route path="telemedicine" element={
                        <Suspense fallback={<Loading />}>
                            <Telemedicine />
                        </Suspense>
                    } />
                    <Route path="lab-orders" element={
                        <Suspense fallback={<Loading />}>
                            <LabOrders />
                        </Suspense>
                    } />
                    <Route path="laboratory-management" element={
                        <Suspense fallback={<Loading />}>
                            <LaboratoryManagement />
                        </Suspense>
                    } />
                    <Route path="prescription-management" element={
                        <Suspense fallback={<Loading />}>
                            <PrescriptionManagement />
                        </Suspense>
                    } />
                    <Route path="pharmacy-management" element={
                        <Suspense fallback={<Loading />}>
                            <PharmacyManagement />
                        </Suspense>
                    } />
                    <Route path="referrals" element={
                        <Suspense fallback={<Loading />}>
                            <Referrals />
                        </Suspense>
                    } />
                    <Route path="procedural-reports" element={
                        <Suspense fallback={<Loading />}>
                            <ProceduralReports />
                        </Suspense>
                    } />

                    {/* Financial Routes */}
                    <Route path="billing" element={
                        <Suspense fallback={<Loading />}>
                            <Billing />
                        </Suspense>
                    } />
                    <Route path="financial-analytics" element={
                        <Suspense fallback={<Loading />}>
                            <FinancialAnalytics />
                        </Suspense>
                    } />

                    {/* Templates & Documents */}
                    <Route path="consultation-templates" element={
                        <Suspense fallback={<Loading />}>
                            <ConsultationTemplates />
                        </Suspense>
                    } />
                    <Route path="medical-document-templates" element={
                        <Suspense fallback={<Loading />}>
                            <MedicalDocumentTemplates />
                        </Suspense>
                    } />

                    {/* Administration Routes */}
                    <Route path="user-management" element={
                        <Suspense fallback={<Loading />}>
                            <UserManagement />
                        </Suspense>
                    } />
                    <Route path="organizations" element={
                        <Suspense fallback={<Loading />}>
                            <Organizations />
                        </Suspense>
                    } />
                    <Route path="organization-settings" element={
                        <Suspense fallback={<Loading />}>
                            <OrganizationSettings />
                        </Suspense>
                    } />
                    <Route path="settings" element={
                        <Suspense fallback={<Loading />}>
                            <Settings />
                        </Suspense>
                    } />
                    <Route path="profile" element={
                        <Suspense fallback={<Loading />}>
                            <Profile />
                        </Suspense>
                    } />

                    {/* Analytics & Performance */}
                    <Route path="clinical-performance" element={
                        <Suspense fallback={<Loading />}>
                            <ClinicalPerformance />
                        </Suspense>
                    } />
                    <Route path="compliance-center" element={
                        <Suspense fallback={<Loading />}>
                            <ComplianceCenter />
                        </Suspense>
                    } />

                    {/* Support & Communication */}
                    <Route path="help-support" element={
                        <Suspense fallback={<Loading />}>
                            <HelpSupport />
                        </Suspense>
                    } />
                    <Route path="staff-messaging" element={
                        <Suspense fallback={<Loading />}>
                            <StaffMessaging />
                        </Suspense>
                    } />

                    {/* System Testing */}
                    <Route path="system-tester" element={
                        <Suspense fallback={<Loading />}>
                            <SystemTester />
                        </Suspense>
                    } />
                    <Route path="consultation-management" element={
                        <Suspense fallback={<Loading />}>
                            <ConsultationManagement />
                        </Suspense>
                    } />
                    <Route path="autocomplete-demo" element={
                        <Suspense fallback={<Loading />}>
                            <AutocompleteDemoPage />
                        </Suspense>
                    } />
                    <Route path="dialog-alert-test" element={
                        <Suspense fallback={<Loading />}>
                            <DialogAlertTestPage />
                        </Suspense>
                    } />

                    {/* Catch all route - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}