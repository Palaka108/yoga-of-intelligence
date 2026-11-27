import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { isListenId, readListenAudio } from '@/lib/listen-store';
import { OWNER_COOKIE, isOwnerUnlocked } from '@/lib/session-owner-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isOwnerUnlocked(cookies().get(OWNER_COOKIE)?.value)) {
    return new NextResponse('Locked', { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
  }
  if (!isListenId(params.id)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const audio = await readListenAudio(params.id);
  if (!audio) return new NextResponse('Not found', { status: 404 });

  const download = request.nextUrl.searchParams.get('download') === '1';
  const ext = extensionFor(audio.contentType);
  return new NextResponse(new Uint8Array(audio.bytes), {
    headers: {
      'Content-Type': audio.contentType,
      'Content-Length': String(audio.bytes.length),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${params.id}.${ext}"`,
    },
  });
}

function extensionFor(contentType: string): string {
  if (contentType.includes('mp4') || contentType.includes('aac') || contentType.includes('m4a')) return 'm4a';
  if (contentType.includes('ogg')) return 'ogg';
  if (contentType.includes('wav')) return 'wav';
  if (contentType.includes('webm')) return 'webm';
  return 'audio';
}
