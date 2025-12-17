#!/bin/bash

SCRIPT_DIR="$HOME/.config/slack"
DEBUG_PORT=9222

# Check if Slack is already running with debugging
if curl -s "http://127.0.0.1:$DEBUG_PORT/json" > /dev/null 2>&1; then
    cd "$SCRIPT_DIR"
    node inject-css.js > /dev/null 2>&1
    osascript -e 'tell application "Slack" to activate'
    exit 0
fi

# Kill any existing Slack
pkill -x "Slack" 2>/dev/null
sleep 1

# Start Slack with debugging
/Applications/Slack.app/Contents/MacOS/Slack --remote-debugging-port=$DEBUG_PORT &

# Wait for debug port to be available
for i in {1..30}; do
    curl -s "http://127.0.0.1:$DEBUG_PORT/json" > /dev/null 2>&1 && break
    sleep 0.5
done

# Poll until Slack client page is loaded (check for title containing "Slack")
echo "Waiting for Slack to load..."
for i in {1..60}; do
    PAGES=$(curl -s "http://127.0.0.1:$DEBUG_PORT/json" 2>/dev/null)
    # Check if any page has "Slack" in the title (indicates fully rendered)
    if echo "$PAGES" | grep -q '"title":\s*"Slack'; then
        echo "Slack loaded!"
        sleep 2  # Brief extra wait for React to finish
        break
    fi
    sleep 0.5
done

# Inject CSS
cd "$SCRIPT_DIR"
node inject-css.js > /dev/null 2>&1

echo "Theme applied!"
