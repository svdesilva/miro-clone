# Collaborative whiteboard (real-time)

I built this to sharpen how I **scope collaboration products** end-to-end: crisp problem framing, explicit tradeoffs, and a codebase that is pleasant for engineers to extend.

If you are evaluating how I work with eng partners, start with **Tradeoffs** and the docs in `/docs`.

---

## Executive summary

**Problem:** Remote and hybrid teams still lose alignment on visual work. Screensharing is broadcast-only; async screenshots go stale; “everyone edits a file” breaks down under concurrency.

**What shipped here:** Authenticated users can create boards, collaborate in real time with presence, and edit a shared canvas (vector tooling, undo/redo). The focus is **reliable shared state** and **identifiable participants**, not feature parity with mature whiteboard incumbents.

**What is intentionally not in v1:** Enterprise admin, compliance packaging, mobile-native clients, deep enterprise IdP edge cases — see [`ROADMAP.md`](ROADMAP.md).

**Stack:** Next.js, Clerk (identity), Liveblocks (rooms + presence), Fabric.js (canvas), Zustand, Tailwind + shadcn/ui.

---

## Demo

Hosted demo: **coming soon** (Vercel preview + production split). Until then, local run is the fastest way to evaluate behavior.

If you want a guided walkthrough, open an issue with your use case; I will prioritize a short Loom-style recording once hosting is wired.

---

## Users and jobs-to-be-done

| User | Job |
|------|-----|
| Facilitator | Spin up a board quickly, invite collaborators, sketch structure live. |
| Contributor | Join without install friction; trust edits reconcile under concurrency. |

---

## Architecture (high level)

```
Browser (Next.js)
  ├── Clerk — session + identity
  ├── Liveblocks — room, presence, shared document sync
  └── Fabric.js — canvas scene graph + tools
```

Identity stays in Clerk; **ephemeral collaborative state** is coordinated through Liveblocks. That separation keeps reviews straightforward: auth and billing-adjacent concerns do not get entangled with canvas CRDT-ish behavior.

---

## Tradeoffs (non-exhaustive)

| Decision | Rationale | Cost |
|----------|-----------|------|
| **Liveblocks vs. self-hosted WS + CRDT/OT** | Faster path to reliable presence and conflict handling at my current stage of the build. | Vendor lock-in; cost at scale; data residency needs explicit validation for regulated customers. |
| **Clerk vs. custom OAuth** | Smaller auth surface area for a focused reference implementation. | Less flexibility for exotic IdP flows without leaning on Clerk capabilities. |
| **Fabric.js vs. DOM/SVG-only** | Strong object-level editing model and hit testing for tools work. | Bundle weight; advanced scene operations take learning time. |
| **Zustand vs. Redux** | Less boilerplate for UI-local state that is not the collaborative source of truth. | Team discipline required to avoid duplicating Liveblocks state locally. |

---

## Security and operations

- **Secrets:** never commit keys; use `.env.local` (gitignored) and CI secrets for deploy targets.
- **Environment:** start from `.env.example` when present; document new variables when they are introduced.
- **Dependencies:** run `npm audit` before meaningful releases; treat major upgrades as scheduled risk.

---

## Provenance

This repository is maintained at `github.com/svdesilva/miro-clone`. Older bootstrap docs pointed at a different clone URL during early import; **this remote is canonical**. The narrative and tradeoff notes here are maintained alongside the code I ship in this repo.

```bash
git clone https://github.com/svdesilva/miro-clone.git
cd miro-clone
```

---

## Local development

### Prerequisites

- Node.js **20 LTS** (18+ may work, but I develop on 20)
- Clerk + Liveblocks accounts (free tiers are fine for local work)

### Setup

```bash
npm install
cp .env.example .env.local   # if present; otherwise follow dashboard docs
```

Fill `CLERK_*` and Liveblocks keys from each vendor dashboard, then:

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Features (current)

- Sign up / sign in (Clerk)
- Board CRUD
- Real-time canvas editing + live cursors
- Drawing tools (shapes, text, freehand) — see code for the exact tool matrix
- Undo / redo

---

## Docs in this repo

- [`ROADMAP.md`](ROADMAP.md)
- [`docs/metrics-and-outcomes.md`](docs/metrics-and-outcomes.md)
- [`docs/release-checklist.md`](docs/release-checklist.md)

Cross-repo ADRs that are not code-bound live in [**decisions**](https://github.com/svdesilva/decisions).

---

## License

All rights reserved until a `LICENSE` file is added to the default branch.
