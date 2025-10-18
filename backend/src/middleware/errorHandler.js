/**
 * Error handling middleware
 */

import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res) => {
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Default error
    let error = {
        message: 'Internal Server Error',
        status: 500
    };

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        error.message = 'Validation Error';
        error.status = 400;
        error.details = Object.values(err.errors).map(val => val.message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.status = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.status = 401;
    }

    // PostgreSQL errors
    if (err.code === '23505') { // Unique violation
        error.message = 'Duplicate entry';
        error.status = 409;
    }

    if (err.code === '23503') { // Foreign key violation
        error.message = 'Referenced record not found';
        error.status = 400;
    }

    if (err.code === '23502') { // Not null violation
        error.message = 'Required field missing';
        error.status = 400;
    }

    // Custom application errors
    if (err.status) {
        error.status = err.status;
        error.message = err.message;
    }

    res.status(error.status).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        ...(error.details && { details: error.details })
    });
};