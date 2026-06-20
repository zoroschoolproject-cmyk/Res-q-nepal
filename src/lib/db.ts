import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

// Lazy loading of Turso Database client
let client: any = null;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) {
      console.warn('TURSO_DATABASE_URL is not defined. Using in-memory fallback client.');
      // Prevent crash during Next.js build phase
      client = createClient({
        url: 'file::memory:',
      });
    } else {
      client = createClient({
        url,
        authToken: authToken || '',
      });
    }
  }
  return client;
}

// Initialize database schema asynchronously
const initializeSchema = async () => {
  const c = getClient();
  
  // Contacts table
  await c.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      number TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      district TEXT,
      location_text TEXT,
      latitude REAL,
      longitude REAL
    )
  `);
  
  // Add new columns if they don't exist (for existing databases)
  try { await c.execute('ALTER TABLE contacts ADD COLUMN district TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE contacts ADD COLUMN location_text TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE contacts ADD COLUMN latitude REAL'); } catch (e) {}
  try { await c.execute('ALTER TABLE contacts ADD COLUMN longitude REAL'); } catch (e) {}



  // Complaints table
  await c.execute(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Submitted',
      complaint_id TEXT UNIQUE NOT NULL,
      admin_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      complainant_name TEXT,
      complainant_phone TEXT,
      location_text TEXT,
      latitude REAL,
      longitude REAL,
      is_anonymous INTEGER DEFAULT 0,
      image_path TEXT
    )
  `);

  // Add new columns for complaints if they don't exist
  try { await c.execute('ALTER TABLE complaints ADD COLUMN complainant_name TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE complaints ADD COLUMN complainant_phone TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE complaints ADD COLUMN location_text TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE complaints ADD COLUMN latitude REAL'); } catch (e) {}
  try { await c.execute('ALTER TABLE complaints ADD COLUMN longitude REAL'); } catch (e) {}
  try { await c.execute('ALTER TABLE complaints ADD COLUMN is_anonymous INTEGER DEFAULT 0'); } catch (e) {}
  try { await c.execute('ALTER TABLE complaints ADD COLUMN image_path TEXT'); } catch (e) {}

  // Donors table (Blood only)
  await c.execute(`
    CREATE TABLE IF NOT EXISTS donors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      blood_group TEXT,
      city TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_of_birth TEXT,
      gender TEXT,
      email TEXT,
      address TEXT,
      emergency_contact TEXT,
      location_text TEXT,
      latitude REAL,
      longitude REAL
    )
  `);

  // Add new columns for donors if they don't exist
  try { await c.execute('ALTER TABLE donors ADD COLUMN date_of_birth TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE donors ADD COLUMN gender TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE donors ADD COLUMN email TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE donors ADD COLUMN address TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE donors ADD COLUMN emergency_contact TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE donors ADD COLUMN location_text TEXT'); } catch (e) {}
  try { await c.execute('ALTER TABLE donors ADD COLUMN latitude REAL'); } catch (e) {}
  try { await c.execute('ALTER TABLE donors ADD COLUMN longitude REAL'); } catch (e) {}

  // Notices table
  await c.execute(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notifications table
  await c.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin Session / credentials table
  await c.execute(`
    CREATE TABLE IF NOT EXISTS admin_session (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Nearby Services (Hospitals, Blood Banks, Clinics)
  await c.execute(`
    CREATE TABLE IF NOT EXISTS nearby_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT,
      district TEXT,
      latitude REAL,
      longitude REAL
    )
  `);

  // Create performance indexes for optimized WHERE queries
  await c.execute('CREATE INDEX IF NOT EXISTS idx_donors_type ON donors (type)');
  await c.execute('CREATE INDEX IF NOT EXISTS idx_donors_status ON donors (status)');
  await c.execute('CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status)');
};

const seedDatabase = async () => {
  const c = getClient();

  // 1. Seed Admin
  const adminCountRes = await c.execute("SELECT COUNT(*) as count FROM admin_session WHERE username = 'Titans' COLLATE NOCASE");
  const adminCount = Number(adminCountRes.rows[0].count);
  if (adminCount === 0) {
    await c.execute("DELETE FROM admin_session");
    await c.execute({
      sql: 'INSERT INTO admin_session (username, password) VALUES (?, ?)',
      args: ['Titans', 'ASM']
    });
  }

  // 2. Seed Contacts
  const contactCountRes = await c.execute('SELECT COUNT(*) as count FROM contacts');
  const contactCount = Number(contactCountRes.rows[0].count);
  if (contactCount === 0) {
    const contactsJsonPath = path.join(process.cwd(), 'public', 'data', 'contacts.json');
    if (fs.existsSync(contactsJsonPath)) {
      try {
        const contactsData = JSON.parse(fs.readFileSync(contactsJsonPath, 'utf-8'));
        const stmts = contactsData.map((co: any) => ({
          sql: `INSERT INTO contacts (name, number, category, description, district, location_text, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            co.name, co.number, co.category, co.description || null,
            co.district || null, co.location_text || null, co.latitude || null, co.longitude || null
          ]
        }));
        await c.batch(stmts, 'write');
      } catch (err) {
        console.error('Error seeding contacts:', err);
      }
    }
  }

  // 3. Seed Nearby Services
  const servicesCountRes = await c.execute('SELECT COUNT(*) as count FROM nearby_services');
  const servicesCount = Number(servicesCountRes.rows[0].count);
  if (servicesCount === 0) {
    await c.batch([
      {
        sql: 'INSERT INTO nearby_services (name, type, phone, location, district, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: ['Patan Hospital Blood Bank', 'Blood Bank', '01-5522295', 'Patan, Lalitpur', 'Lalitpur', 27.6720, 85.3180]
      },
      {
        sql: 'INSERT INTO nearby_services (name, type, phone, location, district, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: ['Nepal Red Cross Society', 'Blood Bank', '01-4272718', 'Kathmandu', 'Kathmandu', 27.7080, 85.3150]
      },
      {
        sql: 'INSERT INTO nearby_services (name, type, phone, location, district, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: ['Bir Hospital Emergency', 'Hospital', '01-4221119', 'Tundikhel, Kathmandu', 'Kathmandu', 27.7045, 85.3180]
      }
    ], 'write');
  }

  // 4. Seed Pinned Notices
  const noticesCountRes = await c.execute('SELECT COUNT(*) as count FROM notices');
  const noticesCount = Number(noticesCountRes.rows[0].count);
  if (noticesCount === 0) {
    await c.execute(`
      INSERT INTO notices (title, content, is_pinned)
      VALUES 
      ('Monsoon Precaution Advisory', 'DHM has issued warnings for landslides in hilly areas. Stay away from steep slopes and monitor local news.', 1),
      ('Emergency Blood Drive at Patan Hospital', 'ResQ Nepal is coordinating with Nepal Red Cross to organize an emergency blood drive at Patan Hospital on Saturday. All groups welcome.', 1)
    `);
  }
};

