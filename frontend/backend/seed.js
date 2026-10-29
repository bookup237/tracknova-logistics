const db = require('./database');
const bcrypt = require('bcryptjs');

console.log('🌱 Initialisation des données pour la France...\n');

// ═══════════════════════════════════════════
// VILLES DE FRANCE (principales + hubs régionaux)
// ═══════════════════════════════════════════
const cities = [
  // Île-de-France
  { name: 'Paris', code_postal: '75000', region: 'Île-de-France', departement: 'Paris', is_hub: 1 },
  { name: 'Boulogne-Billancourt', code_postal: '92100', region: 'Île-de-France', departement: 'Hauts-de-Seine', is_hub: 0 },
  { name: 'Saint-Denis', code_postal: '93200', region: 'Île-de-France', departement: 'Seine-Saint-Denis', is_hub: 0 },
  { name: 'Versailles', code_postal: '78000', region: 'Île-de-France', departement: 'Yvelines', is_hub: 0 },
  { name: 'Créteil', code_postal: '94000', region: 'Île-de-France', departement: 'Val-de-Marne', is_hub: 0 },
  { name: 'Nanterre', code_postal: '92000', region: 'Île-de-France', departement: 'Hauts-de-Seine', is_hub: 0 },
  { name: 'Argenteuil', code_postal: '95100', region: 'Île-de-France', departement: "Val-d'Oise", is_hub: 0 },
  { name: 'Montreuil', code_postal: '93100', region: 'Île-de-France', departement: 'Seine-Saint-Denis', is_hub: 0 },
  { name: 'Évry-Courcouronnes', code_postal: '91000', region: 'Île-de-France', departement: 'Essonne', is_hub: 0 },

  // Auvergne-Rhône-Alpes
  { name: 'Lyon', code_postal: '69000', region: 'Auvergne-Rhône-Alpes', departement: 'Rhône', is_hub: 1 },
  { name: 'Grenoble', code_postal: '38000', region: 'Auvergne-Rhône-Alpes', departement: 'Isère', is_hub: 0 },
  { name: 'Saint-Étienne', code_postal: '42000', region: 'Auvergne-Rhône-Alpes', departement: 'Loire', is_hub: 0 },
  { name: 'Clermont-Ferrand', code_postal: '63000', region: 'Auvergne-Rhône-Alpes', departement: 'Puy-de-Dôme', is_hub: 0 },
  { name: 'Villeurbanne', code_postal: '69100', region: 'Auvergne-Rhône-Alpes', departement: 'Rhône', is_hub: 0 },
  { name: 'Annecy', code_postal: '74000', region: 'Auvergne-Rhône-Alpes', departement: 'Haute-Savoie', is_hub: 0 },
  { name: 'Valence', code_postal: '26000', region: 'Auvergne-Rhône-Alpes', departement: 'Drôme', is_hub: 0 },
  { name: 'Chambéry', code_postal: '73000', region: 'Auvergne-Rhône-Alpes', departement: 'Savoie', is_hub: 0 },

  // Nouvelle-Aquitaine
  { name: 'Bordeaux', code_postal: '33000', region: 'Nouvelle-Aquitaine', departement: 'Gironde', is_hub: 1 },
  { name: 'Limoges', code_postal: '87000', region: 'Nouvelle-Aquitaine', departement: 'Haute-Vienne', is_hub: 0 },
  { name: 'Poitiers', code_postal: '86000', region: 'Nouvelle-Aquitaine', departement: 'Vienne', is_hub: 0 },
  { name: 'La Rochelle', code_postal: '17000', region: 'Nouvelle-Aquitaine', departement: 'Charente-Maritime', is_hub: 0 },
  { name: 'Pau', code_postal: '64000', region: 'Nouvelle-Aquitaine', departement: 'Pyrénées-Atlantiques', is_hub: 0 },
  { name: 'Bayonne', code_postal: '64100', region: 'Nouvelle-Aquitaine', departement: 'Pyrénées-Atlantiques', is_hub: 0 },
  { name: 'Angoulême', code_postal: '16000', region: 'Nouvelle-Aquitaine', departement: 'Charente', is_hub: 0 },

  // Occitanie
  { name: 'Toulouse', code_postal: '31000', region: 'Occitanie', departement: 'Haute-Garonne', is_hub: 1 },
  { name: 'Montpellier', code_postal: '34000', region: 'Occitanie', departement: 'Hérault', is_hub: 1 },
  { name: 'Nîmes', code_postal: '30000', region: 'Occitanie', departement: 'Gard', is_hub: 0 },
  { name: 'Perpignan', code_postal: '66000', region: 'Occitanie', departement: 'Pyrénées-Orientales', is_hub: 0 },
  { name: 'Béziers', code_postal: '34500', region: 'Occitanie', departement: 'Hérault', is_hub: 0 },
  { name: 'Tarbes', code_postal: '65000', region: 'Occitanie', departement: 'Hautes-Pyrénées', is_hub: 0 },
  { name: 'Albi', code_postal: '81000', region: 'Occitanie', departement: 'Tarn', is_hub: 0 },
  { name: 'Carcassonne', code_postal: '11000', region: 'Occitanie', departement: 'Aude', is_hub: 0 },

  // Provence-Alpes-Côte d'Azur
  { name: 'Marseille', code_postal: '13000', region: "Provence-Alpes-Côte d'Azur", departement: 'Bouches-du-Rhône', is_hub: 1 },
  { name: 'Nice', code_postal: '06000', region: "Provence-Alpes-Côte d'Azur", departement: 'Alpes-Maritimes', is_hub: 1 },
  { name: 'Toulon', code_postal: '83000', region: "Provence-Alpes-Côte d'Azur", departement: 'Var', is_hub: 0 },
  { name: 'Aix-en-Provence', code_postal: '13100', region: "Provence-Alpes-Côte d'Azur", departement: 'Bouches-du-Rhône', is_hub: 0 },
  { name: 'Avignon', code_postal: '84000', region: "Provence-Alpes-Côte d'Azur", departement: 'Vaucluse', is_hub: 0 },
  { name: 'Cannes', code_postal: '06400', region: "Provence-Alpes-Côte d'Azur", departement: 'Alpes-Maritimes', is_hub: 0 },
  { name: 'Antibes', code_postal: '06600', region: "Provence-Alpes-Côte d'Azur", departement: 'Alpes-Maritimes', is_hub: 0 },

  // Hauts-de-France
  { name: 'Lille', code_postal: '59000', region: 'Hauts-de-France', departement: 'Nord', is_hub: 1 },
  { name: 'Amiens', code_postal: '80000', region: 'Hauts-de-France', departement: 'Somme', is_hub: 0 },
  { name: 'Roubaix', code_postal: '59100', region: 'Hauts-de-France', departement: 'Nord', is_hub: 0 },
  { name: 'Tourcoing', code_postal: '59200', region: 'Hauts-de-France', departement: 'Nord', is_hub: 0 },
  { name: 'Dunkerque', code_postal: '59140', region: 'Hauts-de-France', departement: 'Nord', is_hub: 0 },
  { name: 'Calais', code_postal: '62100', region: 'Hauts-de-France', departement: 'Pas-de-Calais', is_hub: 0 },
  { name: 'Beauvais', code_postal: '60000', region: 'Hauts-de-France', departement: 'Oise', is_hub: 0 },

  // Grand Est
  { name: 'Strasbourg', code_postal: '67000', region: 'Grand Est', departement: 'Bas-Rhin', is_hub: 1 },
  { name: 'Reims', code_postal: '51100', region: 'Grand Est', departement: 'Marne', is_hub: 0 },
  { name: 'Metz', code_postal: '57000', region: 'Grand Est', departement: 'Moselle', is_hub: 0 },
  { name: 'Mulhouse', code_postal: '68100', region: 'Grand Est', departement: 'Haut-Rhin', is_hub: 0 },
  { name: 'Nancy', code_postal: '54000', region: 'Grand Est', departement: 'Meurthe-et-Moselle', is_hub: 0 },
  { name: 'Colmar', code_postal: '68000', region: 'Grand Est', departement: 'Haut-Rhin', is_hub: 0 },

  // Pays de la Loire
  { name: 'Nantes', code_postal: '44000', region: 'Pays de la Loire', departement: 'Loire-Atlantique', is_hub: 1 },
  { name: 'Angers', code_postal: '49000', region: 'Pays de la Loire', departement: 'Maine-et-Loire', is_hub: 0 },
  { name: 'Le Mans', code_postal: '72000', region: 'Pays de la Loire', departement: 'Sarthe', is_hub: 0 },
  { name: 'Saint-Nazaire', code_postal: '44600', region: 'Pays de la Loire', departement: 'Loire-Atlantique', is_hub: 0 },

  // Bretagne
  { name: 'Rennes', code_postal: '35000', region: 'Bretagne', departement: 'Ille-et-Vilaine', is_hub: 1 },
  { name: 'Brest', code_postal: '29200', region: 'Bretagne', departement: 'Finistère', is_hub: 0 },
  { name: 'Quimper', code_postal: '29000', region: 'Bretagne', departement: 'Finistère', is_hub: 0 },
  { name: 'Lorient', code_postal: '56100', region: 'Bretagne', departement: 'Morbihan', is_hub: 0 },
  { name: 'Saint-Malo', code_postal: '35400', region: 'Bretagne', departement: 'Ille-et-Vilaine', is_hub: 0 },

  // Normandie
  { name: 'Rouen', code_postal: '76000', region: 'Normandie', departement: 'Seine-Maritime', is_hub: 0 },
  { name: 'Le Havre', code_postal: '76600', region: 'Normandie', departement: 'Seine-Maritime', is_hub: 0 },
  { name: 'Caen', code_postal: '14000', region: 'Normandie', departement: 'Calvados', is_hub: 0 },

  // Centre-Val de Loire
  { name: 'Orléans', code_postal: '45000', region: 'Centre-Val de Loire', departement: 'Loiret', is_hub: 0 },
  { name: 'Tours', code_postal: '37000', region: 'Centre-Val de Loire', departement: 'Indre-et-Loire', is_hub: 0 },

  // Bourgogne-Franche-Comté
  { name: 'Dijon', code_postal: '21000', region: 'Bourgogne-Franche-Comté', departement: "Côte-d'Or", is_hub: 0 },
  { name: 'Besançon', code_postal: '25000', region: 'Bourgogne-Franche-Comté', departement: 'Doubs', is_hub: 0 },

  // Corse
  { name: 'Ajaccio', code_postal: '20000', region: 'Corse', departement: 'Corse-du-Sud', is_hub: 0 },
  { name: 'Bastia', code_postal: '20200', region: 'Corse', departement: 'Haute-Corse', is_hub: 0 }
];

