import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import initialData from './initialData.js';
import { isPostgresConfigured, initPostgres, pgInsert, pgUpdate, pgDelete } from './postgres.js';

const isVercel = Boolean(process.env.VERCEL);
let targetDbPath;

if (isVercel) {
  targetDbPath = path.join(os.tmpdir(), 'database.json');
} else {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    targetDbPath = path.join(__dirname, 'database.json');
  } catch {
    targetDbPath = path.join(os.tmpdir(), 'database.json');
  }
}

class HybridDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.loadLocal();
    this.pgReady = false;

    // Tentative d'initialisation PostgreSQL en tâche de fond si DATABASE_URL est présent
    if (isPostgresConfigured()) {
      this.initPostgresSync();
    }
  }

  async initPostgresSync() {
    try {
      const pgData = await initPostgres();
      if (pgData && pgData.users && pgData.users.length > 0) {
        this.data = pgData;
        this.saveLocal(this.data);
        this.pgReady = true;
        console.log(`[Database] Synchronisé avec PostgreSQL (${this.data.shipments?.length || 0} expéditions, ${this.data.users?.length || 0} utilisateurs)`);
      }
    } catch (err) {
      console.warn('[Database] Attention initialisation PostgreSQL:', err.message);
    }
  }

  loadLocal() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.cities) && parsed.cities.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erreur lecture DB locale:', e);
    }

    // Initialisation depuis initialData
    const cloned = JSON.parse(JSON.stringify(initialData));
    this.saveLocal(cloned);
    return cloned;
  }

  saveLocal(data = this.data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      // Ignorer si système de fichiers en lecture seule (ex: Vercel non-tmp)
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.saveLocal();
    }
    return this.data[name];
  }

  insert(table, item) {
    const list = this.getCollection(table);
    if (!this.data.counters) this.data.counters = {};
    if (!this.data.counters[table]) this.data.counters[table] = list.length;

    this.data.counters[table]++;
    const newItem = {
      id: item.id || this.data.counters[table],
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      ...item,
    };
    list.push(newItem);
    this.saveLocal();

    // Persistance PostgreSQL
    if (isPostgresConfigured()) {
      pgInsert(table, newItem).catch((err) => {
        console.error(`[PostgreSQL] Erreur écriture insert ${table}:`, err.message);
      });
    }

    return newItem;
  }

  find(table, predicate = () => true) {
    return this.getCollection(table).filter(predicate);
  }

  findOne(table, predicate) {
    return this.getCollection(table).find(predicate);
  }

  findById(table, id) {
    return this.findOne(table, (item) => Number(item.id) === Number(id));
  }

  update(table, id, updates) {
    const item = this.findById(table, id);
    if (item) {
      Object.assign(item, updates, { updated_at: new Date().toISOString() });
      this.saveLocal();

      // Mise à jour PostgreSQL
      if (isPostgresConfigured()) {
        pgUpdate(table, id, updates, item).catch((err) => {
          console.error(`[PostgreSQL] Erreur écriture update ${table}:`, err.message);
        });
      }

      return item;
    }
    return null;
  }

  delete(table, id) {
    const list = this.getCollection(table);
    const index = list.findIndex((item) => Number(item.id) === Number(id));
    if (index !== -1) {
      const removed = list.splice(index, 1)[0];
      this.saveLocal();

      // Suppression PostgreSQL
      if (isPostgresConfigured()) {
        pgDelete(table, id).catch((err) => {
          console.error(`[PostgreSQL] Erreur suppression delete ${table}:`, err.message);
        });
      }

      return removed;
    }
    return null;
  }
}

const db = new HybridDatabase(targetDbPath);
export default db;
