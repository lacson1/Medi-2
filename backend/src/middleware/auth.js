/**
 * Authentication middleware
 */

import jwt from 'jsonwebtoken';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

export const authenticateToken = async(req, res, next) => {
    try {
        // CRITICAL: Remove development bypass for production security
        // Only allow bypass in development mode AND when explicitly enabled via environment variable
        if (process.env.NODE_ENV === 'development' &&
            process.env.ALLOW_DEV_BYPASS === 'true' &&
            !req.headers['authorization']) {
            logger.warn('Development authentication bypass enabled - NOT FOR PRODUCTION');
            req.user = {
                userId: 'dev-user-001',
                email: 'dev@mediflow.com',
                role: 'SuperAdmin',
                organizationId: '550e8400-e29b-41d4-a716-446655440000'
            };
            return next();
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify token with proper secret validation
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || jwtSecret === 'fallback-secret') {
            logger.error('JWT_SECRET not properly configured');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);

        // Check if user still exists and is active
        const userResult = await query(
            'SELECT id, email, role, organization_id, is_active FROM users WHERE id = $1', [decoded.userId]
        );

        if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            organizationId: decoded.organizationId
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        logger.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

export const requirePermission = (permission) => {
    return async(req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get user permissions
            const userResult = await query(
                'SELECT permissions FROM users WHERE id = $1', [req.user.userId]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const userPermissions = userResult.rows[0].permissions || [];

            // Check if user has the required permission or is SuperAdmin
            if (userPermissions.includes('*') || userPermissions.includes(permission)) {
                next();
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
        } catch (error) {
            logger.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Permission check error'
            });
        }
    };
};