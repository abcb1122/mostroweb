#!/bin/bash
# deploy.sh - Deploy MostroWeb to GitHub Pages
# Usage: ./deploy.sh [commit-message]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_BRANCH="claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK"
SOURCE_DIR="src"

echo -e "${BLUE}🚀 MostroWeb GitHub Pages Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Current branch: ${YELLOW}${CURRENT_BRANCH}${NC}"

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes in current branch${NC}"
    echo -e "${YELLOW}   Consider committing them first${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Switch to deployment branch
echo -e "${BLUE}🔄 Switching to deployment branch: ${YELLOW}${DEPLOY_BRANCH}${NC}"
git checkout "$DEPLOY_BRANCH"

# Check if src/ directory exists in current branch
if [[ ! -d "$SOURCE_DIR" ]]; then
    echo -e "${YELLOW}⚠️  Source directory not found in this branch${NC}"
    echo -e "${BLUE}   Fetching from ${YELLOW}${CURRENT_BRANCH}${NC}"
    git checkout "$CURRENT_BRANCH" -- "$SOURCE_DIR/"
fi

# Copy files from src/ to root
echo -e "${BLUE}📦 Copying files from ${YELLOW}${SOURCE_DIR}/${NC} to root..."
cp -rf "${SOURCE_DIR}"/* .

# Ensure .nojekyll exists
if [[ ! -f .nojekyll ]]; then
    echo -e "${BLUE}📝 Creating .nojekyll file${NC}"
    touch .nojekyll
fi

# Check if there are changes to deploy
if [[ -z $(git status -s) ]]; then
    echo -e "${GREEN}✅ No changes to deploy${NC}"
    git checkout "$CURRENT_BRANCH"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Already up to date!${NC}"
    exit 0
fi

# Stage changes
echo -e "${BLUE}📝 Staging changes...${NC}"
git add .nojekyll README.md index.html css/ js/ 2>/dev/null || true

# Create commit message
if [[ -n "$1" ]]; then
    COMMIT_MSG="Deploy: $1"
else
    COMMIT_MSG="Deploy: Update $(date +'%Y-%m-%d %H:%M:%S')"
fi

# Commit changes
echo -e "${BLUE}💾 Creating commit: ${YELLOW}${COMMIT_MSG}${NC}"
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
if git push origin "$DEPLOY_BRANCH"; then
    echo -e "${GREEN}✅ Push successful!${NC}"
else
    echo -e "${RED}❌ Push failed${NC}"
    echo -e "${YELLOW}   You may need to push manually${NC}"
    git checkout "$CURRENT_BRANCH"
    exit 1
fi

# Return to original branch
echo -e "${BLUE}🔙 Returning to branch: ${YELLOW}${CURRENT_BRANCH}${NC}"
git checkout "$CURRENT_BRANCH"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}🌐 Your site will be available at:${NC}"
echo -e "${BLUE}   ${YELLOW}https://abcb1122.github.io/mostroweb/${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⏱️  GitHub Pages may take 1-3 minutes to update${NC}"
