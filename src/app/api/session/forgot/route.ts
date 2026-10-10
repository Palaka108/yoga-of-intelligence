import { NextResponse, type NextRequest } from 'next/server';
import { clientIpFrom, requestPasswordResetFor } from '@/lib/session-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const result = await requestPasswordResetFor(
    String(form.get('email') ?? ''),
    clientIpFrom(request.headers, request.ip)
  );

  const back = new URL('/session/forgot', request.url);
  if (result === 'ok') {
    back.searchParams.set('sent', '1');
  } else {
    back.searchParams.set('error', result);
  }
  return NextResponse.redirect(back, 303);
}
