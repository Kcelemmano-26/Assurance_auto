import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role = 'client' } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await executeQuery(
      'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, full_name, phone, role]
    );

    // Générer le token JWT
    const token = jwt.sign(
      { userId: result.insertId, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: result.insertId,
        email,
        full_name,
        phone,
        role
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const users = await executeQuery(
      'SELECT id, email, password, full_name, phone, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Compte désactivé' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Vérifier le token
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;