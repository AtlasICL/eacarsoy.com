#!/usr/bin/env bash
# Check that every domain variant 301-redirects to https://eacarsoy.com.

set -uo pipefail

canonical="https://eacarsoy.com"
path="/redirect-check?q=1"
max_hops=5

starts=(
    http://eacarsoy.com
    http://www.eacarsoy.com https://www.eacarsoy.com
    http://acarsoy.co.uk https://acarsoy.co.uk
    http://www.acarsoy.co.uk https://www.acarsoy.co.uk
    http://emreacarsoy.com https://emreacarsoy.com
    http://www.emreacarsoy.com https://www.emreacarsoy.com
)

# Colour only in a terminal or GitHub Actions, and never when NO_COLOR is set.
if [ -z "${NO_COLOR:-}" ] && { [ -t 1 ] || [ "${GITHUB_ACTIONS:-}" = true ]; }; then
    green=$'\e[32m' red=$'\e[31m' dim=$'\e[2m' bold=$'\e[1m' reset=$'\e[0m'
else
    green="" red="" dim="" bold="" reset=""
fi

passed=0
failed=0

pass() { # <url> <result>
    printf '  %s✓%s  %-28s %s\n' "$green" "$reset" "$1" "$2"
    passed=$((passed + 1))
}

fail() { # <url> <result> <reason>
    printf '  %s✗%s  %-28s %s\n' "$red" "$reset" "$1" "$2"
    printf '     %-28s %s%s%s\n' "" "$red" "$3" "$reset"
    failed=$((failed + 1))
}

# Fetch a URL without following redirects; prints "<status> <redirect target>".
fetch() {
    curl -s -o /dev/null --max-time 10 -w '%{http_code} %{redirect_url}' "$1"
}

printf '%sChecking redirects to %s%s\n' "$bold" "$canonical" "$reset"
printf '%sEach URL is requested with %s, which must be kept.%s\n\n' "$dim" "$path" "$reset"

read -r code _ < <(fetch "$canonical/")
if [ "$code" = 200 ]; then
    pass "$canonical/" "200"
elif [ "$code" = 000 ]; then
    fail "$canonical/" "no response" "the canonical site is unreachable"
else
    fail "$canonical/" "$code" "expected 200"
fi

for start in "${starts[@]}"; do
    url="$start$path"
    chain=""
    non301=""
    hops=0
    while [ "$hops" -lt "$max_hops" ]; do
        read -r code next < <(fetch "$url")
        case "$code" in
            30[1278])
                chain="${chain:+$chain → }$code"
                [ "$code" = 301 ] || non301="$code"
                url="$next"
                hops=$((hops + 1))
                ;;
            *) break ;;
        esac
    done

    if [ -z "$chain" ] && [ "$code" = 000 ]; then
        fail "$start" "no response" "no DNS record, or it isn't proxied through Cloudflare"
    elif [ -z "$chain" ]; then
        fail "$start" "$code" "responded without redirecting"
    elif [ -n "$non301" ]; then
        fail "$start" "$chain" "$non301 is not a permanent redirect; use 301"
    elif [ "$hops" -ge "$max_hops" ]; then
        fail "$start" "$chain" "more than $max_hops redirects (a loop?)"
    elif [ "$url" != "$canonical$path" ]; then
        fail "$start" "$chain → $url" "should end at $canonical$path"
    else
        pass "$start" "$chain"
    fi
done

echo
total=$((passed + failed))
if [ "$failed" = 0 ]; then
    printf '%s%sAll %d checks passed.%s\n' "$green" "$bold" "$total" "$reset"
else
    printf '%s%s%d of %d checks failed.%s\n' "$red" "$bold" "$failed" "$total" "$reset"
fi
[ "$failed" = 0 ]
