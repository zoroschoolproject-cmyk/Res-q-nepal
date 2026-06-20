import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/contacts - Retrieve all emergency contacts
export async function GET() {
  try {
    const contacts = await db.prepare('SELECT * FROM contacts ORDER BY name ASC LIMIT 100').all();
    return NextResponse.json(contacts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/contacts - Add a new emergency contact (Admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, number, category, description, district, location_text, latitude, longitude } = body;

    if (!name || !number || !category) {
      return NextResponse.json({ error: 'Name, number, and category are required' }, { status: 400 });
    }

    const info = await db.prepare(`
      INSERT INTO contacts (name, number, category, description, district, location_text, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, number, category, description || null, district || null, location_text || null, latitude || null, longitude || null);

    const newContact = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(info.lastInsertRowid);
    return NextResponse.json(newContact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
