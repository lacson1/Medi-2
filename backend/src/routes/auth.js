/**
 * Authentication routes
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Login endpoint
router.post('/login', async(req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const userResult = await query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true', [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = userResult.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]
        );

        // Generate JWT token with proper secret validation
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || jwtSecret === 'fallback-secret') {
            logger.error('JWT_SECRET not properly configured');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        const token = jwt.sign({
                userId: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organization_id
            },
            jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Remove password from response
        const userWithoutPassword = {...user };
        delete userWithoutPassword.password_hash;

        logger.info('User logged in successfully', { userId: user.id, email: user.email });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get current user profile
router.get('/me', authenticateToken, async(req, res, next) => {
    try {
        const userResult = await query(
            'SELECT * FROM users WHERE id = $1', [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];
        const userWithoutPassword = {...user };
        delete userWithoutPassword.password_hash;

        res.json({
            success: true,
            data: { user: userWithoutPassword }
        });

    } catch (error) {
        next(error);
    }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
    logger.info('User logged out', { userId: req.user.userId });
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

export default router;