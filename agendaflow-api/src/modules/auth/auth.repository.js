const { pool } = require('../../../database/connection');

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash, role, active FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function create({ name, email, passwordHash, role }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  );
  return result.insertId;
}

module.exports = { findByEmail, create };