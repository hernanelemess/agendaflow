const { pool } = require('../../../database/connection');

async function listUsers({ page = 1, limit = 20, role = null } = {}) {
  const offset = (page - 1) * limit;
  const where  = role ? 'WHERE role = ?' : '';
  const params = role ? [role, limit, offset] : [limit, offset];

  const [rows] = await pool.query(
    `SELECT id, name, email, role, active, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    params
  );

  const countParams = role ? [role] : [];
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    countParams
  );

  return { rows, total, page, limit };
}

async function setUserActive(id, active) {
  await pool.query('UPDATE users SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
}

async function listEstablishments({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT e.*, u.name AS owner_name, u.email AS owner_email
     FROM establishments e
     JOIN users u ON u.id = e.owner_id
     ORDER BY e.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM establishments');
  return { rows, total, page, limit };
}

async function setEstablishmentActive(id, active) {
  await pool.query('UPDATE establishments SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
}

async function getStats() {
  const [[users]]          = await pool.query('SELECT COUNT(*) AS total FROM users');
  const [[establishments]] = await pool.query('SELECT COUNT(*) AS total FROM establishments');
  const [[appointments]]   = await pool.query('SELECT COUNT(*) AS total FROM appointments');
  const [[revenue]]        = await pool.query(
    `SELECT COALESCE(SUM(s.price), 0) AS total
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     WHERE a.status = 'completed'`
  );

  return {
    total_users:          users.total,
    total_establishments: establishments.total,
    total_appointments:   appointments.total,
    total_revenue:        Number(revenue.total),
  };
}

module.exports = { listUsers, setUserActive, listEstablishments, setEstablishmentActive, getStats };