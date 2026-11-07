# Evora — A Curated Event Atlas

A responsive event-management website built with **HTML5, CSS3 and vanilla JavaScript** — no frameworks, no build step. Visitors browse a curated season of gatherings across eight Indian cities, search and filter by category, view event details, and register for seats with locally-stored confirmation passes.

## Features

- **Browse & search** — a featured row plus a full grid of 12 events; debounced live search and category filters with a result counter and empty state
- **Event details** — hash-routed detail panel (`#/event/<id>`) with full description, meta, live countdown and a seat-capacity indicator
- **Registration** — validated form (name, email, phone, event, seats) with inline errors, duplicate-registration detection and seat-availability checks
- **Passes** — confirmed registrations render as ticket stubs with generated pass codes; cancelling a pass restores its seats
- **Dark / light theme** — toggle persisted to `localStorage`, initialised from `prefers-color-scheme`
- **Responsive & accessible** — mobile-first layout, collapsible nav, keyboard-operable cards, `aria-live` status regions, visible focus rings, `prefers-reduced-motion` support

## Design

- **Palette** — Emerald `#064E3B`, Mint `#D1FAE5`, Cream `#FAF7F0`, Charcoal `#202A25`, exposed as semantic CSS custom properties
- **Typography** — Fraunces (display serif) + Instrument Sans (interface)
- **Artwork** — each event's cover is a deterministic SVG composition seeded by its id, with a motif per category (vinyl for music, circuits for tech, bauhaus for art). No external images — nothing ever 404s

## Project structure

```
├── index.html      # Semantic markup
├── css/style.css   # Design tokens, themes, components, motion
├── js/data.js      # Event dataset
├── js/app.js       # Rendering, filters, routing, validation, storage
└── favicon.svg
```

## Running locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Deployment

Static site — deploy as-is on GitHub Pages, Netlify or Vercel. No build command or environment variables required.

## Implementation notes

- Registrations persist in `localStorage` under `evora-passes`, seat deltas under `evora-deltas`, theme under `evora-theme`
- Detail panels open via `hashchange` routing; Escape, backdrop click and the close button all exit cleanly
- Form validation uses a per-field rule map (`rules` in `js/app.js`), validated on input after first touch and on submit

---

© MMXXVI Evora Gatherings
