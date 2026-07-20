#!/bin/sh
# Usage: . ./load-env.sh
set -a
if [ -f .env ]; then
  while IFS='=' read -r key value; do
    case "$key" in '' | '#'*) continue ;; esac
    export "$key=$value"
  done <.env
fi
set +a
