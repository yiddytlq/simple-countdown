#!/bin/sh

if [ "$ENVIRONMENT" != "DEV" ]
then
    npm run build
fi
