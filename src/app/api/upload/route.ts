import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * POST /api/upload
 * Handles video file uploads with server-side validation.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const moduleId = formData.get('module_id') as string;
    const sequenceId = formData.get('sequence_id') as string;
    const bucket = (formData.get('bucket') as string) || 'yoi-videos';

    if (!file || !moduleId || !sequenceId) {
      return NextResponse.json(
        { error: 'Missing file, module_id, or sequence_id' },
        { status: 400 }
      );
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum 100MB.' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() ?? 'webm';
    const filePath = `${user.id}/${moduleId}/${sequenceId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch {
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
