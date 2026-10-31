import pg from 'pg';
import initialData from './initialData.js';

const { Pool } = pg;

let pool = null;
let isInitialized = false;

export function isPostgresConfigured() {
  return Boolean(process.env.DATABASE_URL || process.env.PGHOST);
}

export function getPool() {
  if (!pool && isPostgresConfigured()) {
    const connectionString = process.env.DATABASE_URL;
    const isLocal = connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'));

    pool = new Pool({
      connectionString: connectionString || undefined,
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: isLocal ? false : (process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Erreur inattendue sur le client idle:', err.message);
    });
  }
  return pool;
}

export async function initPostgres() {
  if (!isPostgresConfigured()) {
    console.log('[PostgreSQL] Aucune variable DATABASE_URL détectée. Utilisation du stockage fichier/cloud.');
    return null;
  }

  const p = getPool();
  if (!p) return null;

  try {
    console.log('[PostgreSQL] Connexion au serveur PostgreSQL Railway...');
    
    // Création des tables
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        username VARCHAR(150),
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(100),
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cities (
        id BIGINT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code_postal VARCHAR(20),
        region VARCHAR(255),
        departement VARCHAR(255),
        is_hub INT DEFAULT 0,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id BIGINT PRIMARY KEY,
        tracking_number VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'en_attente',
        sender_name VARCHAR(255),
        sender_city_name VARCHAR(255),
        receiver_name VARCHAR(255),
        receiver_city_name VARCHAR(255),
        price NUMERIC,
        weight NUMERIC,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tracking_history (
        id BIGINT PRIMARY KEY,
        shipment_id BIGINT,
        tracking_number VARCHAR(100),
        status VARCHAR(50),
        location VARCHAR(255),
        description TEXT,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id BIGINT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        is_read INT DEFAULT 0,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id BIGINT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'en_attente',
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS app_counters (
        table_name VARCHAR(100) PRIMARY KEY,
        last_id BIGINT NOT NULL
      );
    `);

    // Vérifier si des données doivent être seedées
    const userCountRes = await p.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCountRes.rows[0].count, 10);

    if (userCount === 0) {
      console.log('[PostgreSQL] Initialisation des données de base (utilisateurs, 70 villes, etc.)...');
      
      // Users
      for (const u of initialData.users || []) {
        await p.query(
          `INSERT INTO users (id, username, email, role, password, full_name, phone, payload, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [u.id, u.username, u.email, u.role, u.password, u.full_name, u.phone, JSON.stringify(u), u.created_at || new Date(), u.updated_at || new Date()]
        );
      }

      // Cities
      for (const c of initialData.cities || []) {
        await p.query(
          `INSERT INTO cities (id, name, code_postal, region, departement, is_hub, payload, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.code_postal, c.region, c.departement, c.is_hub || 0, JSON.stringify(c), c.created_at || new Date(), c.updated_at || new Date()]
        );
      }

      // Shipments
      for (const s of initialData.shipments || []) {
        await p.query(
          `INSERT INTO shipments (id, tracking_number, status, sender_name, sender_city_name, receiver_name, receiver_city_name, price, weight, payload, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [s.id, s.tracking_number, s.status, s.sender_name, s.sender_city_name, s.receiver_name, s.receiver_city_name, s.price, s.weight, JSON.stringify(s), s.created_at || new Date(), s.updated_at || new Date()]
        );
      }

      // Tracking History
      for (const th of initialData.tracking_history || []) {
        await p.query(
          `INSERT INTO tracking_history (id, shipment_id, tracking_number, status, location, description, payload, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [th.id, th.shipment_id, th.tracking_number || null, th.status, th.location, th.description, JSON.stringify(th), th.created_at || new Date(), th.updated_at || new Date()]
        );
      }

      // Counters
      const counters = initialData.counters || {
        users: 10,
        cities: 70,
        shipments: 10000,
        tracking_history: 20000,
        contact_messages: 100,
        quotes: 100
      };
      for (const [k, v] of Object.entries(counters)) {
        await p.query(
          `INSERT INTO app_counters (table_name, last_id) VALUES ($1, $2)
           ON CONFLICT (table_name) DO UPDATE SET last_id = EXCLUDED.last_id`,
          [k, v]
        );
      }
      console.log('[PostgreSQL] Initialisation terminée avec succès.');
    }

    // Charger les données existantes de PostgreSQL
    const loadedData = await loadAllFromPostgres();
    isInitialized = true;
    console.log('[PostgreSQL] Base de données PostgreSQL connectée et active !');
    return loadedData;
  } catch (err) {
    console.error('[PostgreSQL] Erreur lors de l\'initialisation PostgreSQL:', err.message);
    return null;
  }
}

export async function loadAllFromPostgres() {
  const p = getPool();
  if (!p) return null;

  try {
    const [usersRes, citiesRes, shipmentsRes, historyRes, messagesRes, quotesRes, countersRes] = await Promise.all([
      p.query('SELECT payload FROM users ORDER BY id ASC'),
      p.query('SELECT payload FROM cities ORDER BY id ASC'),
      p.query('SELECT payload FROM shipments ORDER BY id ASC'),
      p.query('SELECT payload FROM tracking_history ORDER BY id ASC'),
      p.query('SELECT payload FROM contact_messages ORDER BY id ASC'),
      p.query('SELECT payload FROM quotes ORDER BY id ASC'),
      p.query('SELECT table_name, last_id FROM app_counters')
    ]);

    const counters = {};
    for (const row of countersRes.rows) {
      counters[row.table_name] = Number(row.last_id);
    }

    return {
      users: usersRes.rows.map(r => r.payload),
      cities: citiesRes.rows.map(r => r.payload),
      shipments: shipmentsRes.rows.map(r => r.payload),
      tracking_history: historyRes.rows.map(r => r.payload),
      contact_messages: messagesRes.rows.map(r => r.payload),
      quotes: quotesRes.rows.map(r => r.payload),
      counters
    };
  } catch (err) {
    console.error('[PostgreSQL] Erreur chargement tables:', err.message);
    return null;
  }
}

export async function pgInsert(table, item) {
  const p = getPool();
  if (!p) return;

  try {
    const payloadJson = JSON.stringify(item);
    const now = item.created_at || new Date().toISOString();

    if (table === 'shipments') {
      await p.query(
        `INSERT INTO shipments (id, tracking_number, status, sender_name, sender_city_name, receiver_name, receiver_city_name, price, weight, payload, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           tracking_number = EXCLUDED.tracking_number,
           status = EXCLUDED.status,
           payload = EXCLUDED.payload,
           updated_at = EXCLUDED.updated_at`,
        [item.id, item.tracking_number, item.status, item.sender_name, item.sender_city_name, item.receiver_name, item.receiver_city_name, item.price, item.weight, payloadJson, now, now]
      );
    } else if (table === 'tracking_history') {
      await p.query(
        `INSERT INTO tracking_history (id, shipment_id, tracking_number, status, location, description, payload, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           location = EXCLUDED.location,
           description = EXCLUDED.description,
           payload = EXCLUDED.payload,
           updated_at = EXCLUDED.updated_at`,
        [item.id, item.shipment_id, item.tracking_number || null, item.status, item.location, item.description, payloadJson, now, now]
      );
    } else if (table === 'users') {
      await p.query(
        `INSERT INTO users (id, username, email, role, password, full_name, phone, payload, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           payload = EXCLUDED.payload,
           updated_at = EXCLUDED.updated_at`,
        [item.id, item.username, item.email, item.role, item.password, item.full_name, item.phone, payloadJson, now, now]
      );
    } else if (table === 'contact_messages') {
      await p.query(
        `INSERT INTO contact_messages (id, name, email, subject, message, is_read, payload, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           is_read = EXCLUDED.is_read,
           payload = EXCLUDED.payload,
           updated_at = EXCLUDED.updated_at`,
        [item.id, item.name, item.email, item.subject, item.message, item.is_read || 0, payloadJson, now, now]
      );
    } else if (table === 'quotes') {
      await p.query(
        `INSERT INTO quotes (id, name, email, status, payload, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           payload = EXCLUDED.payload,
           updated_at = EXCLUDED.updated_at`,
        [item.id, item.name, item.email, item.status, payloadJson, now, now]
      );
    }

    // Mettre à jour le compteur
    await p.query(
      `INSERT INTO app_counters (table_name, last_id) VALUES ($1, $2)
       ON CONFLICT (table_name) DO UPDATE SET last_id = GREATEST(app_counters.last_id, EXCLUDED.last_id)`,
      [table, item.id]
    );
  } catch (err) {
    console.error(`[PostgreSQL] Erreur pgInsert sur ${table}:`, err.message);
  }
}

export async function pgUpdate(table, id, updates, fullItem) {
  const p = getPool();
  if (!p) return;

  try {
    const payloadJson = JSON.stringify(fullItem);
    const now = new Date().toISOString();

    if (table === 'shipments') {
      await p.query(
        `UPDATE shipments
         SET status = COALESCE($2, status),
             payload = $3,
             updated_at = $4
         WHERE id = $1`,
        [id, updates.status || null, payloadJson, now]
      );
    } else if (table === 'tracking_history') {
      await p.query(
        `UPDATE tracking_history
         SET payload = $2, updated_at = $3
         WHERE id = $1`,
        [id, payloadJson, now]
      );
    } else if (table === 'contact_messages') {
      await p.query(
        `UPDATE contact_messages
         SET is_read = COALESCE($2, is_read),
             payload = $3,
             updated_at = $4
         WHERE id = $1`,
        [id, updates.is_read !== undefined ? updates.is_read : null, payloadJson, now]
      );
    } else if (table === 'quotes') {
      await p.query(
        `UPDATE quotes
         SET status = COALESCE($2, status),
             payload = $3,
             updated_at = $4
         WHERE id = $1`,
        [id, updates.status || null, payloadJson, now]
      );
    } else if (table === 'users') {
      await p.query(
        `UPDATE users
         SET payload = $2, updated_at = $3
         WHERE id = $1`,
        [id, payloadJson, now]
      );
    }
  } catch (err) {
    console.error(`[PostgreSQL] Erreur pgUpdate sur ${table}:`, err.message);
  }
}

export async function pgDelete(table, id) {
  const p = getPool();
  if (!p) return;

  try {
    const validTables = ['shipments', 'tracking_history', 'users', 'contact_messages', 'quotes', 'cities'];
    if (validTables.includes(table)) {
      await p.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    }
  } catch (err) {
    console.error(`[PostgreSQL] Erreur pgDelete sur ${table}:`, err.message);
  }
}
