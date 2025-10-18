/**
 * Database seeding script
 * Populates the database with initial data
 */

import bcrypt from 'bcryptjs';
import { query } from './connection.js';

const seedData = async() => {
    try {
        console.log('Starting database seeding...');

        // Create default organization
        const orgResult = await query(`
            INSERT INTO organizations (id, name, type, address, city, state, zip_code, phone, email, is_active, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING
            RETURNING id
        `, [
            '550e8400-e29b-41d4-a716-446655440000', // Fixed UUID for consistency
            'MediFlow Medical Center',
            'hospital',
            '123 Medical Drive',
            'Healthcare City',
            'CA',
            '90210',
            '(555) 123-4567',
            'admin@mediflow.com',
            true,
            'Primary healthcare organization for MediFlow system'
        ]);

        const organizationId = orgResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440000';

        // Create default super admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await query(`
            INSERT INTO users (id, first_name, last_name, email, password_hash, role, permissions, organization_id, is_active, job_title, department)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (email) DO NOTHING
        `, [
            '550e8400-e29b-41d4-a716-446655440001',
            'Super',
            'Admin',
            'admin@mediflow.com',
            hashedPassword,
            'SuperAdmin', ['*'], // All permissions
            organizationId,
            true,
            'System Administrator',
            'IT'
        ]);

        // Create sample doctor
        const doctorPassword = await bcrypt.hash('doctor123', 10);
        await query(`
            INSERT INTO users (id, first_name, last_name, email, password_hash, role, permissions, organization_id, is_active, job_title, department, specialization, license_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (email) DO NOTHING
        `, [
            '550e8400-e29b-41d4-a716-446655440002',
            'Dr. Sarah',
            'Johnson',
            'sarah.johnson@mediflow.com',
            doctorPassword,
            'Doctor', ['patients:read', 'patients:write', 'appointments:read', 'appointments:write', 'encounters:read', 'encounters:write'],
            organizationId,
            true,
            'Primary Care Physician',
            'Internal Medicine',
            'Internal Medicine',
            'MD123456'
        ]);

        // Create sample nurse
        const nursePassword = await bcrypt.hash('nurse123', 10);
        await query(`
            INSERT INTO users (id, first_name, last_name, email, password_hash, role, permissions, organization_id, is_active, job_title, department)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (email) DO NOTHING
        `, [
            '550e8400-e29b-41d4-a716-446655440003',
            'Emily',
            'Davis',
            'emily.davis@mediflow.com',
            nursePassword,
            'Nurse', ['patients:read', 'appointments:read', 'encounters:read'],
            organizationId,
            true,
            'Registered Nurse',
            'Nursing'
        ]);

        // Create sample patients
        await query(`
            INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_number, allergies, medications, medical_history, blood_type, status, organization_id)
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20),
            ($21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40)
            ON CONFLICT (id) DO NOTHING
        `, [
            // Patient 1
            '550e8400-e29b-41d4-a716-446655440010',
            'John',
            'Smith',
            '1985-03-15',
            'male',
            '(555) 111-2222',
            'john.smith@email.com',
            '123 Main St',
            'Springfield',
            'IL',
            '62701',
            'Jane Smith',
            '(555) 111-2223',
            'Blue Cross Blue Shield',
            'BC123456789', ['Penicillin', 'Shellfish'],
            ['Lisinopril 10mg daily'],
            ['Hypertension', 'Type 2 Diabetes'],
            'O+',
            'active',
            organizationId,
            // Patient 2
            '550e8400-e29b-41d4-a716-446655440011',
            'Mary',
            'Johnson',
            '1992-07-22',
            'female',
            '(555) 333-4444',
            'mary.johnson@email.com',
            '456 Oak Ave',
            'Springfield',
            'IL',
            '62702',
            'Robert Johnson',
            '(555) 333-4445',
            'Aetna',
            'AET987654321', ['Latex'],
            ['Metformin 500mg twice daily'],
            ['Type 2 Diabetes'],
            'A-',
            'active',
            organizationId
        ]);

        // Create sample appointments
        await query(`
            INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, duration, type, status, notes, reason, organization_id)
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11),
            ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            ON CONFLICT (id) DO NOTHING
        `, [
            // Appointment 1
            '550e8400-e29b-41d4-a716-446655440020',
            '550e8400-e29b-41d4-a716-446655440010',
            '550e8400-e29b-41d4-a716-446655440002',
            '2024-01-15',
            '09:00:00',
            30,
            'consultation',
            'scheduled',
            'Regular checkup',
            'Annual physical examination',
            organizationId,
            // Appointment 2
            '550e8400-e29b-41d4-a716-446655440021',
            '550e8400-e29b-41d4-a716-446655440011',
            '550e8400-e29b-41d4-a716-446655440002',
            '2024-01-16',
            '10:30:00',
            45,
            'follow_up',
            'confirmed',
            'Follow-up for diabetes management',
            'Diabetes follow-up appointment',
            organizationId
        ]);

        console.log('✓ Database seeding completed successfully!');
        console.log('Default credentials:');
        console.log('  Super Admin: admin@mediflow.com / admin123');
        console.log('  Doctor: sarah.johnson@mediflow.com / doctor123');
        console.log('  Nurse: emily.davis@mediflow.com / nurse123');

        return true;
    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    }
};

// Run seeding if this file is executed directly
if (
    import.meta.url === `file://${process.argv[1]}`) {
    seedData()
        .then(() => {
            console.log('Seeding script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding script failed:', error);
            process.exit(1);
        });
}

export default seedData;
