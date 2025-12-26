#!/bin/bash
# Vercel Ignored Build Step
# https://vercel.com/docs/projects/overview#ignored-build-step
#
# Exit 1 = SKIP build (no relevant changes)
# Exit 0 = PROCEED with build (relevant changes detected)
#
# This script reduces Vercel credit consumption by skipping builds
# when only non-web files change (e.g., installer scripts, bash libs).

set -e

echo "🔍 Checking if web app files changed..."

# Get the commit range (VERCEL_GIT_PREVIOUS_SHA may be empty on first deploy)
PREV_SHA="${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}"
CURR_SHA="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

echo "   Previous: $PREV_SHA"
echo "   Current:  $CURR_SHA"

# Paths that should trigger a rebuild
# Note: paths are relative to repo root, not apps/web
TRIGGER_PATHS=(
    "apps/web/"
    "package.json"
    "bun.lockb"
)

# Check if any trigger paths have changes
for path in "${TRIGGER_PATHS[@]}"; do
    if git diff --name-only "$PREV_SHA" "$CURR_SHA" 2>/dev/null | grep -q "^${path}"; then
        echo "✅ Changes detected in: $path"
        echo "   → Proceeding with build"
        exit 0  # Build
    fi
done

# Also check if this is a production branch (always build production)
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" || "$VERCEL_GIT_COMMIT_REF" == "production" ]]; then
    # For main/production, check if we should still skip
    # Only skip if truly no web changes
    CHANGED_FILES=$(git diff --name-only "$PREV_SHA" "$CURR_SHA" 2>/dev/null || echo "")

    if echo "$CHANGED_FILES" | grep -q "^apps/web/"; then
        echo "✅ Web app changes on $VERCEL_GIT_COMMIT_REF branch"
        exit 0  # Build
    fi
fi

echo "⏭️  No web app changes detected"
echo "   → Skipping build to save Vercel credits"
echo ""
echo "   Changed files:"
git diff --name-only "$PREV_SHA" "$CURR_SHA" 2>/dev/null | head -20 || echo "   (unable to determine)"

exit 1  # Skip build
