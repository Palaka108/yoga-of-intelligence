'use client';

import { useEffect } from 'react';
import { consumeRsvpConversion, recordRsvpConversion } from './GoogleTag';

/**
 * Fires the RSVP conversion on the thank-you page, and only for someone who
 * actually completed the form.
 *
 * The form leaves a short-lived marker in sessionStorage on a confirmed 200
 * from the RSVP endpoint. This reads it once and clears it, so a page refresh,
 * a bookmark, a shared link or a crawler landing on /redemption/thanks records
 * nothing. Renders no markup.
 */
export default function RsvpConversion() {
  useEffect(() => {
    const eventId = consumeRsvpConversion();
    if (eventId) recordRsvpConversion(eventId);
  }, []);

  return null;
}
