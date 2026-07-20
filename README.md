[![CI](https://github.com/yiddytlq/simple-countdown/actions/workflows/ci.yml/badge.svg)](https://github.com/yiddytlq/simple-countdown/actions/workflows/ci.yml)

![gif](https://user-images.githubusercontent.com/17204739/88205741-825e7d00-cc4d-11ea-81c3-92e42d197346.gif)

# Simple countdown

Simple countdown is an easy to setup countdown page. Can be setup as a countdown or as a timer.

## Using docker (Recommended)

Edit `docker-compose.yml` to fit your needs. The published image (`yiddy/simple-countdown`) is
built on `nginx:alpine-slim` (~21 MB) — no Node.js or `node_modules` in the runtime container — and
all `TIMER_*` variables below are injected at **container start**, so one prebuilt image works for
any deployment.

| Variables               | Definition                                                                                                            | Example                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| TIMER_BACKGROUND        | The url of an image that will be used for as background                                                               | https://wallpaperplay.com/walls/full/0/7/6/29912.jpg |
| TIMER_TARGET            | The target date of the countdown — always include an explicit UTC offset (e.g. `Z` or `+02:00`)                       | Fri Oct 01 2021 15:33:36 GMT+0200                    |
| TIMER_TITLE             | The title of the countdown, can be empty                                                                              | My title!                                            |
| TIMER_DONE_MESSAGE      | Text shown when the countdown reaches zero (default `The wait is over!`)                                              | Happy new year!                                      |
| TIMER_DONE_COUNTUP      | `true`/`false` (default `false`) — keep counting up past zero instead of freezing; overrides all other `TIMER_DONE_*` | true                                                 |
| TIMER_DONE_ANIMATION    | `true`/`false` (default `false`) — pulse animation on the completion message (skipped for reduced motion users)       | true                                                 |
| TIMER_DONE_HIDE_TIMER   | `true`/`false` (default `false`) — hide the frozen `00 00 00 00` blocks at zero and show only the message             | true                                                 |
| TIMER_DONE_RELOAD       | `true`/`false` (default `false`) — reload the page after the done state, per `TIMER_DONE_DELAY_MS`                    | true                                                 |
| TIMER_DONE_REDIRECT_URL | http(s) URL to navigate to after the done state; takes priority over `TIMER_DONE_RELOAD` when both are set            | https://example.com/live                             |
| TIMER_DONE_DELAY_MS     | How long (ms, default `3000`) the done state stays visible before reload/redirect fires                               | 5000                                                 |

Omitting the UTC offset on `TIMER_TARGET` means each viewer sees a different remaining time, since
it's then parsed in their local timezone.

### Example `docker-compose.yml`

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

Release images are tagged with their semantic version (e.g. `yiddy/simple-countdown:1.2.3`) as well
as `latest`.

## Without docker, logs, and local development

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

This project is based on the original [easy-countdown](https://github.com/Yooooomi/easy-countdown) by Yooooomi.
