/**
 * Patient routes
 */

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all patients
router.get('/', authenticateToken, async(req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];
        let paramCount = 1;

        if (search) {
            whereClause = `WHERE (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        const countQuery = `SELECT COUNT(*) FROM patients ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT * FROM patients 
            ${whereClause}
            ORDER BY created_at DESC 
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

// Get patient by ID
router.get('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            'SELECT * FROM patients WHERE id = $1', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
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

// Create new patient
router.post('/', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Doctor']), async(req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            medical_history,
            allergies
        } = req.body;

        if (!first_name || !last_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and email are required'
            });
        }

        // Check if patient already exists
        const existingPatient = await query(
            'SELECT id FROM patients WHERE email = $1', [email]
        );

        if (existingPatient.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Patient with this email already exists'
            });
        }

        const result = await query(`
            INSERT INTO patients (
                first_name, last_name, email, phone, date_of_birth, gender,
                address, emergency_contact_name, emergency_contact_phone,
                medical_history, allergies, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [
            first_name, last_name, email, phone, date_of_birth, gender,
            address, emergency_contact_name, emergency_contact_phone,
            medical_history, allergies, req.user.userId
        ]);

        logger.info('New patient created', {
            patientId: result.rows[0].id,
            email: result.rows[0].email,
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Patient created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Update patient
router.put('/:id', authenticateToken, requireRole(['SuperAdmin', 'Admin', 'Doctor']), async(req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if patient exists
        const existingPatient = await query(
            'SELECT id FROM patients WHERE id = $1', [id]
        );

        if (existingPatient.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && key !== 'id') {
                updateFields.push(`${key} = $${paramCount++}`);
                values.push(updateData[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const updateQuery = `
            UPDATE patients 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        logger.info('Patient updated', {
            patientId: id,
            updatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'Patient updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Delete patient
router.delete('/:id', authenticateToken, requireRole(['SuperAdmin', 'Admin']), async(req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM patients WHERE id = $1 RETURNING id', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        logger.info('Patient deleted', {
            patientId: id,
            deletedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'Patient deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

export default router;