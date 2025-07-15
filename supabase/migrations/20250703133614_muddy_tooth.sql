-- Script de configuration MySQL pour AssuranceRenew
-- Exécuter ce script après avoir créé la base de données

-- Vérifier la connexion
SELECT 'MySQL connection successful!' as status;

-- Afficher les tables créées
SHOW TABLES;

-- Vérifier les données par défaut
SELECT 'Checking default data...' as info;

-- Compter les utilisateurs
SELECT COUNT(*) as total_users FROM users;

-- Compter les compagnies d'assurance
SELECT COUNT(*) as total_companies FROM insurance_companies;

-- Afficher les paramètres système
SELECT * FROM system_settings;

-- Afficher l'utilisateur admin
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
WHERE role = 'admin';

-- Afficher les compagnies d'assurance
SELECT id, name, contact_email, commission_rate, is_active 
FROM insurance_companies;

SELECT 'Setup completed successfully!' as result;