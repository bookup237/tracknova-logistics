const express = require('express');
const db = require('../database');
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', authenticateToken, requireStaff, (req, res) => {
  try {
    const shipments = db.find('shipments');
    const users = db.find('users');
    const messages = db.find('contact_messages');
    const quotes = db.find('quote_requests');
    const cities = db.find('cities');

    const totalShipments = shipments.length;
    const pendingShipments = shipments.filter(s => s.status === 'en_attente').length;
    const inTransitShipments = shipments.filter(s => ['en_transit', 'au_hub', 'collecte'].includes(s.status)).length;
    const deliveredShipments = shipments.filter(s => s.status === 'livre').length;
    const inDeliveryShipments = shipments.filter(s => s.status === 'en_livraison').length;
    const cancelledShipments = shipments.filter(s => s.status === 'annule').length;
    const returnedShipments = shipments.filter(s => s.status === 'retourne').length;

    const totalRevenue = shipments
      .filter(s => s.status !== 'annule')
      .reduce((sum, s) => sum + Number(s.price || 0), 0);

    const totalClients = users.filter(u => u.role === 'client').length;
    const unreadMessages = messages.filter(m => !m.is_read).length;
    const newQuotes = quotes.filter(q => q.status === 'nouveau').length;

    // Expéditions récentes triées par date
    const sortedShipments = [...shipments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const recentShipments = sortedShipments.slice(0, 10).map(s => {
      const sc = db.findById('cities', s.sender_city_id);
      const rc = db.findById('cities', s.receiver_city_id);
      return {
        ...s,
        sender_city_name: sc ? sc.name : 'Inconnu',
        receiver_city_name: rc ? rc.name : 'Inconnu'
      };
    });

    // Top destinations
    const destCounts = {};
    shipments.forEach(s => {
      const cityId = s.receiver_city_id;
      destCounts[cityId] = (destCounts[cityId] || 0) + 1;
    });

    const topDestinations = Object.entries(destCounts)
      .map(([cityId, count]) => {
        const city = db.findById('cities', cityId);
        return {
          name: city ? city.name : `Ville #${cityId}`,
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      stats: {
        totalShipments,
        pendingShipments,
        inTransitShipments,
        deliveredShipments,
        inDeliveryShipments,
        cancelledShipments,
        returnedShipments,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalClients,
        unreadMessages,
        newQuotes
      },
      recentShipments,
      monthlyStats: [],
      topDestinations
    });
  } catch (err) {
    console.error('Erreur stats admin:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/users
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.find('users').map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/users
router.post('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { username, email, password, full_name, phone, role } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const existing = db.findOne('users', u => u.email === email || u.username === username);
    if (existing) {
      return res.status(409).json({ error: 'Cet utilisateur existe déjà' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = db.insert('users', {
      username,
      email,
      password: hashedPassword,
      full_name,
      phone: phone || null,
      role: role || 'client'
    });

    res.status(201).json({ message: 'Utilisateur créé', id: newUser.id });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (Number(req.params.id) === Number(req.user.id)) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    db.delete('users', req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/messages
router.get('/messages', authenticateToken, requireStaff, (req, res) => {
  try {
    const messages = db
      .find('contact_messages')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/messages/:id/read
router.put('/messages/:id/read', authenticateToken, requireStaff, (req, res) => {
  try {
    db.update('contact_messages', req.params.id, { is_read: 1 });
    res.json({ message: 'Message marqué comme lu' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/quotes
router.get('/quotes', authenticateToken, requireStaff, (req, res) => {
  try {
    const quotes = db
      .find('quote_requests')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(q => {
        const oc = db.findById('cities', q.origin_city_id);
        const dc = db.findById('cities', q.destination_city_id);
        return {
          ...q,
          origin_city_name: oc ? oc.name : 'Inconnu',
          destination_city_name: dc ? dc.name : 'Inconnu'
        };
      });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/quotes/:id/status
router.put('/quotes/:id/status', authenticateToken, requireStaff, (req, res) => {
  try {
    const { status } = req.body;
    db.update('quote_requests', req.params.id, { status });
    res.json({ message: 'Statut du devis mis à jour' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/cities
router.get('/cities', authenticateToken, requireStaff, (req, res) => {
  try {
    const cities = db.find('cities').sort((a, b) => a.name.localeCompare(b.name));
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
