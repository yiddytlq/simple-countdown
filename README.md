![Client CI](https://github.com/Yooooomi/easy-countdown/workflows/Client%20CI/badge.svg)

![gif](https://user-images.githubusercontent.com/17204739/88205741-825e7d00-cc4d-11ea-81c3-92e42d197346.gif)

# Simple Countdown

Simple countdown is an easy to setup countdown timer web app designed for easy deployment via a single Docker Compose file. It is a fork and major enhancement of the [easy-countdown](https://github.com/Yooooomi/easy-countdown) project.

## Features

- **Lightweight & Self-hostable**: Single container deployment via Docker Compose
- **Fully Responsive**: Built with Tailwind CSS v4 for optimal mobile and desktop experience
- **Customizable UI**: Extensive styling options controlled via environment variables
- **Smart Countdown**: Proper handling of countdown completion with customizable messages and actions
- **Text Shadow Support**: Configurable text shadows for better visibility on various backgrounds
- **Post-Countdown Actions**: Support for custom messages and automatic redirects

# Setup

## Using docker (Recommended)

If you use docker, just edit the `docker-compose.yml` file so that it fits your needs

| Variables                     | Definition                                                                                          | Example                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| TIMER_BACKGROUND              | The url of an image that will be used as background                                                | https://wallpaperplay.com/walls/full/0/7/6/29912.jpg    |
| TIMER_TARGET                  | The target date of the countdown                                                                    | Fri Oct 01 2021 15:33:36 GMT+0200                        |
| TIMER_TITLE                   | The title of the countdown, can be empty                                                          | My title!                                                 |
| TIMER_TEXT_SHADOW             | Enable/disable text shadows for better visibility (true/false)                                    | true                                                      |
| TIMER_POST_COUNTDOWN_MESSAGE  | Message to display when countdown reaches zero                                                     | Event Started!                                            |
| TIMER_POST_COUNTDOWN_ACTION   | Action to take after countdown (message/redirect)                                                 | message                                                   |
| TIMER_REDIRECT_URL            | URL to redirect to if action is set to "redirect"                                                 | https://example.com                                       |

### Example of `docker-compose.yml` file

> This example is a copy-paste of `docker-compose.production.yml` in the repo

```yml
version: "3.8"

services:
  web:
    stdin_open: true # So that the serving is not exited with code 0
    image: yooooomi/easy-countdown
    environment:
      TIMER_BACKGROUND: https://wallpaperplay.com/walls/full/0/7/6/29912.jpg
      TIMER_TARGET: "Fri Oct 01 2021 15:33:36 GMT+0200" # Get help with https://esqsoft.com/javascript_examples/date-to-epoch.htm
      TIMER_TITLE: "My next birthday" # Can be empty
      TIMER_TEXT_SHADOW: "true" # Optional: Enable text shadows for better visibility
      TIMER_POST_COUNTDOWN_MESSAGE: "Happy Birthday!" # Optional: Custom message when countdown reaches zero
      TIMER_POST_COUNTDOWN_ACTION: "message" # Optional: Action after countdown (message/redirect)
      TIMER_REDIRECT_URL: "https://example.com" # Optional: URL to redirect to if action is "redirect"
    ports:
      - "3000:3000"
```

## Without docker

> This method builds the project following the env variables you gave, producing a `build` folder that has to be served manually afterwards. You can use [`serve`](https://www.npmjs.com/package/serve) to achieve it

Use `yarn` to use the build script from the
`package.json`. Simply use `yarn build`. Use the variables above in the env to personalize your countdown

- `npm install`
- `TIMER_TITLE="example" yarn build`

> Variables will be taken from env, and are the same as above

I.E: `TIMER_TARGET="Fri Oct 01 2021 15:33:36 GMT+0200" yarn build && serve -s -l tcp://0.0.0.0:3000 build/`

## Recent Enhancements

### Tailwind CSS v4 Migration
- Migrated from CSS modules to Tailwind CSS v4 utility classes
- Improved responsive design across all screen sizes
- Enhanced mobile experience with optimized viewport handling
- Better typography scaling for large screens

### Advanced Features
- Configurable text shadows for improved visibility on various backgrounds
- Smart countdown completion with custom messages instead of continuing to count upward
- Post-countdown actions including custom messages and automatic redirects
- Mobile-first responsive design with proper handling of mobile browser address bars

## Credits

This project is based on the original [easy-countdown](https://github.com/Yooooomi/easy-countdown) by Yooooomi.
