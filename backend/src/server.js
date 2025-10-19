/**
 * MediFlow Backend API Server
 * Main server entry point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import utilities
import { createCRUDHandlers } from './utils/crudHandlers.js';
import { createRouter } from './utils/routeGenerator.js';

// Import specialized routes (non-CRUD)
import authRoutes from './routes/auth.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { formatResponse, formatErrorResponse } from './middleware/responseFormatter.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create CRUD handlers for different resources
const patientsHandlers = createCRUDHandlers('patients', [
    'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
    'address', 'emergency_contact', 'medical_history', 'allergies',
    'insurance_info', 'preferred_language', 'gender'
]);

const appointmentsHandlers = createCRUDHandlers('appointments', [
    'patient_id', 'doctor_id', 'appointment_date', 'appointment_time',
    'status', 'notes', 'appointment_type', 'duration', 'location'
]);

const prescriptionsHandlers = createCRUDHandlers('prescriptions', [
    'patient_id', 'doctor_id', 'medication', 'dosage', 'instructions',
    'start_date', 'end_date', 'refills', 'status', 'pharmacy_notes'
]);

const labOrdersHandlers = createCRUDHandlers('lab_orders', [
    'patient_id', 'doctor_id', 'test_name', 'test_type', 'status',
    'order_date', 'results', 'notes', 'lab_location', 'priority'
]);

const usersHandlers = createCRUDHandlers('users', [
    'first_name', 'last_name', 'email', 'role', 'organization_id',
    'job_title', 'department', 'specialization', 'phone', 'is_active',
    'license_number', 'npi_number'
]);

const organizationsHandlers = createCRUDHandlers('organizations', [
    'name', 'email', 'phone', 'address', 'type', 'is_active',
    'license_number', 'tax_id', 'website', 'description'
]);

const billingHandlers = createCRUDHandlers('billing', [
    'patient_id', 'appointment_id', 'amount', 'status', 'due_date',
    'payment_method', 'insurance_info', 'notes', 'invoice_number'
]);

const encountersHandlers = createCRUDHandlers('encounters', [
    'patient_id', 'doctor_id', 'encounter_date', 'encounter_type',
    'chief_complaint', 'diagnosis', 'treatment_plan', 'notes', 'status'
]);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000', // Add support for port 3000
        'http://localhost:3001' // Add support for port 3001
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Compression and logging
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply response formatter middleware
app.use('/api', formatResponse);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', authRoutes);

// CRUD routes with role-based access control
app.use('/api/patients', createRouter(patientsHandlers, {
    allowedRoles: ['SuperAdmin', 'Admin', 'Doctor', 'Nurse']
}));

app.use('/api/appointments', createRouter(appointmentsHandlers, {
    allowedRoles: ['SuperAdmin', 'Admin', 'Doctor', 'Nurse']
}));

app.use('/api/prescriptions', createRouter(prescriptionsHandlers, {
    allowedRoles: ['SuperAdmin', 'Admin', 'Doctor']
}));

app.use('/api/lab-orders', createRouter(labOrdersHandlers, {
    allowedRoles: ['SuperAdmin', 'Admin', 'Doctor', 'LabTech']
}));

app.use('/api/users', createRouter(usersHandlers, {
    allowedRoles: ['SuperAdmin', 'Admin']
}));

app.use('/api/organizations', createRouter(organizationsHandlers, {
    allowedRoles: ['SuperAdmin']
}));

app.use('/api/billing', createRouter(billingHandlers, {
    allowedRoles: ['SuperAdmin', 'Admin', 'Billing']
}));

app.use('/api/encounters', createRouter(encountersHandlers, {
    allowedRoles: ['SuperAdmin', 'Admin', 'Doctor', 'Nurse']
}));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'MediFlow Backend API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(formatErrorResponse);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`MediFlow Backend API server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

export default app;