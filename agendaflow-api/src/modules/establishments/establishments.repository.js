const { pool } = require('../../../database/connection');

async function create({ ownerId, name, slug, phone, address }) {
  const [result] = await pool.query(
    'INSERT INTO establishments (owner_id, name, slug, phone, address) VALUES (?, ?, ?, ?, ?)',
    [ownerId, name, slug, phone || null, address || null]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM establishments WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findByOwnerId(ownerId) {
  const [rows] = await pool.query(
    'SELECT * FROM establishments WHERE owner_id = ? ORDER BY created_at DESC',
    [ownerId]
  );
  return rows;
}

async function findAll({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    'SELECT * FROM establishments WHERE active = 1 ORDER BY name LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM establishments WHERE active = 1'
  );
  return { rows, total, page, limit };
}

async function updateById(id, fields) {
  const allowed = ['name', 'phone', 'address', 'active'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (!sets.length) return false;
  values.push(id);
  await pool.query(`UPDATE establishments SET ${sets.join(', ')} WHERE id = ?`, values);
  return true;
}

async function deleteById(id) {
  await pool.query('DELETE FROM establishments WHERE id = ?', [id]);
}

module.exports = { create, findById, findByOwnerId, findAll, updateById, deleteById };