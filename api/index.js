import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { saveShipmentToCloud, findShipmentInCloud, getAllCloudShipments } from './cloudStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'france_secret_key_tracknova_2026';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Auth Middlewares
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré.' });
    }
    req.user = user;
    next();
  });
}

function requireStaff(req, res, next) {
  if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès réservé au personnel TrackNova.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
  next();
}

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

// ─────────────────────────────────────────────
// ROUTES DE SANTÉ
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API TrackNova Logistics fonctionne',
    time: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────
// ROUTES PUBLIQUES
// ─────────────────────────────────────────────
app.get('/api/public/cities', (req, res) => {
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
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des villes' });
  }
});

app.get('/api/public/pricing', (req, res) => {
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

app.post('/api/public/contact', (req, res) => {
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

    res.status(201).json({ message: 'Message envoyé avec succès. Notre équipe vous répondra dans les meilleurs délais.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

app.post('/api/public/quote', (req, res) => {
  try {
    const { name, email, phone, origin_city_id, destination_city_id, weight, dimensions, package_type, description } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Veuillez remplir votre nom, email et téléphone.' });
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

    res.status(201).json({ message: 'Demande de devis enregistrée avec succès. Un conseiller vous contactera rapidement.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du devis' });
  }
});

// ─────────────────────────────────────────────
// ROUTE DE SUIVI DE COLIS (avec priorité temps réel Cloud)
// ─────────────────────────────────────────────
app.get('/api/tracking/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const cleanNumber = (trackingNumber || '').trim().toUpperCase();

    let shipment = null;
    let history = [];

    // ☁️ 1. Vérifier en priorité dans le Cloud persistant pour obtenir le dernier statut en temps réel
    try {
      const cloudData = await findShipmentInCloud(cleanNumber);
      if (cloudData && cloudData.shipment) {
        shipment = cloudData.shipment;
        history = Array.isArray(cloudData.history) ? cloudData.history : [];

        // Synchroniser le cache local du conteneur
        try {
          const local = db.findOne('shipments', s => s.tracking_number && s.tracking_number.toUpperCase() === cleanNumber);
          if (local) {
            db.update('shipments', local.id, shipment);
          } else {
            db.insert('shipments', shipment);
          }
        } catch (e) {}
      }
    } catch (errCloud) {
      console.warn('Recherche Cloud warning:', errCloud.message);
    }

    // 2. Si pas dans le cloud (ex: colis de démonstration seedés comme FR-PARIS750), chercher dans db locale
    if (!shipment) {
      shipment = db.findOne('shipments', s => s.tracking_number && s.tracking_number.toUpperCase() === cleanNumber);
      if (shipment) {
        history = db
          .find('tracking_history', th => Number(th.shipment_id) === Number(shipment.id))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    }

    if (!shipment) {
      return res.status(404).json({ error: 'Aucun colis trouvé avec ce numéro de suivi' });
    }

    const senderCity = db.findById('cities', shipment.sender_city_id) || { name: shipment.sender_city_name || shipment.sender_city || 'France' };
    const receiverCity = db.findById('cities', shipment.receiver_city_id) || { name: shipment.receiver_city_name || shipment.receiver_city || 'France' };

    const publicShipment = {
      tracking_number: shipment.tracking_number,
      status: shipment.status,
      package_type: shipment.package_type,
      sender_city: senderCity ? senderCity.name : (shipment.sender_city_name || 'France'),
      receiver_city: receiverCity ? receiverCity.name : (shipment.receiver_city_name || 'France'),
      sender_name: shipment.sender_name,
      receiver_name: shipment.receiver_name,
      weight: shipment.weight,
      estimated_delivery: shipment.estimated_delivery,
      actual_delivery: shipment.actual_delivery,
      created_at: shipment.created_at
    };

    res.json({
      shipment: publicShipment,
      history
    });
  } catch (err) {
    console.error('Erreur suivi:', err);
    res.status(500).json({ error: 'Erreur serveur lors du suivi' });
  }
});

// ─────────────────────────────────────────────
// AUTHENTIFICATION
// ─────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = db.findOne('users', u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Erreur connexion:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    const existing = db.findOne('users', u => u.email === email || u.username === username);
    if (existing) {
      return res.status(409).json({ error: 'Cet email ou nom d\'utilisateur existe déjà' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = db.insert('users', {
      username,
      email,
      password: hashedPassword,
      full_name,
      phone: phone || null,
      role: 'client'
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      userId: newUser.id
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─────────────────────────────────────────────
// STATS & ADMIN BACKOFFICE
// ─────────────────────────────────────────────
app.get('/api/admin/stats', authenticateToken, requireStaff, (req, res) => {
  try {
    const shipments = db.find('shipments');
    const users = db.find('users');
    const messages = db.find('contact_messages');
    const quotes = db.find('quote_requests');

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
    res.status(500).json({ error: 'Erreur serveur stats' });
  }
});

app.get('/api/admin/messages', authenticateToken, requireStaff, (req, res) => {
  try {
    const messages = db
      .find('contact_messages')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/messages/:id/read', authenticateToken, requireStaff, (req, res) => {
  try {
    db.update('contact_messages', req.params.id, { is_read: 1 });
    res.json({ message: 'Message marqué comme lu' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/quotes', authenticateToken, requireStaff, (req, res) => {
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

app.put('/api/admin/quotes/:id/status', authenticateToken, requireStaff, (req, res) => {
  try {
    const { status } = req.body;
    db.update('quote_requests', req.params.id, { status });
    res.json({ message: 'Statut du devis mis à jour' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/cities', authenticateToken, requireStaff, (req, res) => {
  try {
    const cities = db.find('cities').sort((a, b) => a.name.localeCompare(b.name));
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
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

app.post('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
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

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
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

// ─────────────────────────────────────────────
// EXPÉDITIONS (CRUD)
// ─────────────────────────────────────────────
app.get('/api/shipments', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    // Synchronisation avec le Cloud persistant pour inclure tous les colis générés
    try {
      const cloudData = await getAllCloudShipments();
      for (const item of cloudData) {
        if (item.shipment && item.shipment.tracking_number) {
          const exists = db.findOne('shipments', s => s.tracking_number === item.shipment.tracking_number);
          if (!exists) {
            db.insert('shipments', item.shipment);
            if (Array.isArray(item.history)) {
              for (const h of item.history) {
                db.insert('tracking_history', h);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Sync cloud shipments warning:', e.message);
    }

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

    shipments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = shipments.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = shipments.slice(startIndex, startIndex + Number(limit));

    const enriched = paginated.map(s => {
      const sc = db.findById('cities', s.sender_city_id);
      const rc = db.findById('cities', s.receiver_city_id);
      const u = db.findById('users', s.created_by);
      return {
        ...s,
        sender_city_name: sc ? sc.name : (s.sender_city_name || 'Inconnu'),
        receiver_city_name: rc ? rc.name : (s.receiver_city_name || 'Inconnu'),
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
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/shipments/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    let shipment = db.findById('shipments', req.params.id);
    if (!shipment) {
      const cloudData = await findShipmentInCloud(req.params.id);
      if (cloudData && cloudData.shipment) {
        shipment = cloudData.shipment;
        try {
          db.insert('shipments', shipment);
          if (Array.isArray(cloudData.history)) {
            for (const h of cloudData.history) db.insert('tracking_history', h);
          }
        } catch {}
      }
    }

    if (!shipment) {
      return res.status(404).json({ error: 'Expédition non trouvée' });
    }

    const sc = db.findById('cities', shipment.sender_city_id);
    const rc = db.findById('cities', shipment.receiver_city_id);
    const u = db.findById('users', shipment.created_by);

    const enrichedShipment = {
      ...shipment,
      sender_city_name: sc ? sc.name : (shipment.sender_city_name || 'Inconnu'),
      sender_postal: sc ? sc.code_postal : '',
      receiver_city_name: rc ? rc.name : (shipment.receiver_city_name || 'Inconnu'),
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
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/shipments', authenticateToken, requireStaff, async (req, res) => {
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

    const senderCity = db.findById('cities', sender_city_id);
    const receiverCity = db.findById('cities', receiver_city_id);

    const newShipment = db.insert('shipments', {
      tracking_number: trackingNumber,
      sender_name,
      sender_phone,
      sender_email: sender_email || null,
      sender_address,
      sender_city_id: Number(sender_city_id),
      sender_city_name: senderCity ? senderCity.name : 'France',
      receiver_name,
      receiver_phone,
      receiver_email: receiver_email || null,
      receiver_address,
      receiver_city_id: Number(receiver_city_id),
      receiver_city_name: receiverCity ? receiverCity.name : 'France',
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

    const firstHistoryEvent = db.insert('tracking_history', {
      shipment_id: newShipment.id,
      status: 'en_attente',
      location: senderCity ? senderCity.name : 'France',
      description: 'Colis enregistré dans le système TrackNova Logistics',
      updated_by: req.user.id
    });

    // ☁️ Sauvegarde persistante dans le cloud GitHub
    try {
      await saveShipmentToCloud(newShipment, [firstHistoryEvent]);
    } catch (e) {
      console.error('Erreur saveShipmentToCloud:', e);
    }

    res.status(201).json({
      message: 'Expédition créée avec succès',
      tracking_number: trackingNumber,
      id: newShipment.id
    });
  } catch (err) {
    console.error('Erreur create shipment:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'expédition' });
  }
});

app.put('/api/shipments/:id/status', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { status, location, description } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Le statut est requis' });
    }

    let shipment = db.findById('shipments', req.params.id);
    if (!shipment) {
      shipment = db.findOne('shipments', s => s.tracking_number === req.params.id);
    }

    // Si pas en local, chercher dans le cloud
    let cloudHistory = [];
    if (!shipment) {
      const allCloud = await getAllCloudShipments();
      const match = allCloud.find(c => 
        Number(c.shipment.id) === Number(req.params.id) || 
        c.shipment.tracking_number === req.params.id ||
        String(c.shipment.id) === String(req.params.id)
      );
      if (match) {
        shipment = match.shipment;
        cloudHistory = Array.isArray(match.history) ? match.history : [];
        try {
          db.insert('shipments', shipment);
        } catch {}
      }
    } else {
      const cloudData = await findShipmentInCloud(shipment.tracking_number);
      if (cloudData && Array.isArray(cloudData.history)) {
        cloudHistory = cloudData.history;
      }
    }

    if (!shipment) {
      return res.status(404).json({ error: 'Expédition non trouvée' });
    }

    const updates = { status };
    if (status === 'livre') {
      updates.actual_delivery = new Date().toISOString().split('T')[0];
    }

    db.update('shipments', shipment.id, updates);
    const updatedShipment = { ...shipment, ...updates };

    const statusLabels = {
      en_attente: "Colis enregistré, en attente d'expédition",
      collecte: "Colis collecté et pris en charge par le réseau TrackNova",
      en_transit: "Colis en cours d'acheminement sur le réseau national",
      au_hub: "Arrivé sur plateforme logistique de tri",
      en_livraison: "Colis pris en charge par le livreur, livraison en cours",
      livre: "Colis livré avec succès et remis au destinataire",
      retourne: "Colis retourné à l'expéditeur",
      annule: "Expédition annulée"
    };

    const newEvent = {
      id: Date.now(),
      shipment_id: shipment.id,
      status,
      location: location || (shipment.sender_city_name || 'France'),
      description: description || statusLabels[status] || status,
      created_at: new Date().toISOString(),
      updated_by: req.user.id
    };

    db.insert('tracking_history', newEvent);

    // Combiner l'historique complet pour la persistance Cloud
    const combinedHistory = [
      newEvent,
      ...cloudHistory.filter(h => h.id !== newEvent.id)
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // ☁️ Synchronisation persistante du statut dans le Cloud GitHub
    try {
      await saveShipmentToCloud(updatedShipment, combinedHistory);
    } catch (e) {
      console.error('Erreur update cloud status:', e);
    }

    res.json({
      message: 'Statut mis à jour avec succès',
      status: updatedShipment.status,
      shipment: updatedShipment,
      event: newEvent
    });
  } catch (err) {
    console.error('Erreur update status:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
  }
});

app.delete('/api/shipments/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Seul un administrateur peut supprimer une expédition' });
    }

    const shipment = db.findById('shipments', req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Expédition non trouvée' });
    }

    const thList = db.getCollection('tracking_history');
    db.data.tracking_history = thList.filter(th => Number(th.shipment_id) !== Number(req.params.id));
    db.delete('shipments', req.params.id);

    res.json({ message: 'Expédition supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

export { app };

// Vercel serverless handler
export default function handler(req, res) {
  return app(req, res);
}
