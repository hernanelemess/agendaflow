-- Migration: 001_create_tables.sql
-- Execute este arquivo no seu MySQL para criar o schema completo.
-- Comando: mysql -u root -p agendaflow < database/migrations/001_create_tables.sql

CREATE DATABASE IF NOT EXISTS agendaflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agendaflow;

-- Usuários do sistema (clientes, donos de estabelecimento, superadmin)
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role        ENUM('client', 'owner', 'admin') NOT NULL DEFAULT 'client',
  active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Estabelecimentos (barbearia, clínica, salão...)
CREATE TABLE IF NOT EXISTS establishments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id    INT UNSIGNED NOT NULL,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  phone       VARCHAR(20),
  address     VARCHAR(255),
  active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Profissionais vinculados a um estabelecimento
CREATE TABLE IF NOT EXISTS professionals (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  establishment_id  INT UNSIGNED NOT NULL,
  user_id           INT UNSIGNED,
  name              VARCHAR(120) NOT NULL,
  bio               TEXT,
  active            TINYINT(1) NOT NULL DEFAULT 1,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Serviços oferecidos pelo estabelecimento
CREATE TABLE IF NOT EXISTS services (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  establishment_id  INT UNSIGNED NOT NULL,
  name              VARCHAR(120) NOT NULL,
  description       TEXT,
  duration_min      SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  price             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  active            TINYINT(1) NOT NULL DEFAULT 1,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Grade de horários disponíveis por profissional (dias da semana)
CREATE TABLE IF NOT EXISTS schedules (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  professional_id  INT UNSIGNED NOT NULL,
  weekday          TINYINT UNSIGNED NOT NULL COMMENT '0=Dom 1=Seg ... 6=Sab',
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  UNIQUE KEY uq_professional_weekday (professional_id, weekday),
  FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- Agendamentos (o coração do sistema)
CREATE TABLE IF NOT EXISTS appointments (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  professional_id  INT UNSIGNED NOT NULL,
  service_id       INT UNSIGNED NOT NULL,
  client_id        INT UNSIGNED NOT NULL,
  starts_at        DATETIME NOT NULL,
  ends_at          DATETIME NOT NULL,
  status           ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  notes            TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_professional_starts (professional_id, starts_at),
  KEY idx_client_starts (client_id, starts_at),
  FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id)      REFERENCES services(id)      ON DELETE CASCADE,
  FOREIGN KEY (client_id)       REFERENCES users(id)         ON DELETE CASCADE
);
