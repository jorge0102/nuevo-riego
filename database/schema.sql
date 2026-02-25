-- Base de datos para sistema de riego
-- MySQL 5.7+

CREATE DATABASE IF NOT EXISTS riego_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE riego_db;

-- Tabla de estado del tanque
CREATE TABLE IF NOT EXISTS tank_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level INT NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estado de riego
CREATE TABLE IF NOT EXISTS watering_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    is_watering BOOLEAN NOT NULL DEFAULT FALSE,
    time_remaining VARCHAR(10) DEFAULT '00:00',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sectores
CREATE TABLE IF NOT EXISTS sectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'yard',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_auto BOOLEAN NOT NULL DEFAULT TRUE,
    color ENUM('primary', 'secondary') DEFAULT 'primary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de configuración de sectores
CREATE TABLE IF NOT EXISTS sector_config (
    id INT PRIMARY KEY,
    start_time TIME NOT NULL DEFAULT '06:00:00',
    duration INT NOT NULL DEFAULT 30 CHECK (duration > 0),
    repeat_cycle BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES sectors(id) ON DELETE CASCADE
);

-- Tabla de días activos para cada sector
CREATE TABLE IF NOT EXISTS sector_days (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sector_id INT NOT NULL,
    day_code CHAR(1) NOT NULL,
    day_label VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_sector_day (sector_id, day_code)
);

-- Tabla de programación semanal (resumen)
CREATE TABLE IF NOT EXISTS weekly_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    day_code CHAR(1) NOT NULL UNIQUE,
    day_label VARCHAR(20) NOT NULL,
    has_watering BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar datos iniciales para el tanque
INSERT INTO tank_status (level) VALUES (75);

-- Insertar datos iniciales para estado de riego
INSERT INTO watering_status (is_watering, time_remaining) VALUES (FALSE, '00:00');

-- Insertar sectores de ejemplo
INSERT INTO sectors (id, name, icon, is_active, is_auto, color) VALUES
(1, 'Sector 1: Aguacates', 'yard', TRUE, TRUE, 'secondary'),
(2, 'Sector 2: Mangos', 'local_florist', FALSE, TRUE, 'primary'),
(3, 'Sector 3: Pencas', 'potted_plant', FALSE, TRUE, 'primary'),
(4, 'Sector 4: Pitayas', 'grass', TRUE, FALSE, 'secondary');

-- Insertar configuración de sectores
INSERT INTO sector_config (id, start_time, duration, repeat_cycle) VALUES
(1, '06:30:00', 45, FALSE),
(2, '07:00:00', 30, FALSE),
(3, '06:00:00', 60, TRUE),
(4, '18:00:00', 20, FALSE);

-- Insertar días para cada sector
-- Sector 1: Aguacates
INSERT INTO sector_days (sector_id, day_code, day_label, active) VALUES
(1, 'L', 'Lunes', FALSE),
(1, 'M', 'Martes', TRUE),
(1, 'X', 'Miércoles', FALSE),
(1, 'J', 'Jueves', TRUE),
(1, 'V', 'Viernes', FALSE),
(1, 'S', 'Sábado', TRUE),
(1, 'D', 'Domingo', FALSE);

-- Sector 2: Mangos
INSERT INTO sector_days (sector_id, day_code, day_label, active) VALUES
(2, 'L', 'Lunes', TRUE),
(2, 'M', 'Martes', FALSE),
(2, 'X', 'Miércoles', FALSE),
(2, 'J', 'Jueves', TRUE),
(2, 'V', 'Viernes', FALSE),
(2, 'S', 'Sábado', FALSE),
(2, 'D', 'Domingo', FALSE);

-- Sector 3: Pencas
INSERT INTO sector_days (sector_id, day_code, day_label, active) VALUES
(3, 'L', 'Lunes', TRUE),
(3, 'M', 'Martes', TRUE),
(3, 'X', 'Miércoles', TRUE),
(3, 'J', 'Jueves', TRUE),
(3, 'V', 'Viernes', TRUE),
(3, 'S', 'Sábado', TRUE),
(3, 'D', 'Domingo', TRUE);

-- Sector 4: Pitayas
INSERT INTO sector_days (sector_id, day_code, day_label, active) VALUES
(4, 'L', 'Lunes', TRUE),
(4, 'M', 'Martes', TRUE),
(4, 'X', 'Miércoles', TRUE),
(4, 'J', 'Jueves', TRUE),
(4, 'V', 'Viernes', TRUE),
(4, 'S', 'Sábado', TRUE),
(4, 'D', 'Domingo', FALSE);

-- Insertar días de la semana para el schedule general
INSERT INTO weekly_schedule (day_code, day_label, has_watering) VALUES
('L', 'Lunes', FALSE),
('M', 'Martes', TRUE),
('X', 'Miércoles', FALSE),
('J', 'Jueves', TRUE),
('V', 'Viernes', FALSE),
('S', 'Sábado', TRUE),
('D', 'Domingo', FALSE);
