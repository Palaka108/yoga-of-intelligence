import { NextResponse, type NextRequest } from 'next/server';
import { signupFromForm } from '@/lib/session-join';
import { sessionPath } from '@/lib/session-participants';

export const dynamic = 'force-dynamic';

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return request.ip || 'unknown';
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const result = await signupFromForm(form, clientIp(request));

  if (result.ok) {
    return NextResponse.redirect(new URL(sessionPath(result.clientId), request.url), 303);
  }

  const back = new URL('/join', request.url);
  back.searchParams.set('error', result.error);
  return NextResponse.redirect(back, 303);
}
