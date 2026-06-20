import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/complaints/[id] - Update complaint status and admin response (Admin)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id, 10);

    if (isNaN(complaintId)) {
      return NextResponse.json({ error: 'Invalid complaint ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, admin_response } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const info = await db.prepare(`
      UPDATE complaints
      SET status = ?, admin_response = ?
      WHERE id = ?
    `).run(status, admin_response || null, complaintId);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const updatedComplaint = await db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaintId);
    return NextResponse.json(updatedComplaint);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
