# Release checklist (solo maintainer edition)

Use this before tagging a release or promoting a build to a shared demo environment.

## Product

- [ ] README runbook matches reality (`npm install`, `npm run dev`, required env vars).
- [ ] Known sharp edges are documented (limits, unsupported browsers, etc.).

## Security

- [ ] No secrets in repo history for this release cut.
- [ ] `.env.example` reflects required variables (no real values).

## Quality

- [ ] `npm run lint` passes (when configured).
- [ ] Smoke test: sign in, create board, join from two browsers, concurrent edits, refresh/reconnect.

## Operational

- [ ] Rollback plan: what to revert if realtime provider or auth misbehaves in prod.
- [ ] Changelog entry for user-visible changes (even if small).
