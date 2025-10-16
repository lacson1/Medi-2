import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Patients from "./Patients";

import Appointments from "./Appointments";

import PatientProfile from "./PatientProfile";

import Encounters from "./Encounters";

import ConsultationTemplates from "./ConsultationTemplates";

import Billing from "./Billing";

import OrganizationSettings from "./OrganizationSettings";

import UserManagement from "./UserManagement";

import Organizations from "./Organizations";

import Profile from "./Profile";

import MedicalDocumentTemplates from "./MedicalDocumentTemplates";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Patients: Patients,
    
    Appointments: Appointments,
    
    PatientProfile: PatientProfile,
    
    Encounters: Encounters,
    
    ConsultationTemplates: ConsultationTemplates,
    
    Billing: Billing,
    
    OrganizationSettings: OrganizationSettings,
    
    UserManagement: UserManagement,
    
    Organizations: Organizations,
    
    Profile: Profile,
    
    MedicalDocumentTemplates: MedicalDocumentTemplates,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Patients" element={<Patients />} />
                
                <Route path="/Appointments" element={<Appointments />} />
                
                <Route path="/PatientProfile" element={<PatientProfile />} />
                
                <Route path="/Encounters" element={<Encounters />} />
                
                <Route path="/ConsultationTemplates" element={<ConsultationTemplates />} />
                
                <Route path="/Billing" element={<Billing />} />
                
                <Route path="/OrganizationSettings" element={<OrganizationSettings />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/Organizations" element={<Organizations />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/MedicalDocumentTemplates" element={<MedicalDocumentTemplates />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}