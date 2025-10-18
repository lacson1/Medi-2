// Utility functions for autopopulating patient form fields

// Address autopopulation using online APIs
export const getAddressSuggestions = async(query) => {
    try {
        // Using a free geocoding service (you can replace with Google Places API or similar)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
        );
        const data = await response.json();

        return data.map(item => ({
            display: item.display_name,
            address: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            components: item.address || {}
        }));
    } catch (error) {
        console.error('Error fetching address suggestions:', error);
        return [];
    }
};

// Medical allergies database (common allergies)
export const getAllergySuggestions = async(query) => {
    const commonAllergies = [
        'Penicillin', 'Amoxicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Naproxen',
        'Shellfish', 'Peanuts', 'Tree nuts', 'Eggs', 'Milk', 'Soy', 'Wheat',
        'Latex', 'Dust mites', 'Pollen', 'Pet dander', 'Mold', 'Bee stings',
        'Contrast dye', 'Insulin', 'Codeine', 'Morphine', 'Vancomycin'
    ];

    if (!query) return commonAllergies;

    return commonAllergies.filter(allergy =>
        allergy.toLowerCase().includes(query.toLowerCase())
    );
};

// Medical conditions database (common conditions)
export const getMedicalConditionSuggestions = async(query) => {
    const commonConditions = [
        'Hypertension', 'Diabetes Type 1', 'Diabetes Type 2', 'High Cholesterol',
        'Asthma', 'COPD', 'Heart Disease', 'Stroke', 'Migraine', 'Depression',
        'Anxiety', 'Arthritis', 'Osteoporosis', 'Cancer', 'Thyroid Disease',
        'Kidney Disease', 'Liver Disease', 'Epilepsy', 'Multiple Sclerosis',
        'Parkinson\'s Disease', 'Alzheimer\'s Disease', 'Fibromyalgia',
        'Chronic Fatigue Syndrome', 'Irritable Bowel Syndrome', 'Crohn\'s Disease',
        'Ulcerative Colitis', 'GERD', 'Peptic Ulcer', 'Gallstones', 'Hepatitis'
    ];

    if (!query) return commonConditions;

    return commonConditions.filter(condition =>
        condition.toLowerCase().includes(query.toLowerCase())
    );
};

// Surgical procedures database (common procedures)
export const getSurgicalHistorySuggestions = async(query) => {
    const commonProcedures = [
        'Appendectomy', 'Cholecystectomy', 'Hernia repair', 'Cataract surgery',
        'Knee replacement', 'Hip replacement', 'C-section', 'Tonsillectomy',
        'Gallbladder removal', 'Colonoscopy', 'Endoscopy', 'Biopsy',
        'Cardiac catheterization', 'Angioplasty', 'Bypass surgery',
        'Mastectomy', 'Prostatectomy', 'Hysterectomy', 'Laparoscopy',
        'Arthroscopy', 'Spinal fusion', 'Carpal tunnel release',
        'Rotator cuff repair', 'ACL reconstruction', 'Meniscus repair'
    ];

    if (!query) return commonProcedures;

    return commonProcedures.filter(procedure =>
        procedure.toLowerCase().includes(query.toLowerCase())
    );
};

// AI-powered suggestions based on patient's previous data
export const getAISuggestions = async(patientData, fieldType) => {
    try {
        // This would integrate with your AI service
        // For now, we'll return empty array as placeholder
        const response = await fetch('/api/ai-suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patientData,
                fieldType,
                context: 'patient_registration'
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.suggestions || [];
        }

        return [];
    } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        return [];
    }
};

// Get previous patient data for autopopulation
export const getPreviousPatientData = async(patientId) => {
    try {
        // This would fetch from your database
        // For now, return mock data
        return {
            previousDiagnoses: [],
            previousProcedures: [],
            familyHistory: []
        };
    } catch (error) {
        console.error('Error fetching previous patient data:', error);
        return {
            previousDiagnoses: [],
            previousProcedures: [],
            familyHistory: []
        };
    }
};

// Debounce function for API calls
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};