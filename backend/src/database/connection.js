/**
 * Database connection and configuration
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432, // Use standard PostgreSQL port
    database: process.env.DB_NAME || 'mediflow',
    user: process.env.DB_USER || 'mediflow',
    password: process.env.DB_PASSWORD || 'mediflow123',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20, // Maximum number of clients in the pool
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000, // Increased timeout for better reliability
    retryDelayMillis: parseInt(process.env.DB_RETRY_DELAY) || 2000, // Delay between retry attempts
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection with retry logic
export const testConnection = async(retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            console.log('Database connected successfully:', result.rows[0]);
            return true;
        } catch (error) {
            console.error(`Database connection attempt ${attempt} failed:`, error.message);
            if (attempt < retries) {
                console.log(`Retrying in ${dbConfig.retryDelayMillis}ms...`);
                await new Promise(resolve => setTimeout(resolve, dbConfig.retryDelayMillis));
            } else {
                console.error('All database connection attempts failed');
                return false;
            }
        }
    }
};

// Execute query with error handling and retry logic
export const query = async(text, params, retries = 2) => {
    const start = Date.now();
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Executed query', { text, duration, rows: result.rowCount });
            return result;
        } catch (error) {
            console.error(`Query attempt ${attempt} failed:`, error.message);
            if (attempt < retries && error.code === 'ECONNRESET') {
                console.log('Retrying query due to connection reset...');
                await new Promise(resolve => setTimeout(resolve, dbConfig.retryDelayMillis));
            } else {
                console.error('Query error:', error);
                throw error;
            }
        }
    }
};

// Transaction helper
export const transaction = async(callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Close all connections
export const closePool = async() => {
    await pool.end();
};

export default pool;