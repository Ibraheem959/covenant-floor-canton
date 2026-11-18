// Alert-only. This process has no ledger signing key and no admin authority.
// It publishes public announcements. It does not withdraw, pay, or deploy.

const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
const chat = process.env.TELEGRAM_CHAT_ID ?? "";
const topic = process.env.TELEGRAM_FLOOR_TOPIC ?? "";
const ledger = process.env.CANTON_LEDGER_URL ?? "";

const ALLOWED = new Set([
  "game",
  "win",
  "loss",
  "competition",
  "paydesk-open",
  "paydesk-submit",
  "paydesk-pay",
  "paydesk-return",
  "token",
  "system",
]);

export function renderAlert(event) {
  if (!ALLOWED.has(event.kind)) throw new Error("That alert is not allowed.");
  const party = typeof event.party === "string" ? event.party.slice(0, 12) : "";
  const lines = [
    `Covenant Floor · ${event.kind}`,
    event.summary ?? "",
    party ? `Party ${party}…` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

async function send(text) {
  if (!token || !chat) {
    console.log("Telegram is not configured. No message was sent.");
    return;
  }
  const body = { chat_id: chat, text, disable_web_page_preview: true };
  if (topic) body.message_thread_id = Number(topic);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Telegram refused the alert (${response.status}).`);
}

async function main() {
  if (!ledger) {
    console.log("Canton ledger is not configured. The bot is idle and will not invent alerts.");
    return;
  }
  console.log("Canton ledger is configured, but no public event indexer is deployed. The bot stays idle.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
