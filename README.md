# 🚗 AssuranceRenew - Plateforme de Renouvellement d'Assurance Automobile

Une plateforme web moderne permettant aux conducteurs de renouveler leur assurance automobile en ligne avec un processus simplifié, paiement sécurisé via FedaPay, et gestion automatisée des dossiers.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Comptes par défaut](#-comptes-par-défaut)
- [Déploiement](#-déploiement)

## 🚀 Fonctionnalités

### Pour les Clients
- ✅ Création de compte et authentification
- ✅ Soumission de demandes de renouvellement
- ✅ Upload de documents (carte grise, ancienne assurance, etc.)
- ✅ Paiement sécurisé via FedaPay
- ✅ Suivi en temps réel du traitement
- ✅ Téléchargement des attestations
- ✅ Historique des demandes

### Pour les Assureurs
- ✅ Tableau de bord des demandes assignées
- ✅ Gestion du traitement des dossiers
- ✅ Upload des attestations d'assurance
- ✅ Statistiques de performance

### Pour les Administrateurs
- ✅ Vue d'ensemble de la plateforme
- ✅ Gestion des clients et assureurs
- ✅ Attribution des demandes aux assureurs
- ✅ Configuration des tarifs et commissions
- ✅ Suivi des paiements et revenus

## 🛠 Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et dev server
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **React Hook Form** pour les formulaires
- **Axios** pour les appels API
- **Lucide React** pour les icônes

### Backend
- **Node.js** avec Express
- **MySQL** pour la base de données
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **bcryptjs** pour le hachage des mots de passe
- **CORS** pour les requêtes cross-origin

### Paiement
- **FedaPay** (intégration prête)

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 16 ou supérieure)
- **npm** ou **yarn**
- **MySQL** (version 8.0 ou supérieure)
- **Git**

## 🔧 Installation

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd insurance-renewal-platform
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Créer les dossiers nécessaires**
```bash
mkdir -p server/uploads/certificates
```

## ⚙️ Configuration

### 1. Installation et configuration de MySQL

#### Sur Ubuntu/Debian :
```bash
# Installer MySQL
sudo apt update
sudo apt install mysql-server

# Démarrer MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Configuration sécurisée (optionnel)
sudo mysql_secure_installation
```

#### Sur macOS :
```bash
# Avec Homebrew
brew install mysql
brew services start mysql
```

#### Sur Windows :
1. Télécharger MySQL depuis [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Installer et démarrer le service MySQL

### 2. Configuration de la base de données

1. **Se connecter à MySQL**
```bash
mysql -u root -p
```

2. **Créer la base de données**
```sql
CREATE DATABASE insurance_platform;
EXIT;
```

3. **Importer le schéma**
```bash
mysql -u root -p insurance_platform < supabase/migrations/20250703125359_holy_tooth.sql
```

### 3. Variables d'environnement

Le fichier `.env` est déjà configuré. **Modifiez uniquement le mot de passe MySQL** :

```env
# Base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=VOTRE_MOT_DE_PASSE_MYSQL_ICI
DB_NAME=insurance_platform

# JWT Secret (changez en production)
JWT_SECRET=your_super_secret_jwt_key_here

# FedaPay Configuration
FEDAPAY_PUBLIC_KEY=your_fedapay_public_key
FEDAPAY_SECRET_KEY=your_fedapay_secret_key
FEDAPAY_WEBHOOK_SECRET=your_fedapay_webhook_secret

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🚀 Démarrage

### ⚠️ IMPORTANT : Vérifier MySQL avant de démarrer

```bash
# Vérifier que MySQL fonctionne
sudo systemctl status mysql

# Si MySQL n'est pas démarré
sudo systemctl start mysql

# Tester la connexion
mysql -u root -p -e "SELECT 1;"
```

### Option 1: Démarrage simultané (Recommandé)
```bash
npm run dev
```
Cette commande démarre automatiquement :
- **Backend** sur `http://localhost:3001`
- **Frontend** sur `http://localhost:5173`

### Option 2: Démarrage séparé

**Terminal 1 - Backend :**
```bash
npm run server
```

**Terminal 2 - Frontend :**
```bash
npm run client
```

### Vérification

1. **Backend** : Visitez `http://localhost:3001/api/health`
   - ✅ Doit retourner : `{"status": "OK", "message": "Server is running"}`
   - ✅ Dans les logs : `✅ MySQL Connected successfully`

2. **Frontend** : Visitez `http://localhost:5173`
   - ✅ Page d'accueil AssuranceRenew

## 🐛 Dépannage

### Erreur de connexion MySQL

**Problème :** `❌ MySQL connection failed: connect ECONNREFUSED 127.0.0.1:3306`

**Solutions :**

1. **Vérifier que MySQL est démarré**
```bash
sudo systemctl status mysql
# Si arrêté :
sudo systemctl start mysql
```

2. **Vérifier le mot de passe dans .env**
```bash
# Tester la connexion
mysql -u root -p
```

3. **Vérifier le port MySQL**
```sql
SHOW VARIABLES WHERE Variable_name = 'port';
```

4. **Redémarrer MySQL si nécessaire**
```bash
sudo systemctl restart mysql
```

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port
lsof -i :3001
lsof -i :5173

# Tuer le processus si nécessaire
kill -9 <PID>
```

### Problème de permissions sur les uploads
```bash
chmod 755 server/uploads
chmod 755 server/uploads/certificates
```

## 📁 Structure du projet

```
insurance-renewal-platform/
├── src/                          # Frontend React
│   ├── components/               # Composants réutilisables
│   ├── contexts/                 # Contextes React (Auth, etc.)
│   ├── lib/                      # Utilitaires et API client
│   ├── pages/                    # Pages de l'application
│   │   ├── auth/                 # Pages d'authentification
│   │   ├── client/               # Pages client
│   │   ├── insurer/              # Pages assureur
│   │   └── admin/                # Pages admin
│   └── types/                    # Types TypeScript
├── server/                       # Backend Node.js
│   ├── config/                   # Configuration (DB, etc.)
│   ├── middleware/               # Middlewares Express
│   ├── routes/                   # Routes API
│   └── uploads/                  # Fichiers uploadés
├── supabase/migrations/          # Schéma de base de données
└── public/                       # Assets statiques
```

## 📚 API Documentation

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Client
- `POST /api/client/requests` - Créer une demande
- `GET /api/client/requests` - Liste des demandes
- `GET /api/client/requests/:id` - Détail d'une demande
- `GET /api/client/dashboard` - Statistiques client

### Assureur
- `GET /api/insurer/requests` - Demandes assignées
- `PUT /api/insurer/requests/:id/status` - Mettre à jour le statut
- `POST /api/insurer/requests/:id/certificate` - Upload attestation
- `GET /api/insurer/dashboard` - Statistiques assureur

### Admin
- `GET /api/admin/dashboard` - Statistiques générales
- `GET /api/admin/clients` - Liste des clients
- `GET /api/admin/insurers` - Liste des assureurs
- `GET /api/admin/requests` - Toutes les demandes
- `PUT /api/admin/requests/:id/assign` - Assigner une demande

### Paiement
- `POST /api/payment/initiate` - Initier un paiement
- `GET /api/payment/status/:id` - Statut du paiement
- `POST /api/payment/webhook` - Webhook FedaPay

## 👤 Comptes par défaut

### Administrateur
- **Email :** `admin@assurancerenew.com`
- **Mot de passe :** `password`

### Compagnies d'assurance pré-configurées
- Allianz Bénin
- AXA Assurances  
- NSIA Assurances
- Saham Assurance

## 🔄 Workflow de fonctionnement

1. **Client** crée un compte et soumet une demande avec documents
2. **Système** calcule automatiquement les montants (base + commission)
3. **Client** effectue le paiement via FedaPay
4. **Admin** assigne la demande à un assureur partenaire
5. **Assureur** traite la demande et upload l'attestation
6. **Client** reçoit une notification et télécharge son attestation

## 💰 Gestion des commissions

- Commission configurable par l'admin (défaut: 5%)
- Calcul automatique : `Total = Montant_Base + (Montant_Base × Taux_Commission)`
- Transparence totale pour le client
- Suivi des revenus en temps réel

## 🔒 Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Validation des rôles utilisateur
- Upload sécurisé des fichiers
- Protection CORS configurée

## 🚀 Déploiement

### Production
1. Configurer les variables d'environnement de production
2. Build du frontend : `npm run build`
3. Déployer sur votre serveur avec PM2 ou Docker

### Variables d'environnement de production
```env
NODE_ENV=production
DB_HOST=your_production_db_host
JWT_SECRET=your_super_secure_jwt_secret
FEDAPAY_PUBLIC_KEY=your_production_fedapay_key
FEDAPAY_SECRET_KEY=your_production_fedapay_secret
```

## 📞 Support

Pour toute question ou problème :
- Email : support@assurancerenew.com
- Documentation API : `http://localhost:3001/api/health`

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour simplifier le renouvellement d'assurance automobile**