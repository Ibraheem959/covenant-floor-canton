import { useState } from "react";
import { connectCanton } from "./wallet";
import { Menu, Wallet, X } from "lucide-react";
import {
  DiceStage,
  KenoStage,
  Lobby,
  LotteryVisual,
  MineStage,
  PlinkoStage,
  RouletteStage,
  SlotsStage,
} from "./stage";

const NAV = [
  ["lottery", "Lottery"],
  ["desk", "Pay desk"],
  ["competition", "Competition"],
  ["dice", "Dice"],
  ["roulette", "Roulette"],
  ["slots", "Slots"],
  ["plinko", "Plinko"],
  ["keno", "Keno"],
  ["baccarat", "Baccarat"],
  ["hi-lo", "Hi-Lo"],
  ["mines", "Mines"],
  ["blackjack", "Blackjack"],
  ["poker", "Poker"],
  ["duel", "Heads-Up"],
  ["table", "Table"],
  ["wallet", "Wallet"],
  ["stakes", "Stakes"],
  ["tithe", "Tithe"],
  ["pilgrimage", "Pilgrimage"],
  ["house", "House"],
] as const;

type PageId = (typeof NAV)[number][0];

const RANDOM = new Set<PageId>(["lottery", "dice", "roulette", "slots", "plinko", "keno", "baccarat", "hi-lo", "mines", "blackjack", "poker", "duel", "table", "competition"]);

const COPY: Record<PageId, { eyebrow: string; title: string; copy: string }> = {
  lottery: { eyebrow: "Shared pool", title: "The Lottery", copy: "A draw needs a verified Canton randomness source. None is configured, so this round is not live." },
  desk: { eyebrow: "Work · not a bet", title: "Pay desk", copy: "A reward is locked from the poster's own holding. It is not house liquidity. The contract is written and tested. It is not deployed." },
  competition: { eyebrow: "Play any game", title: "Competition", copy: "A race cannot lock a prize until the token and the tables are deployed." },
  dice: { eyebrow: "Two dice", title: "Dice", copy: "Under 7 and over 7 pay 2.30×. Exact 7 pays 5.76×. Settlement stays off until randomness is verified." },
  roulette: { eyebrow: "0 to 36", title: "Roulette", copy: "A straight pays 36×. Outside bets pay 2×. A dozen pays 3×. The wheel is not live." },
  slots: { eyebrow: "Three reels", title: "Slots", copy: "The reel pays match the Supra floor. The reels do not spin for money." },
  plinko: { eyebrow: "Eight drops", title: "Plinko", copy: "Eight even steps. The ball is not dropped on mainnet." },
  keno: { eyebrow: "10 of 40", title: "Keno", copy: "Pick 1 to 10 numbers. The draw is not live." },
  baccarat: { eyebrow: "Player, banker, tie", title: "Baccarat", copy: "Player and banker pay 2×. A tie pays 9×. The shoe is not live." },
  "hi-lo": { eyebrow: "One rank at a time", title: "Hi-Lo", copy: "A hit multiplies by 1.9. The next card is not drawn." },
  mines: { eyebrow: "25 tiles · 3 mines", title: "Mines", copy: "Tiles stay closed. A mine layout would be visible if it were chosen in the browser." },
  blackjack: { eyebrow: "Dealer stands on 17", title: "Blackjack", copy: "A natural pays 3 to 2. The shoe is not live." },
  poker: { eyebrow: "You versus the house", title: "Poker", copy: "Ante, then call exactly twice the ante, or fold. The house needs a pair of fours. The deal is not live." },
  duel: { eyebrow: "Two parties", title: "Heads-Up", copy: "No-limit hold'em between two parties. Not deployed." },
  table: { eyebrow: "Two seats, one shoe", title: "Table", copy: "Both parties put up an even wager. Not deployed." },
  wallet: { eyebrow: "Your party", title: "Wallet", copy: "Holdings are Canton contracts your party can see. Nothing is shown until a wallet returns them." },
  stakes: { eyebrow: "Not configured", title: "Stakes", copy: "A Canton lock is a contract with a controller and an unlock time. No stake contract is deployed." },
  tithe: { eyebrow: "Not configured", title: "Tithe", copy: "Scroll packs are not deployed on Canton." },
  pilgrimage: { eyebrow: "Not configured", title: "Pilgrimage", copy: "Faith locks are not deployed on Canton." },
  house: { eyebrow: "Application parties", title: "House", copy: "House funds, player holdings, prizes, stake rewards, and Pay Desk escrow are separate. No pool is funded." },
};

