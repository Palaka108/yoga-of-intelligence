import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createListenGate, reportedListenIsComplete } from './listen-gate';

function playThrough(duration: number, step = 0.25) {
  const gate = createListenGate(duration);
  let wall = 5_000;
  gate.anchor(0, wall);
  for (let t = step; t <= duration + 1e-6; t += step) {
    wall += step * 1000;
    gate.tick({
      mediaTime: Math.min(t, duration),
      wallMs: wall,
      paused: false,
      rate: 1,
      seeking: false,
    });
  }
  gate.finish(duration);
  return gate;
}

test('a full listen at real time opens the gate', () => {
  const gate = playThrough(12);
  assert.equal(gate.ended(), true);
  assert.ok(gate.coverage() >= 0.94);
  assert.equal(gate.unlocks(12), true);
});

test('seeking to the end does not open the gate', () => {
  const gate = createListenGate(12);
  gate.anchor(0, 0);
  gate.tick({ mediaTime: 0.5, wallMs: 500, paused: false, rate: 1, seeking: false });
  gate.anchor(12, 530);
  gate.tick({ mediaTime: 12, wallMs: 560, paused: false, rate: 1, seeking: true });
  gate.finish(12);
  assert.equal(gate.ended(), false);
  assert.ok(gate.coverage() < 0.2);
  assert.equal(gate.unlocks(12), false);
});

test('hearing the first half and jumping to the end does not open the gate', () => {
  const gate = createListenGate(12);
  let wall = 0;
  gate.anchor(0, wall);
  for (let t = 0.25; t <= 6; t += 0.25) {
    wall += 250;
    gate.tick({ mediaTime: t, wallMs: wall, paused: false, rate: 1, seeking: false });
  }
  gate.anchor(12, wall + 20);
  gate.finish(12);
  assert.ok(gate.coverage() < 0.6);
  assert.equal(gate.unlocks(12), false);
});

test('a pause in the middle still opens once the rest is heard', () => {
  const gate = createListenGate(8);
  let wall = 0;
  gate.anchor(0, wall);
  for (let t = 0.25; t <= 3; t += 0.25) {
    wall += 250;
    gate.tick({ mediaTime: t, wallMs: wall, paused: false, rate: 1, seeking: false });
  }
  wall += 10_000;
  gate.anchor(3, wall);
  for (let t = 3.25; t <= 8; t += 0.25) {
    wall += 250;
    gate.tick({ mediaTime: Math.min(t, 8), wallMs: wall, paused: false, rate: 1, seeking: false });
  }
  gate.finish(8);
  assert.equal(gate.unlocks(8), true);
});

test('speeding the playhead ahead of the clock does not count', () => {
  const gate = createListenGate(12);
  let media = 0;
  let wall = 0;
  gate.anchor(0, wall);
  for (let i = 0; i < 48; i += 1) {
    media += 0.25;
    wall += 20;
    gate.tick({ mediaTime: media, wallMs: wall, paused: false, rate: 1, seeking: false });
  }
  gate.finish(12);
  assert.equal(gate.unlocks(12), false);
});

test('a playback rate above 1 does not count', () => {
  const gate = createListenGate(4);
  let wall = 0;
  gate.anchor(0, wall);
  for (let t = 0.25; t <= 4; t += 0.25) {
    wall += 250;
    gate.tick({ mediaTime: t, wallMs: wall, paused: false, rate: 2, seeking: false });
  }
  gate.finish(4);
  assert.equal(gate.coverage(), 0);
  assert.equal(gate.unlocks(4), false);
});

test('reaching the end without the ended event does not open the gate', () => {
  const gate = playThrough(12);
  const unfinished = createListenGate(12);
  let wall = 0;
  unfinished.anchor(0, wall);
  for (let t = 0.25; t <= 12; t += 0.25) {
    wall += 250;
    unfinished.tick({ mediaTime: Math.min(t, 12), wallMs: wall, paused: false, rate: 1, seeking: false });
  }
  assert.equal(unfinished.unlocks(12), false);
  assert.equal(gate.unlocks(12), true);
});

test('looping the opening does not fill a skipped ending', () => {
  const gate = createListenGate(8);
  let wall = 0;
  gate.anchor(0, wall);
  for (let pass = 0; pass < 4; pass += 1) {
    gate.anchor(0, wall);
    for (let t = 0.25; t <= 2; t += 0.25) {
      wall += 250;
      gate.tick({ mediaTime: t, wallMs: wall, paused: false, rate: 1, seeking: false });
    }
  }
  gate.finish(8);
  assert.ok(gate.coverage() < 0.4);
  assert.equal(gate.unlocks(8), false);
});

test('the server rejects an incomplete report and accepts a full one', () => {
  assert.equal(reportedListenIsComplete(1, 12, 0.1), false);
  assert.equal(reportedListenIsComplete(12, 12, 1), true);
  assert.equal(reportedListenIsComplete(11, 12, 0.93), true);
  assert.equal(reportedListenIsComplete(12, 0.1, 1), false);
});
