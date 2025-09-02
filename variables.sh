#!/bin/sh

# Create the variables-final.js file from the template
cp $1/variables.js $1/variables-final.js

# Support both legacy TIMER_ variables and new VITE_ variables
# Use VITE_ versions if available, otherwise fall back to TIMER_ versions

# Background variable
BACKGROUND_VALUE="${VITE_TIMER_BACKGROUND:-${TIMER_BACKGROUND}}"
sed -i -e "s@__BACKGROUND__@${BACKGROUND_VALUE}@g" $1/variables-final.js

# Target date variable  
TARGET_VALUE="${VITE_TIMER_TARGET:-${TIMER_TARGET}}"
sed -i -e "s@__END__@${TARGET_VALUE}@g" $1/variables-final.js

# Title variable
TITLE_VALUE="${VITE_TIMER_TITLE:-${TIMER_TITLE}}"
sed -i -e "s@__TITLE__@${TITLE_VALUE}@g" $1/variables-final.js
