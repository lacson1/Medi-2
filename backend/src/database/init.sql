-- Development Database Initialization Script for MediFlow
-- This script sets up the development database with sample data

-- Create the main database tables
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    type VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    license_number VARCHAR(100),
    tax_id VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    job_title VARCHAR(100),
    department VARCHAR(100),
    specialization VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    license_number VARCHAR(100),
    npi_number VARCHAR(100),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    address TEXT,
    emergency_contact JSONB,
    medical_history TEXT,
    allergies TEXT,
    insurance_info JSONB,
    preferred_language VARCHAR(50),
    gender VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    appointment_type VARCHAR(100),
    duration INTEGER DEFAULT 30,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    instructions TEXT,
    start_date DATE,
    end_date DATE,
    refills INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    pharmacy_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    order_date DATE DEFAULT CURRENT_DATE,
    results JSONB,
    notes TEXT,
    lab_location VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    appointment_id UUID REFERENCES appointments(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    payment_method VARCHAR(100),
    insurance_info JSONB,
    notes TEXT,
    invoice_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    encounter_date DATE NOT NULL,
    encounter_type VARCHAR(100),
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample organization
INSERT INTO organizations (id, name, email, phone, address, type, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'MedFlow Medical Center', 'admin@medflow.com', '+1-555-0123', '123 Medical Drive, Health City, HC 12345', 'Medical Practice', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample users (password is 'dev' hashed with bcrypt)
INSERT INTO users (id, first_name, last_name, email, password_hash, role, organization_id, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Super', 'Admin', 'superadmin@mediflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SuperAdmin', '550e8400-e29b-41d4-a716-446655440000', true),
('550e8400-e29b-41d4-a716-446655440002', 'John', 'Doctor', 'dev@medi-2.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Doctor', '550e8400-e29b-41d4-a716-446655440000', true),
('550e8400-e29b-41d4-a716-446655440003', 'Jane', 'Nurse', 'nurse@mediflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurse', '550e8400-e29b-41d4-a716-446655440000', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (id, first_name, last_name, email, phone, date_of_birth, address, status) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'Alice', 'Johnson', 'alice.johnson@email.com', '+1-555-0101', '1985-03-15', '456 Patient Street, Health City, HC 12345', 'active'),
('550e8400-e29b-41d4-a716-446655440011', 'Bob', 'Smith', 'bob.smith@email.com', '+1-555-0102', '1978-07-22', '789 Health Avenue, Health City, HC 12345', 'active'),
('550e8400-e29b-41d4-a716-446655440012', 'Carol', 'Davis', 'carol.davis@email.com', '+1-555-0103', '1992-11-08', '321 Wellness Road, Health City, HC 12345', 'active')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_patient ON billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters(patient_id);
