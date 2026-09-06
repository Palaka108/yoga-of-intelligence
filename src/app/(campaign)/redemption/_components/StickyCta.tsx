'use client';

import { useEffect, useState } from 'react';

/**
 * Thumb-reachable RSVP bar for phones.
 *
 * Appears only once the hero has scrolled away, hides again over the RSVP
 * section so it never covers the form, and is hidden entirely on desktop —
 * where the form is reachable without it and a fixed bar is just clutter.
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
                  md:hidden
                  ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!visible}
    >
      <a
        href="#rsvp"
        tabIndex={visible ? 0 : -1}
        className="block w-full bg-redemption-vermilion px-6 py-4 text-center font-mono text-sm
                   font-semibold uppercase tracking-[0.16em] text-redemption-ivory
                   transition-colors duration-300 hover:bg-redemption-vermilion-deep"
      >
        Reserve your spot
      </a>
      <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-redemption-ivory/55">
        Tue Sept 22 · 7–9 PM · Donations welcome
      </p>
    </div>
  );
}
