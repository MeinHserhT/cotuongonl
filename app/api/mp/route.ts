import { NextRequest, NextResponse } from 'next/server';
import { getRoomManager } from '@/server/room-manager';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientId = typeof body?.clientId === 'string' && body.clientId ? body.clientId : 'anon';
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const roomManager = getRoomManager();
    const outMessages = roomManager.handleHttpPoll(clientId, messages);
    return NextResponse.json({ messages: outMessages }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ messages: [] }, { status: 400 });
  }
}
