#!/usr/bin/env bash
# Integration tests for scripts/preview-mint-check.sh.
#
# Creates two fixture trees — one safe, one unsafe — and asserts the gate
# script exits 0 / 1 respectively. Each unsafe category is also exercised in
# isolation so failures point at the exact rule that mis-fired.
#
# Run:  bash scripts/preview-mint-check.test.sh
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GATE="$ROOT/scripts/preview-mint-check.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0
fail=0

assert() {
  local label="$1"; local expected="$2"; local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $label"
    pass=$((pass + 1))
  else
    echo "  ✕ $label  (expected exit=$expected, got exit=$actual)"
    fail=$((fail + 1))
  fi
}

run_gate() {
  # Runs the gate against the given fixture roots; returns the exit code.
  local roots="$1"
  PE_SCAN_ROOTS="$roots" bash "$GATE" >/dev/null 2>&1
  echo $?
}

# ───────────────────────────────────────────────
# Fixture 1 — fully safe
# ───────────────────────────────────────────────
SAFE="$TMP/safe"
mkdir -p "$SAFE/src" "$SAFE/supabase/migrations"
cat > "$SAFE/src/component.tsx" <<'EOF'
// Curated cast for the Client Preview
const cohort = ["Eleanor Whitcombe", "Hugo Pemberton", "Margaux Devereux"];
const role = "Director"; // Operations is fine, Director is fine
EOF
cat > "$SAFE/supabase/migrations/20260101000000_seed.sql" <<'EOF'
INSERT INTO public.inquiries (name, email, phone) VALUES
  ('Eleanor Whitcombe', 'eleanor.w@example.com', '0400 000 000'),
  ('Hugo Pemberton',    'hugo.p@example.org',    '0400 000 000');
EOF

echo "▶ Fixture · SAFE"
assert "safe fixture passes" 0 "$(run_gate "$SAFE/src $SAFE/supabase")"

# ───────────────────────────────────────────────
# Fixture 2 — blocklisted name in source
# ───────────────────────────────────────────────
UNSAFE_NAME="$TMP/unsafe_name"
mkdir -p "$UNSAFE_NAME/src"
cat > "$UNSAFE_NAME/src/bad.tsx" <<'EOF'
const preview = { name: "Josh Smith", role: "Client Preview" };
EOF
echo "▶ Fixture · UNSAFE name"
assert "blocklisted name fails" 1 "$(run_gate "$UNSAFE_NAME/src")"

# ───────────────────────────────────────────────
# Fixture 3 — real-looking email in seed migration
# ───────────────────────────────────────────────
UNSAFE_EMAIL="$TMP/unsafe_email"
mkdir -p "$UNSAFE_EMAIL/supabase/migrations"
cat > "$UNSAFE_EMAIL/supabase/migrations/20260101000000_seed.sql" <<'EOF'
INSERT INTO public.inquiries (name, email)
VALUES ('Hugo Pemberton', 'hugo.pemberton@gmail.com');
EOF
echo "▶ Fixture · UNSAFE email domain"
assert "real email domain fails" 1 "$(run_gate "$UNSAFE_EMAIL/supabase")"

# ───────────────────────────────────────────────
# Fixture 4 — real AU mobile in seed migration
# ───────────────────────────────────────────────
UNSAFE_PHONE="$TMP/unsafe_phone"
mkdir -p "$UNSAFE_PHONE/supabase/migrations"
cat > "$UNSAFE_PHONE/supabase/migrations/20260101000000_seed.sql" <<'EOF'
INSERT INTO public.inquiries (name, email, phone)
VALUES ('Eleanor Whitcombe', 'eleanor.w@example.com', '0419 224 118');
EOF
echo "▶ Fixture · UNSAFE phone"
assert "real AU mobile fails" 1 "$(run_gate "$UNSAFE_PHONE/supabase")"

# ───────────────────────────────────────────────
# Fixture 5 — street address in seed migration
# ───────────────────────────────────────────────
UNSAFE_ADDR="$TMP/unsafe_addr"
mkdir -p "$UNSAFE_ADDR/supabase/migrations"
cat > "$UNSAFE_ADDR/supabase/migrations/20260101000000_seed.sql" <<'EOF'
INSERT INTO public.inquiries (name, location)
VALUES ('Eleanor Whitcombe', '42 Boundary Road, Red Hill');
EOF
echo "▶ Fixture · UNSAFE address"
assert "street address fails" 1 "$(run_gate "$UNSAFE_ADDR/supabase")"

# ───────────────────────────────────────────────
# Fixture 6 — "Operations" (allowed) does not trip "Operator"
# ───────────────────────────────────────────────
EDGE="$TMP/edge"
mkdir -p "$EDGE/src"
cat > "$EDGE/src/role.ts" <<'EOF'
export const role = "Operations & Creative";
EOF
echo "▶ Fixture · EDGE word-boundary"
assert "Operations does not trip Operator" 0 "$(run_gate "$EDGE/src")"

# ───────────────────────────────────────────────
echo
echo "── Results · $pass passed · $fail failed"
[ "$fail" -eq 0 ] || exit 1
