#!/bin/bash
# EPG Cache API - Shows running right now
# Usage: ./now-playing.sh
#
# Queries the /api/events/timerange endpoint with start=stop=now
# to find all events overlapping with the current moment.

# Configuration
EPG_HOST="${EPG_HOST:-localhost:3000}"
EPG_URL="http://$EPG_HOST"

NOW=$(date +%s)

echo "=== Currently airing shows ==="
echo "Time: $(date)"
echo

curl -s "$EPG_URL/api/events/timerange?start=$NOW&stop=$NOW" |
  jq -r '.data[] | "\(.channelName): \(.title) (\(.start | strftime("%H:%M")) - \(.stop | strftime("%H:%M")))"'
