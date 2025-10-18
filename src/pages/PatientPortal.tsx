import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientAuth from '@/components/patient-portal/PatientAuth';
import PatientDashboard from './PatientDashboard';
import PatientSession from './PatientSession';
import PatientWaiting from './PatientWaiting';

// Patient Portal Layout Component
export default function PatientPortalLayout() {
  return (
    <Routes>
      {/* Patient Authentication */}
      <Route path="/auth" element={<PatientAuth />} />

      {/* Protected Patient Routes */}
      <Route path="/dashboard" element={
        <PatientRoute>
          <PatientDashboard />
        </PatientRoute>
      } />

      {/* Session Routes */}
      <Route path="/session/:sessionId" element={
        <PatientRoute>
          <PatientSession />
        </PatientRoute>
      } />

      <Route path="/waiting" element={
        <PatientRoute>
          <PatientWaiting />
        </PatientRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/patient-portal/auth" replace />} />
      <Route path="*" element={<Navigate to="/patient-portal/auth" replace />} />
    </Routes>
  );
}

// Patient Route Protection Component
export function PatientRoute({ children }: { children: React.ReactNode }) {
  const patientSession = localStorage.getItem('patient_session');

  if (!patientSession) {
    return <Navigate to="/patient-portal/auth" replace />;
  }

  return children;
}