let initPromise: Promise<void> | null = null;

export const initDb = async () => {
  if (!process.env.TURSO_DATABASE_URL) {
    return; // Don't run schema init during build time if URL is missing
  }
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await initializeSchema();
        await seedDatabase();
      } catch (err) {
        console.error('Database initialization/seeding failed:', err);
      }
    })();
  }
  await initPromise;
};

// Start initial seeding task in background if URL is available
if (process.env.TURSO_DATABASE_URL) {
  initDb();
}

class PreparedAsyncStatement {
  sql: string;
  constructor(sql: string) {
    this.sql = sql;
  }

  private getArgs(args: any[]) {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      return args[0];
    }
    return args;
  }

  async all(...args: any[]) {
    await initDb();
    const res = await getClient().execute({ sql: this.sql, args: this.getArgs(args) });
    return res.rows;
  }

  async get(...args: any[]) {
    await initDb();
    const res = await getClient().execute({ sql: this.sql, args: this.getArgs(args) });
    return res.rows[0];
  }

  async run(...args: any[]) {
    await initDb();
    const res = await getClient().execute({ sql: this.sql, args: this.getArgs(args) });
    let lastInsertRowid: any = res.lastInsertRowid;
    if (typeof lastInsertRowid === 'bigint') {
      lastInsertRowid = Number(lastInsertRowid);
    }
    return {
      lastInsertRowid,
      changes: res.rowsAffected
    };
  }
}

const dbWrapper = {
  prepare(sql: string) {
    return new PreparedAsyncStatement(sql);
  },
  async execute(opts: any) {
    await initDb();
    return getClient().execute(opts);
  },
  async batch(stmts: any[], mode?: any) {
    await initDb();
    return getClient().batch(stmts, mode);
  },
  transaction(fn: any) {
    throw new Error('Synchronous transaction callbacks are not supported with Turso db. Use db.batch() instead.');
  }
};

export default dbWrapper;