// Réinitialiser les données
db.data = {
  users: [],
  cities: [],
  shipments: [],
  tracking_history: [],
  contact_messages: [],
  quote_requests: [],
  counters: {
    users: 0,
    cities: 0,
    shipments: 0,
    tracking_history: 0,
    contact_messages: 0,
    quote_requests: 0
  }
};

// 1. VILLES
cities.forEach(c => db.insert('cities', c));
console.log(`✅ ${cities.length} villes françaises enregistrées`);

// 2. UTILISATEURS ADMIN ET AGENT
const adminPassword = bcrypt.hashSync('admin123', 10);
const agentPassword = bcrypt.hashSync('agent123', 10);

const adminUser = db.insert('users', {
  username: 'admin',
  email: 'admin@franceexpress.fr',
  password: adminPassword,
  full_name: 'Administrateur Système',
  phone: '01 40 00 00 00',
  role: 'admin'
});

const agentUser = db.insert('users', {
  username: 'agent1',
  email: 'agent@franceexpress.fr',
  password: agentPassword,
  full_name: 'Pierre Dupont',
  phone: '01 40 00 00 01',
  role: 'agent'
});

console.log('✅ Utilisateurs créés :');
console.log('   Admin  → admin@franceexpress.fr / admin123');
console.log('   Agent  → agent@franceexpress.fr / agent123');

