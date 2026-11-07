/* ============================================================
   EVORA — application logic
   Vanilla JS: rendering, search/filter, detail panel, countdown,
   form validation, localStorage passes, theme, toasts.
   ============================================================ */
"use strict";

/* ---------- Tiny helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtDate = (iso, opts = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) =>
  new Date(iso).toLocaleDateString("en-IN", opts);
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
const fmtPrice = (p) => (p === 0 ? "Free entry" : "₹" + p.toLocaleString("en-IN"));

/* ---------- Persistent state ---------- */
const store = {
  get passes() { try { return JSON.parse(localStorage.getItem("evora-passes")) || []; } catch { return []; } },
  set passes(v) { localStorage.setItem("evora-passes", JSON.stringify(v)); },
  get deltas() { try { return JSON.parse(localStorage.getItem("evora-deltas")) || {}; } catch { return {}; } },
  set deltas(v) { localStorage.setItem("evora-deltas", JSON.stringify(v)); },
  get theme() { return localStorage.getItem("evora-theme"); },
  set theme(v) { localStorage.setItem("evora-theme", v); },
};

const eventById = (id) => EVENTS.find((e) => e.id === id);
const seatsTaken = (e) => e.booked + (store.deltas[e.id] || 0);
const seatsLeft = (e) => Math.max(0, e.capacity - seatsTaken(e));
const sortedEvents = () => [...EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date));

/* ---------- Seeded RNG (art generator) ---------- */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = (s) => [...s].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 7);

/* ============================================================
   GENERATIVE EVENT ART
   Each event gets a deterministic SVG composition based on its
   category, drawn only from the brand palette.
   ============================================================ */
const ART_PALETTES = [
  { bg: "#D1FAE5", fg: "#064E3B", fg2: "#202A25" },   // mint ground
  { bg: "#EFE7D3", fg: "#064E3B", fg2: "#202A25" },   // deep cream ground
  { bg: "#B7E3CE", fg: "#04392B", fg2: "#202A25" },   // pale jade ground
  { bg: "#064E3B", fg: "#D1FAE5", fg2: "#FAF7F0" },   // emerald ground — occasional contrast
];

function artFor(event) {
  const rng = mulberry32(hashStr(event.id));
  const p = ART_PALETTES[Math.floor(rng() * ART_PALETTES.length)];
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const motif = MOTIFS[event.category] || MOTIFS._default;
  const inner = motif(rng, p, pick);
  return `<svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Artwork for ${esc(event.title)}">
    <rect width="480" height="300" fill="${p.bg}"/>${inner}
  </svg>`;
}

