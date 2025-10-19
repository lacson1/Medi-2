// Comprehensive Consultation Data
// Mock data for specialists, consultation templates, and specialty consultations

export const mockSpecialists = [{
        id: 'specialist-1',
        full_name: 'Dr. Sarah Chen',
        specialty: 'Cardiology',
        email: 'sarah.chen@mediflow.com',
        phone: '+1-555-0101',
        license_number: 'MD123456',
        years_of_experience: 12,
        qualifications: ['MD', 'FACC', 'Board Certified Cardiology'],
        languages: ['English', 'Mandarin'],
        consultation_fee: 250,
        availability: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' }
        },
        bio: 'Specialized in interventional cardiology and heart failure management.',
        created_at: '2020-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'specialist-2',
        full_name: 'Dr. Michael Rodriguez',
        specialty: 'Dermatology',
        email: 'michael.rodriguez@mediflow.com',
        phone: '+1-555-0102',
        license_number: 'MD234567',
        years_of_experience: 8,
        qualifications: ['MD', 'FAAD', 'Board Certified Dermatology'],
        languages: ['English', 'Spanish'],
        consultation_fee: 200,
        availability: {
            monday: { start: '08:00', end: '16:00' },
            tuesday: { start: '08:00', end: '16:00' },
            wednesday: { start: '08:00', end: '16:00' },
            thursday: { start: '08:00', end: '16:00' },
            friday: { start: '08:00', end: '14:00' }
        },
        bio: 'Expert in cosmetic dermatology and skin cancer treatment.',
        created_at: '2021-03-10T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'specialist-3',
        full_name: 'Dr. Emily Johnson',
        specialty: 'Pediatrics',
        email: 'emily.johnson@mediflow.com',
        phone: '+1-555-0103',
        license_number: 'MD345678',
        years_of_experience: 15,
        qualifications: ['MD', 'FAAP', 'Board Certified Pediatrics'],
        languages: ['English'],
        consultation_fee: 180,
        availability: {
            monday: { start: '08:30', end: '17:30' },
            tuesday: { start: '08:30', end: '17:30' },
            wednesday: { start: '08:30', end: '17:30' },
            thursday: { start: '08:30', end: '17:30' },
            friday: { start: '08:30', end: '16:30' }
        },
        bio: 'Specialized in pediatric cardiology and developmental disorders.',
        created_at: '2019-06-01T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'specialist-4',
        full_name: 'Dr. James Wilson',
        specialty: 'Orthopedics',
        email: 'james.wilson@mediflow.com',
        phone: '+1-555-0104',
        license_number: 'MD456789',
        years_of_experience: 20,
        qualifications: ['MD', 'FAAOS', 'Board Certified Orthopedic Surgery'],
        languages: ['English'],
        consultation_fee: 300,
        availability: {
            monday: { start: '07:00', end: '18:00' },
            tuesday: { start: '07:00', end: '18:00' },
            wednesday: { start: '07:00', end: '18:00' },
            thursday: { start: '07:00', end: '18:00' },
            friday: { start: '07:00', end: '16:00' }
        },
        bio: 'Expert in sports medicine and joint replacement surgery.',
        created_at: '2018-01-01T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'specialist-5',
        full_name: 'Dr. Lisa Thompson',
        specialty: 'Neurology',
        email: 'lisa.thompson@mediflow.com',
        phone: '+1-555-0105',
        license_number: 'MD567890',
        years_of_experience: 10,
        qualifications: ['MD', 'FAAN', 'Board Certified Neurology'],
        languages: ['English', 'French'],
        consultation_fee: 280,
        availability: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' }
        },
        bio: 'Specialized in epilepsy and movement disorders.',
        created_at: '2020-09-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'specialist-6',
        full_name: 'Dr. Robert Kim',
        specialty: 'Psychiatry',
        email: 'robert.kim@mediflow.com',
        phone: '+1-555-0106',
        license_number: 'MD678901',
        years_of_experience: 14,
        qualifications: ['MD', 'FAPA', 'Board Certified Psychiatry'],
        languages: ['English', 'Korean'],
        consultation_fee: 220,
        availability: {
            monday: { start: '10:00', end: '18:00' },
            tuesday: { start: '10:00', end: '18:00' },
            wednesday: { start: '10:00', end: '18:00' },
            thursday: { start: '10:00', end: '18:00' },
            friday: { start: '10:00', end: '16:00' }
        },
        bio: 'Specialized in mood disorders and psychotherapy.',
        created_at: '2019-11-20T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    }
];

