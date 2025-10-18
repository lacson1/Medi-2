/**
 * Appointment routes
 */

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all appointments
router.get('/', authenticateToken, async(req, res, next) => {
    try {
        const { page = 1, limit = 10, patient_id, doctor_id, status, date_from, date_to } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];
        let paramCount = 1;

        // Build where clause based on filters
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

        if (date_from) {
            conditions.push(`appointment_date >= $${paramCount++}`);
            params.push(date_from);
        }

        if (date_to) {
            conditions.push(`appointment_date <= $${paramCount++}`);
            params.push(date_to);
        }

        // Non-admin users can only see their own appointments
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

        const countQuery = `SELECT COUNT(*) FROM appointments ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT a.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN users d ON a.doctor_id = d.id
            ${whereClause}
            ORDER BY a.appointment_date DESC 
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

// Get appointment by ID
router.get('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT a.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN users d ON a.doctor_id = d.id
            WHERE a.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        const appointment = result.rows[0];

        // Check permissions
        if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
            if (req.user.role === 'Doctor' && appointment.doctor_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
            if (req.user.role === 'Patient' && appointment.patient_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
        }

        res.json({
            success: true,
            data: appointment
        });

    } catch (error) {
        next(error);
    }
});

// Create new appointment
router.post('/', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Doctor', 'Receptionist']), async(req, res, next) => {
    try {
        const {
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            duration,
            type,
            reason,
            notes
        } = req.body;

        if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID, doctor ID, appointment date, and time are required'
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

        // Check for conflicting appointments
        const conflictResult = await query(`
            SELECT id FROM appointments 
            WHERE doctor_id = $1 
            AND appointment_date = $2 
            AND appointment_time = $3 
            AND status IN ('scheduled', 'confirmed')
        `, [doctor_id, appointment_date, appointment_time]);

        if (conflictResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Doctor has a conflicting appointment at this time'
            });
        }

        const result = await query(`
            INSERT INTO appointments (
                patient_id, doctor_id, appointment_date, appointment_time,
                duration, type, reason, notes, status, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            patient_id, doctor_id, appointment_date, appointment_time,
            duration || 30, type || 'consultation', reason, notes,
            'scheduled', req.user.userId
        ]);

        logger.info('New appointment created', {
            appointmentId: result.rows[0].id,
            patientId: patient_id,
            doctorId: doctor_id,
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Update appointment
router.put('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if appointment exists
        const existingAppointment = await query(
            'SELECT * FROM appointments WHERE id = $1', [id]
        );

        if (existingAppointment.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        const appointment = existingAppointment.rows[0];

        // Check permissions
        if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
            if (req.user.role === 'Doctor' && appointment.doctor_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
            if (req.user.role === 'Patient' && appointment.patient_id !== req.user.userId) {
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
        const allowedFields = ['appointment_date', 'appointment_time', 'duration', 'type', 'reason', 'notes', 'status'];

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                updateFields.push(`${key} = $${paramCount++}`);
                values.push(updateData[key]);
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
            UPDATE appointments 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        logger.info('Appointment updated', {
            appointmentId: id,
            updatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Cancel appointment
router.patch('/:id/cancel', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Check if appointment exists
        const existingAppointment = await query(
            'SELECT * FROM appointments WHERE id = $1', [id]
        );

        if (existingAppointment.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        const appointment = existingAppointment.rows[0];

        // Check permissions
        if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
            if (req.user.role === 'Doctor' && appointment.doctor_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
            if (req.user.role === 'Patient' && appointment.patient_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
        }

        const result = await query(
            'UPDATE appointments SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *', ['cancelled', reason || 'Appointment cancelled', id]
        );

        logger.info('Appointment cancelled', {
            appointmentId: id,
            cancelledBy: req.user.userId,
            reason
        });

        res.json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

export default router;