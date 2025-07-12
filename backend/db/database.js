require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log('DATABASE_URL:', process.env.DATABASE_URL);


pool.on('error', (err) => {
  console.error('Error inesperado en el cliente PostgreSQL', err);
  process.exit(-1);
});

module.exports = pool;
