/**
 * Database Migration Script
 * Creates all necessary tables for MediFlow application
 */

import { query } from './connection.js';
import { logger } from '../utils/logger.js';

const migrations = [
    // Organizations table
    `CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        website VARCHAR(255),
        description TEXT,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID
    )`,

    // Users table
    `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient', 'Billing')),
        organization_id UUID REFERENCES organizations(id),
        job_title VARCHAR(100),
        department VARCHAR(100),
        specialization VARCHAR(100),
        phone VARCHAR(20),
        mobile VARCHAR(20),
        bio TEXT,
        permissions JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID
    )`,

    // Patients table
    `CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
        address TEXT,
        emergency_contact_name VARCHAR(200),
        emergency_contact_phone VARCHAR(20),
        medical_history TEXT,
        allergies TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Appointments table
    `CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id),
        doctor_id UUID NOT NULL REFERENCES users(id),
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration INTEGER DEFAULT 30,
        type VARCHAR(50) DEFAULT 'consultation',
        reason TEXT,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Encounters table
    `CREATE TABLE IF NOT EXISTS encounters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id),
        doctor_id UUID NOT NULL REFERENCES users(id),
        encounter_date DATE NOT NULL,
        type VARCHAR(50) NOT NULL,
        chief_complaint TEXT,
        history_of_present_illness TEXT,
        physical_examination TEXT,
        assessment TEXT,
        plan TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Lab Orders table
    `CREATE TABLE IF NOT EXISTS lab_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id),
        doctor_id UUID NOT NULL REFERENCES users(id),
        tests JSONB NOT NULL,
        order_date DATE NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'collected', 'processing', 'completed', 'cancelled')),
        results JSONB,
        result_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Prescriptions table
    `CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id),
        doctor_id UUID NOT NULL REFERENCES users(id),
        medications JSONB NOT NULL,
        prescription_date DATE NOT NULL,
        instructions TEXT,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Billing table
    `CREATE TABLE IF NOT EXISTS billing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id),
        encounter_id UUID REFERENCES encounters(id),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        billing_date DATE NOT NULL,
        due_date DATE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
        payment_date DATE,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Audit Logs table
    `CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
];

const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
    'CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)',
    'CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_encounters_doctor ON encounters(doctor_id)',
    'CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_billing_patient ON billing(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)'
];

async function runMigrations() {
    try {
        logger.info('Starting database migrations...');

        // Run table creation migrations
        for (const migration of migrations) {
            await query(migration);
            logger.info('Migration executed successfully');
        }

        // Create indexes
        for (const index of indexes) {
            await query(index);
            logger.info('Index created successfully');
        }

        logger.info('All migrations completed successfully');
        return true;
    } catch (error) {
        logger.error('Migration failed:', error);
        throw error;
    }
}

async function seedDatabase() {
    try {
        logger.info('Starting database seeding...');

        // Create default organization
        const orgResult = await query(`
            INSERT INTO organizations (name, email, description, settings)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `, [
            'MediFlow Healthcare',
            'admin@mediflow.com',
            'Default healthcare organization',
            JSON.stringify({ theme: 'default', features: ['appointments', 'patients', 'billing'] })
        ]);

        let orgId = orgResult.rows[0] && orgResult.rows[0].id;

        if (!orgId) {
            // Get existing organization
            const existingOrg = await query('SELECT id FROM organizations WHERE email = $1', ['admin@mediflow.com']);
            orgId = existingOrg.rows[0].id;
        }

        // Create default super admin user
        const bcrypt = await
        import ('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await query(`
            INSERT INTO users (first_name, last_name, email, password_hash, role, organization_id, job_title)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (email) DO NOTHING
        `, [
            'Super',
            'Admin',
            'admin@mediflow.com',
            hashedPassword,
            'SuperAdmin',
            orgId,
            'System Administrator'
        ]);

        logger.info('Database seeding completed successfully');
        return true;
    } catch (error) {
        logger.error('Seeding failed:', error);
        throw error;
    }
}

// Run migrations and seeding if this file is executed directly
if (
    import.meta.url === `file://${process.argv[1]}`) {
    runMigrations()
        .then(() => seedDatabase())
        .then(() => {
            logger.info('Database setup completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Database setup failed:', error);
            process.exit(1);
        });
}

export { runMigrations, seedDatabase };