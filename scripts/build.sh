#!/usr/bin/env bash

if [[ "$ENVIRONMENT" != "DEV" ]]
then
    npm run build
fi
