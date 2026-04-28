// server.js
const app = require('./src/app');
const pool = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Test de la connexion à la base de données
pool.getConnection()
    .then(connection => {
        console.log('Connecté à MySQL');
        connection.release();
        
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
    })
    .catch(err => {
        console.error('Erreur de connexion à MySQL:', err);
        process.exit(1);
    });