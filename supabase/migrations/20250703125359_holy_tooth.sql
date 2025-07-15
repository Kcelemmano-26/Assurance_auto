-- Création de la base de données
CREATE DATABASE IF NOT EXISTS insurance_platform;
USE insurance_platform;

-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('client', 'insurer', 'admin') NOT NULL DEFAULT 'client',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des compagnies d'assurance
CREATE TABLE insurance_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT TRUE,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des demandes d'assurance
CREATE TABLE insurance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    insurer_id INT,
    vehicle_brand VARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_year INT NOT NULL,
    vehicle_registration VARCHAR(50) NOT NULL,
    previous_insurer VARCHAR(255),
    insurer_preference VARCHAR(255),
    net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'assigned', 'processing', 'completed', 'rejected') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    documents JSON,
    certificate_url VARCHAR(500),
    notes TEXT,
    estimated_processing_time VARCHAR(50) DEFAULT '24-48h',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (insurer_id) REFERENCES insurance_companies(id) ON DELETE SET NULL
);

-- Table des paiements
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    payment_method VARCHAR(50) NOT NULL,
    fedapay_transaction_id VARCHAR(255),
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES insurance_requests(id) ON DELETE CASCADE
);

-- Table des paramètres système
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertion des données par défaut
INSERT INTO users (email, password, full_name, role) VALUES 
('admin@assurancerenew.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur', 'admin');

INSERT INTO insurance_companies (name, contact_email, commission_rate) VALUES 
('Allianz Bénin', 'contact@allianz.bj', 5.00),
('AXA Assurances', 'info@axa.bj', 5.50),
('NSIA Assurances', 'contact@nsia.bj', 4.50),
('Saham Assurance', 'info@saham.bj', 5.25);

INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('default_commission_rate', '5.00', 'Taux de commission par défaut en pourcentage'),
('base_insurance_amount', '20000', 'Montant de base pour l\'assurance en FCFA'),
('processing_time', '24-48h', 'Délai de traitement estimé'),
('company_name', 'AssuranceRenew', 'Nom de la plateforme'),
('support_email', 'support@assurancerenew.com', 'Email de support');

-- Index pour optimiser les performances
CREATE INDEX idx_requests_client ON insurance_requests(client_id);
CREATE INDEX idx_requests_insurer ON insurance_requests(insurer_id);
CREATE INDEX idx_requests_status ON insurance_requests(status);
CREATE INDEX idx_payments_request ON payments(request_id);
CREATE INDEX idx_users_email ON users(email);