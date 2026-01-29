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
        # Fallback if identify is not available (though it should be on GH Actions)
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
    
    if [ -n "$resize_args" ]; then
        echo "Converting and resizing $file to $webp_file..."
        action_msg="- Converted and resized $file"
    else
        echo "Converting $file to $webp_file..."
        action_msg="- Converted $file"
    fi
    
    # Convert to webp with quality 80
    # $resize_args is unquoted to allow arguments handling
    cwebp -q 80 $resize_args "$file" -o "$webp_file" -quiet
    
    echo "$action_msg" >> "$SUMMARY_FILE"
    echo "$webp_file" >> "$PROCESSED_LIST"
    
    # Calculate size change if source file exists (it should)
    if [ -f "$file" ] && [ -f "$webp_file" ]; then
        src_size=$(stat -c%s "$file")
        dest_size=$(stat -c%s "$webp_file")
        echo "  ($src_size -> $dest_size bytes)" >> "$SUMMARY_FILE"
    fi
    
    HAS_CHANGES=true

done

# 2. Optimize existing values (compress more if possible)
find . -type f -iname "*.webp" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.git/*" \
    -print0 | while IFS= read -r -d '' file; do
    
    # Skip files we just created
    if grep -Fxq "$file" "$PROCESSED_LIST"; then
        continue
    fi
    
    original_size=$(stat -c%s "$file")
    resize_args=$(get_resize_args "$file")
    is_resized=false
    
    if [ -n "$resize_args" ]; then
        is_resized=true
    fi
    
    # Try to compress to a temp file
    cwebp -q 80 $resize_args "$file" -o "${file}.tmp" -quiet
    
    if [ -f "${file}.tmp" ]; then
        new_size=$(stat -c%s "${file}.tmp")
        
        # If resized OR smaller, replace
        if [ "$is_resized" = true ] || [ "$new_size" -lt "$original_size" ]; then
            if [ "$is_resized" = true ]; then
                echo "Resizing and optimizing $file..."
                log_msg="- Resized and optimized $file"
            else
                echo "Optimizing $file ($original_size -> $new_size bytes)..."
                log_msg="- Optimized $file"
            fi
            
            mv "${file}.tmp" "$file"
            echo "$log_msg" >> "$SUMMARY_FILE"
            echo "  ($original_size -> $new_size bytes)" >> "$SUMMARY_FILE"
            HAS_CHANGES=true
        else
            rm "${file}.tmp"
        fi
    fi
done

# Clean up
rm "$PROCESSED_LIST"

# Set output for GitHub Actions based on whether summary file has content
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