const ROWS = [
  ["Network", "Canton mainnet intended"],
  ["Contracts", "Not deployed"],
  ["Application party", "Not created"],
  ["Funding party", "Not created"],
  ["Token", "Not deployed"],
  ["House balance", "Not deployed"],
  ["Your vault", "Not connected"],
  ["Randomness", "Not configured"],
  ["Telegram", "Not configured"],
];

export function Floor() {
  const [page, setPage] = useState<PageId>("lottery");
  const [open, setOpen] = useState(false);
  const [party, setParty] = useState("");
  const [note, setNote] = useState("");
  const copy = COPY[page];

  async function connect() {
    setNote("");
    try {
      const partyId = await connectCanton();
      setParty(partyId);
      setNote("Connected. This party has no deployed floor contracts.");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "The wallet did not connect.");
    }
  }

  return (
    <div className="app-noise app-frame min-h-[100dvh] text-parchment">
      <div className="flex min-h-[100dvh]">
        <aside className="app-sidebar hidden w-[224px] shrink-0 flex-col border-r border-line px-4 py-5 lg:flex">
          <Brand />
          <div className="mt-8 px-3 text-[10px] font-extrabold tracking-[.22em] text-muted uppercase">Play</div>
          <Nav page={page} onPick={setPage} />
          <p className="mt-auto border-t border-line px-3 pt-4 text-xs text-muted">Canton · mainnet not deployed</p>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="app-header sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line px-4 backdrop-blur-xl sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" className="icon-button grid place-items-center lg:hidden" aria-label="Open navigation" onClick={() => setOpen((v) => !v)}>
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="lg:hidden"><Brand compact /></div>
              <div className="hidden items-center gap-2 text-[11px] tracking-[.08em] text-muted sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                CANTON <span className="opacity-40">/</span> NOT DEPLOYED
              </div>
            </div>
            <button type="button" onClick={() => void connect()} className="wallet-button">
              <Wallet size={15} aria-hidden />
              <span>{party ? short(party) : "Connect wallet"}</span>
            </button>
          </header>
          {open ? <div className="border-b border-line p-3 lg:hidden"><Nav page={page} onPick={(id) => { setPage(id); setOpen(false); }} /></div> : null}
          <div className="mx-auto grid max-w-[1480px] items-start gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
            <section className="grid min-w-0 gap-4">
              <p className="text-[11px] font-bold tracking-[.21em] text-muted uppercase">{copy.eyebrow}</p>
              <div className="page-heading flex items-center justify-between gap-4">
                <div>
                  <h1>{copy.title}</h1>
                  <p>{copy.copy}</p>
                </div>
                <div className="heading-mark hidden sm:grid">F<i /></div>
              </div>
              {note ? <p className="text-sm text-muted">{note}</p> : null}
              <Body page={page} onOpen={setPage} />
            </section>
            <aside className="right-rail overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4">
                <div>
                  <p className="text-[9px] tracking-[.16em] text-muted uppercase">Floor</p>
                  <h2 className="font-display text-xl">Canton</h2>
                </div>
                <span className="rounded-full border border-line px-2 py-1 text-[9px] text-muted">NOT LIVE</span>
              </div>
              <div className="mt-3 border-t border-line">
                {ROWS.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 text-sm">
                    <span className="text-muted">{label}</span>
                    <span className="text-right">{value}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function Body({ page, onOpen }: { page: PageId; onOpen: (id: PageId) => void }) {
  if (page === "lottery") {
    return (
      <div className="grid gap-4">
        <LotteryVisual round="Not deployed" pot="Not deployed" />
        <Lobby onOpen={(id) => onOpen(id as PageId)} />
      </div>
    );
  }
  if (page === "desk") return <Desk />;
  if (page === "wallet" || page === "house" || page === "stakes" || page === "tithe" || page === "pilgrimage") return <Status page={page} />;
  return <Closed page={page} />;
}

function Closed({ page }: { page: PageId }) {
  const random = RANDOM.has(page);
  return (
    <div className="grid gap-4">
      <StageFor page={page} />
      <section className="rounded-2xl border border-line bg-panel/70 px-4 py-4">
        <p className="text-[10px] tracking-[.14em] text-muted uppercase">{random ? "Randomness" : "Status"}</p>
        <p className="mt-2 text-lg">{random ? "Not configured" : "Not deployed"}</p>
        <p className="mt-2 max-w-xl text-sm text-muted">
          {random
            ? "Canton has no verified public dVRF. This table will not accept a wager, and the browser will not invent a result."
            : "This contract is not on Canton mainnet."}
        </p>
        <button type="button" className="action-button mt-4" disabled>Not live</button>
      </section>
    </div>
  );
}

function StageFor({ page }: { page: PageId }) {
  if (page === "dice") return <DiceStage sum={null} rolling={false} call="Not live" />;
  if (page === "roulette") return <RouletteStage pocket={null} rolling={false} />;
  if (page === "slots") return <SlotsStage reels={["—", "—", "—"]} rolling={false} />;
  if (page === "plinko") return <PlinkoStage bucket={-1} rolling={false} />;
  if (page === "keno") return <KenoStage picks={[]} />;
  if (page === "mines") return <MineStage revealed={[]} alive={false} onReveal={() => undefined} />;
  return null;
}

function Desk() {
  return (
    <div className="grid gap-3">
      {[
        ["Post", "The poster locks a reward from their own holding. The brief cannot be edited."],
        ["Submit", "The first other party to submit is the only one who can be paid."],
        ["Review", "The poster has 48 hours to pay, or to return the reward with a written reason."],
        ["Silence", "After 48 hours anyone may close the job and pay the worker."],
        ["Cancel", "The poster can take the reward back only while nobody has submitted."],
        ["Capacity", "The active board holds 24 jobs. Finished jobs leave when a new one needs the room."],
      ].map(([title, copy]) => (
        <article key={title} className="rounded-2xl border border-line bg-panel/70 px-4 py-3">
          <h2 className="font-display text-xl">{title}</h2>
          <p className="text-sm text-muted">{copy}</p>
        </article>
      ))}
      <p className="text-sm text-muted">Contract: Not deployed. Tests of these rules: 9 passed, off ledger.</p>
    </div>
  );
}

function Status({ page }: { page: PageId }) {
  const lines: Record<string, string[]> = {
    wallet: ["Party: not connected", "Canton Coin: unavailable until a wallet is connected", "Application token: Not deployed", "Vault: Not deployed"],
    house: ["House pool: Not deployed", "Player holdings stay with the player", "Pay Desk escrow is a separate contract", "A house move needs two application parties and cannot name a player holding"],
    stakes: ["Stake contract: Not deployed", "Weight: Not deployed", "Rewards: Not deployed"],
    tithe: ["Pack contract: Not deployed"],
    pilgrimage: ["Lock contract: Not deployed", "Faith: Not deployed"],
  };
  return (
    <div className="grid gap-2">
      {(lines[page] ?? ["Not deployed"]).map((line) => (
        <p key={line} className="rounded-xl border border-line px-4 py-3 text-sm">{line}</p>
      ))}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "gap-2" : ""}`}>
      <div className="brand-emblem">F</div>
      <div>
        <strong>FELT</strong>
        <small>CANTON · NOT DEPLOYED</small>
      </div>
    </div>
  );
}

function Nav({ page, onPick }: { page: PageId; onPick: (id: PageId) => void }) {
  return (
    <nav className="mt-3 grid grid-cols-2 gap-1 lg:grid-cols-1">
      {NAV.map(([id, label]) => (
        <button key={id} type="button" onClick={() => onPick(id)} className={`nav-link ${page === id ? "nav-link-active" : ""}`}>
          {label}
        </button>
      ))}
    </nav>
  );
}

function short(value: string) {
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-4)}` : value;
}
