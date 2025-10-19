// Comprehensive Autocomplete Data Service
// Centralized data for autocomplete suggestions across the application

// Type definition for autocomplete items
export interface AutocompleteItem {
    value: string;
    label: string;
    description?: string;
    category?: string;
    format?: string;
}

// Medical specialties and conditions
export const MEDICAL_SPECIALTIES = [
    { value: 'cardiology', label: 'Cardiology', description: 'Heart and cardiovascular system' },
    { value: 'dermatology', label: 'Dermatology', description: 'Skin, hair, and nails' },
    { value: 'endocrinology', label: 'Endocrinology', description: 'Hormones and metabolism' },
    { value: 'gastroenterology', label: 'Gastroenterology', description: 'Digestive system' },
    { value: 'hematology', label: 'Hematology', description: 'Blood and blood disorders' },
    { value: 'infectious_disease', label: 'Infectious Disease', description: 'Infections and communicable diseases' },
    { value: 'nephrology', label: 'Nephrology', description: 'Kidneys and urinary system' },
    { value: 'neurology', label: 'Neurology', description: 'Nervous system and brain' },
    { value: 'oncology', label: 'Oncology', description: 'Cancer treatment' },
    { value: 'ophthalmology', label: 'Ophthalmology', description: 'Eyes and vision' },
    { value: 'orthopedics', label: 'Orthopedics', description: 'Bones, joints, and muscles' },
    { value: 'otolaryngology', label: 'Otolaryngology', description: 'Ear, nose, and throat' },
    { value: 'pediatrics', label: 'Pediatrics', description: 'Children and adolescents' },
    { value: 'psychiatry', label: 'Psychiatry', description: 'Mental health and behavior' },
    { value: 'pulmonology', label: 'Pulmonology', description: 'Lungs and respiratory system' },
    { value: 'radiology', label: 'Radiology', description: 'Medical imaging' },
    { value: 'rheumatology', label: 'Rheumatology', description: 'Joints and autoimmune diseases' },
    { value: 'urology', label: 'Urology', description: 'Urinary and male reproductive system' }
];

// Common medical conditions
export const MEDICAL_CONDITIONS = [
    { value: 'hypertension', label: 'Hypertension', category: 'Cardiovascular' },
    { value: 'diabetes_type_2', label: 'Type 2 Diabetes', category: 'Endocrine' },
    { value: 'diabetes_type_1', label: 'Type 1 Diabetes', category: 'Endocrine' },
    { value: 'asthma', label: 'Asthma', category: 'Respiratory' },
    { value: 'copd', label: 'COPD', category: 'Respiratory' },
    { value: 'arthritis', label: 'Arthritis', category: 'Musculoskeletal' },
    { value: 'depression', label: 'Depression', category: 'Mental Health' },
    { value: 'anxiety', label: 'Anxiety', category: 'Mental Health' },
    { value: 'migraine', label: 'Migraine', category: 'Neurological' },
    { value: 'epilepsy', label: 'Epilepsy', category: 'Neurological' },
    { value: 'thyroid_disorder', label: 'Thyroid Disorder', category: 'Endocrine' },
    { value: 'heart_disease', label: 'Heart Disease', category: 'Cardiovascular' },
    { value: 'stroke', label: 'Stroke', category: 'Neurological' },
    { value: 'cancer', label: 'Cancer', category: 'Oncology' },
    { value: 'kidney_disease', label: 'Kidney Disease', category: 'Renal' },
    { value: 'liver_disease', label: 'Liver Disease', category: 'Hepatic' },
    { value: 'ibd', label: 'Inflammatory Bowel Disease', category: 'Gastrointestinal' },
    { value: 'crohns', label: "Crohn's Disease", category: 'Gastrointestinal' },
    { value: 'ulcerative_colitis', label: 'Ulcerative Colitis', category: 'Gastrointestinal' },
    { value: 'psoriasis', label: 'Psoriasis', category: 'Dermatological' }
];

