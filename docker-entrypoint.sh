#!/bin/sh
set -e

echo "[entrypoint] simple-countdown container starting"

# Inject TIMER_* env vars into variables-final.js at container start,
# so one prebuilt image is configured per-deployment.
if /variables.sh /usr/share/nginx/html; then
    echo "[entrypoint] runtime configuration injected"
else
    status=$?
    echo "[entrypoint] ERROR: variables.sh failed with exit code $status" >&2
    exit "$status"
fi

# Presence only - values may be long or sensitive
for name in TIMER_BACKGROUND TIMER_TARGET TIMER_TITLE TIMER_DONE_MESSAGE TIMER_DONE_COUNTUP \
    TIMER_DONE_ANIMATION TIMER_DONE_HIDE_TIMER TIMER_DONE_RELOAD TIMER_DONE_REDIRECT_URL \
    TIMER_DONE_DELAY_MS; do
    eval "value=\${$name:-}"
    if [ -n "$value" ]; then
        echo "[entrypoint] $name set"
    else
        echo "[entrypoint] $name not set"
    fi
done

echo "[entrypoint] starting nginx"
exec nginx -g 'daemon off;'
