/**
 * Billing routes
 */

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all billing records
router.get('/', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Billing']), async(req, res, next) => {
    try {
        const { page = 1, limit = 10, patient_id, status } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];
        let paramCount = 1;

        const conditions = [];

        if (patient_id) {
            conditions.push(`patient_id = $${paramCount++}`);
            params.push(patient_id);
        }

        if (status) {
            conditions.push(`status = $${paramCount++}`);
            params.push(status);
        }

        if (conditions.length > 0) {
            whereClause = `WHERE ${conditions.join(' AND ')}`;
        }

        const countQuery = `SELECT COUNT(*) FROM billing ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT b.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name
            FROM billing b
            LEFT JOIN patients p ON b.patient_id = p.id
            ${whereClause}
            ORDER BY b.created_at DESC 
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

// Get billing record by ID
router.get('/:id', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Billing']), async(req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT b.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name
            FROM billing b
            LEFT JOIN patients p ON b.patient_id = p.id
            WHERE b.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Billing record not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Create new billing record
router.post('/', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Billing']), async(req, res, next) => {
    try {
        const {
            patient_id,
            encounter_id,
            amount,
            description,
            billing_date,
            due_date,
            status
        } = req.body;

        if (!patient_id || !amount || !description) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID, amount, and description are required'
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

        const result = await query(`
            INSERT INTO billing (
                patient_id, encounter_id, amount, description,
                billing_date, due_date, status, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            patient_id, encounter_id, amount, description,
            billing_date || new Date().toISOString().split('T')[0],
            due_date, status || 'pending', req.user.userId
        ]);

        logger.info('New billing record created', {
            billingId: result.rows[0].id,
            patientId: patient_id,
            amount: amount,
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Billing record created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Update billing record
router.put('/:id', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Billing']), async(req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if billing record exists
        const existingBilling = await query(
            'SELECT id FROM billing WHERE id = $1', [id]
        );

        if (existingBilling.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Billing record not found'
            });
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        // Only allow certain fields to be updated
        const allowedFields = ['amount', 'description', 'billing_date', 'due_date', 'status', 'payment_date', 'payment_method'];

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
            UPDATE billing 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        logger.info('Billing record updated', {
            billingId: id,
            updatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'Billing record updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

export default router;