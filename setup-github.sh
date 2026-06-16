#!/bin/bash
# ─────────────────────────────────────────────────────────────
# GitHub setup script for pg-crud-prisma
# Usage: GITHUB_TOKEN=<your_pat> GITHUB_USERNAME=<your_username> bash setup-github.sh
# ─────────────────────────────────────────────────────────────

set -e

if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_USERNAME" ]; then
  echo "❌ Please set GITHUB_TOKEN and GITHUB_USERNAME environment variables."
  echo "   Example: GITHUB_TOKEN=ghp_xxx GITHUB_USERNAME=yourname bash setup-github.sh"
  exit 1
fi

REPO_NAME="pg-crud-prisma"

echo "🚀 Creating GitHub repository: $REPO_NAME"

curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"PostgreSQL CRUD with Prisma, TypeScript, Node.js and Supabase\",
    \"private\": false,
    \"auto_init\": false
  }"

echo ""
echo "✅ Repo created! Initializing git and pushing code..."

git init
git add .
git commit -m "feat: initial PostgreSQL CRUD setup with Prisma + TypeScript"
git branch -M main
git remote add origin "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"
git push -u origin main

echo ""
echo "✅ Done! Visit: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
