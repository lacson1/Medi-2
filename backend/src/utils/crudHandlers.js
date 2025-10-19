/**
 * Generic CRUD handlers for any database table
 * Provides standardized list, get, create, update, delete operations
 */

import { query } from '../database/connection.js';
import { logger } from './logger.js';

/**
 * Create CRUD handlers for a specific database table
 * @param {string} tableName - Name of the database table
 * @param {string[]} allowedFields - Array of fields allowed for create/update operations
 * @returns {Object} Object containing CRUD handler functions
 */
export const createCRUDHandlers = (tableName, allowedFields = []) => {
    // Helper function to filter allowed fields
    const filterFields = (data, allowed) => {
        if (allowed.length === 0) return data;
        return Object.keys(data)
            .filter(key => allowed.includes(key))
            .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});
    };

    // Helper function to build WHERE clause
    const buildWhereClause = (filters, paramCount = 1) => {
        const conditions = [];
        const params = [];

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'string' && value.includes('%')) {
                    conditions.push(`${key} ILIKE $${paramCount}`);
                    params.push(value);
                } else {
                    conditions.push(`${key} = $${paramCount}`);
                    params.push(value);
                }
                paramCount++;
            }
        });

        return {
            whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
            params,
            paramCount
        };
    };

    return {
        // GET /api/{resource} - List all with pagination and filters
        list: async(req, res, next) => {
            try {
                const { page = 1, limit = 10, ...filters } = req.query;
                const offset = (page - 1) * limit;

                // Build WHERE clause from query parameters
                const { whereClause, params, paramCount } = buildWhereClause(filters);

                // Get total count
                const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
                const countResult = await query(countQuery, params);
                const total = parseInt(countResult.rows[0].count);

                // Get paginated data
                const dataQuery = `
          SELECT * FROM ${tableName} 
          ${whereClause}
          ORDER BY created_at DESC 
          LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
                const dataParams = [...params, limit, offset];
                const result = await query(dataQuery, dataParams);

                res.json({
                    success: true,
                    data: result.rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    },
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                logger.error(`Error listing ${tableName}:`, error);
                next(error);
            }
        },

        // GET /api/{resource}/:id - Get single item
        get: async(req, res, next) => {
            try {
                const { id } = req.params;

                const result = await query(
                    `SELECT * FROM ${tableName} WHERE id = $1`, [id]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${tableName} not found`,
                        timestamp: new Date().toISOString()
                    });
                }

                res.json({
                    success: true,
                    data: result.rows[0],
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                logger.error(`Error getting ${tableName}:`, error);
                next(error);
            }
        },

        // POST /api/{resource} - Create new item
        create: async(req, res, next) => {
            try {
                const filteredData = filterFields(req.body, allowedFields);

                // Add created_at timestamp
                filteredData.created_at = new Date().toISOString();

                const fields = Object.keys(filteredData);
                const values = Object.values(filteredData);
                const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');

                const queryText = `
          INSERT INTO ${tableName} (${fields.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;

                const result = await query(queryText, values);

                res.status(201).json({
                    success: true,
                    data: result.rows[0],
                    message: `${tableName} created successfully`,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                logger.error(`Error creating ${tableName}:`, error);
                next(error);
            }
        },

        // PUT /api/{resource}/:id - Update item
        update: async(req, res, next) => {
            try {
                const { id } = req.params;
                const filteredData = filterFields(req.body, allowedFields);

                // Add updated_at timestamp
                filteredData.updated_at = new Date().toISOString();

                const fields = Object.keys(filteredData);
                const values = Object.values(filteredData);
                const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

                const queryText = `
          UPDATE ${tableName} 
          SET ${setClause}
          WHERE id = $1
          RETURNING *
        `;

                const result = await query(queryText, [id, ...values]);

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${tableName} not found`,
                        timestamp: new Date().toISOString()
                    });
                }

                res.json({
                    success: true,
                    data: result.rows[0],
                    message: `${tableName} updated successfully`,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                logger.error(`Error updating ${tableName}:`, error);
                next(error);
            }
        },

        // DELETE /api/{resource}/:id - Delete item
        delete: async(req, res, next) => {
            try {
                const { id } = req.params;

                const result = await query(
                    `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`, [id]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${tableName} not found`,
                        timestamp: new Date().toISOString()
                    });
                }

                res.json({
                    success: true,
                    message: `${tableName} deleted successfully`,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                logger.error(`Error deleting ${tableName}:`, error);
                next(error);
            }
        }
    };
};