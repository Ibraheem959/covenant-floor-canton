export const BOARD_CAP = 24;
export const REVIEW_MS = 48 * 60 * 60 * 1000;
export const MAX_TEXT = 240;

export function openFloor() {
  return { jobs: [], next: 1, wallets: new Map(), escrow: new Map() };
}

export function credit(floor, party, amount) {
  if (amount < 0n) throw new Error("A credit cannot be negative.");
  floor.wallets.set(party, (floor.wallets.get(party) ?? 0n) + amount);
}

function wallet(floor, party) {
  return floor.wallets.get(party) ?? 0n;
}

function setWallet(floor, party, amount) {
  if (amount < 0n) throw new Error("A balance cannot go negative.");
  floor.wallets.set(party, amount);
}

function textOk(value, label) {
  const bytes = new TextEncoder().encode(value).length;
  if (!value.trim() || bytes > MAX_TEXT) throw new Error(`${label} must be 1 to ${MAX_TEXT} bytes.`);
}

function job(floor, id) {
  const found = floor.jobs.find((row) => row.id === id);
  if (!found) throw new Error("That job is not on the board.");
  return found;
}

function active(floor) {
  return floor.jobs.filter((row) => row.state === "open" || row.state === "submitted");
}

function makeRoom(floor) {
  if (active(floor).length >= BOARD_CAP) throw new Error("The board is full.");
  while (floor.jobs.length >= BOARD_CAP) {
    const finished = floor.jobs.findIndex((row) => row.state !== "open" && row.state !== "submitted");
    if (finished === -1) throw new Error("The board is full.");
    floor.jobs.splice(finished, 1);
  }
}

export function post(floor, { poster, brief, reward, now }) {
  textOk(brief, "The brief");
  if (reward < 1n) throw new Error("The reward must be at least 1.");
  if (wallet(floor, poster) < reward) throw new Error("The poster does not hold that reward.");
  makeRoom(floor);
  setWallet(floor, poster, wallet(floor, poster) - reward);
  floor.escrow.set(floor.next, reward);
  const row = {
    id: floor.next,
    poster,
    brief,
    reward,
    postedAt: now,
    worker: "",
    work: "",
    submittedAt: 0,
    reason: "",
    state: "open",
  };
  floor.next += 1;
  floor.jobs.push(row);
  return row.id;
}

export function submit(floor, { id, worker, work, now }) {
  const row = job(floor, id);
  textOk(work, "The work");
  if (row.state !== "open") throw new Error("Only the first submission is eligible.");
  if (worker === row.poster) throw new Error("The poster cannot submit their own job.");
  row.worker = worker;
  row.work = work;
  row.submittedAt = now;
  row.state = "submitted";
}

export function pay(floor, { id, actor }) {
  const row = job(floor, id);
  if (actor !== row.poster) throw new Error("Only the poster can pay.");
  if (row.state !== "submitted") throw new Error("Nothing is waiting to be paid.");
  const locked = floor.escrow.get(id) ?? 0n;
  if (locked !== row.reward) throw new Error("The escrow does not match the job.");
  floor.escrow.set(id, 0n);
  setWallet(floor, row.worker, wallet(floor, row.worker) + locked);
  row.state = "paid";
}

export function returnJob(floor, { id, actor, reason, now }) {
  const row = job(floor, id);
  textOk(reason, "The reason");
  if (actor !== row.poster) throw new Error("Only the poster can return the reward.");
  if (row.state !== "submitted") throw new Error("Nothing has been submitted.");
  if (now >= row.submittedAt + REVIEW_MS) throw new Error("The 48 hour review has ended.");
  const locked = floor.escrow.get(id) ?? 0n;
  floor.escrow.set(id, 0n);
  setWallet(floor, row.poster, wallet(floor, row.poster) + locked);
  row.reason = reason;
  row.state = "returned";
}

export function closeSilence(floor, { id, now }) {
  const row = job(floor, id);
  if (row.state !== "submitted") throw new Error("This job cannot be closed.");
  if (now < row.submittedAt + REVIEW_MS) throw new Error("The review is still open.");
  const locked = floor.escrow.get(id) ?? 0n;
  floor.escrow.set(id, 0n);
  setWallet(floor, row.worker, wallet(floor, row.worker) + locked);
  row.state = "paid";
}

export function cancel(floor, { id, actor }) {
  const row = job(floor, id);
  if (actor !== row.poster) throw new Error("Only the poster can cancel.");
  if (row.state !== "open") throw new Error("A submission is already in.");
  const locked = floor.escrow.get(id) ?? 0n;
  floor.escrow.set(id, 0n);
  setWallet(floor, row.poster, wallet(floor, row.poster) + locked);
  row.state = "cancelled";
}

export function escrowTotal(floor) {
  let sum = 0n;
  for (const value of floor.escrow.values()) sum += value;
  return sum;
}
