/**
 * Prescription routes
 */

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all prescriptions
router.get('/', authenticateToken, async(req, res, next) => {
    try {
        const { page = 1, limit = 10, patient_id, doctor_id, status } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];
        let paramCount = 1;

        const conditions = [];

        if (patient_id) {
            conditions.push(`patient_id = $${paramCount++}`);
            params.push(patient_id);
        }

        if (doctor_id) {
            conditions.push(`doctor_id = $${paramCount++}`);
            params.push(doctor_id);
        }

        if (status) {
            conditions.push(`status = $${paramCount++}`);
            params.push(status);
        }

        // Non-admin users can only see their own prescriptions
        if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
            if (req.user.role === 'Doctor') {
                conditions.push(`doctor_id = $${paramCount++}`);
                params.push(req.user.userId);
            } else if (req.user.role === 'Patient') {
                conditions.push(`patient_id = $${paramCount++}`);
                params.push(req.user.userId);
            }
        }

        if (conditions.length > 0) {
            whereClause = `WHERE ${conditions.join(' AND ')}`;
        }

        const countQuery = `SELECT COUNT(*) FROM prescriptions ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT p.*, 
                   pt.first_name as patient_first_name, pt.last_name as patient_last_name,
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN patients pt ON p.patient_id = pt.id
            LEFT JOIN users d ON p.doctor_id = d.id
            ${whereClause}
            ORDER BY p.prescription_date DESC 
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        params.push(limit, offset);

        const result = await query(dataQuery, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get prescription by ID
router.get('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT p.*, 
                   pt.first_name as patient_first_name, pt.last_name as patient_last_name,
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN patients pt ON p.patient_id = pt.id
            LEFT JOIN users d ON p.doctor_id = d.id
            WHERE p.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        const prescription = result.rows[0];

        // Check permissions
        if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
            if (req.user.role === 'Doctor' && prescription.doctor_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
            if (req.user.role === 'Patient' && prescription.patient_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
        }

        res.json({
            success: true,
            data: prescription
        });

    } catch (error) {
        next(error);
    }
});

// Create new prescription
router.post('/', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Doctor']), async(req, res, next) => {
    try {
        const {
            patient_id,
            doctor_id,
            medications,
            prescription_date,
            instructions,
            notes,
            status
        } = req.body;

        if (!patient_id || !doctor_id || !medications || !Array.isArray(medications) || medications.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID, doctor ID, and medications are required'
            });
        }

        // Check if patient exists
        const patientResult = await query(
            'SELECT id FROM patients WHERE id = $1', [patient_id]
        );

        if (patientResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Check if doctor exists
        const doctorResult = await query(
            'SELECT id FROM users WHERE id = $1 AND role = $2', [doctor_id, 'Doctor']
        );

        if (doctorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const result = await query(`
            INSERT INTO prescriptions (
                patient_id, doctor_id, medications, prescription_date,
                instructions, notes, status, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            patient_id, doctor_id, JSON.stringify(medications), prescription_date || new Date().toISOString().split('T')[0],
            instructions, notes, status || 'active', req.user.userId
        ]);

        logger.info('New prescription created', {
            prescriptionId: result.rows[0].id,
            patientId: patient_id,
            doctorId: doctor_id,
            medicationsCount: medications.length,
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Update prescription
router.put('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if prescription exists
        const existingPrescription = await query(
            'SELECT * FROM prescriptions WHERE id = $1', [id]
        );

        if (existingPrescription.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        const prescription = existingPrescription.rows[0];

        // Check permissions
        if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
            if (req.user.role === 'Doctor' && prescription.doctor_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        // Only allow certain fields to be updated
        const allowedFields = ['medications', 'prescription_date', 'instructions', 'notes', 'status'];

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                if (key === 'medications' && Array.isArray(updateData[key])) {
                    updateFields.push(`${key} = $${paramCount++}`);
                    values.push(JSON.stringify(updateData[key]));
                } else {
                    updateFields.push(`${key} = $${paramCount++}`);
                    values.push(updateData[key]);
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const updateQuery = `
            UPDATE prescriptions 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        logger.info('Prescription updated', {
            prescriptionId: id,
            updatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'Prescription updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

export default router;