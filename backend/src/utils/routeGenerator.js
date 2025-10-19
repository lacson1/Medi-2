/**
 * Generate Express router with CRUD routes
 * Provides standardized route generation with authentication and role-based access control
 */

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

/**
 * Generate Express router with CRUD routes
 * @param {Object} handlers - Object containing CRUD handler functions
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - Whether to require authentication (default: true)
 * @param {string[]} options.allowedRoles - Array of roles allowed to access routes
 * @param {Object} options.customRoutes - Object containing custom routes to add
 * @returns {express.Router} Configured Express router
 */
export const createRouter = (handlers, options = {}) => {
    const router = express.Router();
    const {
        requireAuth = true,
            allowedRoles = [],
            customRoutes = {}
    } = options;

    // Apply authentication middleware if required
    if (requireAuth) {
        router.use(authenticateToken);
    }

    // Apply role-based access control if specified
    if (allowedRoles.length > 0) {
        router.use(requireRole(allowedRoles));
    }

    // Standard CRUD routes
    router.get('/', handlers.list);
    router.get('/:id', handlers.get);
    router.post('/', handlers.create);
    router.put('/:id', handlers.update);
    router.delete('/:id', handlers.delete);

    // Add custom routes if provided
    Object.entries(customRoutes).forEach(([method, routes]) => {
        if (Array.isArray(routes)) {
            routes.forEach(route => {
                if (route.path && route.handler) {
                    router[method](route.path, route.handler);
                }
            });
        }
    });

    return router;
};

/**
 * Create a router with bulk operations support
 * @param {Object} handlers - Base CRUD handlers
 * @param {Object} options - Configuration options
 * @returns {express.Router} Router with bulk operations
 */
export const createRouterWithBulk = (handlers, options = {}) => {
    const router = createRouter(handlers, options);

    // Add bulk operations
    router.put('/bulk', async(req, res, next) => {
        try {
            const { updates } = req.body;

            if (!Array.isArray(updates)) {
                return res.status(400).json({
                    success: false,
                    message: 'Updates must be an array',
                    timestamp: new Date().toISOString()
                });
            }

            const results = [];
            for (const update of updates) {
                if (update.id && update.data) {
                    try {
                        const result = await handlers.update({ params: { id: update.id }, body: update.data },
                            res,
                            next
                        );
                        results.push(result);
                    } catch (error) {
                        results.push({ id: update.id, error: error.message });
                    }
                }
            }

            res.json({
                success: true,
                data: results,
                message: 'Bulk update completed',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    });

    return router;
};