// 3. EXPÉDITIONS ET HISTORIQUE
const statuses = ['en_attente', 'collecte', 'en_transit', 'au_hub', 'en_livraison', 'livre'];
const packageTypes = ['standard', 'express', 'fragile', 'volumineux'];
const names = [
  'Marie Martin', 'Jean Dubois', 'Sophie Bernard', 'Pierre Leroy',
  'Isabelle Moreau', 'François Petit', 'Nathalie Robert', 'Michel Richard',
  'Catherine Durand', 'Alain Simon', 'Élise Laurent', 'Thomas Lefebvre',
  'Camille Morel', 'Hugo Garcia', 'Emma Roux', 'Lucas David'
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTrackingNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FR-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const statusDescriptions = {
  en_attente: 'Colis enregistré dans le système informatique',
  collecte: 'Colis collecté chez l\'expéditeur',
  en_transit: 'Colis en transit vers le centre de distribution',
  au_hub: 'Colis arrivé au hub de tri régional',
  en_livraison: 'Colis pris en charge par le livreur',
  livre: 'Colis livré avec succès et remis contre signature'
};

const allCities = db.find('cities');

for (let i = 0; i < 25; i++) {
  const senderCity = randomItem(allCities);
  let receiverCity = randomItem(allCities);
  while (receiverCity.id === senderCity.id) {
    receiverCity = randomItem(allCities);
  }

  const status = randomItem(statuses);
  const packageType = randomItem(packageTypes);
  const weight = Math.round((Math.random() * 15 + 0.5) * 10) / 10;
  const price = Math.round((5.99 + weight * 1.5) * (packageType === 'express' ? 1.8 : 1) * 100) / 100;

  const daysAgo = Math.floor(Math.random() * 20);
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);

  const estimated = new Date(createdAt);
  estimated.setDate(estimated.getDate() + (packageType === 'express' ? 1 : 3));

  const senderName = randomItem(names);
  let receiverName = randomItem(names);
  while (receiverName === senderName) receiverName = randomItem(names);

  const trackingNumber = generateTrackingNumber();

  const shipment = db.insert('shipments', {
    tracking_number: trackingNumber,
    sender_name: senderName,
    sender_phone: '06 ' + Math.floor(10000000 + Math.random() * 89999999).toString().replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4'),
    sender_email: senderName.toLowerCase().replace(' ', '.') + '@email.fr',
    sender_address: `${Math.floor(1 + Math.random() * 120)} Rue de la République`,
    sender_city_id: senderCity.id,
    receiver_name: receiverName,
    receiver_phone: '07 ' + Math.floor(10000000 + Math.random() * 89999999).toString().replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4'),
    receiver_email: receiverName.toLowerCase().replace(' ', '.') + '@email.fr',
    receiver_address: `${Math.floor(1 + Math.random() * 120)} Avenue Victor Hugo`,
    receiver_city_id: receiverCity.id,
    package_description: `Colis ${packageType} - Équipement & Documents`,
    weight,
    dimensions: '30x20x15',
    package_type: packageType,
    status,
    price,
    estimated_delivery: estimated.toISOString().split('T')[0],
    actual_delivery: status === 'livre' ? estimated.toISOString().split('T')[0] : null,
    notes: 'Livraison standard en France métropolitaine',
    created_by: adminUser.id,
    created_at: createdAt.toISOString()
  });

  // Historique de suivi progressif
  const statusOrder = ['en_attente', 'collecte', 'en_transit', 'au_hub', 'en_livraison', 'livre'];
  const maxIdx = statusOrder.indexOf(status);

  for (let j = 0; j <= maxIdx; j++) {
    const hDate = new Date(createdAt);
    hDate.setHours(hDate.getHours() + (j * 6));
    const loc = j === 0 ? senderCity.name : (j === maxIdx && status === 'livre' ? receiverCity.name : `Hub de tri - ${randomItem(allCities).name}`);

    db.insert('tracking_history', {
      shipment_id: shipment.id,
      status: statusOrder[j],
      location: loc,
      description: statusDescriptions[statusOrder[j]],
      updated_by: adminUser.id,
      created_at: hDate.toISOString()
    });
  }
}

