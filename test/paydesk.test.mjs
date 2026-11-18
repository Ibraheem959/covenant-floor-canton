import assert from "node:assert/strict";
import test from "node:test";
import {
  BOARD_CAP,
  REVIEW_MS,
  cancel,
  closeSilence,
  credit,
  escrowTotal,
  openFloor,
  pay,
  post,
  returnJob,
  submit,
} from "../src/paydesk.mjs";

function desk() {
  const floor = openFloor();
  credit(floor, "poster", 100n);
  credit(floor, "worker", 0n);
  return floor;
}

test("a job locks the poster's own reward and does not touch anyone else", () => {
  const floor = desk();
  const id = post(floor, { poster: "poster", brief: "Write the note", reward: 10n, now: 1 });
  assert.equal(floor.wallets.get("poster"), 90n);
  assert.equal(escrowTotal(floor), 10n);
  assert.equal(floor.jobs.find((row) => row.id === id).state, "open");
});

test("the reward minimum and the board cap are enforced", () => {
  const floor = desk();
  assert.throws(() => post(floor, { poster: "poster", brief: "x", reward: 0n, now: 1 }), /at least 1/);
  for (let i = 0; i < BOARD_CAP; i += 1) {
    post(floor, { poster: "poster", brief: `job ${i}`, reward: 1n, now: i });
  }
  assert.throws(() => post(floor, { poster: "poster", brief: "one more", reward: 1n, now: 99 }), /full/);
});

test("a finished job leaves the board only when a new job needs the room", () => {
  const floor = desk();
  const first = post(floor, { poster: "poster", brief: "first", reward: 1n, now: 1 });
  cancel(floor, { id: first, actor: "poster" });
  for (let i = 0; i < BOARD_CAP - 1; i += 1) {
    post(floor, { poster: "poster", brief: `live ${i}`, reward: 1n, now: i + 2 });
  }
  assert.equal(floor.jobs.some((row) => row.id === first), true);
  post(floor, { poster: "poster", brief: "uses the finished slot", reward: 1n, now: 80 });
  assert.equal(floor.jobs.some((row) => row.id === first), false);
  assert.equal(floor.jobs.length, BOARD_CAP);
});

test("the first submission wins and a second is refused", () => {
  const floor = desk();
  const id = post(floor, { poster: "poster", brief: "draw the mark", reward: 5n, now: 1 });
  submit(floor, { id, worker: "worker", work: "done", now: 2 });
  assert.throws(() => submit(floor, { id, worker: "other", work: "later", now: 3 }), /first submission/);
  assert.throws(() => submit(floor, { id, worker: "poster", work: "self", now: 3 }), /first submission/);
});

test("the poster pays once from escrow", () => {
  const floor = desk();
  const id = post(floor, { poster: "poster", brief: "draw the mark", reward: 5n, now: 1 });
  submit(floor, { id, worker: "worker", work: "done", now: 2 });
  pay(floor, { id, actor: "poster" });
  assert.equal(floor.wallets.get("worker"), 5n);
  assert.equal(escrowTotal(floor), 0n);
  assert.throws(() => pay(floor, { id, actor: "poster" }), /waiting/);
  assert.throws(() => closeSilence(floor, { id, now: 2 + REVIEW_MS }), /cannot be closed/);
});

test("a return inside 48 hours needs a reason and sends the reward back", () => {
  const floor = desk();
  const id = post(floor, { poster: "poster", brief: "draw the mark", reward: 5n, now: 1 });
  submit(floor, { id, worker: "worker", work: "wrong", now: 10 });
  assert.throws(() => returnJob(floor, { id, actor: "poster", reason: " ", now: 11 }), /reason/);
  returnJob(floor, { id, actor: "poster", reason: "Does not match the brief", now: 11 });
  assert.equal(floor.wallets.get("poster"), 100n);
  assert.equal(floor.wallets.get("worker"), 0n);
  assert.throws(() => pay(floor, { id, actor: "poster" }), /waiting/);
});

test("silence after 48 hours pays the worker and an early close is refused", () => {
  const floor = desk();
  const id = post(floor, { poster: "poster", brief: "draw the mark", reward: 5n, now: 1 });
  submit(floor, { id, worker: "worker", work: "done", now: 100 });
  assert.throws(() => closeSilence(floor, { id, now: 100 + REVIEW_MS - 1 }), /still open/);
  assert.throws(() => returnJob(floor, { id, actor: "poster", reason: "late", now: 100 + REVIEW_MS }), /ended/);
  closeSilence(floor, { id, now: 100 + REVIEW_MS });
  assert.equal(floor.wallets.get("worker"), 5n);
  assert.throws(() => closeSilence(floor, { id, now: 100 + REVIEW_MS + 1 }), /cannot be closed/);
});

test("the poster can reclaim only before a submission", () => {
  const floor = desk();
  const id = post(floor, { poster: "poster", brief: "draw the mark", reward: 5n, now: 1 });
  assert.throws(() => cancel(floor, { id, actor: "worker" }), /Only the poster/);
  cancel(floor, { id, actor: "poster" });
  assert.equal(floor.wallets.get("poster"), 100n);
  const next = post(floor, { poster: "poster", brief: "again", reward: 5n, now: 2 });
  submit(floor, { id: next, worker: "worker", work: "in", now: 3 });
  assert.throws(() => cancel(floor, { id: next, actor: "poster" }), /already in/);
});

test("a stranger cannot pay and the brief has no edit path", () => {
  const floor = desk();
  const id = post(floor, { poster: "poster", brief: "original", reward: 5n, now: 1 });
  submit(floor, { id, worker: "worker", work: "done", now: 2 });
  assert.throws(() => pay(floor, { id, actor: "worker" }), /Only the poster/);
  assert.equal(floor.jobs.find((row) => row.id === id).brief, "original");
  assert.equal(typeof floor.jobs.find((row) => row.id === id).edit, "undefined");
});
