#!/bin/bash
# TVHeadend API - EPG Query Examples
# Usage: ./epg-queries.sh

# Configuration
TVH_HOST="localhost:9981"
TVH_USER="admin"
TVH_PASS="password"
TVH_URL="http://$TVH_HOST"

# Helper function
tvh_api() {
    curl -s -u "$TVH_USER:$TVH_PASS" "$@"
}

echo "======================================"
echo "TVHeadend EPG Query Examples"
echo "======================================"
echo

# Example 1: Get current programs
echo "1. Currently airing programs"
echo "---------------------------"
tvh_api "$TVH_URL/api/epg/events/grid?mode=now&limit=5" | \
    jq '.entries[] | "\(.channelName): \(.title)"'
echo
read -p "Press Enter to continue..."
echo

# Example 2: Get upcoming programs
echo "2. Upcoming programs (next 4 hours)"
echo "-----------------------------------"
tvh_api "$TVH_URL/api/epg/events/grid?mode=upcoming&limit=10" | \
    jq '.entries[] | {
        time: (.start | strftime("%H:%M")),
        channel: .channelName,
        title: .title
    }'
echo
read -p "Press Enter to continue..."
echo

# Example 3: Search programs by title
echo "3. Search for 'news' programs"
echo "-----------------------------"
tvh_api "$TVH_URL/api/epg/events/grid?filter=news&fulltext=1&limit=5" | \
    jq '.entries[] | "\(.title) - \(.channelName)"'
echo
read -p "Press Enter to continue..."
echo

# Example 4: Filter by channel
echo "4. Programs on specific channel"
echo "-------------------------------"
# Get first channel UUID
CHANNEL_UUID=$(tvh_api "$TVH_URL/api/channel/grid?limit=1" | \
    jq -r '.entries[0].uuid')

if [ -n "$CHANNEL_UUID" ] && [ "$CHANNEL_UUID" != "null" ]; then
    echo "Channel UUID: $CHANNEL_UUID"
    tvh_api "$TVH_URL/api/epg/events/grid?channel=$CHANNEL_UUID&limit=5" | \
        jq '.entries[] | {
            start: (.start | strftime("%Y-%m-%d %H:%M")),
            title,
            duration: (.duration / 60 | floor)
        }'
fi
echo
read -p "Press Enter to continue..."
echo

# Example 5: Filter by content type (movies)
echo "5. Movies only (content type 16)"
echo "--------------------------------"
tvh_api "$TVH_URL/api/epg/events/grid?contentType=16&limit=5" | \
    jq '.entries[] | {
        title,
        channel: .channelName,
        start: (.start | strftime("%Y-%m-%d %H:%M")),
        duration_min: (.duration / 60 | floor)
    }'
echo
read -p "Press Enter to continue..."
echo

# Example 6: Filter by duration (long-form content)
echo "6. Long programs (>90 minutes)"
echo "------------------------------"
MIN_DURATION=5400  # 90 minutes in seconds
tvh_api "$TVH_URL/api/epg/events/grid?duration=$MIN_DURATION&limit=5" | \
    jq '.entries[] | {
        title,
        duration_min: (.duration / 60 | floor),
        channel: .channelName
    }'
echo
read -p "Press Enter to continue..."
echo

# Example 7: Filter by time range
echo "7. Programs in specific time range"
echo "-----------------------------------"
# Today 20:00 to 23:00
TODAY=$(date +%Y-%m-%d)
START_TIME=$(date -d "$TODAY 20:00" +%s)
END_TIME=$(date -d "$TODAY 23:00" +%s)

echo "Time range: $(date -d @$START_TIME '+%Y-%m-%d %H:%M') to $(date -d @$END_TIME '+%H:%M')"

FILTER="[
    {\"field\":\"start\",\"type\":\"numeric\",\"value\":$START_TIME,\"comparison\":\"gte\"},
    {\"field\":\"start\",\"type\":\"numeric\",\"value\":$END_TIME,\"comparison\":\"lt\"}
]"

tvh_api -G "$TVH_URL/api/epg/events/grid" \
    --data-urlencode "filter=$FILTER" \
    --data-urlencode "limit=10" | \
    jq '.entries[] | {
        time: (.start | strftime("%H:%M")),
        title,
        channel: .channelName
    }'
echo
read -p "Press Enter to continue..."
echo

