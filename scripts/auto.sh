#!/bin/bash

# Define working directory and archive directory
WORK_DIR="/Users/patrick/Desktop/Desktop/auto_post"  # Correct path to your working directory
ARCHIVE_DIR="$WORK_DIR/archive"
IMAGE_DIR="$WORK_DIR/new_images"  # Updated to new_images
GITHUB_REPO_PATH="$WORK_DIR"  # Correct path to your GitHub repo
GITHUB_REPO_URL="https://github.com/WELCOMETOTHETRIBE/auto_post_dashboard.git"
POSTS_JSON="$WORK_DIR/public/posts.json"  # Correct path to posts.json

# Navigate to the working directory
cd "$WORK_DIR" || { echo "❌ ERROR: Cannot access $WORK_DIR"; exit 1; }

# Ensure Git is set up
if [ ! -d "$GITHUB_REPO_PATH/.git" ]; then
    echo "❌ ERROR: Not a Git repository. Initializing..."
    git init
    git remote add origin $GITHUB_REPO_URL
    git pull origin main --allow-unrelated-histories
fi

# Pull the latest changes to make sure we are up-to-date
git pull origin main || { echo "❌ ERROR: Git pull failed."; exit 1; }

# List files in the new images directory to check if the files are being detected
echo "Files in new images directory:"
ls -l "$IMAGE_DIR"  # Display all files in the new_images folder

# Use find to match image files in the new_images directory (jpg, jpeg, png, heic)
echo "Matching image files in the new images directory:"
shopt -s nocaseglob  # Enable case-insensitive globbing
image_found=false  # Flag to track if we find any images

# Loop through image files (jpg, jpeg, png, heic)
for IMAGE_FILE in "$IMAGE_DIR"/*.{jpg,jpeg,png,heic}; do
    if [ -f "$IMAGE_FILE" ]; then
        echo "Found image: $IMAGE_FILE"
        image_found=true
        
        # If it's a HEIC file, convert it to JPEG
        if [[ "$IMAGE_FILE" == *.heic || "$IMAGE_FILE" == *.HEIC ]]; then
            NEW_IMAGE="${IMAGE_FILE%.*}.jpg"  # Create a new filename with .jpg extension
            echo "Converting HEIC to JPEG: $NEW_IMAGE"
            heif-convert "$IMAGE_FILE" "$NEW_IMAGE"  # Convert the HEIC file to JPEG
            IMAGE_FILE="$NEW_IMAGE"  # Update the file path to the new JPEG file
        fi

        # Add and commit the image
        git add "$IMAGE_FILE"
        git commit -m "Added new image: $(basename "$IMAGE_FILE")"
        
        # Push to GitHub
        if git push origin main; then
            IMAGE_NAME=$(basename "$IMAGE_FILE")
            IMAGE_URL="https://raw.githubusercontent.com/WELCOMETOTHETRIBE/auto_post_dashboard/main/archive/$IMAGE_NAME"
            
            # Update posts.json with the correct image URL
            if [ -f "$POSTS_JSON" ]; then
                CURRENT_CONTENT=$(cat "$POSTS_JSON")
                
                if [ "$CURRENT_CONTENT" == "[]" ]; then
                    echo "[{\"image_url\": \"$IMAGE_URL\"}]" > "$POSTS_JSON"
                else
                    TEMP_FILE=$(mktemp)
                    echo "$CURRENT_CONTENT" | sed '$s/]$/,/' > "$TEMP_FILE"
                    echo "{\"image_url\": \"$IMAGE_URL\"}" >> "$TEMP_FILE"
                    echo "]" >> "$TEMP_FILE"
                    mv "$TEMP_FILE" "$POSTS_JSON"
                fi
                echo "✔ Image URL added to posts.json"
            else
                echo "❌ posts.json not found. Skipping image URL update."
            fi

            # Move the file to archive **only AFTER successful push**
            mv "$IMAGE_FILE" "$ARCHIVE_DIR/"
            git add "$ARCHIVE_DIR/$IMAGE_NAME"
            git commit -m "Archived image: $IMAGE_NAME"
            git push origin main
        else
            echo "❌ ERROR: GitHub push failed for image: $(basename "$IMAGE_FILE"). Skipping..."
            continue
        fi
    else
        echo "❌ ERROR: Image file not found: $IMAGE_FILE"
    fi
done

# Automate the commit and push for any changes (including deletions)
echo "Staging and committing changes automatically..."
git add -A  # Stage all changes, including deletions
git commit -m "Automated commit: updates to posts.json and image files"  # Commit all changes
git push origin main  # Push to GitHub

# Show success message
osascript -e 'display notification "All images processed, posts.json updated, and changes pushed successfully!" with title "GitHub Upload"'

exit 0

