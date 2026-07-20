## [1.5.1](https://github.com/yiddytlq/simple-countdown/compare/v1.5.0...v1.5.1) (2026-07-20)


### Bug Fixes

* pass untrusted event data via env: in slack-notify workflow ([#162](https://github.com/yiddytlq/simple-countdown/issues/162)) ([9c282d4](https://github.com/yiddytlq/simple-countdown/commit/9c282d49ebaaca1d39e9640a0889c0da41912ced)), closes [#158](https://github.com/yiddytlq/simple-countdown/issues/158) [#160](https://github.com/yiddytlq/simple-countdown/issues/160)

# [1.5.0](https://github.com/yiddytlq/simple-countdown/compare/v1.4.0...v1.5.0) (2026-07-20)


### Features

* respect prefers-reduced-motion in the slot-machine digit animation ([#156](https://github.com/yiddytlq/simple-countdown/issues/156)) ([f170536](https://github.com/yiddytlq/simple-countdown/commit/f170536558c7f660e975dcc3a6f86b113639b913))

# [1.4.0](https://github.com/yiddytlq/simple-countdown/compare/v1.3.0...v1.4.0) (2026-07-20)


### Features

* add error boundary fallback for render errors ([#155](https://github.com/yiddytlq/simple-countdown/issues/155)) ([ed2f5d9](https://github.com/yiddytlq/simple-countdown/commit/ed2f5d93f6a1a5c26fb2e4671aa551bb24fcb9e8))

# [1.3.0](https://github.com/yiddytlq/simple-countdown/compare/v1.2.0...v1.3.0) (2026-07-19)


### Features

* announce remaining time to screen readers via throttled aria-live region ([#153](https://github.com/yiddytlq/simple-countdown/issues/153)) ([b0064c6](https://github.com/yiddytlq/simple-countdown/commit/b0064c66759941b38e6bced62c0cd1601c31da81))

# [1.2.0](https://github.com/yiddytlq/simple-countdown/compare/v1.1.1...v1.2.0) (2026-07-19)


### Features

* add configurable countdown completion behavior ([#154](https://github.com/yiddytlq/simple-countdown/issues/154)) ([6c314a1](https://github.com/yiddytlq/simple-countdown/commit/6c314a16684311b17520059c79d3b7f6fea72274)), closes [#16](https://github.com/yiddytlq/simple-countdown/issues/16) [#148](https://github.com/yiddytlq/simple-countdown/issues/148) [#152](https://github.com/yiddytlq/simple-countdown/issues/152)

## [1.1.1](https://github.com/yiddytlq/simple-countdown/compare/v1.1.0...v1.1.1) (2026-07-19)


### Bug Fixes

* show configuration error instead of NaN countdown for invalid TIMER_TARGET ([#149](https://github.com/yiddytlq/simple-countdown/issues/149)) ([71ce8cb](https://github.com/yiddytlq/simple-countdown/commit/71ce8cb699d76e937beeda1bb3fa4bf449852f92))

# [1.1.0](https://github.com/yiddytlq/simple-countdown/compare/v1.0.0...v1.1.0) (2026-07-19)


### Features

* migrate styling to Tailwind CSS v4 utility classes ([#150](https://github.com/yiddytlq/simple-countdown/issues/150)) ([015e7fe](https://github.com/yiddytlq/simple-countdown/commit/015e7fe5bf026358a8bc35e431fc254e5e7c3d57)), closes [#44](https://github.com/yiddytlq/simple-countdown/issues/44) [#45](https://github.com/yiddytlq/simple-countdown/issues/45) [#46](https://github.com/yiddytlq/simple-countdown/issues/46) [#47](https://github.com/yiddytlq/simple-countdown/issues/47) [#48](https://github.com/yiddytlq/simple-countdown/issues/48) [#49](https://github.com/yiddytlq/simple-countdown/issues/49) [#106](https://github.com/yiddytlq/simple-countdown/issues/106) [#107](https://github.com/yiddytlq/simple-countdown/issues/107)

# 1.0.0 (2026-07-17)

### Bug Fixes

- remove pnpm cache from audit job and bump workflows to Node 22 ([73d2df2](https://github.com/yiddytlq/simple-countdown/commit/73d2df2593e44107b8d460a1a5f4861b071b3dd2))
- restrict GITHUB_TOKEN to contents:read in CI workflows ([7743579](https://github.com/yiddytlq/simple-countdown/commit/7743579c0ab42f372e478ed4e15dce8730dc6780))
- use RELEASE_TOKEN PAT for semantic-release pushes ([34ac53d](https://github.com/yiddytlq/simple-countdown/commit/34ac53d4f2406943c0e524a181c2e4ca3b801c80))

### Features

- modernize toolchain to pnpm, Vite, React 18, and strict TypeScript ([d7592c9](https://github.com/yiddytlq/simple-countdown/commit/d7592c9118a42bde2883152fe8279ff4e0cc2b52))
