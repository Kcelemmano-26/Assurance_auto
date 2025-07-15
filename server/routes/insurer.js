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

// Créer le dossier pour les certificats
ensureDirectoryExists('server/uploads/certificates');

// Configuration multer pour les attestations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'server/uploads/certificates';
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `certificate-${uniqueSuffix}.pdf`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés pour les attestations'));
    }
  }
});

// Récupérer les demandes assignées à l'assureur
router.get('/requests', authenticateToken, authorizeRoles('insurer'), async (req, res) => {
  try {
    // Trouver la compagnie d'assurance de l'utilisateur
    const company = await executeQuery(
      'SELECT id FROM insurance_companies WHERE user_id = ?',
      [req.user.id]
    );

    if (!company.length) {
      return res.status(404).json({ error: 'Compagnie d\'assurance non trouvée' });
    }

    const requests = await executeQuery(
      `SELECT ir.*, u.full_name as client_name, u.email as client_email, u.phone as client_phone
       FROM insurance_requests ir 
       JOIN users u ON ir.client_id = u.id 
       WHERE ir.insurer_id = ? 
       ORDER BY ir.created_at DESC`,
      [company[0].id]
    );

    res.json(requests);
  } catch (error) {
    console.error('Erreur récupération demandes assureur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

// Mettre à jour le statut d'une demande
router.put('/requests/:id/status', authenticateToken, authorizeRoles('insurer'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const requestId = req.params.id;

    // Vérifier que la demande appartient à cet assureur
    const company = await executeQuery(
      'SELECT id FROM insurance_companies WHERE user_id = ?',
      [req.user.id]
    );

    if (!company.length) {
      return res.status(404).json({ error: 'Compagnie d\'assurance non trouvée' });
    }

    const request = await executeQuery(
      'SELECT id FROM insurance_requests WHERE id = ? AND insurer_id = ?',
      [requestId, company[0].id]
    );

    if (!request.length) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    // Mettre à jour le statut
    await executeQuery(
      'UPDATE insurance_requests SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, notes, requestId]
    );

    res.json({ message: 'Statut mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// Upload d'attestation
router.post('/requests/:id/certificate', authenticateToken, authorizeRoles('insurer'), upload.single('certificate'), async (req, res) => {
  try {
    const requestId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Fichier d\'attestation requis' });
    }

    // Vérifier que la demande appartient à cet assureur
    const company = await executeQuery(
      'SELECT id FROM insurance_companies WHERE user_id = ?',
      [req.user.id]
    );

    if (!company.length) {
      // Nettoyer le fichier uploadé
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Compagnie d\'assurance non trouvée' });
    }

    const request = await executeQuery(
      'SELECT id FROM insurance_requests WHERE id = ? AND insurer_id = ?',
      [requestId, company[0].id]
    );

    if (!request.length) {
      // Nettoyer le fichier uploadé
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    // Mettre à jour avec l'URL du certificat et marquer comme terminé
    const certificateUrl = `/uploads/certificates/${req.file.filename}`;
    
    await executeQuery(
      'UPDATE insurance_requests SET certificate_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [certificateUrl, 'completed', requestId]
    );

    res.json({ 
      message: 'Attestation uploadée avec succès',
      certificate_url: certificateUrl
    });
  } catch (error) {
    console.error('Erreur upload attestation:', error);
    
    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'attestation' });
  }
});

// Statistiques de l'assureur
router.get('/dashboard', authenticateToken, authorizeRoles('insurer'), async (req, res) => {
  try {
    // Trouver la compagnie d'assurance de l'utilisateur
    const company = await executeQuery(
      'SELECT id, name FROM insurance_companies WHERE user_id = ?',
      [req.user.id]
    );

    if (!company.length) {
      return res.status(404).json({ error: 'Compagnie d\'assurance non trouvée' });
    }

    const stats = await executeQuery(
      `SELECT 
         COUNT(*) as total_requests,
         SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as new_requests,
         SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_requests,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests
       FROM insurance_requests 
       WHERE insurer_id = ?`,
      [company[0].id]
    );

    res.json({
      company: company[0],
      ...stats[0]
    });
  } catch (error) {
    console.error('Erreur statistiques assureur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;