#!/bin/bash
# Pre-deployment validator — checks all DEPLOYMENT_CHECKLIST items

set -e

echo "=================================="
echo "Peninsula Equine Pre-Deploy Check"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Helper functions
check_pass() {
  echo -e "${GREEN}✅ $1${NC}"
  ((PASSED++))
}

check_fail() {
  echo -e "${RED}❌ $1${NC}"
  ((FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "1. EMAIL & CONTACT ROUTING"
echo "---"
if grep -q "info@peninsulaequine.systems" .env.example; then
  check_pass "info@peninsulaequine.systems configured in .env.example"
else
  check_fail "info@peninsulaequine.systems not in .env.example"
fi

if grep -q "notify.peninsulaequine.systems" .env.example; then
  check_pass "notify.peninsulaequine.systems email domains configured"
else
  check_fail "notify.peninsulaequine.systems domains not configured"
fi
echo ""

echo "2. LEGACY API ISOLATION"
echo "---"
if ! grep -r "peninsulaequine\.com\.au/api" src/ 2>/dev/null | grep -v node_modules > /dev/null; then
  check_pass "No hardcoded .com.au/api paths found in source"
else
  check_fail "Hardcoded .com.au/api paths detected in source code"
fi
echo ""

echo "3. ENVIRONMENT VARIABLES"
echo "---"
if [ -f ".env.example" ]; then
  check_pass ".env.example exists"
else
  check_fail ".env.example missing"
fi

if [ -f ".gitignore" ] && grep -q "\.env" .gitignore; then
  check_pass ".env patterns in .gitignore"
else
  check_fail ".env not protected in .gitignore"
fi

if grep -q "VITE_SUPABASE_URL" .env.example; then
  check_pass "VITE_SUPABASE_URL configured"
else
  check_fail "VITE_SUPABASE_URL missing"
fi
echo ""

echo "4. OAUTH & CALLBACK ALLOWLISTS"
echo "---"
check_warn "Verify manually in Google Cloud Console:"
check_warn "  - Redirect URI: https://peninsulaequine.com.au/auth/callback"
check_warn "  - JavaScript origins: https://peninsulaequine.com.au"
echo ""

echo "5. DOMAIN REDIRECTS & DNS"
echo "---"
if [ -f ".github/workflows/deploy-github-pages.yml" ]; then
  check_pass "GitHub Pages deployment workflow exists"
else
  check_fail "GitHub Pages deployment workflow missing"
fi

if [ -f "DOMAIN_SETUP.md" ]; then
  check_pass "DOMAIN_SETUP.md exists (DNS instructions)"
else
  check_fail "DOMAIN_SETUP.md missing"
fi
echo ""

echo "6. SUPABASE RLS & AUTHORIZATION"
echo "---"
check_warn "Verify manually in Supabase Dashboard:"
check_warn "  - RLS enabled on all tables"
check_warn "  - Client role cannot query admin tables"
check_warn "  - Service role permissions audited"
echo ""

echo "7. GITHUB PAGES DEPLOYMENT"
echo "---"
check_warn "Verify manually in GitHub Actions and the registrar DNS console:"
check_warn "  - Primary domain: peninsulaequine.com.au"
check_warn "  - Apex A records and www CNAME point to GitHub Pages"
check_warn "  - Repository variables are available to the Pages workflow"
echo ""

echo "8. ROUTE GUARDS & ROLE ENFORCEMENT"
echo "---"
check_warn "Verify manually in codebase:"
check_warn "  - /admin/* routes check user role"
check_warn "  - /client/* routes reject admin users"
check_warn "  - Unauthenticated users redirected to login"
echo ""

echo "9. SESSION & COOKIE HANDLING"
echo "---"
check_warn "Verify manually in browser DevTools:"
check_warn "  - Cookie redirect origin: peninsulaequine.com.au"
check_warn "  - Secure, HttpOnly, SameSite=Lax flags set"
echo ""

echo "10. LEGACY API DECOMMISSION"
echo "---"
check_warn "Verify manually:"
check_warn "  - Old endpoints return 410 Gone or redirect"
check_warn "  - No client code calls deprecated paths"
echo ""

echo "11. MONITORING & OBSERVABILITY"
echo "---"
check_warn "Verify manually:"
check_warn "  - Error tracking configured for .com.au"
check_warn "  - Analytics updated to .com.au domain"
check_warn "  - HQ logs capture auth events"
echo ""

echo "12. FINAL SMOKE TESTS"
echo "---"
check_warn "Manual testing required:"
check_warn "  - [ ] Landing page loads, all links work"
check_warn "  - [ ] Sign-up/sign-in/sign-out works"
check_warn "  - [ ] HQ admin dashboard accessible"
check_warn "  - [ ] Client portal visible, admin content hidden"
check_warn "  - [ ] Contact form sends email"
check_warn "  - [ ] Mobile responsive (iPhone/Android)"
check_warn "  - [ ] Lighthouse score ≥ 80"
check_warn "  - [ ] peninsulaequine.com.au serves the GitHub Pages build"
echo ""

echo "=================================="
echo "SUMMARY"
echo "=================================="
echo -e "Passed: ${GREEN}$PASSED${NC} | Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Automated checks passed!${NC}"
  echo "Complete manual verifications above, then deploy."
  exit 0
else
  echo -e "${RED}❌ Fix failures above before deploying.${NC}"
  exit 1
fi
