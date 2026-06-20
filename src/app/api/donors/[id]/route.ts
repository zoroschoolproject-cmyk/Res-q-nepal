import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/donors/[id] - Approve or Reject donor listings (Admin)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const client = db.getClient();
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

    await client.execute({
      sql: 'UPDATE donors SET status = ? WHERE id = ?',
      args: [status, donorId]
    });

    // Check if row exists
    const checkResult = await client.execute({
      sql: 'SELECT * FROM donors WHERE id = ?',
      args: [donorId]
    });
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Donor listing not found' }, { status: 404 });
    }

    return NextResponse.json(checkResult.rows[0]);
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
    const client = db.getClient();
    const { id } = await params;
    const donorId = parseInt(id, 10);

    if (isNaN(donorId)) {
      return NextResponse.json({ error: 'Invalid donor ID' }, { status: 400 });
    }

    // Check if row exists first
    const checkResult = await client.execute({
      sql: 'SELECT * FROM donors WHERE id = ?',
      args: [donorId]
    });
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Donor listing not found' }, { status: 404 });
    }

    await client.execute({
      sql: 'DELETE FROM donors WHERE id = ?',
      args: [donorId]
    });

    return NextResponse.json({ success: true, message: 'Donor listing deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
