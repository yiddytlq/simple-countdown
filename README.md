[![CI](https://github.com/yiddytlq/simple-countdown/actions/workflows/ci.yml/badge.svg)](https://github.com/yiddytlq/simple-countdown/actions/workflows/ci.yml)

![gif](https://user-images.githubusercontent.com/17204739/88205741-825e7d00-cc4d-11ea-81c3-92e42d197346.gif)

# Simple countdown

Simple countdown is an easy to setup countdown page. Can be setup as a countdown or as a timer.

# Setup

## Using docker (Recommended)

If you use docker, just edit the `docker-compose.yml` file so that it fits your needs.

| Variables               | Definition                                                                                                             | Example                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| TIMER_BACKGROUND        | The url of an image that will be used for as background                                                                | https://wallpaperplay.com/walls/full/0/7/6/29912.jpg |
| TIMER_TARGET            | The target date of the countdown                                                                                       | Fri Oct 01 2021 15:33:36 GMT+0200                    |
| TIMER_TITLE             | The title of the countdown, can be empty                                                                               | My title!                                            |
| TIMER_DONE_MESSAGE      | Text shown when the countdown reaches zero (default `The wait is over!`)                                               | Happy new year!                                      |
| TIMER_DONE_COUNTUP      | `true`/`false` (default `false`) — keep counting up past zero instead of freezing; all other TIMER_DONE_\* are ignored | true                                                 |
| TIMER_DONE_ANIMATION    | `true`/`false` (default `false`) — play a pulse animation on the completion message (skipped for reduced motion users) | true                                                 |
| TIMER_DONE_HIDE_TIMER   | `true`/`false` (default `false`) — hide the frozen `00 00 00 00` blocks at zero and show only the message              | true                                                 |
| TIMER_DONE_RELOAD       | `true`/`false` (default `false`) — reload the page after the done state has been visible for TIMER_DONE_DELAY_MS       | true                                                 |
| TIMER_DONE_REDIRECT_URL | http(s) URL to navigate to after the done state has been visible for TIMER_DONE_DELAY_MS; ignored if invalid           | https://example.com/live                             |
| TIMER_DONE_DELAY_MS     | How long (ms, default `3000`) the done state stays visible before TIMER_DONE_RELOAD / TIMER_DONE_REDIRECT_URL fires    | 5000                                                 |

Variables are injected at **container start**, so one prebuilt image can be configured per deployment.

### When the countdown reaches zero

By default the timer freezes at `00 00 00 00` and shows `TIMER_DONE_MESSAGE`. The `TIMER_DONE_*`
flags are independent and combinable (e.g. message + animation + delayed redirect), with these rules:

1. `TIMER_DONE_COUNTUP=true` — the timer just keeps counting up past zero (the historical behavior);
   every other `TIMER_DONE_*` variable is ignored.
2. Otherwise the timer freezes the instant the target passes and the message is shown
   (`TIMER_DONE_ANIMATION` animates it, `TIMER_DONE_HIDE_TIMER` hides the frozen blocks).
3. If both `TIMER_DONE_RELOAD` and a valid `TIMER_DONE_REDIRECT_URL` are set, the redirect wins;
   the reload only fires when the redirect URL is unset or invalid.
4. If neither reload nor redirect is set, the done state stays visible indefinitely.

### Example of `docker-compose.yml` file

```yml
services:
  web:
    image: yiddy/simple-countdown
    environment:
      TIMER_BACKGROUND: https://wallpaperplay.com/walls/full/0/7/6/29912.jpg
      TIMER_TARGET: 'Fri Oct 01 2021 15:33:36 GMT+0200' # Get help with https://esqsoft.com/javascript_examples/date-to-epoch.htm
      TIMER_TITLE: 'My next birthday' # Can be empty
    ports:
      - '3000:3000'
```

Release images are tagged with their semantic version (e.g. `yiddy/simple-countdown:1.2.3`) as well as `latest`.

### Logs

Everything the container does is logged to stdout/stderr, so the standard Docker commands show it:

```sh
docker logs <container>       # or: docker compose logs -f web
```

What you'll see:

- **Startup configuration summary** — the entrypoint confirms the runtime variables were injected
  and reports, for each `TIMER_*` variable, whether it was set (values themselves are not logged).
- **nginx access and error logs** — the image forwards them to stdout/stderr.
- **Failures** — if variable injection fails, the reason is logged before the container exits.

The image also ships a `HEALTHCHECK` that fetches `http://127.0.0.1:3000/`; inspect its status with:

```sh
docker inspect --format '{{json .State.Health}}' <container>
```

## Without docker

> This method builds the project with the env variables you provide, producing a `build` folder that has to be served manually afterwards.

This project uses [pnpm](https://pnpm.io) exclusively — do not use npm or yarn.

```sh
pnpm install
TIMER_TARGET="Fri Oct 01 2021 15:33:36 GMT+0200" TIMER_TITLE="example" pnpm build
pnpm dlx serve -s -l tcp://0.0.0.0:3000 build/
```

> Variables are taken from the env and are the same as the table above.

# Development

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

## Credits

This project is based on the original [easy-countdown](https://github.com/Yooooomi/easy-countdown) by Yooooomi.
