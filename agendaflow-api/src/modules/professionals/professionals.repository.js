const { pool } = require('../../../database/connection');

async function create({ establishmentId, name, bio }) {
  const [result] = await pool.query(
    'INSERT INTO professionals (establishment_id, name, bio) VALUES (?, ?, ?)',
    [establishmentId, name, bio || null]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, e.owner_id
     FROM professionals p
     JOIN establishments e ON e.id = p.establishment_id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByEstablishment(establishmentId) {
  const [rows] = await pool.query(
    'SELECT * FROM professionals WHERE establishment_id = ? ORDER BY name',
    [establishmentId]
  );
  return rows;
}

async function updateById(id, fields) {
  const allowed = ['name', 'bio', 'active'];
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
  await pool.query(`UPDATE professionals SET ${sets.join(', ')} WHERE id = ?`, values);
  return true;
}

async function deleteById(id) {
  await pool.query('DELETE FROM professionals WHERE id = ?', [id]);
}

module.exports = { create, findById, findByEstablishment, updateById, deleteById };