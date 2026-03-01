'use client';

import { useEffect, useState } from 'react';
import { Target, CheckCircle, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

interface Goal {
  id: string;
  goal_text: string;
  small_action: string | null;
  target_date: string;
  status: 'active' | 'completed' | 'abandoned';
}

export default function GoalsWidget({ userId }: { userId: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from('yoi_user_goals')
        .select('id, goal_text, small_action, target_date, status')
        .eq('user_id', userId)
        .in('status', ['active', 'completed'])
        .order('created_at');

      setGoals((data as unknown as Goal[]) ?? []);
      setLoading(false);
    }
    fetch();
  }, [userId]);

  if (loading || goals.length === 0) return null;

  const toggleComplete = async (goalId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'completed' : 'active';
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('yoi_user_goals') as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', goalId);

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, status: newStatus as Goal['status'] } : g
      )
    );
  };

  return (
    <div className="glass-portal-inner p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target size={16} className="text-sacred-gold/60" />
        <h3 className="font-display text-sm text-white/60 uppercase tracking-wider">
          Your Intentions
        </h3>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const daysLeft = Math.max(
            0,
            Math.ceil(
              (new Date(goal.target_date).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          );

          return (
            <div
              key={goal.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                goal.status === 'completed'
                  ? 'bg-emerald-500/5 border border-emerald-500/10'
                  : 'bg-white/3 border border-glass-border'
              }`}
            >
              <button
                onClick={() => toggleComplete(goal.id, goal.status)}
                className="mt-0.5 flex-shrink-0"
              >
                {goal.status === 'completed' ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20 hover:border-sacred-gold/50 transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed ${
                    goal.status === 'completed'
                      ? 'text-white/40 line-through'
                      : 'text-white/70'
                  }`}
                >
                  {goal.goal_text}
                </p>
                {goal.small_action && goal.status === 'active' && (
                  <p className="text-xs text-sacred-gold/40 mt-1">
                    Daily: {goal.small_action}
                  </p>
                )}
              </div>

              {goal.status === 'active' && (
                <div className="flex items-center gap-1 text-[10px] text-white/20 flex-shrink-0">
                  <Calendar size={10} />
                  <span>{daysLeft}d</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
