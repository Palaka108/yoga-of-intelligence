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

  // Entry is free; the house night is donation-based, so "free" is always
  // paired with the invitation rather than left to imply "no money involved".
  admission: 'FREE ENTRY',
  admissionNote: 'Donations welcome',
  admissionLong: 'Free to attend · Donations welcome',
  includes: ['MUSIC', 'KIRTAN', 'CONVERSATION', 'FREE VEGETARIAN FEAST'],

  og: {
    title: 'WHO OWNS YOUR MIND? | REDEMPTION — Brooklyn, Sept. 22',
    description:
      'A free Brooklyn evening exploring desire, consciousness and freedom through music, kirtan, ancient yoga psychology and mantra—followed by a vegetarian feast.',
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
