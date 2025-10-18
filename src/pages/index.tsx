import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';

// Lazy load Layout component
const Layout = lazy(() => import('./Layout'));

// Lazy load all page components for better performance
const Dashboard = lazy(() => import('./Dashboard'));
const IconEnhancedDashboard = lazy(() => import('./IconEnhancedDashboard'));
const Patients = lazy(() => import('./Patients'));
const PatientProfile = lazy(() => import('./PatientProfile'));
const EnhancedPatientProfile = lazy(() => import('./EnhancedPatientProfile'));
const PatientDashboard = lazy(() => import('./PatientDashboard'));
const PatientPortal = lazy(() => import('./PatientPortal'));
const Appointments = lazy(() => import('./Appointments'));
const Telemedicine = lazy(() => import('./Telemedicine'));
const LabOrders = lazy(() => import('./LabOrders'));
const LaboratoryManagement = lazy(() => import('./LaboratoryManagement'));
const LabManagement = lazy(() => import('./LabManagement'));
const PrescriptionManagement = lazy(() => import('./PrescriptionManagement'));
const PharmacyManagement = lazy(() => import('./PharmacyManagement'));
const Referrals = lazy(() => import('./Referrals'));
const ProceduralReports = lazy(() => import('./ProceduralReports'));
const TestProceduralReports = lazy(() => import('./TestProceduralReports'));
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
const SystemTester = lazy(() => import('./SystemTester'));
const TestCRUD = lazy(() => import('./TestCRUD'));
const HelpSupport = lazy(() => import('./HelpSupport'));
const StaffMessaging = lazy(() => import('./StaffMessaging'));
const SuperAdminDashboard = lazy(() => import('./SuperAdminDashboard'));
const WorkspaceDashboard = lazy(() => import('./WorkspaceDashboard'));
const EnhancedLayout = lazy(() => import('./EnhancedLayout'));
const EnhancedPatientWorkspace = lazy(() => import('./EnhancedPatientWorkspace'));
const IconEnhancedPatientWorkspace = lazy(() => import('./IconEnhancedPatientWorkspace'));
const ClinicalPerformance = lazy(() => import('./ClinicalPerformance'));
const ComplianceCenter = lazy(() => import('./ComplianceCenter'));
const MedicationFormDemo = lazy(() => import('./MedicationFormDemo'));

// Main Pages Component with Routing
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
                    {/* Dashboard Routes */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={
                        <Suspense fallback={<Loading />}>
                            <Dashboard />
                        </Suspense>
                    } />
                    <Route path="icon-enhanced-dashboard" element={
                        <Suspense fallback={<Loading />}>
                            <IconEnhancedDashboard />
                        </Suspense>
                    } />
                    <Route path="workspace-dashboard" element={
                        <Suspense fallback={<Loading />}>
                            <WorkspaceDashboard />
                        </Suspense>
                    } />
                    <Route path="super-admin-dashboard" element={
                        <Suspense fallback={<Loading />}>
                            <SuperAdminDashboard />
                        </Suspense>
                    } />

                    {/* Patient Management Routes */}
                    <Route path="patients" element={
                        <Suspense fallback={<Loading />}>
                            <Patients />
                        </Suspense>
                    } />
                    <Route path="patient-profile/:id" element={
                        <Suspense fallback={<Loading />}>
                            <PatientProfile />
                        </Suspense>
                    } />
                    <Route path="enhanced-patient-profile/:id" element={
                        <Suspense fallback={<Loading />}>
                            <EnhancedPatientProfile />
                        </Suspense>
                    } />
                    <Route path="patient-dashboard/:id" element={
                        <Suspense fallback={<Loading />}>
                            <PatientDashboard />
                        </Suspense>
                    } />
                    <Route path="enhanced-patient-workspace/:id" element={
                        <Suspense fallback={<Loading />}>
                            <EnhancedPatientWorkspace />
                        </Suspense>
                    } />
                    <Route path="icon-enhanced-patient-workspace/:id" element={
                        <Suspense fallback={<Loading />}>
                            <IconEnhancedPatientWorkspace />
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
                    <Route path="lab-management" element={
                        <Suspense fallback={<Loading />}>
                            <LabManagement />
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
                    <Route path="test-procedural-reports" element={
                        <Suspense fallback={<Loading />}>
                            <TestProceduralReports />
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

                    {/* Development & Testing */}
                    <Route path="system-tester" element={
                        <Suspense fallback={<Loading />}>
                            <SystemTester />
                        </Suspense>
                    } />
                    <Route path="test-crud" element={
                        <Suspense fallback={<Loading />}>
                            <TestCRUD />
                        </Suspense>
                    } />
                    <Route path="medication-form-demo" element={
                        <Suspense fallback={<Loading />}>
                            <MedicationFormDemo />
                        </Suspense>
                    } />

                    {/* Enhanced Layout Routes */}
                    <Route path="enhanced-layout" element={
                        <Suspense fallback={<Loading />}>
                            <EnhancedLayout />
                        </Suspense>
                    } />

                    {/* Catch all route - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}
