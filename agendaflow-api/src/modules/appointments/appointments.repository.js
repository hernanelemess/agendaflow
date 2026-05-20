const { pool } = require('../../../database/connection');

// Busca todos os agendamentos ativos do profissional em um intervalo de tempo.
// Usado para checar conflito: um novo agendamento não pode sobrepor nenhum existente.
async function findConflicts({ professionalId, startsAt, endsAt, excludeId = null }) {
  let query = `
    SELECT id FROM appointments
    WHERE professional_id = ?
      AND status NOT IN ('cancelled')
      AND starts_at < ?
      AND ends_at   > ?
  `;
  const params = [professionalId, endsAt, startsAt];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function create({ professionalId, serviceId, clientId, startsAt, endsAt, notes }) {
  const [result] = await pool.query(
    `INSERT INTO appointments
       (professional_id, service_id, client_id, starts_at, ends_at, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [professionalId, serviceId, clientId, startsAt, endsAt, notes || null]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT
       a.*,
       u.name  AS client_name,
       u.email AS client_email,
       p.name  AS professional_name,
       s.name  AS service_name,
       s.duration_min,
       s.price
     FROM appointments a
     JOIN users        u ON u.id = a.client_id
     JOIN professionals p ON p.id = a.professional_id
     JOIN services      s ON s.id = a.service_id
     WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByClient(clientId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT a.*, p.name AS professional_name, s.name AS service_name
     FROM appointments a
     JOIN professionals p ON p.id = a.professional_id
     JOIN services      s ON s.id = a.service_id
     WHERE a.client_id = ?
     ORDER BY a.starts_at DESC
     LIMIT ? OFFSET ?`,
    [clientId, limit, offset]
  );
  return rows;
}

async function findByProfessional(professionalId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS client_name, s.name AS service_name
     FROM appointments a
     JOIN users   u ON u.id = a.client_id
     JOIN services s ON s.id = a.service_id
     WHERE a.professional_id = ?
     ORDER BY a.starts_at DESC
     LIMIT ? OFFSET ?`,
    [professionalId, limit, offset]
  );
  return rows;
}

// Retorna todos os agendamentos confirmados/pendentes de um profissional em um dia específico.
// Usado para calcular os slots disponíveis.
async function findByProfessionalAndDate(professionalId, date) {
  const [rows] = await pool.query(
    `SELECT 
       DATE_FORMAT(starts_at, '%Y-%m-%d %H:%i:%s') AS starts_at,
       DATE_FORMAT(ends_at,   '%Y-%m-%d %H:%i:%s') AS ends_at
     FROM appointments
     WHERE professional_id = ?
       AND DATE(starts_at) = ?
       AND status NOT IN ('cancelled')
     ORDER BY starts_at`,
    [professionalId, date]
  );
  return rows;
}

async function updateStatus(id, status) {
  await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
}

module.exports = {
  findConflicts,
  create,
  findById,
  findByClient,
  findByProfessional,
  findByProfessionalAndDate,
  updateStatus,
};