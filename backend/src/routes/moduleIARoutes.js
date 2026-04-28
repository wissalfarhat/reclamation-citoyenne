const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const db = require('../config/database');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ✅ Suggest category + priority
router.post('/suggest', verifyToken, async (req, res) => {
  try {
    const { titre, description } = req.body;

    if (!titre && !description) {
      return res.status(400).json({ success: false, message: 'Titre ou description requis' });
    }

    // Get categories from DB
    const [categories] = await db.execute(
      'SELECT idCategorie, nomCategorie, description, prioriteDefaut FROM Categorie'
    );

    const categoriesList = categories.map(c =>
      `- ID: ${c.idCategorie}, Nom: ${c.nomCategorie}, Description: ${c.description || 'N/A'}, Priorité défaut: ${c.prioriteDefaut}`
    ).join('\n');

    const prompt = `
Tu es un assistant municipal tunisien expert en gestion des réclamations citoyennes.
Analyse cette réclamation et retourne UNIQUEMENT un objet JSON valide, sans markdown ni explication.

Titre: "${titre || ''}"
Description: "${description || ''}"

Catégories disponibles:
${categoriesList}

Règles de priorité (1-10):
- 1-2: Très basse (esthétique, mineur)
- 3-4: Basse (gêne légère)
- 5-6: Moyenne (problème courant)
- 7-8: Haute (danger potentiel, accès bloqué)
- 9-10: Très haute (urgence, danger immédiat)

Retourne UNIQUEMENT ce JSON:
{
  "idCategorie": <number>,
  "nomCategorie": "<string>",
  "priorite": <number 1-10>,
  "prioriteLabel": "<Très basse|Basse|Moyenne|Haute|Très haute>",
  "confidence": <number 0-100>,
  "raisonnement": "<explication courte en français, max 100 chars>"
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text.trim();
    console.log('🤖 AI response:', responseText);

    const suggestion = JSON.parse(responseText);

    res.json({ success: true, data: suggestion });

  } catch (error) {
    console.error('❌ Erreur AI suggest:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suggestion IA' });
  }
});

// ✅ Analyze trends
router.get('/trends', verifyToken, async (req, res) => {
  try {
    const [reclamations] = await db.execute(`
      SELECT r.titre, r.description, r.statut, r.priorite,
             c.nomCategorie, l.ville, l.quartier,
             r.dateCreation
      FROM Reclamation r
      LEFT JOIN Categorie c ON r.idCategorie = c.idCategorie
      LEFT JOIN Localisation l ON r.idLocalisation = l.idLocalisation
      ORDER BY r.dateCreation DESC
      LIMIT 50
    `);

    if (reclamations.length === 0) {
      return res.json({ success: true, data: { analyse: 'Aucune donnée disponible.' } });
    }

    const summary = reclamations.map(r =>
      `- [${r.nomCategorie || 'N/A'}] ${r.titre} | Statut: ${r.statut} | Zone: ${r.quartier || r.ville || 'N/A'}`
    ).join('\n');

    const prompt = `
Tu es un analyste municipal. Voici les 50 dernières réclamations citoyennes en Tunisie:

${summary}

Analyse ces données et retourne UNIQUEMENT un JSON valide:
{
  "tendances": ["<tendance1>", "<tendance2>", "<tendance3>"],
  "zonesProblematiques": ["<zone1>", "<zone2>"],
  "categoriesFrequentes": ["<cat1>", "<cat2>", "<cat3>"],
  "recommandations": ["<rec1>", "<rec2>"],
  "resume": "<résumé global en 2 phrases>"
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const analysis = JSON.parse(message.content[0].text.trim());
    res.json({ success: true, data: analysis });

  } catch (error) {
    console.error('❌ Erreur AI trends:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;