export const mockConsultationTemplates = [{
        id: 'template-1',
        name: 'Cardiology Initial Consultation',
        specialty: 'cardiology',
        description: 'Comprehensive cardiovascular assessment template',
        template_content: 'Cardiology consultation template with comprehensive cardiovascular assessment',
        is_active: true,
        variables: [{
                name: 'chief_complaint',
                label: 'Chief Complaint',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'cardiac_history',
                label: 'Cardiac History',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'risk_factors',
                label: 'Cardiovascular Risk Factors',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'medications',
                label: 'Current Medications',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'physical_exam',
                label: 'Cardiovascular Physical Exam',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'assessment',
                label: 'Cardiovascular Assessment',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'plan',
                label: 'Treatment Plan',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'follow_up',
                label: 'Follow-up Instructions',
                type: 'text',
                required: false,
                default_value: ''
            }
        ],
        created_at: '2023-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'template-2',
        name: 'Dermatology Skin Assessment',
        specialty: 'dermatology',
        description: 'Comprehensive skin examination and assessment template',
        template_content: 'Dermatology consultation template for skin conditions and assessments',
        is_active: true,
        variables: [{
                name: 'skin_concern',
                label: 'Primary Skin Concern',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'duration',
                label: 'Duration of Condition',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'skin_type',
                label: 'Skin Type',
                type: 'select',
                required: true,
                options: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'],
                default_value: ''
            },
            {
                name: 'current_products',
                label: 'Current Skincare Products',
                type: 'text',
                required: false,
                default_value: ''
            },
            {
                name: 'skin_exam',
                label: 'Skin Examination Findings',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'diagnosis',
                label: 'Dermatological Diagnosis',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'treatment_plan',
                label: 'Treatment Plan',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'preventive_care',
                label: 'Preventive Care Instructions',
                type: 'text',
                required: false,
                default_value: ''
            }
        ],
        created_at: '2023-02-10T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'template-3',
        name: 'Pediatric Growth Assessment',
        specialty: 'pediatrics',
        description: 'Comprehensive pediatric growth and development assessment',
        template_content: 'Pediatric consultation template for growth and development monitoring',
        is_active: true,
        variables: [{
                name: 'age',
                label: 'Patient Age',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'growth_concerns',
                label: 'Growth Concerns',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'developmental_milestones',
                label: 'Developmental Milestones',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'height_weight',
                label: 'Height and Weight Measurements',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'vaccination_status',
                label: 'Vaccination Status',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'family_history',
                label: 'Family History',
                type: 'text',
                required: false,
                default_value: ''
            },
            {
                name: 'assessment',
                label: 'Growth Assessment',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'recommendations',
                label: 'Recommendations',
                type: 'text',
                required: true,
                default_value: ''
            }
        ],
        created_at: '2023-03-05T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'template-4',
        name: 'Orthopedic Joint Assessment',
        specialty: 'orthopedics',
        description: 'Comprehensive joint and musculoskeletal assessment',
        template_content: 'Orthopedic consultation template for joint and musculoskeletal conditions',
        is_active: true,
        variables: [{
                name: 'joint_pain',
                label: 'Joint Pain Location',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'pain_severity',
                label: 'Pain Severity (1-10)',
                type: 'number',
                required: true,
                default_value: ''
            },
            {
                name: 'pain_duration',
                label: 'Duration of Pain',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'range_of_motion',
                label: 'Range of Motion Assessment',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'imaging_results',
                label: 'Imaging Results',
                type: 'text',
                required: false,
                default_value: ''
            },
            {
                name: 'functional_assessment',
                label: 'Functional Assessment',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'diagnosis',
                label: 'Orthopedic Diagnosis',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'treatment_options',
                label: 'Treatment Options',
                type: 'text',
                required: true,
                default_value: ''
            }
        ],
        created_at: '2023-04-12T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'template-5',
        name: 'Neurology Cognitive Assessment',
        specialty: 'neurology',
        description: 'Comprehensive neurological and cognitive assessment',
        template_content: 'Neurology consultation template for cognitive and neurological assessments',
        is_active: true,
        variables: [{
                name: 'neurological_symptoms',
                label: 'Neurological Symptoms',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'cognitive_function',
                label: 'Cognitive Function Assessment',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'neurological_exam',
                label: 'Neurological Examination',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'imaging_studies',
                label: 'Imaging Studies',
                type: 'text',
                required: false,
                default_value: ''
            },
            {
                name: 'lab_results',
                label: 'Laboratory Results',
                type: 'text',
                required: false,
                default_value: ''
            },
            {
                name: 'neurological_diagnosis',
                label: 'Neurological Diagnosis',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'treatment_plan',
                label: 'Treatment Plan',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'monitoring_plan',
                label: 'Monitoring Plan',
                type: 'text',
                required: false,
                default_value: ''
            }
        ],
        created_at: '2023-05-20T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 'template-6',
        name: 'Psychiatry Mental Health Assessment',
        specialty: 'psychiatry',
        description: 'Comprehensive mental health and psychiatric assessment',
        template_content: 'Psychiatry consultation template for mental health assessments',
        is_active: true,
        variables: [{
                name: 'presenting_problem',
                label: 'Presenting Problem',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'mental_status_exam',
                label: 'Mental Status Examination',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'psychiatric_history',
                label: 'Psychiatric History',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'substance_use',
                label: 'Substance Use History',
                type: 'text',
                required: false,
                default_value: ''
            },
            {
                name: 'social_history',
                label: 'Social History',
                type: 'text',
                required: false,
                default_value: ''
            },
            {
                name: 'psychiatric_diagnosis',
                label: 'Psychiatric Diagnosis',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'treatment_recommendations',
                label: 'Treatment Recommendations',
                type: 'text',
                required: true,
                default_value: ''
            },
            {
                name: 'safety_assessment',
                label: 'Safety Assessment',
                type: 'text',
                required: true,
                default_value: ''
            }
        ],
        created_at: '2023-06-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    }
];

export const mockSpecialtyConsultations = [{
        id: 'consultation-1',
        patient_id: 'patient-1',
        patient_name: 'John Doe',
        specialist_id: 'specialist-1',
        specialist_name: 'Dr. Sarah Chen',
        template_id: 'template-1',
        template_name: 'Cardiology Initial Consultation',
        consultation_date: '2024-01-15T10:00:00Z',
        status: 'completed',
        summary: 'Patient presented with chest pain and shortness of breath. Comprehensive cardiovascular assessment completed.',
        consultation_data: {
            chief_complaint: 'Chest pain and shortness of breath for 2 weeks',
            cardiac_history: 'No previous cardiac events',
            risk_factors: 'Hypertension, family history of CAD',
            medications: 'Lisinopril 10mg daily',
            physical_exam: 'Normal heart sounds, no murmurs',
            assessment: 'Possible angina, recommend stress test',
            plan: 'Schedule stress test, continue current medications',
            follow_up: 'Follow up in 2 weeks'
        },
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T11:30:00Z'
    },
    {
        id: 'consultation-2',
        patient_id: 'patient-2',
        patient_name: 'Jane Smith',
        specialist_id: 'specialist-2',
        specialist_name: 'Dr. Michael Rodriguez',
        template_id: 'template-2',
        template_name: 'Dermatology Skin Assessment',
        consultation_date: '2024-01-16T14:00:00Z',
        status: 'completed',
        summary: 'Patient concerned about skin changes and mole appearance. Full skin examination performed.',
        consultation_data: {
            skin_concern: 'New mole on back, skin changes',
            duration: '3 months',
            skin_type: 'Normal',
            current_products: 'Basic cleanser and moisturizer',
            skin_exam: 'Irregular mole noted, recommend biopsy',
            diagnosis: 'Atypical mole, rule out melanoma',
            treatment_plan: 'Excisional biopsy scheduled',
            preventive_care: 'Regular skin checks, sun protection'
        },
        created_at: '2024-01-16T14:00:00Z',
        updated_at: '2024-01-16T15:00:00Z'
    },
    {
        id: 'consultation-3',
        patient_id: 'patient-3',
        patient_name: 'Mike Johnson',
        specialist_id: 'specialist-4',
        specialist_name: 'Dr. James Wilson',
        template_id: 'template-4',
        template_name: 'Orthopedic Joint Assessment',
        consultation_date: '2024-01-17T09:00:00Z',
        status: 'pending',
        summary: 'Patient with knee pain and limited mobility. Orthopedic assessment in progress.',
        consultation_data: {
            joint_pain: 'Right knee pain',
            pain_severity: '7',
            pain_duration: '6 weeks',
            range_of_motion: 'Limited flexion and extension',
            imaging_results: 'X-ray shows mild arthritis',
            functional_assessment: 'Difficulty with stairs and walking',
            diagnosis: 'Osteoarthritis of right knee',
            treatment_options: 'Physical therapy, NSAIDs, possible injection'
        },
        created_at: '2024-01-17T09:00:00Z',
        updated_at: '2024-01-17T09:00:00Z'
    }
];

// Helper functions
export const getSpecialistsBySpecialty = (specialty) => {
    return mockSpecialists.filter(specialist =>
        specialist.specialty.toLowerCase() === specialty.toLowerCase()
    );
};

export const getTemplatesBySpecialty = (specialty) => {
    return mockConsultationTemplates.filter(template =>
        template.specialty.toLowerCase() === specialty.toLowerCase()
    );
};

export const getConsultationsByPatient = (patientId) => {
    return mockSpecialtyConsultations.filter(consultation =>
        consultation.patient_id === patientId
    );
};

export const getConsultationsBySpecialist = (specialistId) => {
    return mockSpecialtyConsultations.filter(consultation =>
        consultation.specialist_id === specialistId
    );
};

export const getConsultationById = (consultationId) => {
    return mockSpecialtyConsultations.find(consultation =>
        consultation.id === consultationId
    );
};

export const getSpecialistById = (specialistId) => {
    return mockSpecialists.find(specialist =>
        specialist.id === specialistId
    );
};

export const getTemplateById = (templateId) => {
    return mockConsultationTemplates.find(template =>
        template.id === templateId
    );
};