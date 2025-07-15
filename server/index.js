import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/client.js';
import insurerRoutes from './routes/insurer.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';

// Import database connection
import { connectDB } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Créer les dossiers d'upload s'ils n'existent pas
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Dossier créé: ${dirPath}`);
  }
};

// Créer tous les dossiers nécessaires
ensureDirectoryExists(path.join(__dirname, 'uploads'));
ensureDirectoryExists(path.join(__dirname, 'uploads', 'documents'));
ensureDirectoryExists(path.join(__dirname, 'uploads', 'certificates'));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads avec gestion d'erreur
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Définir les en-têtes appropriés pour les fichiers
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// Middleware de gestion d'erreur pour les fichiers statiques
app.use('/uploads', (err, req, res, next) => {
  console.error('Erreur fichier statique:', err);
  res.status(404).json({ error: 'Fichier non trouvé' });
});

// Test database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/insurer', insurerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    uploads: {
      documents: fs.existsSync(path.join(__dirname, 'uploads', 'documents')),
      certificates: fs.existsSync(path.join(__dirname, 'uploads', 'certificates'))
    }
  });
});

// Middleware de gestion d'erreur global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fichier trop volumineux (max 5MB)' });
    }
    return res.status(400).json({ error: 'Erreur lors de l\'upload du fichier' });
  }
  
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});