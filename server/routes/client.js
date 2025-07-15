import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { executeQuery } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Créer les dossiers s'ils n'existent pas
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Créer les dossiers nécessaires
ensureDirectoryExists('server/uploads/documents');
ensureDirectoryExists('server/uploads/certificates');

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'server/uploads/documents';
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `document-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, JPG, JPEG et PNG sont autorisés'));
    }
  }
});

// Créer une nouvelle demande
router.post('/requests', authenticateToken, authorizeRoles('client'), upload.array('documents', 10), async (req, res) => {
  try {
    const {
      vehicle_brand,
      vehicle_model,
      vehicle_year,
      vehicle_registration,
      previous_insurer,
      insurer_preference
    } = req.body;

    // Validation des champs requis
    if (!vehicle_brand || !vehicle_model || !vehicle_year || !vehicle_registration) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Vérifier qu'au moins 5 documents sont fournis (documents obligatoires)
    if (!req.files || req.files.length < 5) {
      return res.status(400).json({ 
        error: 'Au moins 5 documents obligatoires doivent être fournis (carte grise, contrôle technique, TVM, permis, pièce d\'identité)' 
      });
    }

    // Récupérer les paramètres système
    const settings = await executeQuery(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
      ['base_insurance_amount', 'default_commission_rate']
    );

    const baseAmount = parseFloat(settings.find(s => s.setting_key === 'base_insurance_amount')?.setting_value || 20000);
    const commissionRate = parseFloat(settings.find(s => s.setting_key === 'default_commission_rate')?.setting_value || 5);

    const commissionAmount = (baseAmount * commissionRate) / 100;
    const totalAmount = baseAmount + commissionAmount;

    // Traiter les fichiers uploadés
    const documents = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

    // Insérer la demande
    const result = await executeQuery(
      `INSERT INTO insurance_requests 
       (client_id, vehicle_brand, vehicle_model, vehicle_year, vehicle_registration, 
        previous_insurer, net_amount, commission_amount, total_amount, documents) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        vehicle_brand,
        vehicle_model,
        parseInt(vehicle_year),
        vehicle_registration.toUpperCase(),
        previous_insurer || null,
        baseAmount,
        commissionAmount,
        totalAmount,
        JSON.stringify(documents)
      ]
    );

    res.status(201).json({
      message: 'Demande créée avec succès',
      requestId: result.insertId,
      amounts: {
        net_amount: baseAmount,
        commission_amount: commissionAmount,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    console.error('Erreur création demande:', error);
    
    // Nettoyer les fichiers en cas d'erreur
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de la création de la demande' });
  }
});

// Récupérer les demandes du client
router.get('/requests', authenticateToken, authorizeRoles('client'), async (req, res) => {
  try {
    const requests = await executeQuery(
      `SELECT ir.*, ic.name as insurer_name 
       FROM insurance_requests ir 
       LEFT JOIN insurance_companies ic ON ir.insurer_id = ic.id 
       WHERE ir.client_id = ? 
       ORDER BY ir.created_at DESC`,
      [req.user.id]
    );

    res.json(requests);
  } catch (error) {
    console.error('Erreur récupération demandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

// Récupérer une demande spécifique
router.get('/requests/:id', authenticateToken, authorizeRoles('client'), async (req, res) => {
  try {
    const requests = await executeQuery(
      `SELECT ir.*, ic.name as insurer_name 
       FROM insurance_requests ir 
       LEFT JOIN insurance_companies ic ON ir.insurer_id = ic.id 
       WHERE ir.id = ? AND ir.client_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!requests.length) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    res.json(requests[0]);
  } catch (error) {
    console.error('Erreur récupération demande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la demande' });
  }
});

// Statistiques du client
router.get('/dashboard', authenticateToken, authorizeRoles('client'), async (req, res) => {
  try {
    const stats = await executeQuery(
      `SELECT 
         COUNT(*) as total_requests,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
         SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_requests
       FROM insurance_requests 
       WHERE client_id = ?`,
      [req.user.id]
    );

    res.json(stats[0]);
  } catch (error) {
    console.error('Erreur statistiques client:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;