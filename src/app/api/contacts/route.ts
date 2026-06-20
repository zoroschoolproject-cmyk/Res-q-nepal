import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/contacts - Retrieve all emergency contacts
export async function GET() {
  try {
    const client = db.getClient();
    const result = await client.execute('SELECT * FROM contacts ORDER BY name ASC LIMIT 100');
    return NextResponse.json(result.rows);
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

    const client = db.getClient();
    await client.execute({
      sql: 'INSERT INTO contacts (name, number, category, description, district, location_text, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [name, number, category, description || null, district || null, location_text || null, latitude || null, longitude || null]
    });
    
    // Get the last inserted row
    const lastInsertResult = await client.execute('SELECT last_insert_rowid() as id');
    const lastId = lastInsertResult.rows[0].id;
    const newContactResult = await client.execute({
      sql: 'SELECT * FROM contacts WHERE id = ?',
      args: [lastId]
    });
    
    return NextResponse.json(newContactResult.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
