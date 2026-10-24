const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware d'authentification JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide ou expiré' });
  }
}

// Middleware de vérification du rôle admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

// Middleware de vérification agent ou admin
function requireStaff(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'agent') {
    return res.status(403).json({ error: 'Accès réservé au personnel' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireStaff };
