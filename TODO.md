# simple-countdown Development TODO

## Priority Order & Details

### 1. Add credit to original developer

- [ ] Add clear credit line to README with link to https://github.com/Yooooomi/easy-countdown

### 2. Migrate styling to Tailwind CSS v4 (no config file)

- [ ] Replace existing CSS with Tailwind v4 utility classes only
- [ ] Ensure no tailwind.config.js or other config file is needed
- [ ] Verify UI responsiveness across screen sizes
- [ ] Fix existing layout issues:
  - [ ] Title too small on large screens → increase font size responsively
  - [ ] Title & text visibility on various backgrounds → add text shadows or overlays configurable via env vars
  - [ ] Mobile scrolling caused by address bar → optimize viewport and layout to avoid scroll
  - [ ] General responsiveness bugs → test and fix for common breakpoints
  - [ ] Fix countdown behavior to display a clear message or state when timer reaches zero instead of counting upward silently
  - [ ] Optionally allow customizing the post-countdown message or action via environment variables (e.g., show "Event Started", redirect, or stop timer)

### 3. Add enhanced UI environment variables (each must be functional)

- [ ] `TIMER_COLOR` - color of countdown digits
- [ ] `TIMER_FONT_SIZE` - font size for digits (responsive support optional)
- [ ] `TIMER_FONT_FAMILY` - font family for digits
- [ ] `TIMER_TITLE_COLOR` - color for title text
- [ ] `TIMER_TITLE_FONT_SIZE` - font size for title (fix title size issue)
- [ ] `TIMER_SHOW_SECONDS` - toggle display of seconds (`true`/`false`)
- [ ] `TIMER_ALIGN` - text alignment (`left`, `center`, `right`)
- [ ] `TIMER_BORDER_COLOR` - optional border color around countdown container
- [ ] `TIMER_BORDER_RADIUS` - border radius for container
- [ ] `TIMER_COUNTDOWN_FORMAT` - customizable countdown format string (e.g., `DD:HH:mm:ss`)
- [ ] `TIMER_SHOW_LABELS` - toggle labels like “Days”, “Hours”, etc.
- [ ] `TIMER_AUTO_RELOAD` - reload page automatically when countdown hits zero
- [ ] `TIMER_REDIRECT_URL` - redirect URL after countdown finishes
- [ ] UI contrast improvements for background images (configurable overlays or text shadows)

### 4. Support multiple countdown pages

- [ ] Support defining multiple countdown pages via environment variables in Docker or using a JSON or YAML config file mounted via Docker volume
- [ ] Allow managing and modifying these countdown pages dynamically through the admin page (if enabled), syncing changes with environment-configured pages
- [ ] Each page should allow all the environment variable customizations individually
- [ ] Add `DEFAULT_PAGE` env variable to specify which page loads at root `/`
- [ ] Implement routing like `/page1`, `/page2`, etc. (or configurable slugs)
- [ ] Implement redirect from `/` to the `DEFAULT_PAGE`

### 5. Optional admin page for managing countdowns

- [ ] Add optional `/admin` page with token-based or other authentication controlled by env variables
- [ ] Allow admin to add/edit/delete countdown pages dynamically (updates config file or in-memory)
- [ ] Changes reflect immediately without app restart if possible
- [ ] Hide admin page if not enabled (`ENABLE_ADMIN_PAGE=false` by default)

---

## Development Workflow Suggestions

- Use **GitHub Issues** to track each feature and bugfix clearly.
- Create a **dedicated branch** for each feature or fix, e.g. `feature/tailwind-migration`, `feature/multi-page-support`.
- Use **Pull Requests** to merge features into `master` after review & testing.
- Set up **CI/CD pipelines** (GitHub Actions recommended) for:
  - Running tests (if any added)
  - Building Docker image
  - Linting and formatting checks
- Use **semantic commit messages** for clarity.
- Update this TODO checklist in each PR to mark tasks done.

---

## Notes on UI Issues to Fix

- Title too small on large screens → implement responsive font sizes with Tailwind `text-4xl`, `text-6xl`, etc.
- Text visibility on backgrounds → add semi-transparent overlay behind text or drop shadow, configurable by `TIMER_TEXT_OVERLAY_OPACITY` or similar.
- Mobile scroll from address bar → add proper viewport meta tag and CSS adjustments (`100vh` tricks).
- Responsive layout issues → test on multiple devices and fix flex/grid layout issues.

---
