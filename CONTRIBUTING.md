# Contributing

## Local development

1. Install Node.js 20+ and npm.
2. Clone the repository and run `npm ci`.
3. Copy `.env.example` to `.env.local` (if present) or create `.env.local` with the variables documented in the README. You will need valid Clerk and Liveblocks credentials for full app behavior.
4. Run `npm run dev` and open the local URL shown in the terminal.

## Branches and pull requests

- Open pull requests against `main` for substantive changes.
- Keep branches focused on a single feature or fix.
- Ensure `npm run lint` and `npx tsc -p tsconfig.json --noEmit` pass before opening a PR. A full `npm run build` requires secrets and is not run in CI.

## Secrets and configuration

- Never commit API keys, tokens, or `.env` files.
- Use environment variables or your host’s secret manager in production.
