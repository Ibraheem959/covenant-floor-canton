import assert from "node:assert/strict";
import test from "node:test";
import { renderAlert } from "../bot/index.mjs";

test("an alert keeps the party short and refuses unknown kinds", () => {
  const text = renderAlert({
    kind: "paydesk-pay",
    summary: "A job was paid.",
    party: "covenant-floor::1220abcdefghijklmnopqrstuvwxyz",
  });
  assert.match(text, /paydesk-pay/);
  assert.doesNotMatch(text, /abcdefghijklmnopqrstuvwxyz/);
  assert.throws(() => renderAlert({ kind: "withdraw", summary: "no" }), /not allowed/);
});
