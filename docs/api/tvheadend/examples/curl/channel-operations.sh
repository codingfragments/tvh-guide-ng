#!/bin/bash
# TVHeadend API - Channel Operations Examples
# Usage: ./channel-operations.sh

# Configuration
TVH_HOST="localhost:9981"
TVH_USER="admin"
TVH_PASS="password"
TVH_URL="http://$TVH_HOST"

# Helper function for authenticated requests
tvh_api() {
    curl -s -u "$TVH_USER:$TVH_PASS" "$@"
}

echo "======================================"
echo "TVHeadend Channel Operations Examples"
echo "======================================"
echo

# Example 1: List all channels
echo "1. List all channels"
echo "-------------------"
tvh_api "$TVH_URL/api/channel/grid?limit=5" | jq '.'
echo
read -p "Press Enter to continue..."
echo

# Example 2: Get simple channel list (for dropdowns)
echo "2. Simple channel list"
echo "---------------------"
tvh_api "$TVH_URL/api/channel/list" | jq '.entries[] | "\(.key): \(.val)"'
echo
read -p "Press Enter to continue..."
echo

# Example 3: Sort channels by number
echo "3. Channels sorted by number"
echo "---------------------------"
tvh_api "$TVH_URL/api/channel/grid?sort=number&dir=ASC&limit=5" | \
    jq '.entries[] | "\(.number): \(.name)"'
echo
read -p "Press Enter to continue..."
echo

# Example 4: Search channels by name
echo "4. Search for BBC channels"
echo "-------------------------"
FILTER='{"field":"name","type":"string","value":"BBC"}'
tvh_api -G "$TVH_URL/api/channel/grid" \
    --data-urlencode "filter=$FILTER" | \
    jq '.entries[] | .name'
echo
read -p "Press Enter to continue..."
echo

# Example 5: Get channels with specific tag
echo "5. Get channels with 'HD' tag (if tag exists)"
echo "---------------------------------------------"
# First, get tag UUID
HD_TAG=$(tvh_api "$TVH_URL/api/channeltag/list" | \
    jq -r '.entries[] | select(.val | contains("HD")) | .key' | head -1)

if [ -n "$HD_TAG" ]; then
    echo "Found HD tag: $HD_TAG"
    tvh_api "$TVH_URL/api/channel/grid?tags=$HD_TAG&limit=5" | \
        jq '.entries[] | .name'
else
    echo "No HD tag found"
fi
echo
read -p "Press Enter to continue..."
echo

# Example 6: Get channel details by UUID
echo "6. Get specific channel details"
echo "-------------------------------"
# Get first channel UUID
CHANNEL_UUID=$(tvh_api "$TVH_URL/api/channel/grid?limit=1" | \
    jq -r '.entries[0].uuid')

if [ -n "$CHANNEL_UUID" ] && [ "$CHANNEL_UUID" != "null" ]; then
    echo "Channel UUID: $CHANNEL_UUID"
    FILTER="{\"field\":\"uuid\",\"type\":\"string\",\"value\":\"$CHANNEL_UUID\"}"
    tvh_api -G "$TVH_URL/api/channel/grid" \
        --data-urlencode "filter=$FILTER" | \
        jq '.entries[0]'
else
    echo "No channels found"
fi
echo
read -p "Press Enter to continue..."
echo

# Example 7: List all channel tags
echo "7. List all channel tags"
echo "-----------------------"
tvh_api "$TVH_URL/api/channeltag/grid" | \
    jq '.entries[] | "\(.name) [\(.uuid)]"'
echo
read -p "Press Enter to continue..."
echo

# Example 8: Get channel configuration schema
echo "8. Channel configuration schema"
echo "------------------------------"
tvh_api "$TVH_URL/api/channel/class" | jq '.properties[0:3]'
echo "... (truncated for brevity)"
echo
read -p "Press Enter to continue..."
echo

# Example 9: Count channels by enabled status
echo "9. Count enabled vs disabled channels"
echo "------------------------------------"
TOTAL=$(tvh_api "$TVH_URL/api/channel/grid?limit=0" | jq '.total')
ENABLED_FILTER='{"field":"enabled","type":"boolean","value":1}'
ENABLED=$(tvh_api -G "$TVH_URL/api/channel/grid?limit=0" \
    --data-urlencode "filter=$ENABLED_FILTER" | jq '.total')
DISABLED=$((TOTAL - ENABLED))

echo "Total channels: $TOTAL"
echo "Enabled: $ENABLED"
echo "Disabled: $DISABLED"
echo

# Example 10: Export channels to CSV
echo "10. Export channels to CSV"
echo "-------------------------"
OUTPUT_FILE="channels_export.csv"
echo "number,name,uuid,enabled" > "$OUTPUT_FILE"
tvh_api "$TVH_URL/api/channel/grid?limit=0&sort=number" | \
    jq -r '.entries[] | "\(.number),\(.name),\(.uuid),\(.enabled)"' >> "$OUTPUT_FILE"
echo "Exported to $OUTPUT_FILE"
wc -l "$OUTPUT_FILE"
echo

echo "======================================"
echo "Examples completed!"
echo "======================================"
