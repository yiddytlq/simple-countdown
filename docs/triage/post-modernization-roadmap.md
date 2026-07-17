# Post-modernization roadmap

> Ready-to-post GitHub issue body. Title: **Post-modernization roadmap**. Suggested labels:
> `enhancement`, `epic`.

With the modernization complete (PR #137: Vite, React 18, strict TypeScript, pnpm, CI with
audit/gitleaks/CodeQL, semantic-release, ~21 MB nginx image with runtime env injection), this
issue tracks what's next. Items are grouped into milestones and ranked by value vs. effort.
Constraint that applies everywhere: runtime config goes through `variables.sh` placeholder
substitution → `window.*` globals — **never** `import.meta.env` (see CLAUDE.md).

---

## Milestone 1 — Correctness & robustness

### 1.1 Fix: invalid/empty `TIMER_TARGET` → `Invalid Date` → NaN countdown 🥇 _(high value, low effort)_

The known bug documented in CLAUDE.md. `public/variables.js` does
`window.target = new Date('__END__')`; when `TIMER_TARGET` is unset or unparsable, every digit
renders `NaN`.

**Implementation**

- Add `src/service/target.ts` with `resolveTarget(): Date | null` that reads `window.target`
  and returns `null` when `Number.isNaN(target.getTime())` (also treat the literal
  unsubstituted `'__END__'` case, which occurs if `variables.sh` never ran).
