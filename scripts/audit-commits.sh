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

# Check for hardcoded .com.au references in source code
echo "2. Scanning for hardcoded .com.au references..."
if grep -r "peninsulaequine\.com\.au" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "DOMAIN_SETUP.md"; then
  echo "   ⚠️  Found .com.au references in source code (should only be in redirects)"
else
  echo "   ✅ No hardcoded .com.au in source"
fi
echo ""

# Check for exposed secrets in recent commits
echo "3. Checking for exposed secrets..."
if git log --all -p | grep -E "(SUPABASE_SERVICE_ROLE_KEY|sk_live_|RESEND_API_KEY)" | head -5; then
  echo "   ❌ CRITICAL: Secrets found in commit history!"
else
  echo "   ✅ No secrets detected in recent commits"
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
for file in DEPLOYMENT_CHECKLIST.md DOMAIN_SETUP.md .env.example vercel.json; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ⚠️  $file missing"
  fi
done
echo ""

echo "=== Audit Complete ==="
