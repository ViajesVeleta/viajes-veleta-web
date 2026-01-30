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

# Function to format bytes to KB
format_size() {
    local size=$1
    if [ "$size" -lt 1024 ]; then
        echo "${size} B"
    else
        # Calculate KB with simple integer division, or use bc for decimals if available
        # Using integer math for simplicity: (size + 512) / 1024 rounds to nearest
        echo "$(( (size + 512) / 1024 )) KB"
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
        needs_update=true
    elif [ -n "$resize_args" ]; then
        dest_width=$(identify -format "%w" "$webp_file" 2>/dev/null || echo "0")
        if [ "$dest_width" -gt 2048 ]; then
            needs_update=true
        fi
    fi
    
    if [ "$needs_update" = true ]; then
        
        # Convert to webp with quality 80
        cwebp -q 80 $resize_args "$file" -o "$webp_file" -quiet
        
        if [ -f "$file" ] && [ -f "$webp_file" ]; then
            src_size=$(stat -c%s "$file")
            dest_size=$(stat -c%s "$webp_file")
            
            # Format sizes
            src_fmt=$(format_size "$src_size")
            dest_fmt=$(format_size "$dest_size")
            
            # Determine verb
            if [ -n "$resize_args" ]; then
                 echo "- \`$file\` converted & resized, \`$src_fmt -> $dest_fmt\`" >> "$SUMMARY_FILE"
            else
                 echo "- \`$file\` converted, \`$src_fmt -> $dest_fmt\`" >> "$SUMMARY_FILE"
            fi
        fi
        
        echo "changed" >> "$PROCESSED_LIST"
    fi
    
    echo "$webp_file" >> "$PROCESSED_LIST"

done

# 2. Resize existing large WebP files (ONLY if they are too large)
find . -type f -iname "*.webp" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.git/*" \
    -print0 | while IFS= read -r -d '' file; do
    
    if grep -Fxq "$file" "$PROCESSED_LIST"; then
        continue
    fi
    
    resize_args=$(get_resize_args "$file")
    
    if [ -n "$resize_args" ]; then
        # Force resize
        should_process=true
        force_action="resized"
    else
        should_process=false
    fi
     
    # Trial run
    cwebp -q 80 $resize_args "$file" -o "${file}.tmp" -quiet
    
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
            
            src_fmt=$(format_size "$original_size")
            dest_fmt=$(format_size "$new_size")
            
            echo "- \`$file\` $verb, \`$src_fmt -> $dest_fmt\`" >> "$SUMMARY_FILE"
            echo "changed" >> "$PROCESSED_LIST"
        else
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
