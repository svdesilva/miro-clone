# Roadmap

This is a working list, not a promise schedule. Items are ordered by **risk reduction** first, then polish.

## Near term

1. **Hosted demo** — preview + production environments; stable URL in the repo About section.
2. **CI on every PR** — lint + typecheck first; add tests as the suite becomes real (no red CI sitting on `main`).
3. **Observability baseline** — structured client error reporting for auth + room join failures; enough signal to debug real sessions.

## Medium term

4. **Board permissions model** — share links, read-only vs edit, basic abuse considerations.
5. **Performance budget** — large boards, many objects; define what “good” latency means for interactions.

## Explicit non-goals (for now)

- Full enterprise admin / audit exports
- Offline-first editing with complex merge semantics
- Native mobile clients

If one of the non-goals should be reprioritized, open an issue with the customer scenario; maintainers can respond with a scope proposal or a deliberate “not yet.”
