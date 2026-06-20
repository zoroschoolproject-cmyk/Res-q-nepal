import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/donors/[id] - Approve or Reject donor listings (Admin)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const donorId = parseInt(id, 10);

    if (isNaN(donorId)) {
      return NextResponse.json({ error: 'Invalid donor ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body; // 'Pending', 'Approved', 'Rejected'

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const info = await db.prepare('UPDATE donors SET status = ? WHERE id = ?').run(status, donorId);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Donor listing not found' }, { status: 404 });
    }

    const updatedDonor = await db.prepare('SELECT * FROM donors WHERE id = ?').get(donorId);
    return NextResponse.json(updatedDonor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/donors/[id] - Delete a donor listing (Admin)
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const donorId = parseInt(id, 10);

    if (isNaN(donorId)) {
      return NextResponse.json({ error: 'Invalid donor ID' }, { status: 400 });
    }

    const info = await db.prepare('DELETE FROM donors WHERE id = ?').run(donorId);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Donor listing not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Donor listing deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
