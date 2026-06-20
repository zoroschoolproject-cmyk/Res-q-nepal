import { NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/complaints/[id] - Update complaint status and admin response (Admin)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const client = db.getClient();
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

    await client.execute({
      sql: `
        UPDATE complaints
        SET status = ?, admin_response = ?
        WHERE id = ?
      `,
      args: [status, admin_response || null, complaintId]
    });

    // Check if row exists
    const checkResult = await client.execute({
      sql: 'SELECT * FROM complaints WHERE id = ?',
      args: [complaintId]
    });
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json(checkResult.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
