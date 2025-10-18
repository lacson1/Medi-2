// Document Type Field Suggestions
// This file contains suggested input fields for each document type

export const DOCUMENT_TYPE_FIELD_SUGGESTIONS = {
    sick_note: {
        name: "Sick Note",
        description: "Medical certificate for sick leave",
        icon: "🏥",
        color: "bg-red-100 text-red-800",
        suggestedFields: [{
                name: "diagnosis",
                title: "Diagnosis",
                type: "text",
                required: true,
                placeholder: "Enter the medical condition",
                description: "Primary diagnosis or reason for sick leave"
            },
            {
                name: "duration",
                title: "Duration of Leave",
                type: "enum",
                required: true,
                enumOptions: "1 day, 2-3 days, 1 week, 2 weeks, 1 month, Other",
                description: "Recommended duration of sick leave"
            },
            {
                name: "valid_from",
                title: "Valid From",
                type: "string",
                required: true,
                placeholder: "YYYY-MM-DD",
                description: "Start date of sick leave"
            },
            {
                name: "valid_until",
                title: "Valid Until",
                type: "string",
                required: true,
                placeholder: "YYYY-MM-DD",
                description: "End date of sick leave"
            },
            {
                name: "return_date",
                title: "Expected Return Date",
                type: "string",
                required: false,
                placeholder: "YYYY-MM-DD",
                description: "When patient can return to work/school"
            },
            {
                name: "restrictions",
                title: "Activity Restrictions",
                type: "text",
                required: false,
                placeholder: "Any activity limitations",
                description: "Specific restrictions or recommendations"
            }
        ]
    },

    medical_letter: {
        name: "Medical Letter",
        description: "General medical correspondence",
        icon: "📋",
        color: "bg-blue-100 text-blue-800",
        suggestedFields: [{
                name: "recipient",
                title: "Recipient",
                type: "string",
                required: true,
                placeholder: "Name of recipient",
                description: "Who the letter is addressed to"
            },
            {
                name: "recipient_title",
                title: "Recipient Title",
                type: "string",
                required: false,
                placeholder: "Mr./Ms./Dr./Organization",
                description: "Title or position of recipient"
            },
            {
                name: "subject",
                title: "Subject",
                type: "string",
                required: true,
                placeholder: "Brief subject line",
                description: "Main topic of the letter"
            },
            {
                name: "medical_history",
                title: "Relevant Medical History",
                type: "text",
                required: false,
                placeholder: "Brief medical history relevant to this letter",
                description: "Key medical information for context"
            },
            {
                name: "current_condition",
                title: "Current Condition",
                type: "text",
                required: true,
                placeholder: "Describe current medical condition",
                description: "Patient's current medical status"
            },
            {
                name: "recommendations",
                title: "Recommendations",
                type: "text",
                required: false,
                placeholder: "Medical recommendations or next steps",
                description: "Suggested actions or treatments"
            },
            {
                name: "follow_up",
                title: "Follow-up Required",
                type: "boolean",
                required: false,
                description: "Whether follow-up is needed"
            }
        ]
    },

    insurance_letter: {
        name: "Insurance Letter",
        description: "Letter for insurance claims or coverage",
        icon: "📄",
        color: "bg-purple-100 text-purple-800",
        suggestedFields: [{
                name: "insurance_company",
                title: "Insurance Company",
                type: "string",
                required: true,
                placeholder: "Name of insurance company",
                description: "Insurance provider name"
            },
            {
                name: "policy_number",
                title: "Policy Number",
                type: "string",
                required: false,
                placeholder: "Policy/Claim number",
                description: "Insurance policy or claim reference"
            },
            {
                name: "claim_type",
                title: "Type of Claim",
                type: "enum",
                required: true,
                enumOptions: "Medical treatment, Prescription, Procedure, Consultation, Emergency, Other",
                description: "Nature of the insurance claim"
            },
            {
                name: "treatment_date",
                title: "Treatment Date",
                type: "string",
                required: true,
                placeholder: "YYYY-MM-DD",
                description: "Date of medical treatment"
            },
            {
                name: "diagnosis_code",
                title: "Diagnosis Code (ICD-10)",
                type: "string",
                required: false,
                placeholder: "ICD-10 code",
                description: "Medical diagnosis code"
            },
            {
                name: "procedure_code",
                title: "Procedure Code (CPT)",
                type: "string",
                required: false,
                placeholder: "CPT code",
                description: "Medical procedure code"
            },
            {
                name: "medical_necessity",
                title: "Medical Necessity",
                type: "text",
                required: true,
                placeholder: "Explain why treatment was medically necessary",
                description: "Justification for medical necessity"
            },
            {
                name: "estimated_cost",
                title: "Estimated Cost",
                type: "number",
                required: false,
                placeholder: "0.00",
                description: "Estimated treatment cost"
            }
        ]
    },

    disability_certificate: {
        name: "Disability Certificate",
        description: "Certificate for disability benefits or accommodations",
        icon: "♿",
        color: "bg-orange-100 text-orange-800",
        suggestedFields: [{
                name: "disability_type",
                title: "Type of Disability",
                type: "enum",
                required: true,
                enumOptions: "Physical, Mental, Sensory, Cognitive, Temporary, Permanent, Other",
                description: "Category of disability"
            },
            {
                name: "severity_level",
                title: "Severity Level",
                type: "enum",
                required: true,
                enumOptions: "Mild, Moderate, Severe, Profound",
                description: "Level of disability impact"
            },
            {
                name: "functional_limitations",
                title: "Functional Limitations",
                type: "text",
                required: true,
                placeholder: "Describe specific limitations",
                description: "How disability affects daily functioning"
            },
            {
                name: "accommodations_needed",
                title: "Required Accommodations",
                type: "text",
                required: false,
                placeholder: "List necessary accommodations",
                description: "Workplace or educational accommodations"
            },
            {
                name: "duration_of_disability",
                title: "Expected Duration",
                type: "enum",
                required: true,
                enumOptions: "Temporary (less than 6 months), Temporary (6-12 months), Temporary (1-2 years), Permanent, Unknown",
                description: "How long disability is expected to last"
            },
            {
                name: "review_date",
                title: "Next Review Date",
                type: "string",
                required: false,
                placeholder: "YYYY-MM-DD",
                description: "When disability should be reassessed"
            },
            {
                name: "work_capacity",
                title: "Work Capacity",
                type: "enum",
                required: false,
                enumOptions: "Full capacity, Modified duties, Part-time only, Unable to work",
                description: "Current work capability"
            }
        ]
    },

    fitness_certificate: {
        name: "Fitness Certificate",
        description: "Certificate confirming fitness for specific activities",
        icon: "💪",
        color: "bg-green-100 text-green-800",
        suggestedFields: [{
                name: "activity_type",
                title: "Activity Type",
                type: "enum",
                required: true,
                enumOptions: "Work, Sports, Exercise, Driving, Travel, School, Other",
                description: "Type of activity patient is fit for"
            },
            {
                name: "fitness_level",
                title: "Fitness Level",
                type: "enum",
                required: true,
                enumOptions: "Fully fit, Fit with restrictions, Temporarily unfit, Permanently unfit",
                description: "Level of fitness for the activity"
            },
            {
                name: "restrictions",
                title: "Activity Restrictions",
                type: "text",
                required: false,
                placeholder: "Any limitations or restrictions",
                description: "Specific limitations on activities"
            },
            {
                name: "valid_from",
                title: "Valid From",
                type: "string",
                required: true,
                placeholder: "YYYY-MM-DD",
                description: "Certificate validity start date"
            },
            {
                name: "valid_until",
                title: "Valid Until",
                type: "string",
                required: true,
                placeholder: "YYYY-MM-DD",
                description: "Certificate validity end date"
            },
            {
                name: "medical_clearance",
                title: "Medical Clearance Required",
                type: "boolean",
                required: false,
                description: "Whether additional medical clearance is needed"
            },
            {
                name: "follow_up_exam",
                title: "Follow-up Examination",
                type: "string",
                required: false,
                placeholder: "YYYY-MM-DD",
                description: "Date for next fitness assessment"
            }
        ]
    },

    referral_letter: {
        name: "Referral Letter",
        description: "Letter referring patient to another specialist",
        icon: "↗️",
        color: "bg-cyan-100 text-cyan-800",
        suggestedFields: [{
                name: "referring_specialist",
                title: "Referring Specialist",
                type: "string",
                required: true,
                placeholder: "Name of referring doctor",
                description: "Doctor making the referral"
            },
            {
                name: "referring_specialty",
                title: "Referring Specialty",
                type: "string",
                required: true,
                placeholder: "e.g., Cardiology, Neurology",
                description: "Medical specialty of referring doctor"
            },
            {
                name: "referred_to",
                title: "Referred To",
                type: "string",
                required: true,
                placeholder: "Name of receiving specialist",
                description: "Doctor or clinic receiving the referral"
            },
            {
                name: "referred_specialty",
                title: "Referred Specialty",
                type: "string",
                required: true,
                placeholder: "e.g., Cardiology, Neurology",
                description: "Medical specialty of receiving doctor"
            },
            {
                name: "reason_for_referral",
                title: "Reason for Referral",
                type: "text",
                required: true,
                placeholder: "Why is this referral being made?",
                description: "Primary reason for the referral"
            },
            {
                name: "current_symptoms",
                title: "Current Symptoms",
                type: "text",
                required: false,
                placeholder: "Describe current symptoms",
                description: "Patient's current symptoms"
            },
            {
                name: "relevant_history",
                title: "Relevant Medical History",
                type: "text",
                required: false,
                placeholder: "Key medical history",
                description: "Important medical background"
            },
            {
                name: "urgency_level",
                title: "Urgency Level",
                type: "enum",
                required: true,
                enumOptions: "Routine, Urgent, Emergency",
                description: "How quickly referral is needed"
            },
            {
                name: "specific_questions",
                title: "Specific Questions",
                type: "text",
                required: false,
                placeholder: "Questions for the specialist",
                description: "Specific questions or concerns"
            }
        ]
    },

    prescription_letter: {
        name: "Prescription Letter",
        description: "Letter for prescription authorization or changes",
        icon: "💊",
        color: "bg-indigo-100 text-indigo-800",
        suggestedFields: [{
                name: "medication_name",
                title: "Medication Name",
                type: "string",
                required: true,
                placeholder: "Name of medication",
                description: "Prescribed medication"
            },
            {
                name: "dosage",
                title: "Dosage",
                type: "string",
                required: true,
                placeholder: "e.g., 10mg, 2 tablets",
                description: "Medication dosage"
            },
            {
                name: "frequency",
                title: "Frequency",
                type: "enum",
                required: true,
                enumOptions: "Once daily, Twice daily, Three times daily, Four times daily, As needed, Other",
                description: "How often to take medication"
            },
            {
                name: "duration",
                title: "Duration",
                type: "string",
                required: true,
                placeholder: "e.g., 7 days, 1 month",
                description: "How long to take medication"
            },
            {
                name: "indication",
                title: "Indication",
                type: "text",
                required: true,
                placeholder: "What is this medication for?",
                description: "Medical condition being treated"
            },
            {
                name: "contraindications",
                title: "Contraindications",
                type: "text",
                required: false,
                placeholder: "Any contraindications noted",
                description: "Medical conditions that prevent use"
            },
            {
                name: "side_effects",
                title: "Potential Side Effects",
                type: "text",
                required: false,
                placeholder: "Common side effects to watch for",
                description: "Expected side effects"
            },
            {
                name: "refills",
                title: "Number of Refills",
                type: "number",
                required: false,
                placeholder: "0",
                description: "How many refills allowed"
            }
        ]
    },

    medical_report: {
        name: "Medical Report",
        description: "Comprehensive medical assessment report",
        icon: "📊",
        color: "bg-slate-100 text-slate-800",
        suggestedFields: [{
                name: "report_type",
                title: "Report Type",
                type: "enum",
                required: true,
                enumOptions: "Initial Assessment, Follow-up, Discharge, Progress, Comprehensive, Other",
                description: "Type of medical report"
            },
            {
                name: "assessment_date",
                title: "Assessment Date",
                type: "string",
                required: true,
                placeholder: "YYYY-MM-DD",
                description: "Date of medical assessment"
            },
            {
                name: "chief_complaint",
                title: "Chief Complaint",
                type: "text",
                required: true,
                placeholder: "Primary reason for visit",
                description: "Main reason patient sought medical care"
            },
            {
                name: "history_of_present_illness",
                title: "History of Present Illness",
                type: "text",
                required: true,
                placeholder: "Detailed history of current condition",
                description: "Detailed account of current medical issue"
            },
            {
                name: "past_medical_history",
                title: "Past Medical History",
                type: "text",
                required: false,
                placeholder: "Previous medical conditions",
                description: "Patient's medical history"
            },
            {
                name: "medications",
                title: "Current Medications",
                type: "text",
                required: false,
                placeholder: "List current medications",
                description: "Medications patient is currently taking"
            },
            {
                name: "allergies",
                title: "Allergies",
                type: "text",
                required: false,
                placeholder: "Known allergies",
                description: "Patient's known allergies"
            },
            {
                name: "physical_examination",
                title: "Physical Examination",
                type: "text",
                required: true,
                placeholder: "Physical exam findings",
                description: "Results of physical examination"
            },
            {
                name: "diagnosis",
                title: "Diagnosis",
                type: "text",
                required: true,
                placeholder: "Medical diagnosis",
                description: "Primary and secondary diagnoses"
            },
            {
                name: "treatment_plan",
                title: "Treatment Plan",
                type: "text",
                required: true,
                placeholder: "Recommended treatment",
                description: "Planned treatment approach"
            },
            {
                name: "follow_up",
                title: "Follow-up Instructions",
                type: "text",
                required: false,
                placeholder: "Follow-up care instructions",
                description: "Instructions for ongoing care"
            }
        ]
    },

    discharge_summary: {
        name: "Discharge Summary",
        description: "Summary of hospital stay and discharge instructions",
        icon: "🏥",
        color: "bg-pink-100 text-pink-800",
        suggestedFields: [{
                name: "admission_date",
                title: "Admission Date",
                type: "string",
                required: true,
                placeholder: "YYYY-MM-DD",
                description: "Date patient was admitted"
            },
            {
                name: "discharge_date",
                title: "Discharge Date",
                type: "string",
                required: true,
                placeholder: "YYYY-MM-DD",
                description: "Date patient was discharged"
            },
            {
                name: "admission_diagnosis",
                title: "Admission Diagnosis",
                type: "text",
                required: true,
                placeholder: "Primary diagnosis on admission",
                description: "Main diagnosis when admitted"
            },
            {
                name: "discharge_diagnosis",
                title: "Discharge Diagnosis",
                type: "text",
                required: true,
                placeholder: "Final diagnosis at discharge",
                description: "Final diagnosis at time of discharge"
            },
            {
                name: "procedures_performed",
                title: "Procedures Performed",
                type: "text",
                required: false,
                placeholder: "List of procedures during stay",
                description: "Medical procedures performed"
            },
            {
                name: "medications_discharge",
                title: "Discharge Medications",
                type: "text",
                required: true,
                placeholder: "Medications prescribed at discharge",
                description: "Medications patient should take at home"
            },
            {
                name: "activity_restrictions",
                title: "Activity Restrictions",
                type: "text",
                required: false,
                placeholder: "Any activity limitations",
                description: "Restrictions on physical activity"
            },
            {
                name: "follow_up_appointments",
                title: "Follow-up Appointments",
                type: "text",
                required: false,
                placeholder: "Scheduled follow-up visits",
                description: "Upcoming medical appointments"
            },
            {
                name: "warning_signs",
                title: "Warning Signs",
                type: "text",
                required: false,
                placeholder: "Signs to watch for",
                description: "Symptoms that require immediate attention"
            },
            {
                name: "care_instructions",
                title: "Home Care Instructions",
                type: "text",
                required: true,
                placeholder: "Detailed care instructions",
                description: "Instructions for home care"
            }
        ]
    },

    consultation_note: {
        name: "Consultation Note",
        description: "Note from specialist consultation",
        icon: "📝",
        color: "bg-yellow-100 text-yellow-800",
        suggestedFields: [{
                name: "consultation_type",
                title: "Consultation Type",
                type: "enum",
                required: true,
                enumOptions: "Initial Consultation, Follow-up, Second Opinion, Urgent Consultation, Other",
                description: "Type of consultation"
            },
            {
                name: "referring_physician",
                title: "Referring Physician",
                type: "string",
                required: false,
                placeholder: "Name of referring doctor",
                description: "Doctor who made the referral"
            },
            {
                name: "consultation_reason",
                title: "Reason for Consultation",
                type: "text",
                required: true,
                placeholder: "Why was consultation requested?",
                description: "Primary reason for the consultation"
            },
            {
                name: "clinical_findings",
                title: "Clinical Findings",
                type: "text",
                required: true,
                placeholder: "Key clinical findings",
                description: "Important clinical observations"
            },
            {
                name: "assessment",
                title: "Clinical Assessment",
                type: "text",
                required: true,
                placeholder: "Clinical assessment and impression",
                description: "Specialist's clinical assessment"
            },
            {
                name: "recommendations",
                title: "Recommendations",
                type: "text",
                required: true,
                placeholder: "Treatment recommendations",
                description: "Specialist's recommendations"
            },
            {
                name: "additional_tests",
                title: "Additional Tests Needed",
                type: "text",
                required: false,
                placeholder: "Recommended diagnostic tests",
                description: "Further testing recommendations"
            },
            {
                name: "follow_up_plan",
                title: "Follow-up Plan",
                type: "text",
                required: false,
                placeholder: "Planned follow-up care",
                description: "Follow-up care plan"
            }
        ]
    },

    other: {
        name: "Other",
        description: "Custom document type",
        icon: "📄",
        color: "bg-gray-100 text-gray-800",
        suggestedFields: [{
                name: "document_purpose",
                title: "Document Purpose",
                type: "text",
                required: true,
                placeholder: "What is this document for?",
                description: "Purpose of this document"
            },
            {
                name: "recipient",
                title: "Recipient",
                type: "string",
                required: false,
                placeholder: "Who will receive this document?",
                description: "Intended recipient"
            },
            {
                name: "key_information",
                title: "Key Information",
                type: "text",
                required: true,
                placeholder: "Main information to include",
                description: "Primary information for the document"
            },
            {
                name: "additional_details",
                title: "Additional Details",
                type: "text",
                required: false,
                placeholder: "Any additional relevant details",
                description: "Supporting information"
            }
        ]
    }
};

// Helper function to get suggested fields for a document type
export const getSuggestedFieldsForDocumentType = (documentType) => {
    return DOCUMENT_TYPE_FIELD_SUGGESTIONS[documentType] && DOCUMENT_TYPE_FIELD_SUGGESTIONS[documentType].suggestedFields || [];
};

// Helper function to get document type info
export const getDocumentTypeInfo = (documentType) => {
    return DOCUMENT_TYPE_FIELD_SUGGESTIONS[documentType] || DOCUMENT_TYPE_FIELD_SUGGESTIONS['other'];
};

// Helper function to get all available document types
export const getAllDocumentTypes = () => {
    return Object.keys(DOCUMENT_TYPE_FIELD_SUGGESTIONS);
};