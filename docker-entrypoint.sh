#!/bin/sh
set -e

# Inject TIMER_* env vars into variables-final.js at container start,
# so one prebuilt image is configured per-deployment.
/variables.sh /usr/share/nginx/html

exec nginx -g 'daemon off;'
