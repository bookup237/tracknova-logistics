import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import initialData from './initialData.js';

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

class JSONDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.cities) && parsed.cities.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erreur lecture DB, réinitialisation avec initialData...', e);
    }

    // Initialisation depuis initialData
    const cloned = JSON.parse(JSON.stringify(initialData));
    this.save(cloned);
    return cloned;
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Erreur écriture DB:', e);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.save();
    }
    return this.data[name];
  }

  insert(table, item) {
    const list = this.getCollection(table);
    if (!this.data.counters) this.data.counters = {};
    if (!this.data.counters[table]) this.data.counters[table] = list.length;

    this.data.counters[table]++;
    const newItem = {
      id: this.data.counters[table],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item,
    };
    list.push(newItem);
    this.save();
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
      this.save();
      return item;
    }
    return null;
  }

  delete(table, id) {
    const list = this.getCollection(table);
    const index = list.findIndex((item) => Number(item.id) === Number(id));
    if (index !== -1) {
      const removed = list.splice(index, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }
}

const db = new JSONDatabase(targetDbPath);
export default db;
