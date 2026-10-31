import { app } from './api/index.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const distPath = path.join(__dirname, 'frontend/dist');

// Servir les fichiers statiques du frontend buildé
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Catch-all pour le routeur client SPA (React Router)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn(`[ATTENTION] Le dossier ${distPath} n'existe pas encore. Lancez 'npm run build' pour compiler le frontend.`);
  app.get('/', (req, res) => {
    res.send('TrackNova Logistics API est en ligne. Le frontend est en cours de compilation.');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   🚚 TrackNova Logistics - Production Server     ║
  ║   ──────────────────────────────────────────     ║
  ║   Serveur démarré sur le port : ${PORT}             ║
  ║   Prêt pour Railway & Standalone (0.0.0.0)       ║
  ║   API: /api/*                                    ║
  ║   Frontend: ${fs.existsSync(distPath) ? 'Actif (dist)' : 'Non compilé'}                        ║
  ╚══════════════════════════════════════════════════╝
  `);
});
