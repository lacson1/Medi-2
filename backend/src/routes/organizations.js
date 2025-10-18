/**
 * Organization routes
 */

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all organizations
router.get('/', authenticateToken, requireRole(['SuperAdmin', 'Admin']), async(req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];
        let paramCount = 1;

        if (search) {
            whereClause = `WHERE (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        const countQuery = `SELECT COUNT(*) FROM organizations ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT * FROM organizations 
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

// Get organization by ID
router.get('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;

        // Users can only view their own organization unless they're admin
        if (id !== req.user.organizationId && !['SuperAdmin', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        const result = await query(
            'SELECT * FROM organizations WHERE id = $1', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
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

// Create new organization
router.post('/', authenticateToken, requireRole(['SuperAdmin']), async(req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            address,
            city,
            state,
            zip_code,
            country,
            website,
            description,
            settings
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Check if organization already exists
        const existingOrg = await query(
            'SELECT id FROM organizations WHERE email = $1', [email]
        );

        if (existingOrg.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Organization with this email already exists'
            });
        }

        const result = await query(`
            INSERT INTO organizations (
                name, email, phone, address, city, state, zip_code, country,
                website, description, settings, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [
            name, email, phone, address, city, state, zip_code, country,
            website, description, settings || '{}', req.user.userId
        ]);

        logger.info('New organization created', {
            organizationId: result.rows[0].id,
            name: result.rows[0].name,
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Update organization
router.put('/:id', authenticateToken, requireRole(['SuperAdmin', 'Admin']), async(req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if organization exists
        const existingOrg = await query(
            'SELECT id FROM organizations WHERE id = $1', [id]
        );

        if (existingOrg.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        // Only allow certain fields to be updated
        const allowedFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip_code', 'country', 'website', 'description', 'settings'];

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
            UPDATE organizations 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        logger.info('Organization updated', {
            organizationId: id,
            updatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'Organization updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

export default router;