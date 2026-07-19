#!/bin/sh

dir=$1

cp "$dir/variables.js" "$dir/variables-final.js" || {
    echo "[variables.sh] ERROR: cannot copy $dir/variables.js to $dir/variables-final.js" >&2
    exit 1
}

for pair in "__BACKGROUND__=$TIMER_BACKGROUND" "__END__=$TIMER_TARGET" "__TITLE__=$TIMER_TITLE"; do
    placeholder=${pair%%=*}
    value=${pair#*=}
    sed -i -e "s@$placeholder@$value@g" "$dir/variables-final.js" || {
        echo "[variables.sh] ERROR: substitution of $placeholder failed" >&2
        exit 1
    }
done

echo "[variables.sh] substituted TIMER_* placeholders into $dir/variables-final.js"