const MOTIFS = {
  /* Vinyl disc + tonearm — grooves, label, pivot at top-right */
  "Music": (rng, p) => {
    const cx = 168, cy = 158, R = 132;
    let s = "";
    for (let i = 0; i < 10; i++) {
      const r = 34 + i * 11 + rng() * 3;
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.fg}" stroke-width="2" opacity="${i % 3 === 0 ? .6 : .28}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="18" fill="${p.fg2}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${p.bg}"/>`;
    const px = cx + R + 58, py = 30;
    const tx = cx + R * .52, ty = cy - R * .6;
    s += `<line x1="${px}" y1="${py}" x2="${tx}" y2="${ty}" stroke="${p.fg2}" stroke-width="4.5" stroke-linecap="round"/>`;
    s += `<circle cx="${px}" cy="${py}" r="10" fill="${p.bg}" stroke="${p.fg2}" stroke-width="3.5"/>`;
    return s;
  },

  /* Circuit traces — right-angle routes over a quiet dot grid */
  "Technology": (rng, p) => {
    let s = "";
    for (let x = 36; x <= 444; x += 48)
      for (let y = 36; y <= 264; y += 48)
        s += `<circle cx="${x}" cy="${y}" r="2.6" fill="${p.fg}" opacity=".3"/>`;
    const lanes = rng() > .5 ? [70, 150, 230] : [105, 190, 250];
    lanes.forEach((y0, i) => {
      const x1 = 120 + i * 80 + rng() * 30;
      const y1 = y0 + (i % 2 === 0 ? 48 : -48);
      const x2 = Math.min(430, 320 + i * 45 + rng() * 50);
      s += `<path d="M0 ${y0} H${x1} V${y1} H${x2}" fill="none" stroke="${p.fg2}" stroke-width="3"/>`;
      s += `<circle cx="${x1}" cy="${y1}" r="7.5" fill="${p.bg}" stroke="${p.fg2}" stroke-width="3"/>`;
      s += `<circle cx="${x2}" cy="${y1}" r="9" fill="${p.fg}"/>`;
    });
    return s;
  },

  /* Bauhaus still-life — every shape fully inside the canvas */
  "Art & Design": (rng, p) => {
    let s = "";
    const cy = 140 + rng() * 30;
    s += `<circle cx="${95 + rng() * 40}" cy="${cy}" r="${52 + rng() * 18}" fill="${p.fg}"/>`;
    const scx = 255 + rng() * 60;
    s += `<path d="M${scx - 55} 262 A55 55 0 0 1 ${scx + 55} 262 Z" fill="${p.fg2}"/>`;
    s += `<path d="M335 22 A93 93 0 0 1 428 115 L335 115 Z" fill="${p.fg}" opacity=".85"/>`;
    const tx = 295 + rng() * 50, ty = 78 + rng() * 25;
    s += `<path d="M${tx} ${ty + 52} l34 0 l-17 -50 Z" fill="${p.fg2}"/>`;
    s += `<rect x="0" y="262" width="480" height="6" fill="${p.fg}" opacity=".6"/>`;
    return s;
  },

  /* Cloche on a table — solid dome, knob, rising steam, side glass */
  "Food & Drink": (rng, p) => {
    const bx = 140 + rng() * 120, ty = 236;
    let s = `<line x1="0" y1="${ty}" x2="480" y2="${ty}" stroke="${p.fg}" stroke-width="2.5" opacity=".65"/>`;
    s += `<path d="M${bx - 85} ${ty} A85 85 0 0 1 ${bx + 85} ${ty}" fill="${p.fg}"/>`;
    s += `<circle cx="${bx}" cy="${ty - 92}" r="8.5" fill="${p.fg2}"/>`;
    for (let i = -1; i <= 1; i++) {
      const sx = bx + i * 32;
      s += `<path d="M${sx} ${ty - 106} q9 -13 0 -26 q-9 -13 0 -26" fill="none" stroke="${p.fg2}" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`;
    }
    s += `<circle cx="${bx + 175}" cy="${ty - 26}" r="26" fill="none" stroke="${p.fg2}" stroke-width="3.5"/>`;
    return s;
  },

  /* Ascending bars + dotted trend line on a baseline */
  "Business": (rng, p) => {
    const n = 7, w = 480 / n, base = 258;
    let s = "";
    const tops = [];
    for (let i = 0; i < n; i++) {
      const h = 55 + i * 26 + rng() * 14;
      const x = i * w + w * .22;
      tops.push([x + w * .28, base - h]);
      s += `<rect x="${x}" y="${base - h}" width="${w * .56}" height="${h}" rx="4" fill="${i % 2 ? p.fg : p.fg2}" opacity="${.45 + i * .07}"/>`;
    }
    s += `<line x1="0" y1="${base}" x2="480" y2="${base}" stroke="${p.fg}" stroke-width="2.5" opacity=".5"/>`;
    s += `<polyline points="${tops.map((t) => t.join(",")).join(" ")}" fill="none" stroke="${p.fg}" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round" opacity=".9"/>`;
    return s;
  },

  /* Sun on the horizon, waves below, two gulls above */
  "Wellness": (rng, p) => {
    const hy = 184, sx = 150 + rng() * 160;
    let s = `<circle cx="${sx}" cy="${hy}" r="56" fill="${p.fg2}"/>`;
    s += `<rect x="0" y="${hy}" width="480" height="${300 - hy}" fill="${p.bg}"/>`;
    s += `<line x1="0" y1="${hy}" x2="480" y2="${hy}" stroke="${p.fg}" stroke-width="2.5"/>`;
    for (let i = 0; i < 4; i++) {
      const y = hy + 24 + i * 22;
      s += `<path d="M-10 ${y} q60 ${-9 - i} 120 0 t120 0 t120 0 t120 0" fill="none" stroke="${p.fg}" stroke-width="2.5" opacity="${.8 - i * .15}"/>`;
    }
    s += `<path d="M${sx - 105} ${hy - 95} q9 -9 18 0 q9 -9 18 0" fill="none" stroke="${p.fg}" stroke-width="2.5" stroke-linecap="round"/>`;
    s += `<path d="M${sx + 55} ${hy - 118} q7 -8 15 0 q7 -8 15 0" fill="none" stroke="${p.fg}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`;
    return s;
  },

  /* Track lanes + a ball on the center lane */
  "Sports & Fitness": (rng, p) => {
    let s = "";
    for (let i = 0; i < 6; i++) {
      const off = i * 88 - 30;
      s += `<path d="M${off} 300 L${off + 195} 0" stroke="${p.fg}" stroke-width="3" opacity="${.38 + (i % 2) * .24}"/>`;
    }
    const cx = 210 + rng() * 80, cy = 110 + rng() * 50;
    s += `<circle cx="${cx}" cy="${cy}" r="23" fill="${p.fg2}"/>`;
    s += `<path d="M${cx - 23} ${cy} a23 23 0 0 0 46 0" fill="none" stroke="${p.bg}" stroke-width="3"/>`;
    return s;
  },

  _default: (rng, p) => {
    let s = "";
    for (let i = 0; i < 5; i++)
      s += `<circle cx="${70 + rng() * 340}" cy="${60 + rng() * 180}" r="${15 + rng() * 45}" fill="none" stroke="${p.fg}" stroke-width="2.5" opacity=".6"/>`;
    return s;
  },
};

