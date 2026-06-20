import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const info = await db.prepare(`
      UPDATE nearby_services
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          phone = COALESCE(?, phone),
          location = COALESCE(?, location),
          district = COALESCE(?, district),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude)
      WHERE id = ?
    `).run(name, type, phone, location, district, latitude, longitude, params.id);

    const updatedService = await db.prepare('SELECT * FROM nearby_services WHERE id = ?').get(params.id);
    return NextResponse.json(updatedService);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.prepare('DELETE FROM nearby_services WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
