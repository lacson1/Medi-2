/**
 * Production Database Migration Script
 * Creates all necessary tables for MediFlow production environment
 */

import { query } from './connection.js';
import { logger } from '../utils/logger.js';

const productionMigrations = [
    // Organizations table with production constraints
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
        subscription JSONB DEFAULT '{"plan": "basic", "user_limit": 5, "patient_limit": 100}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        CONSTRAINT org_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
    )`,

    // Users table with enhanced security
    `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient', 'Billing', 'LabTech')),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        job_title VARCHAR(100),
        department VARCHAR(100),
        specialization VARCHAR(100),
        phone VARCHAR(20),
        mobile VARCHAR(20),
        bio TEXT,
        permissions JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        CONSTRAINT user_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
        CONSTRAINT user_name_length CHECK (LENGTH(first_name) >= 2 AND LENGTH(last_name) >= 2)
    )`,

    // Patients table with production constraints
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
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id),
        CONSTRAINT patient_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
        CONSTRAINT patient_name_length CHECK (LENGTH(first_name) >= 2 AND LENGTH(last_name) >= 2)
    )`,

    // Appointments table
    `CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration INTEGER DEFAULT 30,
        type VARCHAR(50) DEFAULT 'consultation',
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
        notes TEXT,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Prescriptions table
    `CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        instructions TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Lab Orders table
    `CREATE TABLE IF NOT EXISTS lab_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
        test_name VARCHAR(255) NOT NULL,
        test_type VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        results TEXT,
        notes TEXT,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
    )`,

    // Audit logs table for production monitoring
    `CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        record_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Session management table
    `CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
];

// Create production indexes for performance
const productionIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email_prod ON users(email) WHERE is_active = true',
    'CREATE INDEX IF NOT EXISTS idx_users_organization_prod ON users(organization_id) WHERE is_active = true',
    'CREATE INDEX IF NOT EXISTS idx_patients_status_prod ON patients(status) WHERE status = \'active\'',
    'CREATE INDEX IF NOT EXISTS idx_appointments_date_prod ON appointments(appointment_date)',
    'CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_prod ON prescriptions(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_lab_orders_status_prod ON lab_orders(status)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id) WHERE is_active = true',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)'
];

// Create production triggers for audit logging
const productionTriggers = [
    `CREATE OR REPLACE FUNCTION audit_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, ip_address, user_agent)
            VALUES (current_setting('app.current_user_id', true)::uuid, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD), 
                   current_setting('app.client_ip', true)::inet, current_setting('app.user_agent', true));
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
            VALUES (current_setting('app.current_user_id', true)::uuid, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW),
                   current_setting('app.client_ip', true)::inet, current_setting('app.user_agent', true));
            RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
            INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address, user_agent)
            VALUES (current_setting('app.current_user_id', true)::uuid, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW),
                   current_setting('app.client_ip', true)::inet, current_setting('app.user_agent', true));
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;`,

    'CREATE TRIGGER users_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();',
    'CREATE TRIGGER patients_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON patients FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();',
    'CREATE TRIGGER appointments_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON appointments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();',
    'CREATE TRIGGER prescriptions_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON prescriptions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();',
    'CREATE TRIGGER lab_orders_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON lab_orders FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();'
];

// Run production migrations
const runProductionMigrations = async () => {
    try {
        logger.info('Starting production database migrations...');
        
        // Run table migrations
        for (const migration of productionMigrations) {
            await query(migration);
            logger.info(`Executed migration: ${migration.substring(0, 50)}...`);
        }
        
        // Create indexes
        for (const index of productionIndexes) {
            await query(index);
            logger.info(`Created index: ${index.substring(0, 50)}...`);
        }
        
        // Create triggers
        for (const trigger of productionTriggers) {
            await query(trigger);
            logger.info(`Created trigger: ${trigger.substring(0, 50)}...`);
        }
        
        logger.info('Production database migrations completed successfully');
        
    } catch (error) {
        logger.error('Production migration failed:', error);
        throw error;
    }
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runProductionMigrations()
        .then(() => {
            logger.info('Production migrations completed');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Production migrations failed:', error);
            process.exit(1);
        });
}

export { runProductionMigrations };
