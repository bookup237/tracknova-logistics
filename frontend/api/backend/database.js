const fs = require('fs');
const path = require('path');
const os = require('os');

// Sur Vercel (serverless lambda), seul /tmp est accessible en écriture
const isVercel = Boolean(process.env.VERCEL);
const sourceDbPath = path.join(__dirname, 'database.json');
const targetDbPath = isVercel ? path.join(os.tmpdir(), 'database.json') : sourceDbPath;

if (isVercel) {
  try {
    if (!fs.existsSync(targetDbPath) && fs.existsSync(sourceDbPath)) {
      fs.copyFileSync(sourceDbPath, targetDbPath);
    }
  } catch (err) {
    console.error('Erreur copie DB vers /tmp:', err);
  }
}

// Structure initiale
const initialData = {
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
    quote_requests: 0,
  }
};

class JSONDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(raw);
      }
      if (fs.existsSync(sourceDbPath)) {
        const raw = fs.readFileSync(sourceDbPath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Erreur lecture DB, réinitialisation...', e);
    }
    this.save(initialData);
    return JSON.parse(JSON.stringify(initialData));
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
module.exports = db;