/* ============================================================
   RENDERING
   ============================================================ */
const ICONS = {
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M15.5 5.5a3.4 3.4 0 0 1 0 6.4M17.5 14.4c1.7.7 2.7 2.3 3 4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

function countdownHTML(iso, variant = "") {
  return `<div class="countdown ${variant}" data-countdown="${iso}">
    ${["days", "hrs", "min", "sec"].map((u) =>
      `<div class="countdown__cell"><div class="countdown__num" data-unit="${u}">—</div><div class="countdown__lbl">${u}</div></div>`).join("")}
  </div>`;
}

function seatsLabel(e) {
  const left = seatsLeft(e);
  if (left === 0) return `<span class="seats-left low">Sold out</span>`;
  if (left <= Math.ceil(e.capacity * .12)) return `<span class="seats-left low">${left} seats left</span>`;
  return `<span class="seats-left">${left} seats left</span>`;
}

/* ----- Hero ----- */
function renderHero() {
  const evs = sortedEvents().filter((e) => new Date(e.date) > new Date());
  const cities = new Set(EVENTS.map((e) => e.city));
  const openSeats = evs.reduce((n, e) => n + seatsLeft(e), 0);
  $("#statEvents").textContent = EVENTS.length;
  $("#statCities").textContent = cities.size;
  $("#statSeats").textContent = openSeats.toLocaleString("en-IN");

  const next = evs[0];
  $("#heroTicket").innerHTML = `
    <article class="ticket-hero" data-open="${next.id}" role="button" tabindex="0" aria-label="View ${esc(next.title)}">
      <div class="art">${artFor(next)}</div>
      <div class="ticket-hero__body">
        <p class="ticket-hero__next">Next gathering — ${esc(next.city)}</p>
        <h3 class="ticket-hero__title">${esc(next.title)}</h3>
        <p class="ticket-hero__meta">${fmtDate(next.date)} · ${fmtTime(next.date)} · ${esc(next.venue)}</p>
        ${countdownHTML(next.date)}
      </div>
    </article>`;
}

/* ----- Featured ----- */
function renderFeatured() {
  $("#featuredGrid").innerHTML = EVENTS.filter((e) => e.featured).map((e) => `
    <article class="feature-card reveal" data-open="${e.id}" role="button" tabindex="0" aria-label="View ${esc(e.title)}">
      <div class="art">${artFor(e)}</div>
      <div class="feature-card__body">
        <span class="tag" style="align-self:flex-start">${esc(e.category)}</span>
        <h3 class="feature-card__title">${esc(e.title)}</h3>
        <p class="feature-card__meta">
          <span>${fmtDate(e.date)}</span><span>${fmtTime(e.date)}</span>
          <span>${esc(e.venue)}, ${esc(e.city)}</span>
        </p>
        ${countdownHTML(e.date, "countdown--strip")}
        <p class="feature-card__desc">${esc(e.blurb)}</p>
        <div class="feature-card__foot">
          <span class="feature-card__price">${fmtPrice(e.price)} <small>/ person</small></span>
          ${seatsLabel(e)}
          <span class="event-card__cta" style="margin-left:auto">Details ${ICONS.arrow}</span>
        </div>
      </div>
    </article>`).join("");
}

/* ----- Filter chips ----- */
const filters = { q: "", cat: "All" };

function renderChips() {
  $("#categoryChips").innerHTML = CATEGORIES.map((c) =>
    `<button class="chip" role="option" data-cat="${esc(c)}" aria-selected="${filters.cat === c}">${esc(c)}</button>`).join("");
}

/* ----- Event grid ----- */
function eventMatches(e) {
  const catOk = filters.cat === "All" || e.category === filters.cat;
  if (!catOk) return false;
  const q = filters.q.trim().toLowerCase();
  if (!q) return true;
  return [e.title, e.venue, e.city, e.category, e.blurb].join(" ").toLowerCase().includes(q);
}

function renderGrid() {
  const list = sortedEvents().filter(eventMatches);
  const grid = $("#eventGrid");
  grid.innerHTML = list.map((e, i) => {
    const d = new Date(e.date);
    return `
    <article class="event-card card reveal" data-open="${e.id}" role="button" tabindex="0"
             aria-label="View ${esc(e.title)}" style="--i:${Math.min(i, 9)}">
      <div class="event-card__art">
        ${artFor(e)}
        <span class="tag">${esc(e.category)}</span>
        <span class="date-chip"><b>${d.getDate()}</b><span>${d.toLocaleDateString("en-IN", { month: "short" })}</span></span>
      </div>
      <div class="event-card__body">
        <h3 class="event-card__title">${esc(e.title)}</h3>
        <p class="event-card__venue">${ICONS.pin}${esc(e.venue)}, ${esc(e.city)}</p>
        <p class="event-card__desc">${esc(e.blurb)}</p>
        <div class="event-card__foot">
          <span class="event-card__price ${e.price === 0 ? "free" : ""}">${fmtPrice(e.price)}</span>
          ${seatsLabel(e)}
          <span class="event-card__cta">Details ${ICONS.arrow}</span>
        </div>
      </div>
    </article>`;
  }).join("");

  const total = EVENTS.length;
  $("#resultLine").textContent = list.length === total
    ? `Showing all ${total} gatherings`
    : `${list.length} of ${total} gatherings${filters.q ? ` · “${filters.q.trim()}”` : ""}${filters.cat !== "All" ? ` · ${filters.cat}` : ""}`;
  $("#emptyState").hidden = list.length !== 0;
  grid.hidden = list.length === 0;
  observeReveals(grid);
}

/* ----- Event select options ----- */
function renderEventOptions() {
  const sel = $("#fEvent");
  const cur = sel.value;
  sel.innerHTML = `<option value="">Choose a gathering…</option>` + sortedEvents().map((e) => {
    const left = seatsLeft(e);
    return `<option value="${e.id}" ${left === 0 ? "disabled" : ""}>
      ${esc(e.title)} — ${fmtDate(e.date, { day: "numeric", month: "short" })}${left === 0 ? " (sold out)" : ""}
    </option>`;
  }).join("");
  if (cur) sel.value = cur;
}

/* ============================================================
   DETAIL PANEL  (hash-routed: #/event/{id})
   ============================================================ */
const panel = $("#eventPanel"), backdrop = $("#backdrop"), panelBody = $("#panelBody");
let lastFocus = null, panelHideTimer = null;

function openPanel(id) {
  const e = eventById(id);
  if (!e) return;
  lastFocus = document.activeElement;

  const taken = seatsTaken(e), pct = Math.min(100, Math.round((taken / e.capacity) * 100));
  const left = seatsLeft(e);
  panelBody.innerHTML = `
    <div class="panel__art">${artFor(e)}<span class="tag">${esc(e.category)}</span></div>
    <div class="panel__content">
      <h2 class="panel__title" id="panelTitle">${esc(e.title)}</h2>
      ${countdownHTML(e.date, "countdown--strip")}
      <div class="panel__meta">
        <div class="meta-item">${ICONS.cal}<div><b>Date</b><span>${fmtDate(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div></div>
        <div class="meta-item">${ICONS.clock}<div><b>Doors</b><span>${fmtTime(e.date)}</span></div></div>
        <div class="meta-item">${ICONS.pin}<div><b>Venue</b><span>${esc(e.venue)}, ${esc(e.city)}</span></div></div>
        <div class="meta-item">${ICONS.users}<div><b>Entry</b><span>${fmtPrice(e.price)}</span></div></div>
      </div>
      <div class="panel__desc">${e.description.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      <div class="capacity">
        <div class="capacity__lbl"><span>${taken} of ${e.capacity} seats taken</span><span>${left > 0 ? `${left} left` : "full"}</span></div>
        <div class="capacity__track"><div class="capacity__fill ${pct >= 88 ? "nearly-full" : ""}" style="transform:scaleX(${pct / 100})"></div></div>
      </div>
      <div class="panel__cta">
        ${left > 0
          ? `<button class="btn btn--solid" id="panelRegister" type="button">Reserve a seat ${ICONS.arrow}</button>`
          : `<p class="soldout-note">This gathering is sold out — join the waitlist at the door</p>`}
        <button class="btn btn--ghost" id="panelBack" type="button">Back to events</button>
      </div>
    </div>`;

  clearTimeout(panelHideTimer);
  panel.hidden = false; backdrop.hidden = false;
  requestAnimationFrame(() => { panel.classList.add("is-open"); backdrop.classList.add("is-open"); });
  document.body.style.overflow = "hidden";
  panelBody.scrollTop = 0;
  $("#panelClose").focus();
  startCountdowns();

  $("#panelBack").onclick = closePanel;
  const reg = $("#panelRegister");
  if (reg) reg.onclick = () => { selectEventInForm(e.id); closePanel(); location.hash = "#register"; toast(`${e.title.split(":")[0]} pre-selected below`); };
}

function closePanel() {
  panel.classList.remove("is-open"); backdrop.classList.remove("is-open");
  document.body.style.overflow = "";
  panelHideTimer = setTimeout(() => { panel.hidden = true; backdrop.hidden = true; }, 340);
  if (location.hash.startsWith("#/event/")) {
    history.replaceState(null, "", "#events");
  }
  if (lastFocus) lastFocus.focus();
}

function route() {
  const m = location.hash.match(/^#\/event\/([\w-]+)/);
  if (m) openPanel(m[1]);
  else if (panel.classList.contains("is-open")) closePanel();
}

/* ============================================================
   COUNTDOWN ENGINE  — one interval for all [data-countdown]
   ============================================================ */
let cdTimer = null;
function startCountdowns() {
  const tick = () => {
    let live = false;
    $$("[data-countdown]").forEach((el) => {
      const diff = new Date(el.dataset.countdown) - Date.now();
      if (diff <= 0) {
        el.innerHTML = `<div class="countdown__cell"><div class="countdown__num">Now</div><div class="countdown__lbl">happening</div></div>`;
        return;
      }
      live = true;
      const v = {
        days: Math.floor(diff / 864e5),
        hrs: Math.floor(diff / 36e5) % 24,
        min: Math.floor(diff / 6e4) % 60,
        sec: Math.floor(diff / 1e3) % 60,
      };
      $$("[data-unit]", el).forEach((c) => { c.textContent = String(v[c.dataset.unit]).padStart(2, "0"); });
    });
    if (!live && cdTimer) { clearInterval(cdTimer); cdTimer = null; }
  };
  tick();
  if (!cdTimer) cdTimer = setInterval(tick, 1000);
}

/* ============================================================
   REGISTRATION FORM
   ============================================================ */
const form = $("#registerForm");

const rules = {
  name: (v) => {
    v = v.trim();
    if (!v) return "Please tell us your name";
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'.\- ]{2,60}$/.test(v)) return "Letters, spaces and . ' - only (2–60 chars)";
    return "";
  },
  email: (v) => {
    v = v.trim();
    if (!v) return "An email is needed for your pass";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "That email doesn’t look right";
    return "";
  },
  phone: (v) => {
    v = v.trim();
    if (!v) return "A phone number is required";
    if (!/^\+?\d{7,15}$/.test(v.replace(/[\s\-()]/g, ""))) return "7–15 digits, + allowed up front";
    return "";
  },
  event: (v) => {
    if (!v) return "Choose a gathering to attend";
    const e = eventById(v);
    if (!e) return "Unknown event";
    if (seatsLeft(e) <= 0) return "That event just sold out — pick another";
    return "";
  },
  seats: (v, eId) => {
    const e = eventById(eId);
    if (e && +v > seatsLeft(e)) return `Only ${seatsLeft(e)} seat${seatsLeft(e) === 1 ? "" : "s"} remain.`;
    return "";
  },
};

const fieldMap = {
  name: [$("#fName"), $("#errName")],
  email: [$("#fEmail"), $("#errEmail")],
  phone: [$("#fPhone"), $("#errPhone")],
  event: [$("#fEvent"), $("#errEvent")],
  seats: [$("#fSeats"), $("#errSeats")],
};

function validate(key, quiet = false) {
  const [input, errEl] = fieldMap[key];
  const msg = rules[key](input.value, $("#fEvent").value);
  input.setAttribute("aria-invalid", String(!!msg));
  if (!quiet) {
    errEl.hidden = !msg;
    errEl.textContent = msg;
  }
  return !msg;
}

function validateAll() {
  const order = ["name", "email", "phone", "event", "seats"];
  const bad = order.filter((k) => !validate(k));
  if (bad.length) {
    fieldMap[bad[0]][0].focus();
    form.classList.remove("shake");
    void form.offsetWidth;               /* restart animation */
    form.classList.add("shake");
  }
  return bad.length === 0;
}

function selectEventInForm(id) {
  renderEventOptions();
  $("#fEvent").value = id;
  validate("event");
}

function makeCode() {
  return "EVR-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function handleSubmit(ev) {
  ev.preventDefault();
  if (!validateAll()) return;

  const name = $("#fName").value.trim(), email = $("#fEmail").value.trim().toLowerCase();
  const eId = $("#fEvent").value, seats = +$("#fSeats").value;
  const e = eventById(eId);

  /* one registration per event per email */
  const dup = store.passes.find((p) => p.eventId === eId && p.email === email);
  if (dup) {
    const [, errEl] = fieldMap.email;
    errEl.hidden = false;
    errEl.textContent = `You already hold a pass for this event (${dup.code})`;
    $("#fEmail").setAttribute("aria-invalid", "true");
    $("#fEmail").focus();
    return;
  }

  const pass = {
    code: makeCode(), eventId: eId, name, email,
    phone: $("#fPhone").value.trim(), seats,
    ts: Date.now(),
  };
  store.passes = [...store.passes, pass];
  store.deltas = { ...store.deltas, [eId]: (store.deltas[eId] || 0) + seats };

  /* confirmation view */
  $("#confirmText").textContent =
    `${pass.name}, ${seats} seat${seats > 1 ? "s are" : " is"} held for ${e.title} — ${fmtDate(e.date)} at ${fmtTime(e.date)}, ${e.venue}, ${e.city}`;
  $("#confirmCode").textContent = pass.code;
  form.hidden = true;
  $("#confirmCard").hidden = false;
  $("#confirmCard").classList.add("reveal", "in");

  toast(`Pass confirmed — ${pass.code}`);
  renderPasses(); renderGrid(); renderFeatured(); renderHero(); renderEventOptions();
}

/* ============================================================
   MY PASSES
   ============================================================ */
function renderPasses() {
  const passes = store.passes;
  const grid = $("#passGrid");
  $("#passEmpty").hidden = passes.length > 0;
  grid.innerHTML = passes.map((p) => {
    const e = eventById(p.eventId);
    if (!e) return "";
    const d = new Date(e.date);
    return `
    <article class="pass reveal">
      <div class="pass__stub">
        <b>${String(d.getDate()).padStart(2, "0")}</b>
        <span>${d.toLocaleDateString("en-IN", { month: "short" })}</span>
      </div>
      <div class="pass__main">
        <h3 class="pass__title">${esc(e.title)}</h3>
        <p class="pass__meta">${fmtTime(e.date)} · ${esc(e.venue)}, ${esc(e.city)}</p>
        <p class="pass__name"><b>${esc(p.name)}</b> · ${p.seats} seat${p.seats > 1 ? "s" : ""}</p>
        <div class="pass__foot">
          <div>
            <div class="barcode" aria-hidden="true"></div>
            <div class="pass__code">${p.code}</div>
          </div>
          <button class="pass__cancel" data-cancel="${p.code}" type="button">Cancel pass</button>
        </div>
      </div>
    </article>`;
  }).join("");
  observeReveals(grid);
}

function cancelPass(code, btn) {
  if (!btn.dataset.armed) {
    btn.dataset.armed = "1";
    btn.textContent = "Tap again to confirm";
    setTimeout(() => { delete btn.dataset.armed; btn.textContent = "Cancel pass"; }, 2600);
    return;
  }
  const pass = store.passes.find((p) => p.code === code);
  if (!pass) return;
  store.passes = store.passes.filter((p) => p.code !== code);
  store.deltas = { ...store.deltas, [pass.eventId]: Math.max(0, (store.deltas[pass.eventId] || 0) - pass.seats) };
  toast(`Pass ${code} cancelled`);
  renderPasses(); renderGrid(); renderFeatured(); renderHero(); renderEventOptions();
}

/* ============================================================
   TOASTS
   ============================================================ */
function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${ICONS.check}<span>${esc(msg)}</span>`;
  $("#toasts").appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 280);
  }, 3200);
}

/* ============================================================
   THEME
   ============================================================ */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $("#themeToggle").setAttribute("aria-pressed", String(t === "dark"));
}
function initTheme() {
  const saved = store.theme;
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

/* ============================================================
   SCROLL / NAV / REVEALS
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); }
  });
}, { threshold: .12, rootMargin: "0px 0px -6% 0px" });

function observeReveals(ctx = document) {
  $$(".reveal:not(.in)", ctx).forEach((el) => revealObserver.observe(el));
}

function initNav() {
  const toggle = $("#navToggle"), links = $("#navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
  });
  const navAnchors = $$("#navLinks a");
  addEventListener("scroll", () => {
    $(".site-header").classList.toggle("is-scrolled", scrollY > 8);
    if (scrollY < 160) navAnchors.forEach((a) => a.classList.remove("is-active"));
  }, { passive: true });

  /* active section highlight */
  const sections = ["events", "featured", "register", "passes"].map((id) => $("#" + id));
  const secObs = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-30% 0px -55% 0px" });
  sections.forEach((s) => s && secObs.observe(s));
}

/* ============================================================
   EVENTS / WIRING
   ============================================================ */
function init() {
  initTheme();
  renderHero();
  renderFeatured();
  renderChips();
  renderGrid();
  renderEventOptions();
  renderPasses();
  initNav();
  observeReveals();
  startCountdowns();
  route();

  /* card / featured / hero open panel (delegated) */
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) { location.hash = "#/event/" + opener.dataset.open; return; }
    const chip = e.target.closest(".chip");
    if (chip) {
      filters.cat = chip.dataset.cat;
      renderChips(); renderGrid();
      return;
    }
    const cancel = e.target.closest("[data-cancel]");
    if (cancel) cancelPass(cancel.dataset.cancel, cancel);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("[data-open]")) location.hash = "#/event/" + e.target.dataset.open;
    if (e.key === "Escape") {
      if (panel.classList.contains("is-open")) closePanel();
      const links = $("#navLinks");
      if (links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        $("#navToggle").setAttribute("aria-expanded", "false");
      }
    }
  });

  addEventListener("hashchange", route);
  backdrop.addEventListener("click", closePanel);
  $("#panelClose").addEventListener("click", closePanel);

  /* search */
  let debounce;
  $("#searchInput").addEventListener("input", (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { filters.q = e.target.value; renderGrid(); }, 160);
  });
  $("#clearFilters").addEventListener("click", () => {
    filters.q = ""; filters.cat = "All";
    $("#searchInput").value = "";
    renderChips(); renderGrid();
  });

  /* theme */
  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next); store.theme = next;
  });

  /* form: validate on blur/input-after-touch */
  Object.entries(fieldMap).forEach(([key, [input]]) => {
    input.addEventListener("blur", () => input.dataset.touched && validate(key));
    input.addEventListener("input", () => { input.dataset.touched = "1"; validate(key); });
    input.addEventListener("change", () => { input.dataset.touched = "1"; validate(key); });
  });
  form.addEventListener("submit", handleSubmit);

  /* confirmation actions */
  $("#registerAnother").addEventListener("click", () => {
    form.reset();
    Object.values(fieldMap).forEach(([input, err]) => {
      input.removeAttribute("aria-invalid"); delete input.dataset.touched;
      err.hidden = true;
    });
    $("#confirmCard").hidden = true;
    form.hidden = false;
    $("#fName").focus();
  });
  $("#viewPassBtn").addEventListener("click", () => {
    $("#confirmCard").hidden = true;
    form.hidden = false; form.reset();
  });
}

document.addEventListener("DOMContentLoaded", init);
