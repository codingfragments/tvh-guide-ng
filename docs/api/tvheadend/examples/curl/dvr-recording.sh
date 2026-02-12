#!/bin/bash
# TVHeadend API - DVR Recording Examples
# Usage: ./dvr-recording.sh

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
echo "TVHeadend DVR Recording Examples"
echo "======================================"
echo

# Example 1: List all recordings
echo "1. List all recordings"
echo "---------------------"
tvh_api "$TVH_URL/api/dvr/entry/grid?limit=5" | \
    jq '.entries[] | "\(.title) - \(.status)"'
echo
read -p "Press Enter to continue..."
echo

# Example 2: List scheduled recordings only
echo "2. Scheduled recordings"
echo "----------------------"
tvh_api "$TVH_URL/api/dvr/entry/grid?status=scheduled&limit=5" | \
    jq '.entries[] | {title, start, channelname}'
echo
read -p "Press Enter to continue..."
echo

# Example 3: List completed recordings
echo "3. Completed recordings"
echo "----------------------"
tvh_api "$TVH_URL/api/dvr/entry/grid?status=completed&limit=5" | \
    jq '.entries[] | "\(.title) - \(.filesize // 0 | . / 1048576 | floor)MB"'
echo
read -p "Press Enter to continue..."
echo

# Example 4: Find a program to record
echo "4. Find program in EPG to record"
echo "--------------------------------"
# Search for news programs
FILTER='{"field":"title","type":"string","value":"news"}'
EVENTS=$(tvh_api -G "$TVH_URL/api/epg/events/grid" \
    --data-urlencode "filter=$FILTER" \
    --data-urlencode "limit=5")

echo "Found news programs:"
echo "$EVENTS" | jq '.entries[] | "\(.eventId): \(.title) on \(.channelName)"'
echo
read -p "Press Enter to continue..."
echo

# Example 5: Schedule recording by EPG event
echo "5. Schedule recording from EPG event"
echo "------------------------------------"
# Get first event ID from previous search
EVENT_ID=$(echo "$EVENTS" | jq -r '.entries[0].eventId')

if [ -n "$EVENT_ID" ] && [ "$EVENT_ID" != "null" ]; then
    echo "Scheduling recording for event ID: $EVENT_ID"
    RESPONSE=$(tvh_api -X POST \
        -H "Content-Type: application/json" \
        -d "{\"event_id\":$EVENT_ID}" \
        "$TVH_URL/api/dvr/entry/create_by_event")

    if echo "$RESPONSE" | jq -e '.uuid' > /dev/null 2>&1; then
        DVR_UUID=$(echo "$RESPONSE" | jq -r '.uuid')
        echo "✓ Recording scheduled successfully!"
        echo "  DVR Entry UUID: $DVR_UUID"
    else
        echo "✗ Failed to schedule recording:"
        echo "$RESPONSE" | jq '.'
    fi
else
    echo "No event found to record"
fi
echo
read -p "Press Enter to continue..."
echo

# Example 6: Create manual recording
echo "6. Create manual recording"
echo "-------------------------"
# Get first channel
CHANNEL=$(tvh_api "$TVH_URL/api/channel/grid?limit=1" | jq -r '.entries[0]')
CHANNEL_UUID=$(echo "$CHANNEL" | jq -r '.uuid')
CHANNEL_NAME=$(echo "$CHANNEL" | jq -r '.name')

if [ -n "$CHANNEL_UUID" ] && [ "$CHANNEL_UUID" != "null" ]; then
    # Record 1 hour from now
    START_TIME=$(($(date +%s) + 3600))
    STOP_TIME=$((START_TIME + 3600))

    echo "Creating manual recording:"
    echo "  Channel: $CHANNEL_NAME"
    echo "  Start: $(date -d @$START_TIME '+%Y-%m-%d %H:%M')"
    echo "  Stop: $(date -d @$STOP_TIME '+%Y-%m-%d %H:%M')"

    RESPONSE=$(tvh_api -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"conf\": {
                \"channel\": \"$CHANNEL_UUID\",
                \"start\": $START_TIME,
                \"stop\": $STOP_TIME,
                \"title\": \"Test Manual Recording\",
                \"pri\": 2,
                \"start_extra\": 2,
                \"stop_extra\": 5
            }
        }" \
        "$TVH_URL/api/dvr/entry/create")

    if echo "$RESPONSE" | jq -e '.uuid' > /dev/null 2>&1; then
        echo "✓ Manual recording created!"
        MANUAL_DVR_UUID=$(echo "$RESPONSE" | jq -r '.uuid')
    else
        echo "✗ Failed to create manual recording:"
        echo "$RESPONSE" | jq '.'
    fi
