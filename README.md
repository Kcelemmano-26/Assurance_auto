# 🚗 AssuranceRenew - Plateforme de Renouvellement d'Assurance Automobile

Une plateforme web moderne permettant aux conducteurs de renouveler leur assurance automobile en ligne avec un processus simplifié, paiement sécurisé via FedaPay, et gestion automatisée des dossiers.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration avec Docker](#-configuration-avec-docker)
- [Variables d'environnement](#-variables-denvironnement)
- [Démarrage](#-démarrage)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Comptes par défaut](#-comptes-par-défaut)
- [Déploiement](#-déploiement)
- [Support](#-support)
- [Licence](#-licence)

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
- React 18 avec TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Axios
- Lucide React

### Backend
- Node.js avec Express
- MySQL via Docker
- JWT
- Multer
- bcryptjs
- CORS

### Paiement
- FedaPay

## 📦 Prérequis

- Node.js (v16+)
- Docker & Docker Compose
- Git

## 📥 Installation

```bash
git clone <url-du-repo>
cd insurance-renewal-platform
npm install
mkdir -p server/uploads/certificates
```

## ⚙️ Configuration avec Docker

### Lancer les services MySQL et phpMyAdmin

```bash
docker-compose -f docker-compose.mysql.yml up -d
```

Cela démarre :

- MySQL (port : 3307)
- phpMyAdmin (port : 8080)

### Accès à phpMyAdmin

| Clé        | Valeur             |
|------------|--------------------|
| URL        | http://localhost:8080 |
| Serveur    | mysql              |
| Login      | admin              |
| Password   | admin              |

### Importer la base de données

- Ouvrir phpMyAdmin
- Sélectionner `insurance_platform`
- Onglet "Importer"
- Fichier SQL : `supabase/migrations/20250703125359_holy_tooth.sql`

## 🔐 Variables d'environnement

Créer un fichier `.env` :

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=insurance_platform

JWT_SECRET=your_jwt_secret

FEDAPAY_PUBLIC_KEY=your_fedapay_public_key
FEDAPAY_SECRET_KEY=your_fedapay_secret_key
FEDAPAY_WEBHOOK_SECRET=your_fedapay_webhook_secret

PORT=3001
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

## ▶️ Démarrage

### Backend

```bash
npm run server
```

### Frontend

```bash
npm run client
```

### Lancer les deux

```bash
npm run dev
```

## 🔍 Vérification

- Backend : http://localhost:3001/api/health
- Frontend : http://localhost:5173

## 📁 Structure du projet

```
insurance-renewal-platform/
├── server/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── uploads/
├── src/
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   └── lib/
├── supabase/migrations/
├── docker-compose.mysql.yml
└── .env
```

## 📚 API Documentation

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Client
- POST /api/client/requests
- GET /api/client/requests
- GET /api/client/requests/:id
- GET /api/client/dashboard

### Assureur
- GET /api/insurer/requests
- PUT /api/insurer/requests/:id/status
- POST /api/insurer/requests/:id/certificate
- GET /api/insurer/dashboard

### Admin
- GET /api/admin/dashboard
- GET /api/admin/clients
- GET /api/admin/insurers
- GET /api/admin/requests
- PUT /api/admin/requests/:id/assign

### Paiement
- POST /api/payment/initiate
- GET /api/payment/status/:id
- POST /api/payment/webhook

## 👤 Comptes par défaut

### Admin
- Email : admin@assurancerenew.com
- Mot de passe : password (haché via bcrypt)

### Assureurs par défaut
- Allianz Bénin
- AXA Assurances
- NSIA Assurances
- Saham Assurance

## 🔄 Workflow

1. Client crée une demande
2. Paiement via FedaPay
3. Admin assigne à un assureur
4. Assureur traite et envoie l'attestation
5. Client télécharge l'attestation

## 💰 Commissions

- Commission configurable
- Calcul automatique :
  `total = base + (base * commission%)`

## 🔒 Sécurité

- JWT Auth
- bcrypt password
- Upload protégé
- CORS activé

## 🚀 Déploiement

```bash
docker-compose -f docker-compose.mysql.yml up -d
npm run build
```

Fichier `.env` production :

```env
NODE_ENV=production
DB_HOST=mysql
DB_PORT=3306
JWT_SECRET=super_secure_token
```

## 📞 Support

- support@assurancerenew.com
- http://localhost:3001/api/health

## 📄 Licence

Projet sous licence MIT.
