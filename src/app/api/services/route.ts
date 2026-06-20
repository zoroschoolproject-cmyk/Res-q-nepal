import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const services = await db.prepare('SELECT * FROM nearby_services ORDER BY name ASC').all();
    return NextResponse.json(services);
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

    const info = await db.prepare(`
      INSERT INTO nearby_services (name, type, phone, location, district, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, type, phone, location || null, district || null, latitude || null, longitude || null);

    const newService = await db.prepare('SELECT * FROM nearby_services WHERE id = ?').get(info.lastInsertRowid);
    return NextResponse.json(newService, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
