// Mock prescription templates data
export const prescriptionTemplates = [
    {
        id: '1',
        name: 'Hypertension Management',
        category: 'Cardiology',
        description: 'Standard antihypertensive therapy with ACE inhibitor and diuretic',
        medications: [
            {
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Once daily',
                duration: '30 days',
                indication: 'Hypertension'
            },
            {
                name: 'Hydrochlorothiazide',
                dosage: '25mg',
                frequency: 'Once daily',
                duration: '30 days',
                indication: 'Hypertension'
            }
        ],
        instructions: 'Take with food. Monitor blood pressure weekly. Report dizziness or swelling.',
        monitoring: ['Blood pressure', 'Kidney function', 'Electrolytes'],
        followUp: 'Follow up in 4 weeks',
        usageCount: 45,
        lastUsed: '2024-01-10'
    },
    {
        id: '2',
        name: 'Type 2 Diabetes',
        category: 'Endocrinology',
        description: 'Metformin-based diabetes management with monitoring',
        medications: [
            {
                name: 'Metformin',
                dosage: '500mg',
                frequency: 'Twice daily',
                duration: '30 days',
                indication: 'Type 2 Diabetes'
            },
            {
                name: 'Glipizide',
                dosage: '5mg',
                frequency: 'Once daily',
                duration: '30 days',
                indication: 'Type 2 Diabetes'
            }
        ],
        instructions: 'Take with meals. Monitor blood glucose. Watch for hypoglycemia symptoms.',
        monitoring: ['HbA1c', 'Blood glucose', 'Kidney function', 'Weight'],
        followUp: 'Follow up in 3 months',
        usageCount: 32,
        lastUsed: '2024-01-08'
    },
    {
        id: '3',
        name: 'Upper Respiratory Infection',
        category: 'Infectious Disease',
        description: 'Antibiotic therapy for bacterial respiratory infections',
        medications: [
            {
                name: 'Amoxicillin',
                dosage: '500mg',
                frequency: 'Three times daily',
                duration: '7 days',
                indication: 'Upper respiratory infection'
            },
            {
                name: 'Ibuprofen',
                dosage: '400mg',
                frequency: 'Every 6 hours',
                duration: '5 days',
                indication: 'Pain and inflammation'
            }
        ],
        instructions: 'Complete full course of antibiotics. Take with food to reduce stomach upset.',
        monitoring: ['Temperature', 'Symptoms improvement'],
        followUp: 'Follow up if symptoms worsen',
        usageCount: 67,
        lastUsed: '2024-01-12'
    },
    {
        id: '4',
        name: 'Migraine Prevention',
        category: 'Neurology',
        description: 'Prophylactic migraine treatment with beta-blocker',
        medications: [
            {
                name: 'Propranolol',
                dosage: '40mg',
                frequency: 'Twice daily',
                duration: '30 days',
                indication: 'Migraine prevention'
            },
            {
                name: 'Sumatriptan',
                dosage: '50mg',
                frequency: 'As needed',
                duration: '10 tablets',
                indication: 'Acute migraine'
            }
        ],
        instructions: 'Take propranolol regularly. Use sumatriptan at first sign of migraine.',
        monitoring: ['Blood pressure', 'Heart rate', 'Migraine frequency'],
        followUp: 'Follow up in 6 weeks',
        usageCount: 23,
        lastUsed: '2024-01-05'
    },
    {
        id: '5',
        name: 'Pediatric Asthma',
        category: 'Pediatrics',
        description: 'Inhaled corticosteroid and bronchodilator for pediatric asthma',
        medications: [
            {
                name: 'Fluticasone',
                dosage: '110mcg',
                frequency: 'Twice daily',
                duration: '30 days',
                indication: 'Asthma maintenance'
            },
            {
                name: 'Albuterol',
                dosage: '90mcg',
                frequency: 'As needed',
                duration: '200 inhalations',
                indication: 'Acute asthma'
            }
        ],
        instructions: 'Use spacer device. Rinse mouth after inhaled steroids.',
        monitoring: ['Peak flow', 'Symptoms', 'Growth'],
        followUp: 'Follow up in 3 months',
        usageCount: 18,
        lastUsed: '2024-01-07'
    }
];

// Mock patient data with enhanced information
export const enhancedPatients = [
    {
        id: '1',
        name: 'John Smith',
        age: 45,
        gender: 'Male',
        weight: 85,
        height: 180,
        allergies: ['Penicillin', 'Sulfa'],
        currentMedications: [
            { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'daily', status: 'active' },
            { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'twice daily', status: 'active' }
        ],
        medicalHistory: [
            { condition: 'Hypertension', date: '2023-01-15', status: 'active' },
            { condition: 'Type 2 Diabetes', date: '2022-06-20', status: 'active' },
            { condition: 'Appendectomy', date: '2018-03-10', status: 'resolved' }
        ],
        photo: '/api/placeholder/40/40',
        insuranceProvider: 'Blue Cross Blue Shield',
        lastVisit: '2024-01-15',
        isPregnant: false,
        isLactating: false,
        labValues: {
            creatinine: 1.1,
            bun: 18,
            alt: 25,
            ast: 30,
            bilirubin: 0.8,
            inr: 1.0
        }
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        age: 32,
        gender: 'Female',
        weight: 65,
        height: 165,
        allergies: ['Latex'],
        currentMedications: [
            { id: '3', name: 'Prenatal Vitamins', dosage: '1 tablet', frequency: 'daily', status: 'active' }
        ],
        medicalHistory: [
            { condition: 'Pregnancy', date: '2023-09-01', status: 'active' },
            { condition: 'Migraine', date: '2022-01-15', status: 'active' }
        ],
        photo: '/api/placeholder/40/40',
        insuranceProvider: 'Aetna',
        lastVisit: '2024-01-10',
        isPregnant: true,
        isLactating: false,
        labValues: {
            creatinine: 0.9,
            bun: 12,
            alt: 20,
            ast: 25,
            bilirubin: 0.6,
            inr: 1.1
        }
    },
    {
        id: '3',
        name: 'Michael Brown',
        age: 28,
        gender: 'Male',
        weight: 75,
        height: 175,
        allergies: [],
        currentMedications: [],
        medicalHistory: [
            { condition: 'Sports injury', date: '2023-12-15', status: 'resolved' }
        ],
        photo: '/api/placeholder/40/40',
        insuranceProvider: 'UnitedHealth',
        lastVisit: '2023-12-15',
        isPregnant: false,
        isLactating: false,
        labValues: {
            creatinine: 1.0,
            bun: 15,
            alt: 22,
            ast: 28,
            bilirubin: 0.7,
            inr: 1.0
        }
    }
];
