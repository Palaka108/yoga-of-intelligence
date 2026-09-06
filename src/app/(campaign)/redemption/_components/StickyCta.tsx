'use client';

import { useEffect, useState } from 'react';

/**
 * Thumb-reachable RSVP bar. Appears only once the hero has scrolled away and
 * hides again over the RSVP section itself, so it never covers the form.
 */
export default function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero-sentinel');
    const rsvp = document.getElementById('rsvp-section');
    if (!hero) return;

    let pastHero = false;
    let atForm = false;
    const sync = () => setVisible(pastHero && !atForm);

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        // Only once the sentinel has left through the TOP of the viewport.
        // Plain !isIntersecting would be true at scroll 0 too, because the
        // hero is taller than a phone screen.
        pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sync();
      },
      { threshold: 0 }
    );
    heroObserver.observe(hero);

    let formObserver: IntersectionObserver | undefined;
    if (rsvp) {
      formObserver = new IntersectionObserver(
        ([entry]) => {
          atForm = entry.isIntersecting;
          sync();
        },
        { threshold: 0.12 }
      );
      formObserver.observe(rsvp);
    }

    return () => {
      heroObserver.disconnect();
      formObserver?.disconnect();
    };
  }, []);

  return (
    <div
      // Background and safe-area padding live in redemption.css: an arbitrary
      // Tailwind value containing env() breaks the class extractor and silently
      // drops the neighbouring utility.
      className={`rdm-sticky fixed inset-x-0 bottom-0 z-40 border-t border-redemption-ivory/10
                  px-4 pt-3 backdrop-blur-md transition-transform duration-500 ease-out
                  ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-4">
        <div className="hidden flex-1 sm:block">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-redemption-ivory/55">
            Tue Sept 22 · 7–9 PM · Brooklyn
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-redemption-vermilion">
            Donations welcome
          </p>
        </div>
        <a
          href="#rsvp"
          tabIndex={visible ? 0 : -1}
          className="w-full bg-redemption-vermilion px-6 py-4 text-center font-mono text-sm
                     font-semibold uppercase tracking-[0.16em] text-redemption-ivory
                     transition-colors duration-300 hover:bg-redemption-vermilion-deep sm:w-auto"
        >
          Reserve your spot
        </a>
      </div>
    </div>
  );
}
