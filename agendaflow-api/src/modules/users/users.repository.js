const { pool } = require('../../../database/connection');

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function updateById(id, { name, email }) {
  const fields = [];
  const values = [];

  if (name)  { fields.push('name = ?');  values.push(name); }
  if (email) { fields.push('email = ?'); values.push(email); }

  if (!fields.length) return false;

  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
}

async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

module.exports = { findById, updateById, updatePassword };