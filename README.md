[![CI](https://github.com/yiddytlq/simple-countdown/actions/workflows/ci.yml/badge.svg)](https://github.com/yiddytlq/simple-countdown/actions/workflows/ci.yml)

![gif](https://user-images.githubusercontent.com/17204739/88205741-825e7d00-cc4d-11ea-81c3-92e42d197346.gif)

# Simple countdown

Simple countdown is an easy to setup countdown page. Can be setup as a countdown or as a timer.

## Setup

Copy `.env.example` to `.env` and fill in your values:

```sh
cp .env.example .env
```

| Variables               | Definition                                                                                                            | Example                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| TIMER_BACKGROUND        | The url of an image that will be used for as background                                                               | https://wallpaperplay.com/walls/full/0/7/6/29912.jpg |
| TIMER_TARGET            | The target date of the countdown — always include an explicit UTC offset (e.g. `Z` or `+02:00`)                       | 2026-12-31T23:59:59Z                                 |
| TIMER_TITLE             | The title of the countdown, can be empty                                                                              | My next birthday                                     |
| TIMER_DONE_MESSAGE      | Text shown when the countdown reaches zero (default `The wait is over!`)                                              | Happy new year!                                      |
| TIMER_DONE_COUNTUP      | `true`/`false` (default `false`) — keep counting up past zero instead of freezing; overrides all other `TIMER_DONE_*` | true                                                 |
| TIMER_DONE_ANIMATION    | `true`/`false` (default `false`) — pulse animation on the completion message (skipped for reduced motion users)       | true                                                 |
| TIMER_DONE_HIDE_TIMER   | `true`/`false` (default `false`) — hide the frozen `00 00 00 00` blocks at zero and show only the message             | true                                                 |
| TIMER_DONE_RELOAD       | `true`/`false` (default `false`) — reload the page after the done state, per `TIMER_DONE_DELAY_MS`                    | true                                                 |
| TIMER_DONE_REDIRECT_URL | http(s) URL to navigate to after the done state; takes priority over `TIMER_DONE_RELOAD` when both are set            | https://example.com/live                             |
| TIMER_DONE_DELAY_MS     | How long (ms, default `3000`) the done state stays visible before reload/redirect fires                               | 5000                                                 |

Don't quote values in `.env` — omitting the UTC offset on `TIMER_TARGET` means each viewer sees a
different remaining time, since it's then parsed in their local timezone.

## Usage

```sh
. ./load-env.sh
pnpm install
pnpm build
pnpm dlx serve -s -l tcp://0.0.0.0:3000 build/
```

## Using docker

The published image (`yiddy/simple-countdown`, built on `nginx:alpine-slim`, ~21 MB — no Node.js
or `node_modules` in the runtime container) reads the same `.env`:

```sh
docker run -d --env-file .env -p 3000:3000 yiddy/simple-countdown
```

## Using docker compose

`docker-compose.yml` maps every variable from `.env` (Compose auto-loads it for `${VAR}`
substitution):

```yaml
environment:
  TIMER_BACKGROUND: ${TIMER_BACKGROUND}
  TIMER_TARGET: ${TIMER_TARGET}
  TIMER_TITLE: ${TIMER_TITLE}
  TIMER_DONE_MESSAGE: ${TIMER_DONE_MESSAGE}
  TIMER_DONE_COUNTUP: ${TIMER_DONE_COUNTUP}
  TIMER_DONE_ANIMATION: ${TIMER_DONE_ANIMATION}
  TIMER_DONE_HIDE_TIMER: ${TIMER_DONE_HIDE_TIMER}
  TIMER_DONE_RELOAD: ${TIMER_DONE_RELOAD}
  TIMER_DONE_REDIRECT_URL: ${TIMER_DONE_REDIRECT_URL}
  TIMER_DONE_DELAY_MS: ${TIMER_DONE_DELAY_MS}
```

```sh
docker compose up
```

For production — pulling the published image and loading `.env` straight via `env_file:`:

```sh
docker compose -f docker-compose.production.yml up
```

Release images are tagged with their semantic version (e.g. `yiddy/simple-countdown:1.2.3`) as
well as `latest`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for logs and local development.

## Credits

This project is based on the original [easy-countdown](https://github.com/Yooooomi/easy-countdown) by Yooooomi.
