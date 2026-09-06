/**
 * Single source of truth for the REDEMPTION event.
 * Used by the page, the OpenGraph image, the .ics feed and the thank-you page,
 * so a date or venue change never has to be made twice.
 */

export const EVENT = {
  slug: 'redemption-2026-09-22',
  brand: 'Yoga of Intelligence',
  brandPhrase: 'Know the Knower',
  title: 'REDEMPTION',
  headline: 'WHO OWNS YOUR MIND?',
  subtitle: 'Desire, Consciousness & the Search for Freedom',

  // Tuesday, September 22, 2026 · 7:00–9:00 PM · America/New_York (EDT, UTC-4)
  dateLabel: 'Tuesday, September 22, 2026',
  dateShort: 'TUE 09.22',
  timeLabel: '7:00 – 9:00 PM',
  timeShort: '7–9 PM',
  timezone: 'America/New_York',
  startUtc: '20260922T230000Z',
  endUtc: '20260923T010000Z',

  venue: {
    street: '305 Schermerhorn Street',
    city: 'Brooklyn',
    region: 'NY',
    country: 'US',
    label: '305 Schermerhorn Street, Brooklyn, New York',
  },

  // Positioned as generous rather than as a discount: there is no admission
  // fee, but the page leads with the invitation, not with "FREE".
  admission: 'DONATIONS WELCOME',
  admissionLong: 'No admission fee · Donations welcome',
  includes: ['KIRTAN MUSIC', 'INTERACTIVE PHILOSOPHY', 'MANTRA', 'VEGETARIAN FEAST'],

  // The night runs inside the venue's own Tuesday programme, and they keep
  // their own headcount. Offered on the thank-you page AFTER our own RSVP has
  // been recorded and the Meta conversion has fired, so attribution is intact.
  //
  // NOTE: this URL follows the pattern of the venue's published Sept 1 listing
  // (bhakti-night-2026-09-01-19-00). It has not been opened and confirmed —
  // check it once, and set to null to hide the block entirely.
  venueName: 'Bhakti School NYC',
  venueRsvpUrl:
    'https://www.bhaktischoolnyc.com/event-details/bhakti-night-2026-09-22-19-00' as
      | string
      | null,

  og: {
    title: 'WHO OWNS YOUR MIND? | REDEMPTION — Brooklyn, Sept. 22',
    description:
      'A Brooklyn evening exploring desire, consciousness and freedom through kirtan music, interactive philosophy and mantra—followed by a vegetarian feast. Donations welcome.',
  },
} as const;

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('305 Schermerhorn Street, Brooklyn, NY');

/** UTM keys persisted with every RSVP so ad spend can be attributed. */
export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
