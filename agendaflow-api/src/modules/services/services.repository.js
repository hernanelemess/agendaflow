const { pool } = require('../../../database/connection');

async function create({ establishmentId, name, description, duration_min, price }) {
  const [result] = await pool.query(
    'INSERT INTO services (establishment_id, name, description, duration_min, price) VALUES (?, ?, ?, ?, ?)',
    [establishmentId, name, description || null, duration_min, price]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT s.*, e.owner_id
     FROM services s
     JOIN establishments e ON e.id = s.establishment_id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByEstablishment(establishmentId) {
  const [rows] = await pool.query(
    'SELECT * FROM services WHERE establishment_id = ? AND active = 1 ORDER BY name',
    [establishmentId]
  );
  return rows;
}

async function updateById(id, fields) {
  const allowed = ['name', 'description', 'duration_min', 'price', 'active'];
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
  await pool.query(`UPDATE services SET ${sets.join(', ')} WHERE id = ?`, values);
  return true;
}

async function deleteById(id) {
  await pool.query('DELETE FROM services WHERE id = ?', [id]);
}

module.exports = { create, findById, findByEstablishment, updateById, deleteById };