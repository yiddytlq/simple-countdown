# Contributing

## Logs

```sh
docker logs <container>       # or: docker compose logs -f web
```

- **Startup configuration summary** — the entrypoint confirms the runtime variables were injected
  and reports, for each `TIMER_*` variable, whether it was set (values themselves are not logged).
- **nginx access and error logs** — the image forwards them to stdout/stderr.
- **Failures** — if variable injection fails, the reason is logged before the container exits.

Inspect the `HEALTHCHECK` (`http://127.0.0.1:3000/`):

```sh
docker inspect --format '{{json .State.Health}}' <container>
```

## Local development

```sh
pnpm install        # install dependencies (pnpm only)
pnpm dev            # start the Vite dev server on :3000
pnpm test           # run unit tests (Vitest)
pnpm lint           # ESLint (strict TypeScript, no `any`)
pnpm format:check   # Prettier check
pnpm typecheck      # tsc --noEmit
```

CI enforces all of the above plus a dependency audit (fails on high/critical CVEs), secret scanning
(gitleaks), and CodeQL. Versioning is automated with semantic-release from conventional commit
messages (`feat:` → minor, `fix:` → patch, `BREAKING CHANGE` → major) — never bump the version by hand.
See `CLAUDE.md` for the full contributor conventions.
