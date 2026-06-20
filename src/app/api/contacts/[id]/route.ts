import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/contacts/[id] - Edit an existing contact (Admin)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const contactId = parseInt(id, 10);

    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, number, category, description, district, location_text, latitude, longitude } = body;

    if (!name || !number || !category) {
      return NextResponse.json({ error: 'Name, number, and category are required' }, { status: 400 });
    }

    const info = await db.prepare(`
      UPDATE contacts
      SET name = ?, number = ?, category = ?, description = ?, district = ?, location_text = ?, latitude = ?, longitude = ?
      WHERE id = ?
    `).run(name, number, category, description || null, district || null, location_text || null, latitude || null, longitude || null, contactId);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const updatedContact = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId);
    return NextResponse.json(updatedContact);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/contacts/[id] - Delete a contact (Admin)
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const contactId = parseInt(id, 10);

    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }

    const info = await db.prepare('DELETE FROM contacts WHERE id = ?').run(contactId);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
