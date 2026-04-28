// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================
// Middlewares
// ============================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add RIGHT AFTER app.use(express.json(...))
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================
// 1️⃣ UNE SEULE ROUTE DE TEST (optionnelle)
// ============================
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ API fonctionnelle',
    time: new Date().toISOString()
  });
});

// ============================
// 2️⃣ API Routes
// ============================
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const citoyenRoutes = require('./routes/citoyenRoutes');
const agentMunicipalRoutes = require('./routes/agentMunicipalRoutes');
const administrateurRoutes = require('./routes/administrateurRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const localisationRoutes = require('./routes/localisationRoutes');
const reclamationRoutes = require('./routes/reclamationRoutes');
const historiqueRoutes = require('./routes/historiqueRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statistiqueRoutes = require('./routes/statistiqueRoutes');
const rapportRoutes = require('./routes/rapportRoutes');
const moduleIARoutes = require('./routes/moduleIARoutes');
const imageRoutes = require('./routes/imageRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/citoyen', citoyenRoutes);
app.use('/api/agent', agentMunicipalRoutes);
app.use('/api/admin', administrateurRoutes);
app.use('/api/categories', categorieRoutes);  // ← MAINTENANT LA VRAIE ROUTE
app.use('/api/localisations', localisationRoutes);
app.use('/api/reclamations', reclamationRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/statistiques', statistiqueRoutes);
app.use('/api/rapports', rapportRoutes);
app.use('/api/ia', moduleIARoutes);
app.use('/api/images', imageRoutes);
app.use('/api/stats', statsRoutes);

// ============================
// 3️⃣ Home Route
// ============================
app.get('/', (req, res) => {
    res.json({
        message: 'API Gestion Réclamations Citoyennes',
        version: '2.0.0',
        features: { images: true, mobile: true, web: true }
        
    });
});

// ============================
// 4️⃣ 404 Handler
// ============================
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// ============================
// 5️⃣ Global Error Handler
// ============================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur interne du serveur' });
});

module.exports = app;