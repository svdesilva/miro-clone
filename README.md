# Collaborative whiteboard (real-time)

Production-minded **real-time collaborative canvas** with authentication, organization of boards, and concurrent editing. Intended as a **reference implementation** for how I scope platform product work: clear problem statement, explicit tradeoffs, and operable local setup.

---

## Executive summary

**Problem:** Teams need a low-friction surface to align visually in remote or hybrid workflows, with **consistent shared state** and **identifiable participants**.

**Product scope (this repo):** Authenticated users can create and manage boards, join a shared session, see collaborator presence, and edit vector canvas content with undo/redo. Out of scope for v1 is enterprise admin, compliance packaging, and mobile-native clients — documented under [Roadmap](#roadmap).

**Technical approach:** Next.js application, Clerk for identity, Liveblocks for realtime rooms and presence, Fabric.js for canvas manipulation, Zustand for client state, Tailwind and shadcn/ui for UI.

---

## Users and primary jobs-to-be-done

| User | Job |
|------|-----|
| Facilitator | Spin up a board quickly, invite collaborators, sketch structure live. |
| Contributor | Join an existing board without install friction; trust that edits reconcile. |

---

## Architecture (high level)

```
Browser (Next.js)
  ├── Clerk — session, user identity
  ├── Liveblocks — room, presence, shared document sync
  └── Fabric.js — canvas scene graph, drawing tools
```

Data flows are **explicitly split**: identity and billing-adjacent concerns stay in Clerk; **ephemeral collaborative state** is coordinated through Liveblocks. That separation keeps the security story reviewable under standard SaaS patterns.

---

## Tradeoffs (non-exhaustive)

| Decision | Rationale | Cost |
|----------|-----------|------|
| **Liveblocks vs. self-hosted WebSocket + CRDT/OT** | Faster time-to-reliable presence and conflict handling; vendor operates scale and protocol edge cases. | Vendor lock-in; cost at scale; data residency must be validated for regulated customers. |
| **Clerk vs. custom OAuth** | Reduces auth surface area and session edge cases for a reference app. | Less flexibility for exotic IdP flows without Clerk features. |
| **Fabric.js vs. DOM/SVG-only** | Mature model for object-level canvas editing and hit testing. | Bundle weight and learning curve for advanced scene operations. |
| **Zustand vs. Redux** | Lower boilerplate for UI-local state that is not the collaborative source of truth. | Team conventions must still avoid duplicating Liveblocks state locally. |

---

## Security and operations

- **Secrets:** Never commit API keys. Use `.env.local` (gitignored) and CI secrets for deployment.
- **Environment:** Copy from `.env.example` when present; document every variable in this README or in `docs/` as the project matures.
- **Dependencies:** Run `npm audit` before releases; pin major upgrades behind review.

---

## Provenance

This repository is maintained at `github.com/svdesilva/miro-clone`. Earlier documentation referenced a different clone URL during import; **this remote is canonical**. Product framing, tradeoff analysis, and operational notes in this README are authored for this repository.

Canonical clone:

```bash
git clone https://github.com/svdesilva/miro-clone.git
cd miro-clone
```

---

## Local development

### Prerequisites

- Node.js **20 LTS** or newer (18+ minimum if pinned by policy)
- [Clerk](https://clerk.com) application (API keys)
- [Liveblocks](https://liveblocks.io) project (API keys)

### Setup

```bash
npm install
cp .env.example .env.local   # if .env.example exists; otherwise create from dashboard docs
```

Configure Clerk and Liveblocks keys in `.env.local` per each vendor’s dashboard.

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Features (current)

- Sign up / sign in (Clerk)
- Board CRUD (create, rename, delete)
- Real-time canvas editing with live cursors
- Drawing tools (shapes, text, freehand) — see codebase for exact tool matrix
- Undo / redo

---

## Roadmap (honest)

1. **Hosted demo** with environment separation (preview vs. production).
2. **CI:** lint, typecheck, and tests on every PR.
3. **Observability:** structured client errors and basic server logging for auth failures and room edge cases.
4. **Evaluation hooks** (if extended with AI features): tracing, content policy, and offline eval datasets — *only when there is a defined product requirement.*

---

## Repository metadata (for maintainers)

Suggested GitHub **Topics:** `nextjs`, `typescript`, `real-time`, `collaboration`, `liveblocks`, `clerk`, `canvas`, `fabricjs`, `product-management`

Suggested **About → Website:** deployed app URL when available.

---

## License

No `LICENSE` file is present on the default branch yet; **all rights reserved** until a license is published in the repository root.
