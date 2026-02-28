// Supabase Edge Function — unlock-sequence
// Deploy: supabase functions deploy unlock-sequence
//
// This edge function provides an HTTP endpoint for the admin unlock flow.
// It can be called from n8n webhooks or external automation.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      user_id,
      module_id,
      sequence_id,
      submission_id,
      response_video_url,
      instructor_id,
      message,
      next_meditation_url,
    } = await req.json();

    // Validate required fields
    if (
      !user_id ||
      !module_id ||
      !sequence_id ||
      !submission_id ||
      !response_video_url ||
      !instructor_id
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify instructor role
    const { data: instructor } = await supabase
      .from('yoi_users')
      .select('role')
      .eq('id', instructor_id)
      .single();

    if (!instructor || !['admin', 'instructor'].includes(instructor.role)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Insert instructor response
    await supabase.from('yoi_instructor_responses').insert({
      submission_id,
      instructor_id,
      user_id,
      module_id,
      sequence_id,
      response_video_url,
      message: message || null,
      next_meditation_url: next_meditation_url || null,
    });

    // 2. Mark submission as reviewed
    await supabase
      .from('yoi_video_submissions')
      .update({ status: 'reviewed', reviewed_at: new Date().toISOString() })
      .eq('id', submission_id);

    // 3. Complete current sequence
    await supabase.from('yoi_user_progress').upsert(
      {
        user_id,
        module_id,
        sequence_id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id,sequence_id' }
    );

    // 4. Find and unlock next sequence
    const { data: currentSeq } = await supabase
      .from('yoi_module_sequences')
      .select('sequence_number')
      .eq('id', sequence_id)
      .single();

    let nextSequenceId = null;

    if (currentSeq) {
      const { data: nextSeq } = await supabase
        .from('yoi_module_sequences')
        .select('id')
        .eq('module_id', module_id)
        .eq('sequence_number', currentSeq.sequence_number + 1)
        .single();

      if (nextSeq) {
        nextSequenceId = nextSeq.id;
        await supabase.from('yoi_user_progress').upsert(
          {
            user_id,
            module_id,
            sequence_id: nextSeq.id,
            status: 'unlocked',
          },
          { onConflict: 'user_id,module_id,sequence_id' }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        next_sequence_id: nextSequenceId,
        message: `Sequence unlocked for user ${user_id}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
