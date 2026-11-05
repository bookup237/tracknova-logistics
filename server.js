import { app } from './api/index.js';
import db from './api/db.js';
import { isPostgresConfigured } from './api/postgres.js';
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

  // Route directe pour la validation Google Search Console
  app.get('/googlee0004df97bafc526.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.send('google-site-verification: googlee0004df97bafc526.html');
  });

  // Route dédiée pour le favicon officiel Google
  app.get('/favicon.ico', (req, res) => {
    const icoPath = path.join(distPath, 'favicon.ico');
    if (fs.existsSync(icoPath)) {
      res.setHeader('Content-Type', 'image/x-icon');
      return res.sendFile(icoPath);
    }
    res.status(404).end();
  });

  // Catch-all pour le routeur client SPA (React Router)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const requestedFile = path.join(distPath, req.path);
    if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
      return res.sendFile(requestedFile);
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn(`[ATTENTION] Le dossier ${distPath} n'existe pas encore. Lancez 'npm run build' pour compiler le frontend.`);
  app.get('/', (req, res) => {
    res.send('TrackNova Logistics API est en ligne. Le frontend est en cours de compilation.');
  });
}

// Démarrer l'écoute HTTP IMMÉDIATEMENT pour que Railway valide le healthcheck sans délai
const pgStatus = isPostgresConfigured() ? 'Connecté (PostgreSQL Railway)' : 'Fichier / Cloud Store';
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   🚚 TrackNova Logistics - Production Server     ║
  ║   ──────────────────────────────────────────     ║
  ║   Serveur démarré sur le port : ${PORT}             ║
  ║   Prêt pour Railway & Standalone (0.0.0.0)       ║
  ║   Base de données : ${pgStatus}  ║
  ║   API : /api/*                                   ║
  ║   Frontend : ${fs.existsSync(distPath) ? 'Actif (dist)' : 'Non compilé'}                        ║
  ╚══════════════════════════════════════════════════╝
  `);
});

// Initialiser PostgreSQL en arrière-plan sans JAMAIS bloquer le port HTTP
if (isPostgresConfigured()) {
  db.initPostgresSync().catch((err) => {
    console.warn('[PostgreSQL] Initialisation asynchrone info:', err.message);
  });
}