// Common medications
export const MEDICATIONS = [
    { value: 'metformin', label: 'Metformin', category: 'Diabetes', dosage: '500mg-1000mg' },
    { value: 'lisinopril', label: 'Lisinopril', category: 'ACE Inhibitor', dosage: '5mg-40mg' },
    { value: 'atorvastatin', label: 'Atorvastatin', category: 'Statin', dosage: '10mg-80mg' },
    { value: 'amlodipine', label: 'Amlodipine', category: 'Calcium Channel Blocker', dosage: '2.5mg-10mg' },
    { value: 'omeprazole', label: 'Omeprazole', category: 'PPI', dosage: '10mg-40mg' },
    { value: 'levothyroxine', label: 'Levothyroxine', category: 'Thyroid', dosage: '25mcg-200mcg' },
    { value: 'albuterol', label: 'Albuterol', category: 'Bronchodilator', dosage: '90mcg inhaler' },
    { value: 'prednisone', label: 'Prednisone', category: 'Corticosteroid', dosage: '5mg-60mg' },
    { value: 'warfarin', label: 'Warfarin', category: 'Anticoagulant', dosage: '1mg-10mg' },
    { value: 'furosemide', label: 'Furosemide', category: 'Diuretic', dosage: '20mg-80mg' },
    { value: 'ibuprofen', label: 'Ibuprofen', category: 'NSAID', dosage: '200mg-800mg' },
    { value: 'acetaminophen', label: 'Acetaminophen', category: 'Analgesic', dosage: '325mg-1000mg' },
    { value: 'sertraline', label: 'Sertraline', category: 'SSRI', dosage: '25mg-200mg' },
    { value: 'fluoxetine', label: 'Fluoxetine', category: 'SSRI', dosage: '10mg-80mg' },
    { value: 'tramadol', label: 'Tramadol', category: 'Opioid', dosage: '50mg-100mg' }
];

// Common symptoms
export const SYMPTOMS = [
    { value: 'chest_pain', label: 'Chest Pain', category: 'Cardiovascular' },
    { value: 'shortness_of_breath', label: 'Shortness of Breath', category: 'Respiratory' },
    { value: 'headache', label: 'Headache', category: 'Neurological' },
    { value: 'fever', label: 'Fever', category: 'General' },
    { value: 'fatigue', label: 'Fatigue', category: 'General' },
    { value: 'nausea', label: 'Nausea', category: 'Gastrointestinal' },
    { value: 'vomiting', label: 'Vomiting', category: 'Gastrointestinal' },
    { value: 'diarrhea', label: 'Diarrhea', category: 'Gastrointestinal' },
    { value: 'constipation', label: 'Constipation', category: 'Gastrointestinal' },
    { value: 'abdominal_pain', label: 'Abdominal Pain', category: 'Gastrointestinal' },
    { value: 'joint_pain', label: 'Joint Pain', category: 'Musculoskeletal' },
    { value: 'back_pain', label: 'Back Pain', category: 'Musculoskeletal' },
    { value: 'dizziness', label: 'Dizziness', category: 'Neurological' },
    { value: 'cough', label: 'Cough', category: 'Respiratory' },
    { value: 'rash', label: 'Rash', category: 'Dermatological' },
    { value: 'swelling', label: 'Swelling', category: 'General' },
    { value: 'weight_loss', label: 'Weight Loss', category: 'General' },
    { value: 'weight_gain', label: 'Weight Gain', category: 'General' },
    { value: 'insomnia', label: 'Insomnia', category: 'Sleep' },
    { value: 'anxiety_symptoms', label: 'Anxiety Symptoms', category: 'Mental Health' }
];

