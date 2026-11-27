import assert from 'node:assert/strict';
import { test } from 'node:test';
import { daysFromStart, resolveListenDay } from './listen-day';

const week = {
  calendar: true,
  startDate: '2026-11-27',
  timeZone: 'America/New_York',
};

test('day 1 is the start date in the configured time zone', () => {
  const morning = new Date('2026-11-27T15:00:00.000Z');
  assert.equal(daysFromStart(week.startDate, week.timeZone, morning), 0);
  assert.deepEqual(resolveListenDay(week, 7, morning), { state: 'ready', day: 1 });
});

test('a late evening in New York is still the previous calendar day', () => {
  const late = new Date('2026-11-27T04:30:00.000Z');
  assert.equal(daysFromStart(week.startDate, week.timeZone, late), -1);
  assert.deepEqual(resolveListenDay(week, null, late), { state: 'before', opensOn: '2026-11-27' });
});

test('day 7 is the last day, and the next morning closes the week', () => {
  const daySeven = new Date('2026-12-03T16:00:00.000Z');
  const after = new Date('2026-12-04T16:00:00.000Z');
  assert.deepEqual(resolveListenDay(week, null, daySeven), { state: 'ready', day: 7 });
  assert.deepEqual(resolveListenDay(week, null, after), { state: 'after' });
});

test('the demo ignores the calendar and uses the requested day', () => {
  const demo = { calendar: false, startDate: '2026-11-27', timeZone: 'America/New_York' };
  assert.deepEqual(resolveListenDay(demo, 3, new Date('2027-01-01T00:00:00.000Z')), { state: 'ready', day: 3 });
  assert.deepEqual(resolveListenDay(demo, null), { state: 'ready', day: 1 });
  assert.deepEqual(resolveListenDay(demo, 9), { state: 'ready', day: 1 });
});
