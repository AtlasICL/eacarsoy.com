#!/usr/bin/env bash
# Check that every domain variant 301-redirects to https://eacarsoy.com.

set -uo pipefail
canonical="https://eacarsoy.com"
path="/redirect-check?q=1"
fail=0

code=$(curl -s -o /dev/null -w '%{http_code}' "$canonical/")
if [ "$code" = 200 ]; then
    echo "ok    $canonical/ -> 200"
else
    echo "FAIL  $canonical/ -> $code (expected 200)"
    fail=1
fi

for start in http://eacarsoy.com \
             http://www.eacarsoy.com https://www.eacarsoy.com \
             http://acarsoy.co.uk https://acarsoy.co.uk \
             http://www.acarsoy.co.uk https://www.acarsoy.co.uk \
             http://emreacarsoy.com https://emreacarsoy.com \
             http://www.emreacarsoy.com https://www.emreacarsoy.com; do
    url="$start$path"
    chain=""
    all301=1
    for _ in 1 2 3 4 5; do
        read -r code next < <(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$url")
        case "$code" in
            30[1278]) chain="$chain $code"; [ "$code" = 301 ] || all301=0; url="$next" ;;
            *) break ;;
        esac
    done
    if [ -n "$chain" ] && [ "$all301" = 1 ] && [ "$url" = "$canonical$path" ]; then
        echo "ok    $start ->$chain -> $url"
    else
        [ -z "$chain" ] && chain=" $code"
        echo "FAIL  $start ->$chain -> $url"
        fail=1
    fi
done

if [ "$fail" = 0 ]; then
    echo "All redirects OK."
else
    echo "Expected: only 301s, ending at $canonical$path (000 means no response)."
fi
exit "$fail"
