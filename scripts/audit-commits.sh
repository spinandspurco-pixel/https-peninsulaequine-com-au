#!/bin/bash
# Audit recent commits for deployment readiness

echo "=== Peninsula Equine Deployment Audit ==="
echo ""

# Check for uncommitted changes
echo "1. Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
  echo "   ⚠️  Uncommitted changes detected:"
  git status --short
else
  echo "   ✅ All changes committed"
fi
echo ""

# Check for retired Vercel configuration. Plain-text migration notes are allowed;
# only active configuration signatures should fail this audit.
echo "2. Checking for retired Vercel configuration..."
if git grep -n -i -E '(@vercel/|vercel\\.json|vercel\\.app|VERCEL_)' -- . ':!scripts/audit-commits.sh'; then
  echo "   ❌ Retired Vercel references found"
else
  echo "   ✅ No Vercel configuration references found"
fi
echo ""

# Check the current tracked source for token-shaped secrets. Documentation and
# `.env.example` deliberately contain variable names and example placeholders,
# so they are not evidence of an exposure.
echo "3. Checking the current tree for exposed secrets..."
if git grep -n -E '(sb_secret_[[:alnum:]_-]{20,}|sk_live_[[:alnum:]_]{20,}|re_[[:alnum:]_]{20,})' -- ':!*.md' ':!.env.example' ':!*.test.ts' ':!*.test.tsx'; then
  echo "   ❌ CRITICAL: Token-shaped secret found in tracked source!"
else
  echo "   ✅ No token-shaped secrets detected in tracked source"
fi
echo ""

# Verify .env files are in .gitignore
echo "4. Checking .gitignore..."
if grep -q "\.env" .gitignore; then
  echo "   ✅ .env patterns in .gitignore"
else
  echo "   ⚠️  .env not in .gitignore — add it immediately"
fi
echo ""

# List last 10 commits
echo "5. Last 10 commits:"
git log --oneline -10
echo ""

# Check for deployment-related files
echo "6. Verifying deployment files exist..."
for file in RUNBOOK.md DOMAIN_SETUP.md .env.example .github/workflows/deploy-github-pages.yml; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ⚠️  $file missing"
  fi
done
echo ""

echo "=== Audit Complete ==="