- In `src/scenes/Home/index.tsx`, replace the module-scope `const end = window.target` with the
  resolved value; on `null`, render a friendly configuration-error panel ("No valid countdown
  target configured — set `TIMER_TARGET` to an ISO 8601 date, e.g. `2026-12-31T23:59:59`")
  instead of the timer.
- Unit tests in `src/service/__tests__/Target.test.ts`: valid ISO string, empty string,
  garbage string, raw `__END__` placeholder.
- Good first issue: **yes**.

### 1.2 Countdown-zero behavior _(high value, medium effort)_

`describe()` in `src/service/date.ts` uses `Math.abs`, so after the target passes the timer
silently counts **up**. Nothing signals completion. Also subsumes filed issues #16
(auto-reload) and #17 (redirect).

**Implementation**

- Make reaching zero an explicit state: in `Home`, compute `done = date >= end`; when done,
  stop the interval and render a completion view.
- Default behavior: stop at `00 00 00 00` and show a completion message.
- Configurable via new runtime vars (each needs a `public/variables.js` placeholder, a
  `variables.sh` line, a `Window` type, and README docs):
  - `TIMER_DONE_MESSAGE` — text shown at zero (default "The wait is over!"); covers the
    "configurable countdown-complete message" feature below.
  - `TIMER_DONE_ACTION` — `stop` (default) | `countup` (today's behavior, made explicit) |
    `reload` (#16) | `redirect` (#17, paired with `TIMER_REDIRECT_URL`, validated with
    `new URL()` before navigating).
- Unit tests: `describe()` at/after target, action selection logic (extract to a pure
  `src/service/completion.ts` so it's testable without DOM).

### 1.3 Timezone handling for `TIMER_TARGET` parsing _(medium value, low effort)_

`new Date('2026-12-31T20:00:00')` is parsed in the **viewer's** local timezone; the same
deployment shows different remaining time to viewers in different zones, and bare dates
(`2026-12-31`) are parsed as UTC — an inconsistent mix.

**Implementation**

- Document the rule in README: recommend explicit offsets (`…T20:00:00+02:00` or `…Z`).
- In `resolveTarget()` (1.2 above), detect an offset-less datetime string with a regex and
  surface a console warning (or a small badge in dev) that local-time interpretation applies.
- Optionally add `TIMER_TARGET_TZ` later only if users ask; full TZ-database handling is not
  worth a dependency for this app. Good first issue (docs + warning part): **yes**.

### 1.4 Error boundary _(medium value, low effort)_

A render error currently white-screens the page — bad for a kiosk-style always-on display.

**Implementation**

- Add `src/components/ErrorBoundary.tsx` (class component with `componentDidCatch`), wrap
  `<Home />` in `src/App.tsx`. Fallback UI: title + "something went wrong" + the configured
  background if available. Component test with a throwing child. Good first issue: **yes**.

### 1.5 Background image failure fallback _(low value, low effort)_

`Home` sets `backgroundImage: url('${window.background}')`; a dead URL leaves a plain black
page (acceptable) but an unset/unsubstituted `__BACKGROUND__` produces a broken request on
every load.

**Implementation**

- In `resolveTarget`'s sibling helper, treat empty/`__BACKGROUND__` values as "no background"
  and skip the inline style; define a CSS gradient fallback on `.root` in
  `index.module.css`. Optionally preload via `new Image()` + `onerror` to drop to the gradient
  on load failure. Good first issue: **yes**.

---

## Milestone 2 — Testing depth

### 2.1 Component tests with Testing Library + jsdom _(high value, medium effort)_

Today only `src/service/date.ts` is tested. The rendering logic (NaN case, zero state, title
fallback, block ordering day→hour→minute→second) is untested.

**Implementation**

- `pnpm add -D @testing-library/react @testing-library/jest-dom jsdom`; set
  `test.environment: 'jsdom'` + a setup file in `vite.config.ts` (Vitest reads it).
- Co-locate per convention: `src/scenes/Home/__tests__/Home.test.tsx`, mocking `window.target`
  et al. per test (the typed globals make this easy). Cover: valid target renders 4 blocks in
  order; invalid target renders fallback (1.1); done state (1.2); `document.title` set from
  `window.title`.
- Use fake timers (`vi.useFakeTimers`) for the 1 s interval.

### 2.2 Playwright E2E smoke test _(medium value, medium effort)_

**Implementation**

- `tests/smoke.spec.ts` (new top-level `tests/` dir): build with a known `TIMER_TARGET`, serve
  `build/` via `vite preview`, assert the title and four labeled blocks render with non-NaN
  digits, and that digits tick after ~1 s.
- Add `@playwright/test` as devDependency; CI job runs it after `pnpm build` (Chromium only,
  keep it a smoke test). Optionally a second scenario exercising the Docker image itself
  (`docker run -e TIMER_TARGET=…` + curl/Playwright against :3000) — that also validates
  `variables.sh` runtime injection end-to-end, which unit tests can't.

### 2.3 CI coverage reporting _(low value, low effort)_

- `pnpm test -- --coverage` via `@vitest/coverage-v8`; upload to the job summary (or Codecov if
  the owner wants a badge). Set a soft threshold first (e.g. 60 %) and ratchet later. Good
  first issue: **yes**.

---

## Milestone 3 — UX & accessibility

### 3.1 Accessibility pass: the timer is invisible to assistive tech _(high value, low-medium effort)_

The countdown is purely visual (absolutely-positioned digit stacks); a screen reader hears ten
digits per column or nothing useful.

**Implementation**

- Add a visually-hidden `aria-live="polite"` region in `Home` announcing the remaining time as
  a sentence, throttled to once per minute (announcing every second is hostile);
  `role="timer"` on the container. Mark the decorative digit stacks `aria-hidden="true"`.
- `eslint-plugin-jsx-a11y` is already configured — turn any relevant rules up to error level.

### 3.2 Reduced-motion support for the slot-machine animation _(medium value, low effort)_

`NumberDisplay` rolls every digit on mount and on change via CSS transitions.

**Implementation**

- In `NumberDisplay/index.module.css`, wrap the transition in
  `@media (prefers-reduced-motion: no-preference) { … }` so digits snap instead of roll when
  the user opts out; skip the random intro roll too (guard the `intro` state initializer with
  `matchMedia('(prefers-reduced-motion: reduce)')`). Good first issue: **yes**.

### 3.3 Configurable completion message — covered by 1.2 (`TIMER_DONE_MESSAGE`).

### 3.4 Filed UI fixes (#105–#108) _(medium value, varies)_

Title `clamp()` sizing (#106), background centering on mobile (#107), number-container
responsive scaling (#108 — hardest; the 100px fixed offsets in `NumberDisplay` need to become
em/CSS-variable based). Track under epic #105.

### 3.5 Multiple countdown targets _(deferred — decide first)_

Filed as #20. Big value for some users but it challenges the zero-runtime static-nginx model.
Recommended scope if pursued: client-side routing + a JSON config injected at container start
(same mechanism as `variables.sh`), no admin page, no backend. Do not start before Milestones
1–2 land; see triage question on #20.

---

## Milestone 4 — Ops & supply chain

### 4.1 Pin GitHub Actions to commit SHAs _(high value, low effort)_

CI/release workflows currently use mutable tags (`actions/checkout@v7`, `pnpm/action-setup@v6`,
`gitleaks/gitleaks-action@v3`, …). A hijacked tag = compromised CI with release and Docker Hub
credentials.

**Implementation**

- Pin every `uses:` across `.github/workflows/*.yml` to a full 40-char SHA with a trailing
  `# vX.Y.Z` comment. Dependabot (`github-actions` ecosystem, already enabled) keeps SHA pins
  updated. Good first issue: **yes**.

### 4.2 Docker healthcheck _(medium value, low effort)_

**Implementation**

- nginx:alpine-slim has no curl/wget guarantees — add
  `HEALTHCHECK CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1` (wget is in
  busybox, so no new packages) to the runtime stage, and mirror it as `healthcheck:` in the
  compose files so orchestrators restart a wedged container. Good first issue: **yes**.

### 4.3 nginx cache headers for hashed assets _(medium value, low effort)_

Vite emits content-hashed files under `assets/`; `nginx.conf` currently serves everything with
default caching, and crucially `variables-final.js` + `index.html` must **not** be cached
long-term (they change per deployment/container start).

**Implementation** — in `nginx.conf`:

```nginx
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location = /variables-final.js { add_header Cache-Control "no-cache"; }
location = /index.html { add_header Cache-Control "no-cache"; }
```

Keep the existing `try_files $uri /index.html;` fallback. Good first issue: **yes**.

### 4.4 Docker Hub image docs check _(low value, trivial)_

README/compose examples reference `yiddy/simple-countdown`; `docker-publish.yml` pushes the
same name — verify the Docker Hub repo description/README is updated post-modernization
(image is now nginx-based, ~21 MB, configured via `TIMER_*` at runtime) and that the old
CRA-era usage instructions aren't lingering on the Hub page.

---

## Suggested ordering

| Priority     | Items                             | Rationale                                                     |
| ------------ | --------------------------------- | ------------------------------------------------------------- |
| Now          | 1.1, 4.1, 4.2, 4.3                | Known bug + cheap security/ops wins                           |
| Next         | 1.2, 2.1, 3.1                     | Completion behavior (unblocks #16/#17), test foundation, a11y |
| Then         | 1.3, 1.4, 1.5, 2.2, 2.3, 3.2, 3.4 | Robustness + polish                                           |
| Decide first | 3.5 (#20), Tailwind (#2)          | Architecture/product decisions pending                        |

**Good first issues:** 1.1, 1.3 (docs part), 1.4, 1.5, 2.3, 3.2, 4.1, 4.2, 4.3.
