import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const client = db.getClient();
    const { id } = await params;
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

    await client.execute({
      sql: `
        UPDATE nearby_services
        SET name = COALESCE(?, name),
            type = COALESCE(?, type),
            phone = COALESCE(?, phone),
            location = COALESCE(?, location),
            district = COALESCE(?, district),
            latitude = COALESCE(?, latitude),
            longitude = COALESCE(?, longitude)
        WHERE id = ?
      `,
      args: [name, type, phone, location, district, latitude, longitude, id]
    });

    const updatedServiceResult = await client.execute({
      sql: 'SELECT * FROM nearby_services WHERE id = ?',
      args: [id]
    });
    return NextResponse.json(updatedServiceResult.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const client = db.getClient();
    const { id } = await params;
    await client.execute({
      sql: 'DELETE FROM nearby_services WHERE id = ?',
      args: [id]
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
