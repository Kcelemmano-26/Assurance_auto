import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { executeQuery } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// 👉 Utilitaire pour vérifier la signature FedaPay (à activer pour usage réel)
function verifyFedaSignature(payload, receivedSignature, secret) {
  const computed = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(receivedSignature));
}

// 🚀 Initier un paiement FedaPay
router.post('/initiate', authenticateToken, authorizeRoles('client'), async (req, res) => {
  try {
    const { request_id } = req.body;

    // Vérifier que la demande appartient au client
    const request = await executeQuery(
      'SELECT * FROM insurance_requests WHERE id = ? AND client_id = ?',
      [request_id, req.user.id]
    );

    if (!request.length) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    const insuranceRequest = request[0];

    // 🔄 Simulation ou appel réel à FedaPay (remplacer cette partie en production)
    const transaction_id = `fedapay_${Date.now()}`;
    const payment_url = `https://checkout.fedapay.com/pay/${transaction_id}`;

    // Enregistrement du paiement
    const paymentResult = await executeQuery(
      'INSERT INTO payments (request_id, amount, payment_method, status, fedapay_transaction_id) VALUES (?, ?, ?, ?, ?)',
      [request_id, insuranceRequest.total_amount, 'fedapay', 'pending', transaction_id]
    );

    res.json({
      payment_id: paymentResult.insertId,
      payment_url,
      transaction_id,
      amount: insuranceRequest.total_amount
    });
  } catch (error) {
    console.error('Erreur initiation paiement:', error);
    res.status(500).json({ error: 'Erreur lors de l\'initiation du paiement' });
  }
});

// ✅ Webhook FedaPay
router.post('/webhook', async (req, res) => {
  try {
    const { transaction_id, status, amount } = req.body;

    // 👉 Vérification de la signature (à activer avec la clé réelle)
    // const signature = req.headers['x-fedapay-signature'];
    // if (!verifyFedaSignature(req.body, signature, process.env.FEDAPAY_SECRET)) {
    //   return res.status(403).json({ error: 'Signature invalide' });
    // }

    console.log('🔔 Webhook reçu :', req.body);

    // Chercher le paiement
    const payment = await executeQuery(
      'SELECT * FROM payments WHERE fedapay_transaction_id = ?',
      [transaction_id]
    );

    if (!payment.length) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    // Mise à jour du paiement
    await executeQuery(
      'UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, payment[0].id]
    );

    // Si succès, mettre à jour la demande liée
    if (status === 'success') {
      await executeQuery(
        'UPDATE insurance_requests SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['paid', payment[0].request_id]
      );
    }

    res.json({ message: 'Webhook traité avec succès' });
  } catch (error) {
    console.error('Erreur webhook paiement:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

// 📦 Vérifier le statut d'un paiement
router.get('/status/:payment_id', authenticateToken, async (req, res) => {
  try {
    const payment = await executeQuery(
      `SELECT p.*, ir.client_id 
       FROM payments p 
       JOIN insurance_requests ir ON p.request_id = ir.id 
       WHERE p.id = ?`,
      [req.params.payment_id]
    );

    if (!payment.length) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    if (req.user.role !== 'admin' && payment[0].client_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json(payment[0]);
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du paiement' });
  }
});

// 📊 Historique des paiements (admin uniquement)
router.get('/history', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const payments = await executeQuery(
      `SELECT p.*, ir.vehicle_brand, ir.vehicle_model, u.full_name as client_name
       FROM payments p 
       JOIN insurance_requests ir ON p.request_id = ir.id 
       JOIN users u ON ir.client_id = u.id 
       ORDER BY p.created_at DESC`
    );

    res.json(payments);
  } catch (error) {
    console.error('Erreur historique paiements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

export default router;
