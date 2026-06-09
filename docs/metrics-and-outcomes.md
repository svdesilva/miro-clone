# Metrics and outcomes (draft)

This is the metrics framing used while iterating on a collaboration surface. It is intentionally **outcome-first**: measure whether the product is doing a job, not whether features exist.

## North-star (candidate)

**Weekly collaborating teams** — distinct groups that complete at least one “meaningful session” in a week.

Definition notes:

- A “team” can be inferred conservatively from org/workspace membership when that exists; early builds may approximate with board participants.
- A “meaningful session” should combine **time on canvas** + **edits** (not just page loads).

## Guardrail metrics

| Metric | Why it exists |
|--------|----------------|
| **Crash-free sessions** | Collaboration tools fail loudly; stability is trust. |
| **Time-to-first-edit** | Measures friction from intent to action. |
| **Reconnect success rate** | Realtime products live or die on recovery behavior. |
| **Auth failure rate** | Silent auth issues look like “the product is broken.” |

## Instrumentation principles

- Prefer **stable event names** and explicit versioning when the schema changes.
- Never log secrets or raw document payloads in analytics pipelines.

## Next steps on metrics

- A minimal event taxonomy PRD (10–15 events max) tied to the north-star definition.
- A dashboard spec for weekly review—not a vanity dashboard.
