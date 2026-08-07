#!/bin/sh
# Substitute TIMER_* env vars into <dir>/variables.js -> <dir>/variables-final.js.
#
# Runs before vite (pnpm dev / pnpm build) and again at container start, so one
# prebuilt image is configured per deployment. See CLAUDE.md.
#
# awk reads each value straight from ENVIRON and substitutes it literally. No
# value is ever interpolated into a regex, a sed expression or a shell word, so
# an @, &, backslash or quote in a TIMER_* value cannot corrupt the output or
# stop the container from starting.
set -eu

dir=${1:?usage: variables.sh <dir>}

if [ ! -r "$dir/variables.js" ]; then
    echo "[variables.sh] ERROR: cannot copy $dir/variables.js to $dir/variables-final.js" >&2
    exit 1
fi

awk '
# Escape for a JS single-quoted string literal. The characters are built with
# sprintf so this program needs no backslash escapes of its own -- and so that
# it can handle a single quote at all, being itself inside one.
function js_escape(s) {
    s = replace(s, BS, BS BS)   # backslashes first, or we double our own output
    s = replace(s, SQ, BS SQ)
    s = replace(s, CR, "")
    s = replace(s, LF, " ")
    return s
}

# Literal replacement using index()/substr() only: the needle is never a regex
# and & is never a backreference.
function replace(hay, needle, rep,    acc, p) {
    acc = ""
    while ((p = index(hay, needle)) > 0) {
        acc = acc substr(hay, 1, p - 1) rep
        hay = substr(hay, p + length(needle))
    }
    return acc hay
}

function add(placeholder, envvar) {
    NP++
    PH[NP] = placeholder
    VAL[placeholder] = js_escape(ENVIRON[envvar])
}

# Single left-to-right pass: always take the earliest (then longest) placeholder
# and continue past the text just inserted. Substituting one placeholder at a
# time across the whole line would let a value that happens to contain another
# placeholder be rewritten by a later round.
function substitute(line,    out, best, bestpos, i, p) {
    out = ""
    while (1) {
        bestpos = 0
        best = ""
        for (i = 1; i <= NP; i++) {
            p = index(line, PH[i])
            if (p > 0 && (bestpos == 0 || p < bestpos ||
                          (p == bestpos && length(PH[i]) > length(best)))) {
                bestpos = p
                best = PH[i]
            }
        }
        if (bestpos == 0) break
        out = out substr(line, 1, bestpos - 1) VAL[best]
        line = substr(line, bestpos + length(best))
    }
    return out line
}

BEGIN {
    BS = sprintf("%c", 92)
    SQ = sprintf("%c", 39)
    CR = sprintf("%c", 13)
    LF = sprintf("%c", 10)

    NP = 0
    add("__BACKGROUND__", "TIMER_BACKGROUND")
    add("__END__", "TIMER_TARGET")
    add("__TITLE__", "TIMER_TITLE")
    add("__DONE_MESSAGE__", "TIMER_DONE_MESSAGE")
    add("__DONE_COUNTUP__", "TIMER_DONE_COUNTUP")
    add("__DONE_ANIMATION__", "TIMER_DONE_ANIMATION")
    add("__DONE_HIDE_TIMER__", "TIMER_DONE_HIDE_TIMER")
    add("__DONE_RELOAD__", "TIMER_DONE_RELOAD")
    add("__DONE_REDIRECT_URL__", "TIMER_DONE_REDIRECT_URL")
    add("__DONE_DELAY_MS__", "TIMER_DONE_DELAY_MS")
}

# Catches a placeholder added to variables.js that nobody wired up here. Scans
# the template, never the output, so a TIMER_* value that happens to contain
# __SOMETHING__ is not mistaken for a failed substitution.
function check_unknown(line,    rest, tok) {
    rest = line
    while (match(rest, /__[A-Z0-9_]+__/)) {
        tok = substr(rest, RSTART, RLENGTH)
        if (!(tok in VAL)) UNKNOWN[tok] = 1
        rest = substr(rest, RSTART + RLENGTH)
    }
}

{
    check_unknown($0)
    print substitute($0)
}

END {
    bad = 0
    for (tok in UNKNOWN) {
        print "[variables.sh] ERROR: template placeholder " tok " has no TIMER_* mapping" > "/dev/stderr"
        bad = 1
    }
    if (bad) exit 1
}
' "$dir/variables.js" >"$dir/variables-final.js"

echo "[variables.sh] substituted TIMER_* placeholders into $dir/variables-final.js"
