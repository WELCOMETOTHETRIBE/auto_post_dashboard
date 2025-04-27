#!/bin/bash

# === CONFIGURATION ===
WORK_DIR="/Users/patrick/Desktop/taplink-assets"
ARCHIVE_DIR="$WORK_DIR/archive"
DASHBOARD_REPO="/Users/patrick/Desktop/auto_post"
POSTS_JSON="$DASHBOARD_REPO/posts.json"
GITHUB_REPO="https://github.com/WELCOMETOTHETRIBE/taplink-assets.git"

# === STEP 1: PREPARE WORK DIR ===
cd "$WORK_DIR" || { echo "❌ ERROR: Cannot access $WORK_DIR"; exit 1; }

# Ensure Git is set up
if [ ! -d "$WORK_DIR/.git" ]; then
    echo "❌ ERROR: Not a Git repository. Initializing..."
    git init
    git remote add origin "$GITHUB_REPO"
    git pull origin main
fi

# === STEP 2: FIND THE NEWEST IMAGE ===
LATEST_FILE=$(ls -t -- *.png *.jpg *.jpeg 2>/dev/null | head -n 1)

if [ -z "$LATEST_FILE" ]; then
    osascript -e 'display notification "No new images found!" with title "GitHub Upload Failed"'
    exit 1
fi

echo "✅ Found latest image: $LATEST_FILE"

# === STEP 3: COMMIT IMAGE TO GitHub ===
git add "$LATEST_FILE"
git commit -m "Add new image: $LATEST_FILE"
git push origin main

# === STEP 4: GENERATE RAW URL ===
RAW_URL="https://raw.githubusercontent.com/WELCOMETOTHETRIBE/taplink-assets/main/$LATEST_FILE"
echo "✅ Image uploaded. Public URL: $RAW_URL"

# === STEP 5: PREPARE NEW POST DRAFT ===
cd "$DASHBOARD_REPO" || { echo "❌ ERROR: Cannot access dashboard repo"; exit 1; }

# Check if posts.json exists
if [ ! -f "$POSTS_JSON" ]; then
    echo "[]" > "$POSTS_JSON"
fi

# Create a temp updated posts.json
jq --arg url "$RAW_URL" '. += [{"Image URL": $url, "Caption": "", "Hashtags": "", "Status": "Draft"}]' "$POSTS_JSON" > tmp_posts.json && mv tmp_posts.json "$POSTS_JSON"

echo "✅ Draft added to posts.json."

# === STEP 6: PUSH TO DASHBOARD REPO ===
git add posts.json
git commit -m "Add draft post for new image: $LATEST_FILE"
git push origin main

# === STEP 7: ARCHIVE ORIGINAL IMAGE ===
mkdir -p "$ARCHIVE_DIR"
mv "$WORK_DIR/$LATEST_FILE" "$ARCHIVE_DIR/"

echo "✅ Script completed successfully."

exit 0

