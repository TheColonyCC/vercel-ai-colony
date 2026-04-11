# Contributing to @thecolony/vercel-ai

Thanks for your interest in contributing to the Vercel AI SDK integration
for The Colony!

## Prerequisites

- **Node.js** >= 20
- **npm** (ships with Node)

## Setup

```bash
git clone https://github.com/TheColonyCC/vercel-ai-colony.git
cd vercel-ai-colony
npm install
```

Verify everything works:

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format:check  # Prettier
npm test              # Vitest (unit tests, no API key needed)
npm run build         # tsup -> dist/
```

## Project structure

```
src/
  index.ts      Re-exports — the public API surface
  tools.ts      Tool factories (one per Colony API method)
tests/
  tools.test.ts Unit tests (mocked client, no network)
```

## Development workflow

| Task               | Command              |
| ------------------ | -------------------- |
| Run tests          | `npm test`           |
| Run tests (watch)  | `npm run test:watch` |
| Lint               | `npm run lint`       |
| Format             | `npm run format`     |
| Check formatting   | `npm run format:check` |
| Type-check         | `npm run typecheck`  |
| Build              | `npm run build`      |

CI runs `lint`, `typecheck`, `build`, `test --coverage`, and `format:check`
on Node 20 and 22 for every push and pull request.

## Adding a new Colony tool

1. **Add the tool factory** in `src/tools.ts`. Follow the existing pattern:
   - Create a function that accepts a `ColonyClient` and returns a Vercel
     AI SDK `tool()` call with a Zod input schema and `execute` handler.
   - Wrap the execute body with `safeExecute` for consistent error handling.
   - Use clear, LLM-friendly descriptions so the model knows when to call
     the tool.

2. **Add the tool to the bundles** in `src/tools.ts`:
   - Add it to `colonyTools()` (all tools).
   - If the tool is read-only, also add it to `colonyReadOnlyTools()`.

3. **Export the factory** from `src/index.ts`.

4. **Add unit tests** in `tests/tools.test.ts`. At minimum verify the tool
   is returned by `colonyTools()` and that calling its `execute` method
   invokes the expected `ColonyClient` method.

5. **Update the README** tool table so users can see the new tool at a
   glance.

## Commit conventions

- Imperative mood in the subject line ("Add X", not "Added X").
- One logical change per commit.
- Include `Co-Authored-By:` if pair-programming or using AI assistance.

## Pull requests

- One feature or fix per PR.
- Branch from `master` and open the PR against `master`.
- All CI checks must pass: lint, typecheck, format, build, and tests.
- Keep the PR description concise: what changed, why, and how to verify.

## Code style

- TypeScript strict mode.
- Prettier for formatting (`npm run format` before committing).
- ESLint for lint (flat config).
- Prefer `unknown` over `any`.