fi
echo
read -p "Press Enter to continue..."
echo

# Example 7: Create auto-recording rule
echo "7. Create auto-recording rule (series recording)"
echo "------------------------------------------------"
RESPONSE=$(tvh_api -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "conf": {
            "name": "Record all documentaries",
            "title": ".*documentary.*",
            "fulltext": true,
            "contentType": 144,
            "minduration": 3600,
            "start_extra": 2,
            "stop_extra": 5,
            "pri": 2
        }
    }' \
    "$TVH_URL/api/dvr/autorec/create")

if echo "$RESPONSE" | jq -e '.uuid' > /dev/null 2>&1; then
    AUTOREC_UUID=$(echo "$RESPONSE" | jq -r '.uuid')
    echo "✓ Auto-recording rule created!"
    echo "  UUID: $AUTOREC_UUID"
else
    echo "✗ Failed to create auto-recording rule:"
    echo "$RESPONSE" | jq '.'
fi
echo
read -p "Press Enter to continue..."
echo

# Example 8: List auto-recording rules
echo "8. List auto-recording rules"
echo "----------------------------"
tvh_api "$TVH_URL/api/dvr/autorec/grid" | \
    jq '.entries[] | {name, title, enabled}'
echo
read -p "Press Enter to continue..."
echo

# Example 9: Cancel a recording
echo "9. Cancel a recording"
echo "--------------------"
if [ -n "$MANUAL_DVR_UUID" ]; then
    echo "Canceling manual recording: $MANUAL_DVR_UUID"
    RESPONSE=$(tvh_api -X POST \
        -H "Content-Type: application/json" \
        -d "{\"uuid\":\"$MANUAL_DVR_UUID\"}" \
        "$TVH_URL/api/dvr/entry/cancel")

    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo "✓ Recording cancelled successfully"
    else
        echo "✗ Failed to cancel recording"
    fi
else
    echo "No recording to cancel (manual recording wasn't created)"
fi
echo
read -p "Press Enter to continue..."
echo

# Example 10: Recording statistics
echo "10. Recording statistics"
echo "-----------------------"
ALL_RECORDINGS=$(tvh_api "$TVH_URL/api/dvr/entry/grid?limit=0")
TOTAL=$(echo "$ALL_RECORDINGS" | jq '.total')
SCHEDULED=$(echo "$ALL_RECORDINGS" | jq '[.entries[] | select(.status == "scheduled")] | length')
RECORDING=$(echo "$ALL_RECORDINGS" | jq '[.entries[] | select(.status == "recording")] | length')
COMPLETED=$(echo "$ALL_RECORDINGS" | jq '[.entries[] | select(.status | startswith("completed"))] | length')
FAILED=$(echo "$ALL_RECORDINGS" | jq '[.entries[] | select(.status == "completedError" or .status == "missed")] | length')

echo "Total recordings: $TOTAL"
echo "  Scheduled: $SCHEDULED"
echo "  Currently recording: $RECORDING"
echo "  Completed: $COMPLETED"
echo "  Failed: $FAILED"
echo

# Calculate total disk usage
TOTAL_SIZE=$(echo "$ALL_RECORDINGS" | \
    jq '[.entries[] | .filesize // 0] | add')
TOTAL_SIZE_GB=$(echo "scale=2; $TOTAL_SIZE / 1073741824" | bc)
echo "Total disk usage: ${TOTAL_SIZE_GB}GB"
echo

echo "======================================"
echo "Examples completed!"
echo "======================================"
