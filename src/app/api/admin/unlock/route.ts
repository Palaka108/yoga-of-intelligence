import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';

/**
 * POST /api/admin/unlock
 * Server-side admin unlock endpoint as a fallback to the RPC function.
 * Uses service role to bypass RLS when needed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      module_id,
      sequence_id,
      submission_id,
      response_video_url,
      message,
      next_meditation_url,
      instructor_id,
    } = body;

    if (!user_id || !module_id || !sequence_id || !submission_id || !response_video_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Verify instructor role
    const { data: rawInstructor } = await supabase
      .from('yoi_users')
      .select('role')
      .eq('id', instructor_id)
      .single();

    const instructor = rawInstructor as unknown as { role: string } | null;

    if (!instructor || !['admin', 'instructor'].includes(instructor.role)) {
      return NextResponse.json(
        { error: 'Unauthorized — instructor role required' },
        { status: 403 }
      );
    }

    // Insert instructor response
    const { error: responseError } = await (supabase
      .from('yoi_instructor_responses') as any)
      .insert({
        submission_id,
        instructor_id,
        user_id,
        module_id,
        sequence_id,
        response_video_url,
        message: message || null,
        next_meditation_url: next_meditation_url || null,
      });

    if (responseError) {
      return NextResponse.json({ error: responseError.message }, { status: 500 });
    }

    // Mark submission as reviewed
    await (supabase
      .from('yoi_video_submissions') as any)
      .update({ status: 'reviewed', reviewed_at: new Date().toISOString() })
      .eq('id', submission_id);

    // Complete current sequence
    await (supabase
      .from('yoi_user_progress') as any)
      .upsert(
        {
          user_id,
          module_id,
          sequence_id,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,module_id,sequence_id' }
      );

    // Find and unlock next sequence
    const { data: rawCurrentSeq } = await supabase
      .from('yoi_module_sequences')
      .select('sequence_number')
      .eq('id', sequence_id)
      .single();

    const currentSeq = rawCurrentSeq as unknown as { sequence_number: number } | null;

    if (currentSeq) {
      const { data: rawNextSeq } = await supabase
        .from('yoi_module_sequences')
        .select('id')
        .eq('module_id', module_id)
        .eq('sequence_number', currentSeq.sequence_number + 1)
        .single();

      const nextSeq = rawNextSeq as unknown as { id: string } | null;

      if (nextSeq) {
        await (supabase.from('yoi_user_progress') as any).upsert(
          {
            user_id,
            module_id,
            sequence_id: nextSeq.id,
            status: 'unlocked',
          },
          { onConflict: 'user_id,module_id,sequence_id' }
        );

        return NextResponse.json({
          success: true,
          next_sequence_id: nextSeq.id,
        });
      }
    }

    return NextResponse.json({ success: true, next_sequence_id: null });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
