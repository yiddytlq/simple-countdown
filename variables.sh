#!/bin/sh

# Create the variables-final.js file from the template
cp $1/variables.js $1/variables-final.js

# Support TIMER_ variables only
# Use TIMER_ environment variables to replace placeholders

# Background variable
sed -i -e "s@__BACKGROUND__@${TIMER_BACKGROUND}@g" $1/variables-final.js

# Target date variable  
sed -i -e "s@__END__@${TIMER_TARGET}@g" $1/variables-final.js

# Title variable
sed -i -e "s@__TITLE__@${TIMER_TITLE}@g" $1/variables-final.js
