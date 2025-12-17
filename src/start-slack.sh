#!/bin/bash
#
# start-slack.sh
# Launches Slack with remote debugging and applies theme
#

set -e

# Configuration
DEBUG_PORT="${SLACK_DEBUG_PORT:-9222}"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/slack"
SLACK_APP="/Applications/Slack.app"

log() { echo "[SlackThemed] $1"; }
error() { echo "[SlackThemed] ERROR: $1" >&2; }

# Check if Slack is installed
if [[ ! -d "$SLACK_APP" ]]; then
    error "Slack not found at $SLACK_APP"
    exit 1
fi

# Check if Slack is already running with debugging
if curl -s "http://127.0.0.1:$DEBUG_PORT/json" > /dev/null 2>&1; then
    log "Slack already running, injecting theme..."
    cd "$CONFIG_DIR"
    if node inject-css.js; then
        osascript -e 'tell application "Slack" to activate'
        exit 0
    else
        error "Theme injection failed"
        osascript -e 'tell application "Slack" to activate'
        exit 1
    fi
fi

# Kill any existing Slack
pkill -x "Slack" 2>/dev/null || true
sleep 1

# Start Slack with debugging
log "Starting Slack with remote debugging on port $DEBUG_PORT..."
"$SLACK_APP/Contents/MacOS/Slack" --remote-debugging-port=$DEBUG_PORT &

# Wait for debug port to be available
log "Waiting for debug port..."
for i in {1..30}; do
    if curl -s "http://127.0.0.1:$DEBUG_PORT/json" > /dev/null 2>&1; then
        break
    fi
    sleep 0.5
done

# Poll until Slack client page is loaded
log "Waiting for Slack to load..."
for i in {1..60}; do
    PAGES=$(curl -s "http://127.0.0.1:$DEBUG_PORT/json" 2>/dev/null)
    if echo "$PAGES" | grep -q '"title":\s*"Slack'; then
        log "Slack loaded"
        sleep 2
        break
    fi
    sleep 0.5
done

# Inject CSS
cd "$CONFIG_DIR"
if node inject-css.js; then
    log "Theme applied successfully"
else
    error "Theme injection failed - Slack launched without theme"
    exit 1
fi