# Example 8: Complex filter - HD movies tonight
echo "8. HD movies airing tonight"
echo "--------------------------"
TONIGHT_START=$(date -d "$TODAY 18:00" +%s)
TONIGHT_END=$(date -d "$TODAY 23:59" +%s)

FILTER="[
    {\"field\":\"contentType\",\"type\":\"numeric\",\"value\":16,\"comparison\":\"eq\"},
    {\"field\":\"hd\",\"type\":\"boolean\",\"value\":1},
    {\"field\":\"start\",\"type\":\"numeric\",\"value\":$TONIGHT_START,\"comparison\":\"gte\"},
    {\"field\":\"stop\",\"type\":\"numeric\",\"value\":$TONIGHT_END,\"comparison\":\"lte\"}
]"

tvh_api -G "$TVH_URL/api/epg/events/grid" \
    --data-urlencode "filter=$FILTER" | \
    jq '.entries[] | {
        time: (.start | strftime("%H:%M")),
        title,
        channel: .channelName,
        duration_min: (.duration / 60 | floor)
    }'
echo
read -p "Press Enter to continue..."
echo

# Example 9: Load detailed event information
echo "9. Get detailed event information"
echo "---------------------------------"
# Get first event ID
EVENT_ID=$(tvh_api "$TVH_URL/api/epg/events/grid?limit=1" | \
    jq -r '.entries[0].eventId')

if [ -n "$EVENT_ID" ] && [ "$EVENT_ID" != "null" ]; then
    echo "Loading details for event ID: $EVENT_ID"
    tvh_api -X POST \
        -H "Content-Type: application/json" \
        -d "{\"eventId\":$EVENT_ID}" \
        "$TVH_URL/api/epg/events/load" | \
        jq '.entries[0] | {
            title,
            subtitle,
            description,
            start: (.start | strftime("%Y-%m-%d %H:%M")),
            channel: .channelName,
            genre,
            credits
        }'
fi
echo
read -p "Press Enter to continue..."
echo

# Example 10: Generate daily schedule for channel
echo "10. Daily schedule for first channel"
echo "------------------------------------"
CHANNEL=$(tvh_api "$TVH_URL/api/channel/grid?limit=1" | jq -r '.entries[0]')
CHANNEL_UUID=$(echo "$CHANNEL" | jq -r '.uuid')
CHANNEL_NAME=$(echo "$CHANNEL" | jq -r '.name')

if [ -n "$CHANNEL_UUID" ] && [ "$CHANNEL_UUID" != "null" ]; then
    echo "Channel: $CHANNEL_NAME"
    echo "Date: $TODAY"
    echo

    DAY_START=$(date -d "$TODAY 00:00" +%s)
    DAY_END=$(date -d "$TODAY 23:59" +%s)

    FILTER="[
        {\"field\":\"start\",\"type\":\"numeric\",\"value\":$DAY_START,\"comparison\":\"gte\"},
        {\"field\":\"start\",\"type\":\"numeric\",\"value\":$DAY_END,\"comparison\":\"lte\"}
    ]"

    tvh_api -G "$TVH_URL/api/epg/events/grid" \
        --data-urlencode "channel=$CHANNEL_UUID" \
        --data-urlencode "filter=$FILTER" \
        --data-urlencode "sort=start" \
        --data-urlencode "dir=ASC" \
        --data-urlencode "limit=0" | \
        jq -r '.entries[] | "\(.start | strftime("%H:%M")) - \(.stop | strftime("%H:%M"))  \(.title)"'
fi
echo

# Example 11: Content type statistics
echo "11. Content type distribution"
echo "----------------------------"
tvh_api "$TVH_URL/api/epg/content_type/list" | \
    jq -r '.entries[] | "\(.code): \(.name)"' | head -10
echo

# Example 12: Find series episodes
echo "12. Find all episodes of a series"
echo "---------------------------------"
SERIES_TITLE="Planet Earth"
FILTER="{\"field\":\"title\",\"type\":\"string\",\"value\":\"$SERIES_TITLE\",\"comparison\":\"starts\"}"

tvh_api -G "$TVH_URL/api/epg/events/grid" \
    --data-urlencode "filter=$FILTER" \
    --data-urlencode "sort=start" | \
    jq '.entries[] | {
        title,
        subtitle,
        start: (.start | strftime("%Y-%m-%d %H:%M")),
        channel: .channelName,
        episode: .episodeNumber,
        season: .seasonNumber
    }' | head -20
echo

echo "======================================"
echo "Examples completed!"
echo "======================================"
