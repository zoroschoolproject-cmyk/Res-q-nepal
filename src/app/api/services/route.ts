import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const client = db.getClient();
    const result = await client.execute('SELECT * FROM nearby_services ORDER BY name ASC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      phone,
      location,
      district,
      latitude,
      longitude
    } = body;

    if (!name || !type || !phone) {
      return NextResponse.json({ error: 'Name, type, and phone are required' }, { status: 400 });
    }

    const client = db.getClient();
    await client.execute({
      sql: 'INSERT INTO nearby_services (name, type, phone, location, district, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [name, type, phone, location || null, district || null, latitude || null, longitude || null]
    });
    
    // Get last inserted row
    const lastInsertResult = await client.execute('SELECT last_insert_rowid() as id');
    const lastId = lastInsertResult.rows[0].id;
    const newServiceResult = await client.execute({
      sql: 'SELECT * FROM nearby_services WHERE id = ?',
      args: [lastId]
    });
    
    return NextResponse.json(newServiceResult.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
