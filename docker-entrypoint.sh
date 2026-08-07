#!/bin/sh
# Container start: inject TIMER_* env into variables-final.js, render the nginx
# config for the requested LOG_LEVEL, verify both, then hand off to nginx.
set -e

# Overridable so this can be exercised outside a container; the defaults are the
# only values ever used in the image.
: "${HTML_DIR:=/usr/share/nginx/html}"
: "${TEMPLATE:=/etc/nginx/templates/default.conf.template}"
: "${CONF:=/etc/nginx/conf.d/default.conf}"
: "${VARIABLES_SH:=/usr/local/bin/variables.sh}"

# LOG_LEVEL governs how much *request* traffic is logged. It deliberately does
# not gate startup, shutdown or failures: those are what someone reads when
# something has gone wrong, they cost a few lines per container start, and the
# outage that prompted this was diagnosed from exactly such a line.
#
#   error (default)  failed requests only (non-2xx/3xx)
#   info             every request
#   debug            every request, plus the generated config
#
# Default is error because this serves one static page: a successful GET is the
# uptime monitor doing its job, which nobody reads and which writes ~4 MB/day to
# the disk at one probe every five seconds.
LOG_LEVEL_RAW="${LOG_LEVEL:-error}"
case "$LOG_LEVEL_RAW" in
    debug) LOG_THRESHOLD=0 ;;
    info | error) LOG_THRESHOLD=1 ;;
    *) LOG_THRESHOLD=1 ;;
esac

log() {
    case "$1" in
        debug) lvl=0 ;;
        info) lvl=1 ;;
        warn) lvl=2 ;;
        *) lvl=3 ;;
    esac
    [ "$lvl" -ge "$LOG_THRESHOLD" ] || return 0
    shift
    echo "[entrypoint] $*" >&2
}

log info "simple-countdown container starting (log level ${LOG_LEVEL_RAW})"
case "$LOG_LEVEL_RAW" in
    debug | info | error) ;;
    *) log warn "unknown LOG_LEVEL '${LOG_LEVEL_RAW}', using error" ;;
esac

# Inject TIMER_* env vars into variables-final.js at container start,
# so one prebuilt image is configured per-deployment.
if "$VARIABLES_SH" "$HTML_DIR"; then
    log info "runtime configuration injected"
else
    status=$?
    log error "ERROR: variables.sh failed with exit code $status"
    exit "$status"
fi
log debug "$(cat "$HTML_DIR/variables-final.js")"

# Presence only - values may be long or sensitive
for name in TIMER_BACKGROUND TIMER_TARGET TIMER_TITLE TIMER_DONE_MESSAGE TIMER_DONE_COUNTUP \
    TIMER_DONE_ANIMATION TIMER_DONE_HIDE_TIMER TIMER_DONE_RELOAD TIMER_DONE_REDIRECT_URL \
    TIMER_DONE_DELAY_MS; do
    eval "value=\${$name:-}"
    if [ -n "$value" ]; then
        log info "$name set"
    else
        log info "$name not set"
    fi
done

if [ -z "${TIMER_TARGET:-}" ]; then
    log warn "TIMER_TARGET is not set - the page will show a configuration error"
fi

# A TIMER_* this image does not implement is otherwise ignored in silence: the
# setting looks applied and never is.
for var in $(env | sed -n 's/^\(TIMER_[A-Z0-9_]*\)=.*/\1/p'); do
    case "$var" in
        TIMER_BACKGROUND | TIMER_TARGET | TIMER_TITLE | TIMER_DONE_MESSAGE | TIMER_DONE_COUNTUP | \
            TIMER_DONE_ANIMATION | TIMER_DONE_HIDE_TIMER | TIMER_DONE_RELOAD | \
            TIMER_DONE_REDIRECT_URL | TIMER_DONE_DELAY_MS) ;;
        *) log warn "ignoring $var: not implemented by this image" ;;
    esac
done

# error keeps the access log, but only for requests that failed -- a 404 on a
# background image still has to be visible. $status_failed is the map defined in
# the template. error_log stays at notice even here: dropping to the error tier
# would hide "signal N received, shutting down", which is the single most useful
# line this container ever emits.
if [ "$LOG_LEVEL_RAW" = "debug" ]; then
    ACCESS_LOG="/dev/stdout main"
    ERROR_LOG_LEVEL="info"
elif [ "$LOG_LEVEL_RAW" = "info" ]; then
    ACCESS_LOG="/dev/stdout main"
    ERROR_LOG_LEVEL="notice"
else
    ACCESS_LOG="/dev/stdout main if=\$status_failed"
    ERROR_LOG_LEVEL="notice"
fi

sed -e "s|__ACCESS_LOG__|${ACCESS_LOG}|g" \
    -e "s|__ERROR_LOG_LEVEL__|${ERROR_LOG_LEVEL}|g" \
    "$TEMPLATE" >"$CONF"
log debug "rendered $CONF (access_log ${ACCESS_LOG}, error_log ${ERROR_LOG_LEVEL})"

if nginx -t 2>/dev/null; then
    log info "nginx config test passed"
else
    log error "ERROR: nginx config test failed:"
    nginx -t >&2 2>&1 || true
    exit 1
fi

log info "starting nginx"

# exec so nginx is PID 1 and receives SIGQUIT/SIGTERM directly. Wrapping it to
# trap signals here would need hand-rolled forwarding, and nginx already logs its
# own shutdown to error_log.
exec nginx -g 'daemon off;'