// 4. MESSAGES DE CONTACT
db.insert('contact_messages', {
  name: 'Julien Mercier',
  email: 'julien.mercier@entreprise.fr',
  phone: '01 42 68 00 00',
  subject: 'Demande de contrat professionnel mensuel',
  message: 'Bonjour, nous souhaitons expédier environ 80 colis par semaine depuis notre entrepôt à Lyon vers toute la France. Proposez-vous des tarifs dégressifs ?',
  is_read: 0
});

db.insert('contact_messages', {
  name: 'Claire Dupont',
  email: 'claire.d@gmail.com',
  phone: '06 55 44 33 22',
  subject: 'Délai vers la Corse',
  message: 'Quel est le délai moyen pour un envoi express vers Ajaccio ? Merci.',
  is_read: 1
});

// 5. DEMANDES DE DEVIS
db.insert('quote_requests', {
  name: 'Société TechParts SAS',
  email: 'logistique@techparts.fr',
  phone: '04 78 00 11 22',
  origin_city_id: 10, // Lyon
  destination_city_id: 1, // Paris
  weight: 12.5,
  dimensions: '60x40x30',
  package_type: 'express',
  description: 'Composants électroniques fragiles',
  status: 'nouveau'
});

db.save();
console.log('✅ 25 expéditions, historique, messages et devis insérés avec succès !');
console.log('🚀 Base de données prête.');
