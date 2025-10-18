// Data Aggregation Utilities for Clinical Performance Analytics
import { mockApiClient } from "@/api/mockApiClient";

/**
 * Aggregate clinical performance metrics from existing entities
 */
export class ClinicalDataAggregator {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get cached data or fetch fresh data
     */
    async getCachedData(key, fetchFunction) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const data = await fetchFunction();
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        return data;
    }

    /**
     * Aggregate clinical performance overview metrics
     */
    async getClinicalOverview(organizationId, dateRange = {}) {
        return this.getCachedData(`clinical-overview-${organizationId}-${JSON.stringify(dateRange)}`, async() => {
            const [appointments, encounters, patients] = await Promise.all([
                mockApiClient.entities.Appointment.list(),
                mockApiClient.entities.Encounter.list(),
                mockApiClient.entities.Patient.list()
            ]);

            // Filter by organization and date range
            const orgAppointments = appointments.filter(apt =>
                apt.organization === organizationId &&
                this.isInDateRange(apt.appointment_date, dateRange)
            );

            const orgEncounters = encounters.filter(enc =>
                this.isInDateRange(enc.visit_date, dateRange)
            );

            const orgPatients = patients.filter(patient =>
                patient.organization === organizationId
            );

            // Calculate metrics
            const totalEncounters = orgEncounters.length;
            const avgWaitTime = this.calculateAverageWaitTime(orgAppointments);
            const patientSatisfaction = this.calculatePatientSatisfaction(orgEncounters);
            const topDiagnoses = this.getTopDiagnoses(orgEncounters);
            const treatmentSuccessRate = this.calculateTreatmentSuccessRate(orgEncounters);

            return {
                totalEncounters,
                avgWaitTime,
                patientSatisfaction,
                topDiagnoses,
                treatmentSuccessRate,
                totalPatients: orgPatients.length,
                totalAppointments: orgAppointments.length
            };
        });
    }

    /**
     * Get performance trends over time
     */
    async getPerformanceTrends(organizationId, period = '30days') {
        return this.getCachedData(`performance-trends-${organizationId}-${period}`, async() => {
            const appointments = await mockApiClient.entities.Appointment.list();
            const encounters = await mockApiClient.entities.Encounter.list();

            const orgAppointments = appointments.filter(apt =>
                apt.organization === organizationId
            );

            const orgEncounters = encounters.filter(enc =>
                this.isInPeriod(enc.visit_date, period)
            );

            // Group by time periods
            const trends = this.groupByTimePeriod(orgEncounters, period);

            return trends.map(period => ({
                period: period.label,
                encounters: period.encounters,
                avgWaitTime: this.calculateAverageWaitTime(
                    orgAppointments.filter(apt =>
                        this.isInPeriod(apt.appointment_date, period.label)
                    )
                ),
                satisfaction: this.calculatePatientSatisfaction(period.encounters),
                successRate: this.calculateTreatmentSuccessRate(period.encounters)
            }));
        });
    }

    /**
     * Analyze diagnosis patterns
     */
    async getDiagnosisAnalysis(organizationId, dateRange = {}) {
        return this.getCachedData(`diagnosis-analysis-${organizationId}-${JSON.stringify(dateRange)}`, async() => {
            const encounters = await mockApiClient.entities.Encounter.list();

            const orgEncounters = encounters.filter(enc =>
                this.isInDateRange(enc.visit_date, dateRange)
            );

            // Extract diagnoses from encounters
            const diagnoses = this.extractDiagnoses(orgEncounters);

            // Calculate diagnosis distribution
            const distribution = this.calculateDiagnosisDistribution(diagnoses);

            // Get trends over time
            const trends = this.getDiagnosisTrends(orgEncounters);

            // Demographics correlation
            const demographics = this.getDiagnosisDemographics(orgEncounters);

            return {
                distribution,
                trends,
                demographics,
                totalDiagnoses: diagnoses.length
            };
        });
    }

    /**
     * Analyze staff performance metrics
     */
    async getStaffPerformance(organizationId, dateRange = {}) {
        return this.getCachedData(`staff-performance-${organizationId}-${JSON.stringify(dateRange)}`, async() => {
            const [appointments, encounters, users] = await Promise.all([
                mockApiClient.entities.Appointment.list(),
                mockApiClient.entities.Encounter.list(),
                mockApiClient.entities.User.list()
            ]);

            const orgUsers = users.filter(user =>
                user.organization === organizationId && ['Doctor', 'Nurse', 'Provider'].includes(user.role)
            );

            const staffMetrics = orgUsers.map(user => {
                const userAppointments = appointments.filter(apt =>
                    apt.provider === user.firstName + ' ' + user.lastName &&
                    this.isInDateRange(apt.appointment_date, dateRange)
                );

                const userEncounters = encounters.filter(enc =>
                    enc.provider === user.firstName + ' ' + user.lastName &&
                    this.isInDateRange(enc.visit_date, dateRange)
                );

                return {
                    userId: user.id,
                    name: user.firstName + ' ' + user.lastName,
                    role: user.role,
                    specialization: user.specialization,
                    totalAppointments: userAppointments.length,
                    completedAppointments: userAppointments.filter(apt =>
                        apt.status === 'completed'
                    ).length,
                    avgWaitTime: this.calculateAverageWaitTime(userAppointments),
                    patientSatisfaction: this.calculatePatientSatisfaction(userEncounters),
                    treatmentSuccessRate: this.calculateTreatmentSuccessRate(userEncounters),
                    productivity: this.calculateProductivity(userAppointments, userEncounters)
                };
            });

            return staffMetrics.sort((a, b) => b.productivity - a.productivity);
        });
    }

    /**
     * Helper methods
     */
    isInDateRange(dateString, dateRange) {
        if (!dateRange.start && !dateRange.end) return true;

        const date = new Date(dateString);
        const start = dateRange.start ? new Date(dateRange.start) : new Date(0);
        const end = dateRange.end ? new Date(dateRange.end) : new Date();

        return date >= start && date <= end;
    }

    isInPeriod(dateString, period) {
        const date = new Date(dateString);
        const now = new Date();

        switch (period) {
            case '7days':
                return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30days':
                return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '90days':
                return date >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            default:
                return true;
        }
    }

    calculateAverageWaitTime(appointments) {
        if (appointments.length === 0) return 0;

        const waitTimes = appointments
            .filter(apt => apt.wait_time)
            .map(apt => apt.wait_time);

        return waitTimes.length > 0 ?
            waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length :
            Math.random() * 20 + 5; // Mock data: 5-25 minutes
    }

    calculatePatientSatisfaction(encounters) {
        if (encounters.length === 0) return 0;

        // Mock satisfaction scores based on encounter outcomes
        const satisfactionScores = encounters.map(enc => {
            if (enc.assessment && enc.assessment.includes('good')) return 4.5;
            if (enc.assessment && enc.assessment.includes('excellent')) return 5.0;
            if (enc.assessment && enc.assessment.includes('poor')) return 2.0;
            return 3.5 + Math.random() * 1.5; // Random between 3.5-5.0
        });

        return satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length;
    }

    calculateTreatmentSuccessRate(encounters) {
        if (encounters.length === 0) return 0;

        // Mock success rate based on encounter plans
        const successRates = encounters.map(enc => {
            if (enc.plan && enc.plan.includes('follow up')) return 0.85;
            if (enc.plan && enc.plan.includes('continue')) return 0.95;
            if (enc.plan && enc.plan.includes('discharge')) return 0.90;
            return 0.80 + Math.random() * 0.15; // Random between 80-95%
        });

        return successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length;
    }

    getTopDiagnoses(encounters) {
        const diagnoses = this.extractDiagnoses(encounters);
        const diagnosisCount = {};

        diagnoses.forEach(diagnosis => {
            diagnosisCount[diagnosis] = (diagnosisCount[diagnosis] || 0) + 1;
        });

        return Object.entries(diagnosisCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([diagnosis, count]) => ({ diagnosis, count }));
    }

    extractDiagnoses(encounters) {
        const diagnoses = [];

        encounters.forEach(enc => {
            if (enc.assessment) {
                // Extract common diagnoses from assessment text
                const commonDiagnoses = [
                    'Hypertension', 'Diabetes', 'Common Cold', 'Flu', 'Migraine',
                    'Anxiety', 'Depression', 'Arthritis', 'Asthma', 'Bronchitis',
                    'Pneumonia', 'UTI', 'Headache', 'Back Pain', 'Chest Pain'
                ];

                commonDiagnoses.forEach(diagnosis => {
                    if (enc.assessment.toLowerCase().includes(diagnosis.toLowerCase())) {
                        diagnoses.push(diagnosis);
                    }
                });
            }
        });

        return diagnoses;
    }

    calculateDiagnosisDistribution(diagnoses) {
        const distribution = {};

        diagnoses.forEach(diagnosis => {
            distribution[diagnosis] = (distribution[diagnosis] || 0) + 1;
        });

        return Object.entries(distribution)
            .sort(([, a], [, b]) => b - a)
            .map(([diagnosis, count]) => ({
                diagnosis,
                count,
                percentage: (count / diagnoses.length) * 100
            }));
    }

    getDiagnosisTrends(encounters) {
        // Group encounters by month and analyze diagnosis trends
        const monthlyData = {};

        encounters.forEach(enc => {
            const month = new Date(enc.visit_date).toISOString().substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = [];
            }
            monthlyData[month].push(enc);
        });

        return Object.entries(monthlyData).map(([month, monthEncounters]) => ({
            month,
            diagnoses: this.getTopDiagnoses(monthEncounters).slice(0, 5)
        }));
    }

    getDiagnosisDemographics(encounters) {
        // Mock demographic analysis based on encounters
        const totalEncounters = encounters.length;

        return {
            ageGroups: {
                '0-18': 15,
                '19-35': 25,
                '36-50': 30,
                '51-65': 20,
                '65+': 10
            },
            genderDistribution: {
                'Male': 45,
                'Female': 55
            },
            totalEncounters
        };
    }

    calculateProductivity(appointments, encounters) {
        const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
        const totalEncounters = encounters.length;

        // Productivity score based on completed appointments and encounters
        return (completedAppointments * 0.6 + totalEncounters * 0.4) / Math.max(appointments.length, 1);
    }

    groupByTimePeriod(encounters, period) {
        const groups = {};

        encounters.forEach(enc => {
            const date = new Date(enc.visit_date);
            let key;

            switch (period) {
                case '7days':
                    key = date.toISOString().substring(0, 10); // Daily
                    break;
                case '30days':
                    key = date.toISOString().substring(0, 7); // Monthly
                    break;
                case '90days':
                    key = `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`; // Quarterly
                    break;
                default:
                    key = date.toISOString().substring(0, 7);
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(enc);
        });

        return Object.entries(groups).map(([label, encounters]) => ({
            label,
            encounters
        }));
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Clear specific cache entry
     */
    clearCacheEntry(key) {
        this.cache.delete(key);
    }
}

// Export singleton instance
export const clinicalDataAggregator = new ClinicalDataAggregator();