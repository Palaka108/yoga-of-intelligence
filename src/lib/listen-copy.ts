/** Words for the listen-to-unlock ring. Numerals, so a short demo song can count down. */

export function remainingPhrase(seconds: number): string {
  if (!Number.isFinite(seconds)) return 'when the song finishes';
  const left = Math.max(0, Math.ceil(seconds));
  if (left <= 0) return 'a moment left';
  if (left < 60) return left === 1 ? '1 second left' : `${left} seconds left`;
  const minutes = Math.ceil(left / 60);
  return minutes === 1 ? '1 minute left' : `${minutes} minutes left`;
}
