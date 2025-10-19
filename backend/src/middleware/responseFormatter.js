/**
 * Standardized API response formatter middleware
 * Ensures all API responses follow a consistent format
 */

/**
 * Response formatter middleware
 * Formats all JSON responses to follow the standard API response format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const formatResponse = (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
        // Skip formatting for error responses (they should be handled by error middleware)
        if (res.statusCode >= 400) {
            return originalJson.call(this, data);
        }

        // Skip formatting if data already has the expected structure
        if (data && typeof data === 'object' && 'success' in data) {
            return originalJson.call(this, data);
        }

        // Format successful responses
        const formattedResponse = {
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        };

        // Add pagination if present
        if (data && typeof data === 'object' && 'pagination' in data) {
            formattedResponse.pagination = data.pagination;
            formattedResponse.data = data.data || data;
        }

        return originalJson.call(this, formattedResponse);
    };

    next();
};

/**
 * Error response formatter middleware
 * Formats error responses to follow the standard API response format
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const formatErrorResponse = (err, req, res, next) => {
    // Don't format if response already sent
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    const errorResponse = {
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
                details: err.details
            })
        },
        timestamp: new Date().toISOString()
    };

    // Add request information in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.request = {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            query: req.query,
            params: req.params
        };
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * Validation error formatter
 * Formats validation errors from express-validator or similar libraries
 * @param {Array} errors - Array of validation errors
 * @returns {Object} Formatted validation error response
 */
export const formatValidationError = (errors) => {
    return {
        success: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.map(error => ({
                field: error.path || error.param,
                message: error.msg || error.message,
                value: error.value
            }))
        },
        timestamp: new Date().toISOString()
    };
};

/**
 * Not found response formatter
 * @param {string} resource - Name of the resource that was not found
 * @returns {Object} Formatted not found response
 */
export const formatNotFoundResponse = (resource = 'Resource') => {
    return {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `${resource} not found`
        },
        timestamp: new Date().toISOString()
    };
};

/**
 * Unauthorized response formatter
 * @param {string} message - Custom unauthorized message
 * @returns {Object} Formatted unauthorized response
 */
export const formatUnauthorizedResponse = (message = 'Unauthorized access') => {
    return {
        success: false,
        error: {
            code: 'UNAUTHORIZED',
            message: message
        },
        timestamp: new Date().toISOString()
    };
};

/**
 * Forbidden response formatter
 * @param {string} message - Custom forbidden message
 * @returns {Object} Formatted forbidden response
 */
export const formatForbiddenResponse = (message = 'Access forbidden') => {
    return {
        success: false,
        error: {
            code: 'FORBIDDEN',
            message: message
        },
        timestamp: new Date().toISOString()
    };
};