'use client';

import { useState } from 'react';
import { EVENT } from '@/lib/redemption-event';

/**
 * Native share sheet where it exists (most phones — where this traffic comes
 * from), clipboard copy everywhere else.
 */
export default function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: EVENT.og.title,
      text: EVENT.og.description,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* dismissed — fall through to copy */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full border border-redemption-ivory/30 px-6 py-4 text-center font-mono text-xs
                 uppercase tracking-[0.2em] text-redemption-ivory transition-colors duration-300
                 hover:border-redemption-vermilion hover:text-redemption-vermilion sm:w-auto"
    >
      {copied ? 'Link copied ✓' : 'Bring a friend ↗'}
    </button>
  );
}
