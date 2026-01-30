#!/bin/bash
set -e

# Temporary files for tracking
SUMMARY_FILE=$(mktemp)
PROCESSED_LIST=$(mktemp)
HAS_CHANGES=false

# Ensure we start with empty files
> "$SUMMARY_FILE"
> "$PROCESSED_LIST"

echo "Starting image optimization..."

# Function to get max width resize args
get_resize_args() {
    local file="$1"
    local width
    # Use identify from ImageMagick
    if ! command -v identify &> /dev/null; then
        echo ""
        return
    fi
    
    width=$(identify -format "%w" "$file" 2>/dev/null || echo "0")
    if [ "$width" -gt 2048 ]; then
        # Resize to width 2048, preserve aspect ratio (height=0)
        echo "-resize 2048 0"
    else
        echo ""
    fi
}

# 1. Convert non-webp images to webp
find . -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.git/*" \
    -print0 | while IFS= read -r -d '' file; do

    filename="${file%.*}"
    webp_file="${filename}.webp"
    
    resize_args=$(get_resize_args "$file")
    needs_update=false
    
    # Check if we need to update
    if [ ! -f "$webp_file" ]; then
        needs_update=true
    elif [ "$file" -nt "$webp_file" ]; then
        # Source is newer than dest
        needs_update=true
    elif [ -n "$resize_args" ]; then
        # Destination exists, but source is too big. 
        # We need to check if DEST is also too big.
        # If dest is already resized, we don't need to do anything (unless source is newer, caught above)
        dest_width=$(identify -format "%w" "$webp_file" 2>/dev/null || echo "0")
        if [ "$dest_width" -gt 2048 ]; then
            needs_update=true
        fi
    fi
    
    if [ "$needs_update" = true ]; then
        if [ -n "$resize_args" ]; then
            echo "Converting and resizing $file to $webp_file..."
            action_msg="- Converted and resized $file"
        else
            echo "Converting $file to $webp_file..."
            action_msg="- Converted $file"
        fi
        
        # Convert to webp with quality 80
        cwebp -q 80 $resize_args "$file" -o "$webp_file" -quiet
        
        echo "$action_msg" >> "$SUMMARY_FILE"
        
        if [ -f "$file" ] && [ -f "$webp_file" ]; then
            src_size=$(stat -c%s "$file")
            dest_size=$(stat -c%s "$webp_file")
            echo "  ($src_size -> $dest_size bytes)" >> "$SUMMARY_FILE"
        fi
        
        # Mark as changed
        echo "changed" >> "$PROCESSED_LIST"
    fi
    
    # Add to list of files we visited so we don't process again in step 2
    echo "$webp_file" >> "$PROCESSED_LIST"

done

# 2. Resize existing large WebP files (ONLY if they are too large)
find . -type f -iname "*.webp" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.git/*" \
    -print0 | while IFS= read -r -d '' file; do
    
    # Skip files processed in Step 1
    if grep -Fxq "$file" "$PROCESSED_LIST"; then
        continue
    fi
    
    resize_args=$(get_resize_args "$file")
    
    # If resize is needed, we MUST process it regardless of savings
    if [ -n "$resize_args" ]; then
        echo "Resizing large image $file..."
        action_msg="- Resized $file"
        should_process=true
    else
        # If no resize needed, we only want to optimize if it saves significant space
        # Attempt compression to temp
        should_process=false
        # We'll run cwebp optimization trial next
    fi
     
    # Trial run
    cwebp -q 80 $resize_args "$file" -o "${file}.tmp" -quiet
    
    if [ -f "${file}.tmp" ]; then
        original_size=$(stat -c%s "$file")
        new_size=$(stat -c%s "${file}.tmp")
        
        # Calculate percentage saved: (orig - new) * 100 / orig
        if [ "$original_size" -gt 0 ]; then
            saved_percent=$(( (original_size - new_size) * 100 / original_size ))
        else
            saved_percent=0
        fi
        
        # DECISION LOGIC:
        # 1. If we resized, we accept the new file (even if size grows, though unlikely)
        # 2. If we didn't resize, we only accept if savings > 5% to avoid generation loss loop
        
        accept_changes=false
        
        if [ -n "$resize_args" ]; then
            accept_changes=true
            log_msg="- Resized $file"
        elif [ "$saved_percent" -ge 5 ]; then
            accept_changes=true
            log_msg="- Optimized $file (saved ${saved_percent}%)"
        fi
        
        if [ "$accept_changes" = true ]; then
            mv "${file}.tmp" "$file"
            echo "$log_msg" >> "$SUMMARY_FILE"
            echo "  ($original_size -> $new_size bytes)" >> "$SUMMARY_FILE"
            echo "changed" >> "$PROCESSED_LIST"
        else
            # Discard temp file if savings are trivial
            rm "${file}.tmp"
        fi
    fi
done

# Check if any "changed" marker exists in the processed list logic
# (Actually, simpler to check if summary file is non-empty)

if [ -s "$SUMMARY_FILE" ]; then
    HAS_CHANGES=true
else
    HAS_CHANGES=false
fi

if [ "$HAS_CHANGES" = true ]; then
    echo "has_changes=true" >> "$GITHUB_OUTPUT"
    
    echo "summary<<EOF" >> "$GITHUB_OUTPUT"
    cat "$SUMMARY_FILE" >> "$GITHUB_OUTPUT"
    echo "EOF" >> "$GITHUB_OUTPUT"
    
    # Also output to job summary for visibility in UI
    echo "### Image Optimization Summary" >> $GITHUB_STEP_SUMMARY
    cat "$SUMMARY_FILE" >> $GITHUB_STEP_SUMMARY
else
    echo "has_changes=false" >> "$GITHUB_OUTPUT"
    echo "summary=No images optimized." >> "$GITHUB_OUTPUT"
fi

rm "$SUMMARY_FILE"
rm "$PROCESSED_LIST"
