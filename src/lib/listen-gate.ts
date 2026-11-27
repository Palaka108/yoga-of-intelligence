/**
 * Listening gate.
 *
 * A day opens only when the song has actually played through. Time the
 * playhead spends jumping ahead is not counted. The clock compared here is
 * wall time (`performance.now()` in the player), so moving `currentTime`
 * to the end, or racing the playhead faster than the clock, leaves a hole
 * in the coverage and the question stays closed.
 *
 * Coverage is a union of slices that were heard, not a running total. Hearing
 * the opening twice does not fill in a part that was skipped.
 */

export const SLICE_SECONDS = 0.25;
export const MAX_PLAYBACK_RATE = 1.05;
export const UNLOCK_COVERAGE = 0.94;

export type GateSnapshot = {
  mediaTime: number;
  wallMs: number;
  paused: boolean;
  rate: number;
  seeking: boolean;
};

export type ListenGate = {
  anchor: (mediaTime: number, wallMs: number) => void;
  tick: (snap: GateSnapshot) => void;
  finish: (duration: number) => void;
  coverage: () => number;
  coveredSeconds: (duration: number) => number;
  unlocks: (duration: number) => boolean;
  ended: () => boolean;
};

export function createListenGate(duration: number): ListenGate {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('Listen gate needs a real duration.');
  }

  const slices = Math.max(1, Math.ceil(duration / SLICE_SECONDS));
  const covered = new Uint8Array(slices);
  let primed = false;
  let lastMedia = 0;
  let lastWall = 0;
  let lastAccepted = -1;
  let ended = false;

  const mark = (from: number, to: number) => {
    if (!(to > from)) return;
    const start = Math.max(0, Math.floor(from / SLICE_SECONDS));
    const stop = Math.min(slices - 1, Math.floor((to - 1e-4) / SLICE_SECONDS));
    for (let i = start; i <= stop; i += 1) covered[i] = 1;
  };

  const coverage = () => {
    let heard = 0;
    for (let i = 0; i < covered.length; i += 1) heard += covered[i];
    return heard / covered.length;
  };

  return {
    anchor(mediaTime, wallMs) {
      lastMedia = mediaTime;
      lastWall = wallMs;
      primed = true;
    },
    tick(snap) {
      if (!primed || snap.paused || snap.seeking) {
        lastMedia = snap.mediaTime;
        lastWall = snap.wallMs;
        primed = true;
        return;
      }

      const from = lastMedia;
      const dt = snap.mediaTime - lastMedia;
      const dw = (snap.wallMs - lastWall) / 1000;
      lastMedia = snap.mediaTime;
      lastWall = snap.wallMs;

      if (dt <= 0.001 || dw <= 0) return;
      if (snap.rate > MAX_PLAYBACK_RATE) return;
      // A seek moves the playhead farther than the clock did.
      if (dt > dw * 1.25 + 0.05) return;

      mark(from, snap.mediaTime);
      lastAccepted = snap.mediaTime;
    },
    finish(durationNow) {
      // `ended` only sticks when playback itself arrived at the end.
      // A seek that trips the media element's ended event leaves it closed.
      const natural = lastAccepted >= 0 && durationNow - lastAccepted <= 0.85;
      if (!natural) {
        ended = false;
        return;
      }
      mark(lastAccepted, durationNow);
      lastAccepted = durationNow;
      ended = true;
    },
    coverage,
    coveredSeconds(durationNow) {
      return coverage() * durationNow;
    },
    unlocks(durationNow) {
      return ended && Number.isFinite(durationNow) && durationNow > 0 && coverage() >= UNLOCK_COVERAGE;
    },
    ended() {
      return ended;
    },
  };
}

/** Server-side sanity check on the numbers the player reports. */
export function reportedListenIsComplete(played: number, duration: number, coverage: number): boolean {
  if (!Number.isFinite(played) || !Number.isFinite(duration) || !Number.isFinite(coverage)) return false;
  if (duration < 0.5 || duration > 60 * 30) return false;
  if (coverage < 0.9 || coverage > 1.001) return false;
  if (played + 0.05 < duration * 0.9) return false;
  return true;
}
