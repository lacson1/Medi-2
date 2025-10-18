// Comprehensive Laboratory Test Database with 20 Common Lab Tests
// Including complete details: reference ranges, pricing, normal values, side effects, contraindications

export const LAB_TEST_DATABASE = {
    // HEMATOLOGY TESTS
    hematology: [{
            name: "Complete Blood Count (CBC)",
            code: "CBC",
            description: "Basic blood panel including RBC, WBC, platelets, hemoglobin, hematocrit",
            normalRange: "RBC: 4.5-5.9 M/μL, WBC: 4.5-11.0 K/μL, Hgb: 12-16 g/dL, Hct: 36-46%, Platelets: 150-450 K/μL",
            category: "hematology",
            commonIndications: ["Routine screening", "Anemia evaluation", "Infection monitoring", "Bleeding disorders"],
            pricing: { cost: 15.00, retail: 25.00, insurance: 12.00 },
            specimenType: "Whole blood",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Erythrocyte Sedimentation Rate (ESR)",
            code: "ESR",
            description: "Rate at which red blood cells settle in a tube",
            normalRange: "Men: 0-15 mm/hr, Women: 0-20 mm/hr, Elderly: 0-30 mm/hr",
            category: "hematology",
            commonIndications: ["Inflammation screening", "Rheumatoid arthritis", "Temporal arteritis", "Polymyalgia rheumatica"],
            pricing: { cost: 8.00, retail: 15.00, insurance: 6.00 },
            specimenType: "Whole blood",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Blood Group & Rh Type",
            code: "BGTYPE",
            description: "Determination of ABO blood group and Rh factor",
            normalRange: "A+, A-, B+, B-, AB+, AB-, O+, O-",
            category: "hematology",
            commonIndications: ["Blood transfusion", "Pregnancy", "Surgery preparation", "Emergency situations"],
            pricing: { cost: 12.00, retail: 20.00, insurance: 9.00 },
            specimenType: "Whole blood",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Prothrombin Time (PT) & INR",
            code: "PT-INR",
            description: "Blood clotting time measurement for warfarin monitoring",
            normalRange: "PT: 11-13 seconds, INR: 0.8-1.1 (normal), 2.0-3.0 (therapeutic)",
            category: "hematology",
            commonIndications: ["Anticoagulant monitoring", "Bleeding disorders", "Liver function assessment", "Pre-surgical screening"],
            pricing: { cost: 10.00, retail: 18.00, insurance: 7.50 },
            specimenType: "Whole blood",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Partial Thromboplastin Time (PTT)",
            code: "PTT",
            description: "Intrinsic pathway clotting time measurement",
            normalRange: "25-35 seconds",
            category: "hematology",
            commonIndications: ["Heparin monitoring", "Bleeding disorders", "Pre-surgical screening", "Factor deficiency evaluation"],
            pricing: { cost: 12.00, retail: 22.00, insurance: 9.00 },
            specimenType: "Whole blood",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        }
    ],

    // BIOCHEMISTRY TESTS
    biochemistry: [{
            name: "Fasting Blood Sugar (FBS)",
            code: "FBS",
            description: "Blood glucose level after 8-12 hour fast",
            normalRange: "70-100 mg/dL (normal), 100-125 mg/dL (prediabetes), ≥126 mg/dL (diabetes)",
            category: "biochemistry",
            commonIndications: ["Diabetes screening", "Diabetes monitoring", "Metabolic syndrome evaluation"],
            pricing: { cost: 8.00, retail: 15.00, insurance: 6.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: true,
            specialInstructions: "Patient fasting required (8-12 hours)"
        },
        {
            name: "Hemoglobin A1C",
            code: "HbA1c",
            description: "Average blood glucose over 2-3 months",
            normalRange: "<5.7% (normal), 5.7-6.4% (prediabetes), ≥6.5% (diabetes)",
            category: "biochemistry",
            commonIndications: ["Diabetes monitoring", "Diabetes screening", "Glycemic control assessment"],
            pricing: { cost: 18.00, retail: 30.00, insurance: 14.00 },
            specimenType: "Whole blood",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Lipid Profile",
            code: "LIPID",
            description: "Complete cholesterol and triglyceride panel",
            normalRange: "Total Chol: <200 mg/dL, LDL: <100 mg/dL, HDL: >40 mg/dL, Triglycerides: <150 mg/dL",
            category: "biochemistry",
            commonIndications: ["Cardiovascular risk assessment", "Hyperlipidemia screening", "Statin monitoring"],
            pricing: { cost: 25.00, retail: 45.00, insurance: 20.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: true,
            specialInstructions: "Patient fasting required (12-14 hours)"
        },
        {
            name: "Liver Function Tests (LFT)",
            code: "LFT",
            description: "Liver enzyme and function assessment panel",
            normalRange: "ALT: 7-56 U/L, AST: 10-40 U/L, ALP: 44-147 U/L, Total Bilirubin: 0.3-1.2 mg/dL",
            category: "biochemistry",
            commonIndications: ["Liver disease screening", "Hepatitis monitoring", "Medication toxicity", "Alcohol abuse screening"],
            pricing: { cost: 20.00, retail: 35.00, insurance: 16.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Kidney Function Tests (KFT)",
            code: "KFT",
            description: "Renal function assessment panel",
            normalRange: "BUN: 7-20 mg/dL, Creatinine: 0.6-1.2 mg/dL, eGFR: >60 mL/min/1.73m²",
            category: "biochemistry",
            commonIndications: ["Kidney function assessment", "Medication monitoring", "Diabetes complications", "Hypertension monitoring"],
            pricing: { cost: 15.00, retail: 28.00, insurance: 12.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        }
    ],

    // MICROBIOLOGY TESTS
    microbiology: [{
            name: "Malaria Parasite Test",
            code: "MALARIA",
            description: "Detection of malaria parasites in blood",
            normalRange: "Negative (no parasites detected)",
            category: "microbiology",
            commonIndications: ["Fever in endemic areas", "Travel medicine", "Malaria screening", "Post-travel evaluation"],
            pricing: { cost: 35.00, retail: 60.00, insurance: 28.00 },
            specimenType: "Whole blood",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Blood Culture",
            code: "BC",
            description: "Detection of bacteria or fungi in blood",
            normalRange: "Negative (no growth after 5 days)",
            category: "microbiology",
            commonIndications: ["Sepsis evaluation", "Fever of unknown origin", "Endocarditis", "Bacteremia screening"],
            pricing: { cost: 45.00, retail: 80.00, insurance: 36.00 },
            specimenType: "Whole blood",
            collectionMethod: "Sterile venipuncture",
            processingTime: "5 days",
            fastingRequired: false,
            specialInstructions: "Sterile collection required, multiple sets recommended"
        },
        {
            name: "Urine Culture",
            code: "UC",
            description: "Detection and identification of bacteria in urine",
            normalRange: "Negative or <10,000 CFU/mL",
            category: "microbiology",
            commonIndications: ["Urinary tract infection", "Pyelonephritis", "Asymptomatic bacteriuria", "Recurrent UTI"],
            pricing: { cost: 25.00, retail: 45.00, insurance: 20.00 },
            specimenType: "Urine",
            collectionMethod: "Clean catch",
            processingTime: "2-3 days",
            fastingRequired: false,
            specialInstructions: "Clean catch urine required, midstream preferred"
        },
        {
            name: "Stool Culture",
            code: "SC",
            description: "Detection of pathogenic bacteria in stool",
            normalRange: "Negative for Salmonella, Shigella, Campylobacter, E.coli O157",
            category: "microbiology",
            commonIndications: ["Diarrhea evaluation", "Food poisoning", "Traveler's diarrhea", "Gastroenteritis"],
            pricing: { cost: 30.00, retail: 55.00, insurance: 24.00 },
            specimenType: "Stool",
            collectionMethod: "Fresh stool sample",
            processingTime: "3-5 days",
            fastingRequired: false,
            specialInstructions: "Fresh stool sample required, avoid contamination"
        },
        {
            name: "Sputum Culture",
            code: "SPC",
            description: "Detection of bacteria in respiratory secretions",
            normalRange: "Normal flora only (Streptococcus pneumoniae, Haemophilus influenzae)",
            category: "microbiology",
            commonIndications: ["Pneumonia", "Bronchitis", "Respiratory infection", "Tuberculosis screening"],
            pricing: { cost: 28.00, retail: 50.00, insurance: 22.00 },
            specimenType: "Sputum",
            collectionMethod: "Deep cough specimen",
            processingTime: "2-3 days",
            fastingRequired: false,
            specialInstructions: "Deep cough specimen required, morning collection preferred"
        }
    ],

    // HORMONE TESTS
    hormones: [{
            name: "Thyroid Stimulating Hormone (TSH)",
            code: "TSH",
            description: "Primary thyroid function screening test",
            normalRange: "0.4-4.0 mIU/L (adults), 0.5-3.0 mIU/L (optimal)",
            category: "hormones",
            commonIndications: ["Thyroid dysfunction screening", "Hypothyroidism", "Hyperthyroidism", "Thyroid medication monitoring"],
            pricing: { cost: 22.00, retail: 40.00, insurance: 18.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Free T4 (FT4)",
            code: "FT4",
            description: "Free thyroxine level measurement",
            normalRange: "0.8-1.8 ng/dL",
            category: "hormones",
            commonIndications: ["Thyroid function evaluation", "Hypothyroidism diagnosis", "Hyperthyroidism diagnosis"],
            pricing: { cost: 25.00, retail: 45.00, insurance: 20.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Prostate Specific Antigen (PSA)",
            code: "PSA",
            description: "Prostate cancer screening marker",
            normalRange: "<4.0 ng/mL (normal), 4.0-10.0 ng/mL (borderline), >10.0 ng/mL (elevated)",
            category: "hormones",
            commonIndications: ["Prostate cancer screening", "Prostate cancer monitoring", "Prostatitis evaluation"],
            pricing: { cost: 30.00, retail: 55.00, insurance: 24.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "Avoid ejaculation 48 hours before test"
        },
        {
            name: "Beta-HCG (Pregnancy Test)",
            code: "BHCG",
            description: "Human chorionic gonadotropin for pregnancy detection",
            normalRange: "<5 mIU/mL (negative), >25 mIU/mL (positive)",
            category: "hormones",
            commonIndications: ["Pregnancy confirmation", "Ectopic pregnancy evaluation", "Miscarriage monitoring", "Tumor marker"],
            pricing: { cost: 18.00, retail: 32.00, insurance: 14.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Cortisol",
            code: "CORTISOL",
            description: "Adrenal gland function assessment",
            normalRange: "Morning: 6.2-19.4 μg/dL, Afternoon: 2.3-11.9 μg/dL",
            category: "hormones",
            commonIndications: ["Adrenal insufficiency", "Cushing's syndrome", "Stress evaluation", "Adrenal tumor screening"],
            pricing: { cost: 35.00, retail: 65.00, insurance: 28.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "Timing important - specify collection time"
        }
    ],

    // SEROLOGY TESTS
    serology: [{
            name: "HIV Antibody Test",
            code: "HIV",
            description: "Detection of HIV antibodies in blood",
            normalRange: "Negative (no antibodies detected)",
            category: "serology",
            commonIndications: ["HIV screening", "Pre-employment screening", "Blood donation screening", "STI screening"],
            pricing: { cost: 40.00, retail: 75.00, insurance: 32.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "Informed consent required, counseling recommended"
        },
        {
            name: "Hepatitis B Surface Antigen (HBsAg)",
            code: "HBSAG",
            description: "Detection of Hepatitis B surface antigen",
            normalRange: "Negative (<0.05 IU/mL)",
            category: "serology",
            commonIndications: ["Hepatitis B screening", "Vaccination status", "Liver disease evaluation", "Blood donation screening"],
            pricing: { cost: 35.00, retail: 65.00, insurance: 28.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Hepatitis C Antibody Test",
            code: "HCV",
            description: "Detection of Hepatitis C antibodies",
            normalRange: "Negative (no antibodies detected)",
            category: "serology",
            commonIndications: ["Hepatitis C screening", "Liver disease evaluation", "Blood donation screening", "Risk factor assessment"],
            pricing: { cost: 38.00, retail: 70.00, insurance: 30.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "Syphilis Test (RPR/VDRL)",
            code: "SYPHILIS",
            description: "Screening test for syphilis infection",
            normalRange: "Non-reactive (negative)",
            category: "serology",
            commonIndications: ["STI screening", "Prenatal screening", "Blood donation screening", "Neurological evaluation"],
            pricing: { cost: 25.00, retail: 45.00, insurance: 20.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        },
        {
            name: "C-Reactive Protein (CRP)",
            code: "CRP",
            description: "Marker of inflammation and infection",
            normalRange: "<3.0 mg/L (low risk), 3.0-10.0 mg/L (moderate risk), >10.0 mg/L (high risk)",
            category: "serology",
            commonIndications: ["Inflammation screening", "Cardiovascular risk assessment", "Infection monitoring", "Autoimmune disease evaluation"],
            pricing: { cost: 20.00, retail: 35.00, insurance: 16.00 },
            specimenType: "Serum",
            collectionMethod: "Venipuncture",
            processingTime: "Same day",
            fastingRequired: false,
            specialInstructions: "No special preparation required"
        }
    ]
};

// Clinical Indications Database
export const CLINICAL_INDICATIONS = [
    "Routine screening",
    "Annual physical examination",
    "Pre-operative evaluation",
    "Post-operative monitoring",
    "Medication monitoring",
    "Disease monitoring",
    "Symptom evaluation",
    "Follow-up examination",
    "Emergency evaluation",
    "Infection screening",
    "Cancer screening",
    "Cardiovascular risk assessment",
    "Diabetes monitoring",
    "Thyroid dysfunction",
    "Liver disease evaluation",
    "Kidney function assessment",
    "Anemia evaluation",
    "Bleeding disorder evaluation",
    "Inflammatory condition",
    "Autoimmune disorder",
    "Allergy evaluation",
    "Pregnancy evaluation",
    "Pediatric evaluation",
    "Geriatric evaluation",
    "Occupational screening",
    "Travel medicine",
    "Sports medicine",
    "Workers compensation",
    "Insurance examination",
    "Disability evaluation",
    "STI screening",
    "Blood donation screening",
    "Pre-employment screening",
    "Vaccination status",
    "Risk factor assessment",
    "Tumor marker evaluation",
    "Adrenal function assessment",
    "Stress evaluation",
    "Neurological evaluation",
    "Prenatal screening"
];

// Special Instructions Database
export const SPECIAL_INSTRUCTIONS = [
    "Patient fasting required (8-12 hours)",
    "Patient fasting required (12-14 hours)",
    "Patient fasting required (4-6 hours)",
    "No fasting required",
    "Morning collection preferred",
    "Random collection acceptable",
    "Timed collection required",
    "Sterile collection required",
    "Clean catch urine required",
    "Midstream urine required",
    "First morning void preferred",
    "24-hour collection required",
    "Immediate processing required",
    "Refrigerate if not processed immediately",
    "Room temperature storage",
    "Protect from light",
    "Avoid contamination",
    "Patient preparation required",
    "Medication hold required",
    "Exercise restriction required",
    "Dietary restrictions apply",
    "Contrast allergy check required",
    "Pregnancy test required before imaging",
    "Claustrophobia screening required",
    "Metal implant screening required",
    "Renal function check required",
    "Thyroid function check required",
    "Cardiac clearance required",
    "Informed consent required",
    "Patient education provided",
    "Results to be called to patient",
    "Multiple sets recommended",
    "Deep cough specimen required",
    "Fresh stool sample required",
    "Avoid ejaculation 48 hours before test",
    "Timing important - specify collection time",
    "Counseling recommended"
];

// Doctor Names Database (Common names for auto-suggest)
export const DOCTOR_NAMES = [
    "Dr. Smith",
    "Dr. Johnson",
    "Dr. Williams",
    "Dr. Brown",
    "Dr. Jones",
    "Dr. Garcia",
    "Dr. Miller",
    "Dr. Davis",
    "Dr. Rodriguez",
    "Dr. Martinez",
    "Dr. Hernandez",
    "Dr. Lopez",
    "Dr. Gonzalez",
    "Dr. Wilson",
    "Dr. Anderson",
    "Dr. Thomas",
    "Dr. Taylor",
    "Dr. Moore",
    "Dr. Jackson",
    "Dr. Martin",
    "Dr. Lee",
    "Dr. Perez",
    "Dr. Thompson",
    "Dr. White",
    "Dr. Harris",
    "Dr. Sanchez",
    "Dr. Clark",
    "Dr. Ramirez",
    "Dr. Lewis",
    "Dr. Robinson"
];

// Test Categories Database
export const TEST_CATEGORIES = [
    "hematology",
    "biochemistry",
    "microbiology",
    "hormones",
    "serology",
    "pathology",
    "imaging",
    "cardiology",
    "pulmonology",
    "endocrinology",
    "oncology",
    "immunology"
];

// Specimen Types Database
export const SPECIMEN_TYPES = [
    "Whole blood",
    "Serum",
    "Plasma",
    "Urine",
    "Stool",
    "Sputum",
    "Cerebrospinal fluid",
    "Pleural fluid",
    "Peritoneal fluid",
    "Synovial fluid",
    "Tissue",
    "Swab",
    "Bone marrow",
    "Amniotic fluid"
];

// Collection Methods Database
export const COLLECTION_METHODS = [
    "Venipuncture",
    "Finger stick",
    "Heel stick",
    "Arterial puncture",
    "Clean catch",
    "Midstream",
    "Catheterized",
    "Suprapubic",
    "Fresh stool sample",
    "Deep cough specimen",
    "Sterile venipuncture",
    "Timed collection",
    "24-hour collection",
    "Random collection"
];

// Processing Times Database
export const PROCESSING_TIMES = [
    "Same day",
    "1-2 days",
    "2-3 days",
    "3-5 days",
    "5 days",
    "1 week",
    "2 weeks",
    "Rush (2-4 hours)",
    "Stat (1 hour)"
];

// Helper functions
export const getAllTests = () => {
    return Object.values(LAB_TEST_DATABASE).flat();
};

export const getTestsByCategory = (category) => {
    return LAB_TEST_DATABASE[category] || [];
};

export const searchTests = (query) => {
    const allTests = getAllTests();
    const searchTerm = query.toLowerCase();

    return allTests.filter(test =>
        test.name.toLowerCase().includes(searchTerm) ||
        test.code.toLowerCase().includes(searchTerm) ||
        test.description.toLowerCase().includes(searchTerm) ||
        test.commonIndications.some(indication =>
            indication.toLowerCase().includes(searchTerm)
        )
    );
};

export const getTestSuggestions = (query, maxResults = 10) => {
    if (!query || query.length < 2) return [];

    const results = searchTests(query);
    return results.slice(0, maxResults);
};

export const getIndicationSuggestions = (query, maxResults = 8) => {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    return CLINICAL_INDICATIONS
        .filter(indication => indication.toLowerCase().includes(searchTerm))
        .slice(0, maxResults);
};

export const getInstructionSuggestions = (query, maxResults = 8) => {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    return SPECIAL_INSTRUCTIONS
        .filter(instruction => instruction.toLowerCase().includes(searchTerm))
        .slice(0, maxResults);
};

export const getDoctorSuggestions = (query, maxResults = 8) => {
    if (!query || query.length < 1) return [];

    const searchTerm = query.toLowerCase();
    return DOCTOR_NAMES
        .filter(doctor => doctor.toLowerCase().includes(searchTerm))
        .slice(0, maxResults);
};

export const getTestsBySpecimenType = (specimenType) => {
    const allTests = getAllTests();
    return allTests.filter(test => test.specimenType === specimenType);
};

export const getFastingRequiredTests = () => {
    const allTests = getAllTests();
    return allTests.filter(test => test.fastingRequired === true);
};

export const getSameDayResultsTests = () => {
    const allTests = getAllTests();
    return allTests.filter(test => test.processingTime === "Same day");
};

export const getTestsByPriceRange = (minPrice, maxPrice) => {
    const allTests = getAllTests();
    return allTests.filter(test =>
        test.pricing.cost >= minPrice && test.pricing.cost <= maxPrice
    );
};

export const getCategorySuggestions = (query, maxResults = 8) => {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    return TEST_CATEGORIES
        .filter(category => category.toLowerCase().includes(searchTerm))
        .slice(0, maxResults);
};

export const getSpecimenTypeSuggestions = (query, maxResults = 8) => {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    return SPECIMEN_TYPES
        .filter(specimen => specimen.toLowerCase().includes(searchTerm))
        .slice(0, maxResults);
};

export const getCollectionMethodSuggestions = (query, maxResults = 8) => {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    return COLLECTION_METHODS
        .filter(method => method.toLowerCase().includes(searchTerm))
        .slice(0, maxResults);
};

export const getProcessingTimeSuggestions = (query, maxResults = 8) => {
    if (!query || query.length < 1) return [];

    const searchTerm = query.toLowerCase();
    return PROCESSING_TIMES
        .filter(time => time.toLowerCase().includes(searchTerm))
        .slice(0, maxResults);
};