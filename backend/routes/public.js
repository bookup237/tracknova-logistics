const express = require('express');
const db = require('../database');

const router = express.Router();

// GET /api/public/cities
router.get('/cities', (req, res) => {
  try {
    const { search } = req.query;
    let cities = db.find('cities');

    if (search) {
      const q = search.toLowerCase();
      cities = cities.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.code_postal && c.code_postal.includes(q))
      );
    }

    cities.sort((a, b) => a.name.localeCompare(b.name));
    res.json(cities.slice(0, 100));
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/public/contact
router.post('/contact', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires' });
    }

    db.insert('contact_messages', {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      is_read: 0
    });

    res.status(201).json({ message: 'Message envoyé avec succès. Nous vous répondrons rapidement.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/public/quote
router.post('/quote', (req, res) => {
  try {
    const { name, email, phone, origin_city_id, destination_city_id, weight, dimensions, package_type, description } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires' });
    }

    db.insert('quote_requests', {
      name,
      email,
      phone,
      origin_city_id: origin_city_id ? Number(origin_city_id) : null,
      destination_city_id: destination_city_id ? Number(destination_city_id) : null,
      weight: weight ? Number(weight) : null,
      dimensions: dimensions || null,
      package_type: package_type || 'standard',
      description: description || null,
      status: 'nouveau'
    });

    res.status(201).json({ message: 'Demande de devis envoyée avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/public/pricing
router.get('/pricing', (req, res) => {
  res.json({
    standard: {
      name: 'Standard',
      basePrice: 5.99,
      pricePerKg: 1.50,
      delivery: '3-5 jours ouvrés',
      description: 'Livraison économique pour vos colis non urgents'
    },
    express: {
      name: 'Express',
      basePrice: 10.79,
      pricePerKg: 2.70,
      delivery: '24-48 heures',
      description: 'Livraison rapide avec suivi prioritaire'
    },
    fragile: {
      name: 'Fragile',
      basePrice: 8.99,
      pricePerKg: 2.25,
      delivery: '2-4 jours ouvrés',
      description: 'Emballage et manutention spéciale pour objets fragiles'
    },
    volumineux: {
      name: 'Volumineux',
      basePrice: 11.99,
      pricePerKg: 3.00,
      delivery: '3-7 jours ouvrés',
      description: 'Pour les colis de grande taille et lourds'
    }
  });
});

module.exports = router;
