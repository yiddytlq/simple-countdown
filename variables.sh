#!/usr/bin/env bash

cp $1/variables.js $1/variables-final.js

sed -i -e "s@__BACKGROUND__@$TIMER_BACKGROUND@g" $1/variables-final.js
sed -i -e "s@__END__@$TIMER_TARGET@g" $1/variables-final.js
sed -i -e "s@__TITLE__@$TIMER_TITLE@g" $1/variables-final.js
sed -i -e "s@__TEXT_SHADOW__@$TIMER_TEXT_SHADOW@g" $1/variables-final.js
sed -i -e "s@__POST_COUNTDOWN_MESSAGE__@$TIMER_POST_COUNTDOWN_MESSAGE@g" $1/variables-final.js
sed -i -e "s@__POST_COUNTDOWN_ACTION__@$TIMER_POST_COUNTDOWN_ACTION@g" $1/variables-final.js
sed -i -e "s@__REDIRECT_URL__@$TIMER_REDIRECT_URL@g" $1/variables-final.js
