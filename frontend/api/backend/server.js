const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Initialiser la base de données (crée les tables)
require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/public', require('./routes/public'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'France Express Logistics API fonctionne' });
});

// En mode standalone uniquement (hors Vercel serverless)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════╗
    ║   🚚 TrackNova Logistics - API Server           ║
    ║   ──────────────────────────────────────────     ║
    ║   Serveur démarré sur le port ${PORT}              ║
    ║   http://localhost:${PORT}                         ║
    ║   API: http://localhost:${PORT}/api                ║
    ╚══════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
