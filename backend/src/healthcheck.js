/**
 * Health check script for Docker
 */

import { testConnection } from './src/database/connection.js';

const healthCheck = async() => {
    try {
        // Test database connection
        const dbHealthy = await testConnection();

        if (dbHealthy) {
            console.log('Health check passed');
            process.exit(0);
        } else {
            console.log('Health check failed - database connection error');
            process.exit(1);
        }
    } catch (error) {
        console.error('Health check failed:', error);
        process.exit(1);
    }
};

healthCheck();