// Common allergies
export const ALLERGIES = [
    { value: 'penicillin', label: 'Penicillin', severity: 'Severe' },
    { value: 'sulfa', label: 'Sulfa Drugs', severity: 'Moderate' },
    { value: 'aspirin', label: 'Aspirin', severity: 'Moderate' },
    { value: 'latex', label: 'Latex', severity: 'Severe' },
    { value: 'shellfish', label: 'Shellfish', severity: 'Severe' },
    { value: 'peanuts', label: 'Peanuts', severity: 'Severe' },
    { value: 'tree_nuts', label: 'Tree Nuts', severity: 'Severe' },
    { value: 'eggs', label: 'Eggs', severity: 'Moderate' },
    { value: 'milk', label: 'Milk', severity: 'Moderate' },
    { value: 'soy', label: 'Soy', severity: 'Mild' },
    { value: 'wheat', label: 'Wheat', severity: 'Moderate' },
    { value: 'iodine', label: 'Iodine', severity: 'Moderate' },
    { value: 'contrast_dye', label: 'Contrast Dye', severity: 'Moderate' },
    { value: 'morphine', label: 'Morphine', severity: 'Severe' },
    { value: 'codeine', label: 'Codeine', severity: 'Moderate' }
];

// Common lab tests
export const LAB_TESTS = [
    { value: 'cbc', label: 'Complete Blood Count (CBC)', code: 'CBC', category: 'Hematology' },
    { value: 'bmp', label: 'Basic Metabolic Panel (BMP)', code: 'BMP', category: 'Chemistry' },
    { value: 'cmp', label: 'Comprehensive Metabolic Panel (CMP)', code: 'CMP', category: 'Chemistry' },
    { value: 'lipid_panel', label: 'Lipid Panel', code: 'LIPID', category: 'Chemistry' },
    { value: 'thyroid_tsh', label: 'Thyroid Stimulating Hormone (TSH)', code: 'TSH', category: 'Endocrine' },
    { value: 'hba1c', label: 'Hemoglobin A1C', code: 'HBA1C', category: 'Diabetes' },
    { value: 'glucose', label: 'Glucose', code: 'GLUC', category: 'Chemistry' },
    { value: 'creatinine', label: 'Creatinine', code: 'CREAT', category: 'Renal' },
    { value: 'bun', label: 'Blood Urea Nitrogen (BUN)', code: 'BUN', category: 'Renal' },
    { value: 'alt', label: 'Alanine Aminotransferase (ALT)', code: 'ALT', category: 'Hepatic' },
    { value: 'ast', label: 'Aspartate Aminotransferase (AST)', code: 'AST', category: 'Hepatic' },
    { value: 'pt_inr', label: 'PT/INR', code: 'PT/INR', category: 'Coagulation' },
    { value: 'urinalysis', label: 'Urinalysis', code: 'UA', category: 'Urine' },
    { value: 'culture_urine', label: 'Urine Culture', code: 'UC', category: 'Microbiology' },
    { value: 'culture_blood', label: 'Blood Culture', code: 'BC', category: 'Microbiology' }
];

// Common procedures
export const PROCEDURES = [
    { value: 'colonoscopy', label: 'Colonoscopy', category: 'Gastroenterology' },
    { value: 'endoscopy', label: 'Upper Endoscopy', category: 'Gastroenterology' },
    { value: 'echocardiogram', label: 'Echocardiogram', category: 'Cardiology' },
    { value: 'stress_test', label: 'Stress Test', category: 'Cardiology' },
    { value: 'ct_scan', label: 'CT Scan', category: 'Radiology' },
    { value: 'mri', label: 'MRI', category: 'Radiology' },
    { value: 'x_ray', label: 'X-Ray', category: 'Radiology' },
    { value: 'ultrasound', label: 'Ultrasound', category: 'Radiology' },
    { value: 'biopsy', label: 'Biopsy', category: 'Pathology' },
    { value: 'surgery', label: 'Surgery', category: 'General' },
    { value: 'physical_therapy', label: 'Physical Therapy', category: 'Rehabilitation' },
    { value: 'occupational_therapy', label: 'Occupational Therapy', category: 'Rehabilitation' }
];

