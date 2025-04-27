#!/bin/bash

# === CONFIGURATION ===
WORK_DIR="/Users/patrick/Desktop/taplink-assets"
ARCHIVE_DIR="$WORK_DIR/archive"
POSTS_JSON="/Users/patrick/Desktop/auto_post_dashboard/posts.json"
GITHUB_REPO_URL="https://github.com/WELCOMETOTHETRIBE/taplink-assets.git"
OPENAI_MODEL="gpt-4o"

# Make sure OpenAI API Key is loaded
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ ERROR: OPENAI_API_KEY environment variable not set."
  exit 1
fi

# === SETUP ===
cd "$WORK_DIR" || { echo "❌ ERROR: Cannot access $WORK_DIR"; exit 1; }

# Ensure archive folder exists
mkdir -p "$ARCHIVE_DIR"

# === FIND LATEST FILE ===
LATEST_FILE=$(ls -t -- *.png *.jpg *.jpeg 2>/dev/null | head -n 1)

if [ -z "$LATEST_FILE" ]; then
    osascript -e 'display notification "No new images found!" with title "Upload Failed"'
    exit 1
fi

# === GIT SETUP ===
if [ ! -d "$WORK_DIR/.git" ]; then
    echo "❌ ERROR: Not a Git repo. Initializing..."
    git init
    git remote add origin "$GITHUB_REPO_URL"
    git pull origin main
fi

# === UPLOAD IMAGE TO GITHUB ===
git add "$LATEST_FILE"
git commit -m "Add new image: $LATEST_FILE"
git push origin main

# === CONSTRUCT RAW IMAGE URL ===
URL="https://raw.githubusercontent.com/WELCOMETOTHETRIBE/taplink-assets/main/$LATEST_FILE"
echo "✅ Image uploaded. Public URL: $URL"

# === GENERATE CAPTION + HASHTAGS USING OPENAI ===
CAPTION_RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$OPENAI_MODEL\",
    \"messages\": [
      {\"role\": \"system\", \"content\": \"You are a creative copywriter specializing in short captions and social media hashtags.\"},
      {\"role\": \"user\", \"content\": \"Write a captivating Instagram-style caption and 5 hashtags for an image found at this URL: $URL\"}
    ]
  }")

# Parse the JSON response
CAPTION=$(echo "$CAPTION_RESPONSE" | jq -r '.choices[0].message.content' | awk -F'Hashtags:' '{print $1}' | xargs)
HASHTAGS=$(echo "$CAPTION_RESPONSE" | jq -r '.choices[0].message.content' | awk -F'Hashtags:' '{print $2}' | xargs)

# Safety fallback
CAPTION=${CAPTION:-"Amazing view!"}
HASHTAGS=${HASHTAGS:-"#Adventure #Nature #Inspiration"}

echo "✅ Generated Caption: $CAPTION"
echo "✅ Generated Hashtags: $HASHTAGS"

# === UPDATE posts.json ===
# Create a new post JSON block
NEW_POST=$(jq -n \
  --arg img "$URL" \
  --arg caption "$CAPTION" \
  --arg hashtags "$HASHTAGS" \
  --arg status "Draft" \
  '{ "Image URL": $img, "Caption": $caption, "Hashtags": $hashtags, "Status": $status }')

# Append it to the posts array
jq ". += [$NEW_POST]" "$POSTS_JSON" > tmp_posts.json && mv tmp_posts.json "$POSTS_JSON"

echo "✅ posts.json updated."

# === GIT PUSH posts.json TO DASHBOARD ===
cd /Users/patrick/Desktop/auto_post_dashboard || { echo "❌ ERROR: Cannot access dashboard repo"; exit 1; }

git add posts.json
git commit -m "Add draft post for $LATEST_FILE"
git push origin main

echo "✅ Dashboard updated."

# === ARCHIVE IMAGE LOCALLY ===
mv "$WORK_DIR/$LATEST_FILE" "$ARCHIVE_DIR/"

osascript -e "display notification \"Upload and draft creation complete!\" with title \"Automation Success\""
