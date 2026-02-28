'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { MessageCircle } from 'lucide-react';

interface InstructorResponse {
  id: string;
  response_video_url: string;
  message: string | null;
  next_meditation_url: string | null;
  created_at: string;
}

interface InstructorResponseViewProps {
  userId: string;
  moduleId: string;
  sequenceId: string;
}

export default function InstructorResponseView({
  userId,
  moduleId,
  sequenceId,
}: InstructorResponseViewProps) {
  const [response, setResponse] = useState<InstructorResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResponse() {
      const supabase = createClient();
      const { data: rawData } = await supabase
        .from('yoi_instructor_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .eq('sequence_id', sequenceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const data = rawData as unknown as InstructorResponse | null;
      if (data) setResponse(data);
      setLoading(false);
    }

    fetchResponse();
  }, [userId, moduleId, sequenceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!response) {
    return (
      <div className="text-center py-8">
        <MessageCircle size={32} className="mx-auto text-white/10 mb-3" />
        <p className="text-sm text-white/30">
          Your instructor response will appear here once ready.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Custom Response Video */}
      <div>
        <p className="text-xs text-sacred-gold/60 uppercase tracking-widest mb-2">
          Your Personal Response
        </p>
        <div className="rounded-xl overflow-hidden aspect-video bg-sacred-deep">
          <video
            src={response.response_video_url}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Message */}
      {response.message && (
        <div className="glass-panel p-4">
          <p className="text-sm text-white/60 leading-relaxed italic">
            &ldquo;{response.message}&rdquo;
          </p>
        </div>
      )}

      {/* Next Meditation */}
      {response.next_meditation_url && (
        <div>
          <p className="text-xs text-sacred-gold/60 uppercase tracking-widest mb-2">
            Guided Meditation
          </p>
          <audio
            src={response.next_meditation_url}
            controls
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