// Insurance providers
export const INSURANCE_PROVIDERS = [
    { value: 'aetna', label: 'Aetna', type: 'Commercial' },
    { value: 'anthem', label: 'Anthem', type: 'Commercial' },
    { value: 'blue_cross', label: 'Blue Cross Blue Shield', type: 'Commercial' },
    { value: 'cigna', label: 'Cigna', type: 'Commercial' },
    { value: 'humana', label: 'Humana', type: 'Commercial' },
    { value: 'kaiser', label: 'Kaiser Permanente', type: 'HMO' },
    { value: 'medicare', label: 'Medicare', type: 'Government' },
    { value: 'medicaid', label: 'Medicaid', type: 'Government' },
    { value: 'tricare', label: 'TRICARE', type: 'Military' },
    { value: 'united_healthcare', label: 'UnitedHealthcare', type: 'Commercial' }
];

// Common addresses (major cities)
export const COMMON_ADDRESSES = [
    { value: 'new_york', label: 'New York, NY', state: 'NY', zip: '10001' },
    { value: 'los_angeles', label: 'Los Angeles, CA', state: 'CA', zip: '90001' },
    { value: 'chicago', label: 'Chicago, IL', state: 'IL', zip: '60601' },
    { value: 'houston', label: 'Houston, TX', state: 'TX', zip: '77001' },
    { value: 'phoenix', label: 'Phoenix, AZ', state: 'AZ', zip: '85001' },
    { value: 'philadelphia', label: 'Philadelphia, PA', state: 'PA', zip: '19101' },
    { value: 'san_antonio', label: 'San Antonio, TX', state: 'TX', zip: '78201' },
    { value: 'san_diego', label: 'San Diego, CA', state: 'CA', zip: '92101' },
    { value: 'dallas', label: 'Dallas, TX', state: 'TX', zip: '75201' },
    { value: 'san_jose', label: 'San Jose, CA', state: 'CA', zip: '95101' }
];

// Common phone number formats
export const PHONE_FORMATS = [
    { value: '(555) 123-4567', label: '(555) 123-4567', format: 'US' },
    { value: '555-123-4567', label: '555-123-4567', format: 'US' },
    { value: '555.123.4567', label: '555.123.4567', format: 'US' },
    { value: '+1 555 123 4567', label: '+1 555 123 4567', format: 'International' }
];

// Autocomplete service functions
export const getSuggestionsByType = (type: string, query: string = '') => {
    const suggestions = {
        specialties: MEDICAL_SPECIALTIES,
        conditions: MEDICAL_CONDITIONS,
        medications: MEDICATIONS,
        symptoms: SYMPTOMS,
        allergies: ALLERGIES,
        labTests: LAB_TESTS,
        procedures: PROCEDURES,
        insurance: INSURANCE_PROVIDERS,
        addresses: COMMON_ADDRESSES,
        phoneFormats: PHONE_FORMATS
    };

    const data = suggestions[type] || [];

    if (!query) return data;

    return data.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(query.toLowerCase()))
    );
};

// Smart suggestions based on context
export const getSmartSuggestions = (fieldName: string, query: string = '') => {
    const fieldMappings = {
        // Patient form fields
        'specialty': 'specialties',
        'medical_condition': 'conditions',
        'current_medications': 'medications',
        'allergies': 'allergies',
        'symptoms': 'symptoms',
        'insurance_provider': 'insurance',
        'city': 'addresses',
        'phone': 'phoneFormats',

        // Lab order fields
        'test_name': 'labTests',
        'test_category': 'labTests',

        // Prescription fields
        'medication_name': 'medications',
        'drug_name': 'medications',

        // Consultation fields
        'chief_complaint': 'symptoms',
        'diagnosis': 'conditions',
        'treatment_plan': 'procedures',

        // Appointment fields
        'appointment_type': 'procedures',
        'reason_for_visit': 'symptoms'
    };

    const suggestionType = fieldMappings[fieldName.toLowerCase()];
    return suggestionType ? getSuggestionsByType(suggestionType, query) : [];
};

// Export all data for easy access
export default {
    MEDICAL_SPECIALTIES,
    MEDICAL_CONDITIONS,
    MEDICATIONS,
    SYMPTOMS,
    ALLERGIES,
    LAB_TESTS,
    PROCEDURES,
    INSURANCE_PROVIDERS,
    COMMON_ADDRESSES,
    PHONE_FORMATS,
    getSuggestionsByType,
    getSmartSuggestions
};