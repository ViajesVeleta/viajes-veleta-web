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

# 1. Convert non-webp images to webp
# Finding .png, .jpg, .jpeg
find . -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.git/*" \
    -print0 | while IFS= read -r -d '' file; do

    filename="${file%.*}"
    webp_file="${filename}.webp"

    echo "Converting $file to $webp_file..."
    
    # Convert to webp with quality 80
    cwebp -q 80 "$file" -o "$webp_file" -quiet
    
    echo "- Converted $file to $webp_file" >> "$SUMMARY_FILE"
    echo "$webp_file" >> "$PROCESSED_LIST"
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
    
    # Try to compress to a temp file
    cwebp -q 80 "$file" -o "${file}.tmp" -quiet
    
    if [ -f "${file}.tmp" ]; then
        new_size=$(stat -c%s "${file}.tmp")
        
        # If new file is smaller, replace original
        if [ "$new_size" -lt "$original_size" ]; then
            echo "Optimizing $file ($original_size -> $new_size bytes)..."
            mv "${file}.tmp" "$file"
            echo "- Optimized $file ($original_size -> $new_size bytes)" >> "$SUMMARY_FILE"
            HAS_CHANGES=true
        else
            rm "${file}.tmp"
        fi
    fi
done

# Clean up
rm "$PROCESSED_LIST"

# Set output for GitHub Actions
if [ "$HAS_CHANGES" = true ]; then
    echo "has_changes=true" >> "$GITHUB_OUTPUT"
    
    echo "summary<<EOF" >> "$GITHUB_OUTPUT"
    cat "$SUMMARY_FILE" >> "$GITHUB_OUTPUT"
    echo "EOF" >> "$GITHUB_OUTPUT"
else
    echo "has_changes=false" >> "$GITHUB_OUTPUT"
    echo "summary=No images optimized." >> "$GITHUB_OUTPUT"
fi

rm "$SUMMARY_FILE"
