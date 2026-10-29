/*
  Purpose: MySQL connection-pool configuration | Module: config
  Owner: Adam | Created: 9 Sep 2026
  Notes: Validates required settings and creates a pool that connects on demand.
*/

const mysql = require('mysql2/promise');

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const sslCa = process.env.DB_SSL_CA;

try {
  const missingVariables = requiredVariables.filter(name => !process.env[name] || !process.env[name].trim());

  if (missingVariables.length > 0) {
    throw new Error(`Missing required database environment variable(s): ${missingVariables.join(', ')}`);
  }
} catch (error) {
  console.error(`FATAL DATABASE CONFIGURATION ERROR: ${error.message}`);
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  ...(sslCa ? {
    ssl: {
      ca: sslCa.replace(/\\n/g, '\n'),
      rejectUnauthorized: true
    }
  } : {})
});

module.exports = pool;
