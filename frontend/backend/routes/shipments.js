const express = require('express');
const db = require('../database');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

function generateTrackingNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FR-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function calculatePrice(weight, packageType) {
  let basePrice = 5.99;
  const pricePerKg = 1.50;
  const typeMultiplier = {
    standard: 1,
    express: 1.8,
    fragile: 1.5,
    volumineux: 2.0
  };

  let price = basePrice + (Number(weight || 0) * pricePerKg);
  price *= (typeMultiplier[packageType] || 1);
  return Math.round(price * 100) / 100;
}

// GET /api/shipments
router.get('/', authenticateToken, requireStaff, (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    let shipments = db.find('shipments');

    if (status) {
      shipments = shipments.filter(s => s.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      shipments = shipments.filter(s => 
        (s.tracking_number && s.tracking_number.toLowerCase().includes(q)) ||
        (s.sender_name && s.sender_name.toLowerCase().includes(q)) ||
        (s.receiver_name && s.receiver_name.toLowerCase().includes(q))
      );
    }

    // Tri par date décroissante
    shipments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = shipments.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = shipments.slice(startIndex, startIndex + Number(limit));

    // Enrichir avec villes et créateur
    const enriched = paginated.map(s => {
      const sc = db.findById('cities', s.sender_city_id);
      const rc = db.findById('cities', s.receiver_city_id);
      const u = db.findById('users', s.created_by);
      return {
        ...s,
        sender_city_name: sc ? sc.name : 'Inconnu',
        receiver_city_name: rc ? rc.name : 'Inconnu',
        created_by_name: u ? u.full_name : 'Staff'
      };
    });

    res.json({
      shipments: enriched,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (err) {
    console.error('Erreur liste expéditions:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/shipments/:id
router.get('/:id', authenticateToken, requireStaff, (req, res) => {
  try {
    const shipment = db.findById('shipments', req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Expédition non trouvée' });
    }

    const sc = db.findById('cities', shipment.sender_city_id);
    const rc = db.findById('cities', shipment.receiver_city_id);
    const u = db.findById('users', shipment.created_by);

    const enrichedShipment = {
      ...shipment,
      sender_city_name: sc ? sc.name : 'Inconnu',
      sender_postal: sc ? sc.code_postal : '',
      receiver_city_name: rc ? rc.name : 'Inconnu',
      receiver_postal: rc ? rc.code_postal : '',
      created_by_name: u ? u.full_name : 'Staff'
    };

    const history = db
      .find('tracking_history', th => Number(th.shipment_id) === Number(shipment.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(th => {
        const updater = db.findById('users', th.updated_by);
        return {
          ...th,
          updated_by_name: updater ? updater.full_name : 'Staff'
        };
      });

    res.json({ shipment: enrichedShipment, history });
  } catch (err) {
    console.error('Erreur détail expédition:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/shipments
router.post('/', authenticateToken, requireStaff, (req, res) => {
  try {
    const {
      sender_name, sender_phone, sender_email, sender_address, sender_city_id,
      receiver_name, receiver_phone, receiver_email, receiver_address, receiver_city_id,
      package_description, weight, dimensions, package_type, notes
    } = req.body;

    if (!sender_name || !sender_phone || !sender_address || !sender_city_id ||
        !receiver_name || !receiver_phone || !receiver_address || !receiver_city_id) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires' });
    }

    let trackingNumber;
    let isUnique = false;
    while (!isUnique) {
      trackingNumber = generateTrackingNumber();
      const existing = db.findOne('shipments', s => s.tracking_number === trackingNumber);
      if (!existing) isUnique = true;
    }

    const price = calculatePrice(weight || 0, package_type || 'standard');
    const daysToDeliver = package_type === 'express' ? 1 : 3;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToDeliver);

    const newShipment = db.insert('shipments', {
      tracking_number: trackingNumber,
      sender_name,
      sender_phone,
      sender_email: sender_email || null,
      sender_address,
      sender_city_id: Number(sender_city_id),
      receiver_name,
      receiver_phone,
      receiver_email: receiver_email || null,
      receiver_address,
      receiver_city_id: Number(receiver_city_id),
      package_description: package_description || null,
      weight: Number(weight || 0),
      dimensions: dimensions || null,
      package_type: package_type || 'standard',
      price,
      status: 'en_attente',
      estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
      actual_delivery: null,
      notes: notes || null,
      created_by: req.user.id
    });

    const senderCity = db.findById('cities', sender_city_id);

    db.insert('tracking_history', {
      shipment_id: newShipment.id,
      status: 'en_attente',
      location: senderCity ? senderCity.name : 'France',
      description: 'Colis enregistré dans le système',
      updated_by: req.user.id
    });

    res.status(201).json({
      message: 'Expédition créée avec succès',
      tracking_number: trackingNumber,
      id: newShipment.id
    });
  } catch (err) {
    console.error('Erreur création expédition:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création' });
  }
});

// PUT /api/shipments/:id/status
router.put('/:id/status', authenticateToken, requireStaff, (req, res) => {
  try {
    const { status, location, description } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Le statut est requis' });
    }

    const shipment = db.findById('shipments', req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Expédition non trouvée' });
    }

    const updates = { status };
    if (status === 'livre') {
      updates.actual_delivery = new Date().toISOString().split('T')[0];
    }

    db.update('shipments', req.params.id, updates);

    const statusLabels = {
      en_attente: 'En attente de collecte',
      collecte: 'Colis collecté',
      en_transit: 'En transit',
      au_hub: 'Arrivé au centre de tri',
      en_livraison: 'En cours de livraison',
      livre: 'Colis livré',
      retourne: 'Colis retourné à l\'expéditeur',
      annule: 'Expédition annulée'
    };

    db.insert('tracking_history', {
      shipment_id: shipment.id,
      status,
      location: location || 'France',
      description: description || statusLabels[status] || status,
      updated_by: req.user.id
    });

    res.json({ message: 'Statut mis à jour avec succès' });
  } catch (err) {
    console.error('Erreur mise à jour statut:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/shipments/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Seul un administrateur peut supprimer une expédition' });
    }

    const shipment = db.findById('shipments', req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Expédition non trouvée' });
    }

    // Supprimer l'historique associé
    const thList = db.getCollection('tracking_history');
    const filteredTh = thList.filter(th => Number(th.shipment_id) !== Number(req.params.id));
    db.data.tracking_history = filteredTh;

    db.delete('shipments', req.params.id);

    res.json({ message: 'Expédition supprimée avec succès' });
  } catch (err) {
    console.error('Erreur suppression:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
