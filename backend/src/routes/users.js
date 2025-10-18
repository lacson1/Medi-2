/**
 * User routes
 */

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, requireRole(['SuperAdmin', 'Admin']), async(req, res, next) => {
    try {
        const { page = 1, limit = 10, role, organization_id } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];
        let paramCount = 1;

        if (role) {
            whereClause += `WHERE role = $${paramCount++}`;
            params.push(role);
        }

        if (organization_id) {
            whereClause += whereClause ? ` AND organization_id = $${paramCount++}` : `WHERE organization_id = $${paramCount++}`;
            params.push(organization_id);
        }

        const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT id, first_name, last_name, email, role, organization_id, 
                   job_title, department, specialization, phone, is_active, 
                   created_at, updated_at, last_login
            FROM users 
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

// Get user by ID
router.get('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;

        // Users can only view their own profile unless they're admin
        if (id !== req.user.userId && !['SuperAdmin', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        const result = await query(
            'SELECT id, first_name, last_name, email, role, organization_id, job_title, department, specialization, phone, bio, is_active, created_at, updated_at FROM users WHERE id = $1', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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

// Update user
router.put('/:id', authenticateToken, async(req, res, next) => {
    try {
        const { id } = req.params;

        // Users can only update their own profile unless they're admin
        if (id !== req.user.userId && !['SuperAdmin', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        const updateData = req.body;

        // Check if user exists
        const existingUser = await query(
            'SELECT id FROM users WHERE id = $1', [id]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        // Only allow certain fields to be updated
        const allowedFields = ['first_name', 'last_name', 'phone', 'mobile', 'job_title', 'department', 'specialization', 'bio'];

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
            UPDATE users 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING id, first_name, last_name, email, role, organization_id, 
                     job_title, department, specialization, phone, mobile, bio, 
                     is_active, created_at, updated_at
        `;

        const result = await query(updateQuery, values);

        logger.info('User updated', {
            userId: id,
            updatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Deactivate user
router.patch('/:id/deactivate', authenticateToken, requireRole(['SuperAdmin', 'Admin']), async(req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info('User deactivated', {
            userId: id,
            deactivatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Reactivate user
router.patch('/:id/activate', authenticateToken, requireRole(['SuperAdmin', 'Admin']), async(req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info('User reactivated', {
            userId: id,
            reactivatedBy: req.user.userId
        });

        res.json({
            success: true,
            message: 'User reactivated successfully'
        });

    } catch (error) {
        next(error);
    }
});

export default router;