#!/bin/bash
set -e

# Temporary files for tracking
SUMMARY_FILE=$(mktemp)
PROCESSED_LIST=$(mktemp)
TOTALS_FILE=$(mktemp)
HAS_CHANGES=false

# Ensure we start with empty files
> "$SUMMARY_FILE"
> "$PROCESSED_LIST"
> "$TOTALS_FILE"

echo "Starting image optimization..."
QUALITY=${QUALITY:-80}
SCAN_ALL=${SCAN_ALL:-false}  # true = scan entire repo (weekly), false = git diff only (PR)
echo "Using quality: $QUALITY, scan all: $SCAN_ALL"

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

# Function to format bytes to KB
format_size() {
    local size=$1
    if [ "$size" -lt 1024 ]; then
        echo "${size} B"
    else
        echo "$(( (size + 512) / 1024 )) KB"
    fi
}

# ---------------------------------------------------------------------------
# Build the list of files to process
# SCAN_ALL=true  → entire repo under src/assets (weekly run)
# SCAN_ALL=false → only added/modified files in src/assets from git diff (PR run)
# ---------------------------------------------------------------------------

if [ "$SCAN_ALL" = "true" ]; then
    echo "Scanning all image files in src/assets..."
    IMAGE_FILES=$(find ./src/assets -type f \( \
        -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" \
    \) 2>/dev/null || true)
else
    echo "Scanning only changed image files in src/assets (git diff)..."
    BASE_REF=${BASE_REF:-main}
    # Fetch base branch so the diff is available
    git fetch origin "$BASE_REF" --depth=1 2>/dev/null || true
    IMAGE_FILES=$(git diff --name-only --diff-filter=AM "origin/$BASE_REF" \
        | grep -i '^src/assets/.*\.\(jpg\|jpeg\|png\|webp\)$' \
        | sed 's|^|./|' || true)
fi

if [ -z "$IMAGE_FILES" ]; then
    echo "No image files to process."
    echo "has_changes=false" >> "$GITHUB_OUTPUT"
    echo "summary=No images optimized." >> "$GITHUB_OUTPUT"
    rm "$SUMMARY_FILE" "$PROCESSED_LIST" "$TOTALS_FILE"
    exit 0
fi

echo "Files to process:"
echo "$IMAGE_FILES"

# ---------------------------------------------------------------------------
# 1. Convert non-webp images (jpg/png/jpeg) to webp
# ---------------------------------------------------------------------------
echo "$IMAGE_FILES" | grep -i '\.\(jpg\|jpeg\|png\)$' | while IFS= read -r file; do
    [ -f "$file" ] || continue

    filename="${file%.*}"
    webp_file="${filename}.webp"
    
    resize_args=$(get_resize_args "$file")
    needs_update=false
    
    # Check if we need to update
    if [ ! -f "$webp_file" ]; then
        needs_update=true
    elif [ "$file" -nt "$webp_file" ]; then
        needs_update=true
    elif [ -n "$resize_args" ]; then
        dest_width=$(identify -format "%w" "$webp_file" 2>/dev/null || echo "0")
        if [ "$dest_width" -gt 2048 ]; then
            needs_update=true
        fi
    fi
    
    if [ "$needs_update" = true ]; then
        
        # Convert to webp with quality 80
        cwebp -q $QUALITY $resize_args "$file" -o "$webp_file" -quiet
        
        if [ -f "$file" ] && [ -f "$webp_file" ]; then
            src_size=$(stat -c%s "$file")
            dest_size=$(stat -c%s "$webp_file")
            
            # Accumulate totals (in bytes)
            echo "$src_size $dest_size" >> "$TOTALS_FILE"
            
            # Format sizes
            src_fmt=$(format_size "$src_size")
            dest_fmt=$(format_size "$dest_size")
            
            # Determine verb
            if [ -n "$resize_args" ]; then
                 echo "- \`$file\` converted & resized, \`$src_fmt -> $dest_fmt\`" >> "$SUMMARY_FILE"
            else
                 echo "- \`$file\` converted, \`$src_fmt -> $dest_fmt\`" >> "$SUMMARY_FILE"
            fi
            
            # Delete original file
            rm "$file"
        fi
        
        echo "changed" >> "$PROCESSED_LIST"
    fi
    
    echo "$webp_file" >> "$PROCESSED_LIST"

done

# ---------------------------------------------------------------------------
# 2. Optimize existing WebP files
# ---------------------------------------------------------------------------
echo "$IMAGE_FILES" | grep -i '\.webp$' | while IFS= read -r file; do
    [ -f "$file" ] || continue

    if grep -Fxq "$file" "$PROCESSED_LIST"; then
        continue
    fi
    
    resize_args=$(get_resize_args "$file")
    
    if [ -n "$resize_args" ]; then
        should_process=true
    else
        should_process=false
    fi
     
    # Trial run
    cwebp -q $QUALITY $resize_args "$file" -o "${file}.tmp" -quiet
    
    if [ -f "${file}.tmp" ]; then
        original_size=$(stat -c%s "$file")
        new_size=$(stat -c%s "${file}.tmp")
        
        if [ "$original_size" -gt 0 ]; then
            saved_percent=$(( (original_size - new_size) * 100 / original_size ))
        else
            saved_percent=0
        fi
        
        accept_changes=false
        
        if [ "$should_process" = true ]; then
            accept_changes=true
            verb="resized"
        elif [ "$saved_percent" -ge 15 ]; then
            accept_changes=true
            verb="optimized by ${saved_percent}%"
        fi
        
        if [ "$accept_changes" = true ]; then
            mv "${file}.tmp" "$file"
            
            # Accumulate totals (in bytes)
            echo "$original_size $new_size" >> "$TOTALS_FILE"
            
            src_fmt=$(format_size "$original_size")
            dest_fmt=$(format_size "$new_size")
            
            echo "- \`$file\` $verb, \`$src_fmt -> $dest_fmt\`" >> "$SUMMARY_FILE"
            echo "changed" >> "$PROCESSED_LIST"
        else
            rm "${file}.tmp"
        fi
    fi
done

# Check if summary file is non-empty
if [ -s "$SUMMARY_FILE" ]; then
    HAS_CHANGES=true
else
    HAS_CHANGES=false
fi

if [ "$HAS_CHANGES" = true ]; then
    echo "has_changes=true" >> "$GITHUB_OUTPUT"
    
    # Calculate totals from accumulated file
    total_src_bytes=0
    total_dest_bytes=0
    while read -r src dest; do
        total_src_bytes=$(( total_src_bytes + src ))
        total_dest_bytes=$(( total_dest_bytes + dest ))
    done < "$TOTALS_FILE"
    
    total_src_kb=$(( (total_src_bytes + 512) / 1024 ))
    total_dest_kb=$(( (total_dest_bytes + 512) / 1024 ))
    total_saved_kb=$(( total_src_kb - total_dest_kb ))
    
    echo "total_src_kb=$total_src_kb" >> "$GITHUB_OUTPUT"
    echo "total_dest_kb=$total_dest_kb" >> "$GITHUB_OUTPUT"
    echo "total_saved_kb=$total_saved_kb" >> "$GITHUB_OUTPUT"
    
    echo "summary<<EOF" >> "$GITHUB_OUTPUT"
    cat "$SUMMARY_FILE" >> "$GITHUB_OUTPUT"
    echo "EOF" >> "$GITHUB_OUTPUT"
    
    # Also output to job summary for visibility in UI
    echo "### Image Optimization Summary" >> $GITHUB_STEP_SUMMARY
    echo "| Before | After | Saved |" >> $GITHUB_STEP_SUMMARY
    echo "| --- | --- | --- |" >> $GITHUB_STEP_SUMMARY
    echo "| ${total_src_kb} KB | ${total_dest_kb} KB | ${total_saved_kb} KB |" >> $GITHUB_STEP_SUMMARY
    echo "" >> $GITHUB_STEP_SUMMARY
    cat "$SUMMARY_FILE" >> $GITHUB_STEP_SUMMARY
else
    echo "has_changes=false" >> "$GITHUB_OUTPUT"
    echo "summary=No images optimized." >> "$GITHUB_OUTPUT"
fi

rm "$SUMMARY_FILE"
rm "$PROCESSED_LIST"
rm "$TOTALS_FILE"
