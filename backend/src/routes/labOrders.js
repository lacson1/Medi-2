/**
 * Lab Order routes
 */

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all lab orders
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

        // Non-admin users can only see their own lab orders
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

        const countQuery = `SELECT COUNT(*) FROM lab_orders ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT lo.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM lab_orders lo
            LEFT JOIN patients p ON lo.patient_id = p.id
            LEFT JOIN users d ON lo.doctor_id = d.id
            ${whereClause}
            ORDER BY lo.order_date DESC 
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

// Get lab order by ID
router.get('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT lo.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM lab_orders lo
            LEFT JOIN patients p ON lo.patient_id = p.id
            LEFT JOIN users d ON lo.doctor_id = d.id
            WHERE lo.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lab order not found'
            });
        }

        const labOrder = result.rows[0];

        // Check permissions
        if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
            if (req.user.role === 'Doctor' && labOrder.doctor_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
            if (req.user.role === 'Patient' && labOrder.patient_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
        }

        res.json({
            success: true,
            data: labOrder
        });

    } catch (error) {
        next(error);
    }
});

// Create new lab order
router.post('/', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Doctor']), async(req, res, next) => {
    try {
        const {
            patient_id,
            doctor_id,
            tests,
            order_date,
            priority,
            notes,
            status
        } = req.body;

        if (!patient_id || !doctor_id || !tests || !Array.isArray(tests) || tests.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID, doctor ID, and tests are required'
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
            INSERT INTO lab_orders (
                patient_id, doctor_id, tests, order_date,
                priority, notes, status, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            patient_id, doctor_id, JSON.stringify(tests), order_date || new Date().toISOString().split('T')[0],
            priority || 'normal', notes, status || 'ordered', req.user.userId
        ]);

        logger.info('New lab order created', {
            labOrderId: result.rows[0].id,
            patientId: patient_id,
            doctorId: doctor_id,
            testsCount: tests.length,
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Lab order created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Update lab order
router.put('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if lab order exists
        const existingLabOrder = await query(
            'SELECT * FROM lab_orders WHERE id = $1', [id]
        );

        if (existingLabOrder.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lab order not found'
            });
        }

        const labOrder = existingLabOrder.rows[0];

        // Check permissions
        if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
            if (req.user.role === 'Doctor' && labOrder.doctor_id !== req.user.userId) {
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
        const allowedFields = ['tests', 'order_date', 'priority', 'notes', 'status', 'results', 'result_date'];

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                if (key === 'tests' && Array.isArray(updateData[key])) {
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
            UPDATE lab_orders 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        logger.info('Lab order updated', {
            labOrderId: id,
            updatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'Lab order updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

export default router;