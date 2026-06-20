import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const client = db.getClient();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const result = await client.execute({
      sql: 'SELECT * FROM admin_session WHERE username = ? COLLATE NOCASE',
      args: [username]
    });
    const admin = result.rows[0] as any;

    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Since this is a local offline platform, we will return a simple session token
    // which the admin dashboard will verify from localStorage.
    const mockToken = `session_token_${Date.now()}`;

    return NextResponse.json({
      success: true,
      token: mockToken,
      username: admin.username,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
