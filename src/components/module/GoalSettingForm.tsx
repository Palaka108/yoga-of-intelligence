'use client';

import { useState } from 'react';
import { Target, Plus, Sparkles } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase-client';

interface Goal {
  goal_text: string;
  small_action: string;
}

interface GoalSettingFormProps {
  userId: string;
  onComplete: () => void;
}

export default function GoalSettingForm({ userId, onComplete }: GoalSettingFormProps) {
  const [goals, setGoals] = useState<Goal[]>([
    { goal_text: '', small_action: '' },
    { goal_text: '', small_action: '' },
    { goal_text: '', small_action: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  const updateGoal = (index: number, field: keyof Goal, value: string) => {
    setGoals((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const isValid = goals.every((g) => g.goal_text.trim().length > 0 && g.small_action.trim().length > 0);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 28);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    try {
      const rows = goals.map((g) => ({
        user_id: userId,
        goal_text: g.goal_text.trim(),
        small_action: g.small_action.trim(),
        target_date: targetDateStr,
        status: 'active',
      }));

      const { error: insertErr } = await supabase
        .from('yoi_user_goals')
        .insert(rows as any);

      if (insertErr) throw insertErr;

      onComplete();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save goals');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sacred-gold mb-2">
        <Target size={18} />
        <h3 className="font-display text-lg">Your 3 Intentions</h3>
      </div>

      <p className="text-white/40 text-sm leading-relaxed">
        Set 3 goals for the next 4 weeks. For each goal, include a small daily
        action — something you can do in 5 minutes or less to move toward it.
      </p>

      {goals.map((goal, i) => (
        <div
          key={i}
          className="glass-panel p-4 space-y-3 border border-glass-border"
        >
          <div className="flex items-center gap-2 text-white/60 text-xs font-display uppercase tracking-wider">
            <Sparkles size={12} className="text-sacred-gold/60" />
            Intention {i + 1}
          </div>

          <textarea
            value={goal.goal_text}
            onChange={(e) => updateGoal(i, 'goal_text', e.target.value)}
            placeholder="What do you want to shift or explore?"
            rows={2}
            className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-sacred-gold/30 resize-none transition-colors"
          />

          <div className="flex items-start gap-2">
            <Plus size={14} className="text-sacred-gold/40 mt-3 flex-shrink-0" />
            <input
              type="text"
              value={goal.small_action}
              onChange={(e) => updateGoal(i, 'small_action', e.target.value)}
              placeholder="Small daily action (5 min or less)"
              className="flex-1 bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-sacred-gold/30 transition-colors"
            />
          </div>
        </div>
      ))}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isValid || saving}
        className="btn-sacred w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Set My Intentions & Continue'}
      </button>
    </div>
  );
}
