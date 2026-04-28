const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion directe à MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestion_reclamation',
  waitForConnections: true
}).promise();

// ============================================
// ROUTE D'INSCRIPTION SIMPLIFIÉE
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Inscription:', req.body);
    const { nom, prenom, email, motDePasse } = req.body;
    
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    
    const [result] = await db.execute(
      'INSERT INTO Utilisateur (nom, prenom, email, motDePasse, typeUtilisateur) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, 'Citoyen']
    );
    
    res.json({ success: true, message: 'Compte créé', id: result.insertId });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ROUTE DE CONNEXION SIMPLIFIÉE
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    console.log('🔑 Tentative connexion:', email);

    // Récupérer l'utilisateur DIRECTEMENT
    const [users] = await db.execute(
      'SELECT idUtilisateur, nom, prenom, email, motDePasse, typeUtilisateur FROM Utilisateur WHERE email = ?',
      [email]
    );

    console.log('📊 Résultat SQL:', users.length > 0 ? 'Utilisateur trouvé' : 'Non trouvé');

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    console.log('👤 Utilisateur:', user.email);
    console.log('🔐 Mot de passe en BDD:', user.motDePasse ? 'Présent' : 'MANQUANT');

    if (!user.motDePasse) {
      return res.status(500).json({ success: false, message: 'Mot de passe manquant en BDD' });
    }

    const validPassword = await bcrypt.compare(motDePasse, user.motDePasse);
    console.log('🔐 Mot de passe valide:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.idUtilisateur, email: user.email },
      'secret_key_test',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.idUtilisateur,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ ERREUR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ROUTE DE TEST
// ============================================
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: '✅ Serveur de test fonctionne' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 SERVEUR DE TEST DÉMARRÉ SUR LE PORT ${PORT}`);
  console.log(`📡 http://localhost:${PORT}/api/test`);
  console.log(`📡 http://localhost:${PORT}/api/auth/register`);
  console.log(`📡 http://localhost:${PORT}/api/auth/login\n`);
});