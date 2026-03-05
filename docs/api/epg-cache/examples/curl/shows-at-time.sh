#!/bin/bash
# EPG Cache API - Shows airing at a specific date/time
# Usage: ./shows-at-time.sh "2026-02-23 20:15"
#        ./shows-at-time.sh "2026-02-23T20:15"
#        ./shows-at-time.sh "tomorrow 14:00"
#
# Accepts any date string that `date -d` understands and converts it
# to a Unix timestamp for the /api/events/timerange endpoint.

# Configuration
EPG_HOST="${EPG_HOST:-localhost:3000}"
EPG_URL="http://$EPG_HOST"

if [ -z "$1" ]; then
    echo "Usage: $0 <date-time-string>"
    echo "Examples:"
    echo "  $0 \"2026-02-23 20:15\""
    echo "  $0 \"tomorrow 14:00\""
    echo "  $0 \"next friday 20:00\""
    exit 1
fi

# Convert human-readable date to Unix timestamp
# macOS: uses -jf or gnu date via gdate
# Linux: uses date -d
if date --version >/dev/null 2>&1; then
    # GNU date (Linux)
    TS=$(date -d "$1" +%s 2>/dev/null)
else
    # BSD date (macOS) — try common formats
    TS=$(date -jf "%Y-%m-%d %H:%M" "$1" +%s 2>/dev/null) ||
    TS=$(date -jf "%Y-%m-%dT%H:%M" "$1" +%s 2>/dev/null)
fi

if [ -z "$TS" ]; then
    echo "Error: could not parse date '$1'"
    echo "Try a format like: \"2026-02-23 20:15\""
    exit 1
fi

echo "=== Shows airing at: $(date -r "$TS" 2>/dev/null || date -d "@$TS") ==="
echo

curl -s "$EPG_URL/api/events/timerange?start=$TS&stop=$TS" | \
    jq -r '.data[] | "\(.channelName): \(.title) (\(.start | strftime("%H:%M")) - \(.stop | strftime("%H:%M")))"'
