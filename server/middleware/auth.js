import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Vérifier que l'utilisateur existe toujours
    const user = await executeQuery(
      'SELECT id, email, full_name, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user.length || !user[0].is_active) {
      return res.status(401).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    next();
  };
};