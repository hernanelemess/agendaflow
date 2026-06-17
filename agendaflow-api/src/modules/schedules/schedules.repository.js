const { pool } = require('../../../database/connection');

async function create({ professionalId, weekday, start_time, end_time }) {
  const [result] = await pool.query(
    `INSERT INTO schedules 
     (professional_id, weekday, start_time, end_time)
     VALUES (?, ?, ?, ?)`,
    [professionalId, weekday, start_time, end_time]
  );

  return result.insertId;
}

async function findByProfessional(professionalId) {
  const [rows] = await pool.query(
    'SELECT * FROM schedules WHERE professional_id = ? ORDER BY weekday, start_time',
    [professionalId]
  );
  return rows;
}

async function deleteById(id) {
  await pool.query('DELETE FROM schedules WHERE id = ?', [id]);
}

async function deleteByProfessionalAndWeekday(professionalId, weekday) {
  await pool.query(
    'DELETE FROM schedules WHERE professional_id = ? AND weekday = ?',
    [professionalId, weekday]
  );
}

module.exports = { create, findByProfessional, deleteById, deleteByProfessionalAndWeekday };