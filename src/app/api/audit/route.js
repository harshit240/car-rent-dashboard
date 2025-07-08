import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/app/lib/database';
import { verifyToken, getTokenFromHeaders } from '@/app/lib/auth';

export async function GET(request) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const logs = getAuditLogs();
    return NextResponse.json(logs);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}