-- Seeder: 001_seed_dev.sql
-- Popula o banco com dados de exemplo para desenvolvimento.
-- Comando: mysql -u root -p agendaflow < database/seeders/001_seed_dev.sql
-- Senha do admin: Admin@123  |  Senha dos outros: Senha@123

USE agendaflow;

INSERT INTO users (name, email, password_hash, role) VALUES
('Super Admin',    'admin@agendaflow.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('João Dono',      'joao@barbearia.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner'),
('Maria Cliente',  'maria@email.com',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client');

INSERT INTO establishments (owner_id, name, slug, phone, address) VALUES
(2, 'Barbearia do João', 'barbearia-do-joao', '(54) 99999-1234', 'Rua das Flores, 100 - Passo Fundo/RS');

INSERT INTO professionals (establishment_id, name, bio) VALUES
(1, 'Carlos Barbeiro', 'Especialista em cortes modernos e barba.'),
(1, 'Ana Cabeleireira', 'Coloração e cortes femininos.');

INSERT INTO services (establishment_id, name, duration_min, price) VALUES
(1, 'Corte masculino',     30, 35.00),
(1, 'Barba',               20, 25.00),
(1, 'Corte + Barba',       50, 55.00),
(1, 'Corte feminino',      60, 80.00);

INSERT INTO schedules (professional_id, weekday, start_time, end_time) VALUES
(1, 1, '08:00', '18:00'),
(1, 2, '08:00', '18:00'),
(1, 3, '08:00', '18:00'),
(1, 4, '08:00', '18:00'),
(1, 5, '08:00', '18:00'),
(2, 1, '09:00', '17:00'),
(2, 2, '09:00', '17:00'),
(2, 3, '09:00', '17:00'),
(2, 4, '09:00', '17:00'),
(2, 5, '09:00', '17:00');