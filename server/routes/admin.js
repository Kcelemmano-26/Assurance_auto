import express from 'express';
import { executeQuery } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Statistiques générales
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [clientStats, insurerStats, requestStats, revenueStats] = await Promise.all([
      executeQuery('SELECT COUNT(*) as total_clients FROM users WHERE role = "client"'),
      executeQuery('SELECT COUNT(*) as total_insurers FROM insurance_companies WHERE is_active = 1'),
      executeQuery(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests
        FROM insurance_requests
      `),
      executeQuery('SELECT SUM(commission_amount) as total_revenue FROM insurance_requests WHERE payment_status = "paid"')
    ]);

    res.json({
      total_clients: clientStats[0].total_clients,
      total_insurers: insurerStats[0].total_insurers,
      total_requests: requestStats[0].total_requests,
      pending_requests: requestStats[0].pending_requests,
      completed_requests: requestStats[0].completed_requests,
      total_revenue: revenueStats[0].total_revenue || 0
    });
  } catch (error) {
    console.error('Erreur statistiques admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Gestion des clients
router.get('/clients', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const clients = await executeQuery(
      `SELECT u.id, u.email, u.full_name, u.phone, u.is_active, u.created_at,
              COUNT(ir.id) as total_requests
       FROM users u 
       LEFT JOIN insurance_requests ir ON u.id = ir.client_id 
       WHERE u.role = 'client' 
       GROUP BY u.id 
       ORDER BY u.created_at DESC`
    );

    res.json(clients);
  } catch (error) {
    console.error('Erreur récupération clients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
});

// Gestion des assureurs
router.get('/insurers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const insurers = await executeQuery(
      `SELECT ic.id, ic.name, ic.contact_email, ic.contact_phone, ic.commission_rate, 
              ic.is_active, ic.created_at, u.full_name as manager_name,
              COUNT(ir.id) as total_requests
       FROM insurance_companies ic 
       LEFT JOIN users u ON ic.user_id = u.id 
       LEFT JOIN insurance_requests ir ON ic.id = ir.insurer_id 
       GROUP BY ic.id 
       ORDER BY ic.created_at DESC`
    );

    res.json(insurers);
  } catch (error) {
    console.error('Erreur récupération assureurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des assureurs' });
  }
});

// Toutes les demandes
router.get('/requests', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const requests = await executeQuery(
      `SELECT ir.*, u.full_name as client_name, u.email as client_email,
              ic.name as insurer_name
       FROM insurance_requests ir 
       JOIN users u ON ir.client_id = u.id 
       LEFT JOIN insurance_companies ic ON ir.insurer_id = ic.id 
       ORDER BY ir.created_at DESC`
    );

    res.json(requests);
  } catch (error) {
    console.error('Erreur récupération demandes admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

// Assigner une demande à un assureur
router.put('/requests/:id/assign', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { insurer_id } = req.body;
    const requestId = req.params.id;

    await executeQuery(
      'UPDATE insurance_requests SET insurer_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [insurer_id, 'assigned', requestId]
    );

    res.json({ message: 'Demande assignée avec succès' });
  } catch (error) {
    console.error('Erreur assignation demande:', error);
    res.status(500).json({ error: 'Erreur lors de l\'assignation de la demande' });
  }
});

// Mettre à jour les paramètres système
router.put('/settings', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { settings } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await executeQuery(
        'UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
        [value, key]
      );
    }

    res.json({ message: 'Paramètres mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
});

// Récupérer les paramètres système
router.get('/settings', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const settings = await executeQuery('SELECT setting_key, setting_value, description FROM system_settings');
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
});

export default router;