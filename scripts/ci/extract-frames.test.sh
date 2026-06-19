#!/usr/bin/env bash
# Unit tests for scripts/ci/extract-frames.sh
#
# Asserts that the extractor produces the expected deepest-first top-3 frames
# (file<TAB>line<TAB>col<TAB>func) for each supported stack-trace dialect.

set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXTRACT="${SCRIPT_DIR}/extract-frames.sh"
FIXTURES="${SCRIPT_DIR}/fixtures/stacks"
TAB=$'\t'

PASS=0
FAIL=0
FAILED_CASES=()

assert_eq() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS + 1))
    printf '  ok   %s\n' "$name"
  else
    FAIL=$((FAIL + 1))
    FAILED_CASES+=("$name")
    printf '  FAIL %s\n' "$name"
    printf '    --- expected ---\n%s\n' "$expected" | sed 's/^/      /'
    printf '    --- actual ---\n%s\n'   "$actual"   | sed 's/^/      /'
  fi
}

run_case() {
  local name="$1" fixture="$2" expected="$3"
  local actual
  actual=$(bash "$EXTRACT" "${FIXTURES}/${fixture}" 3)
  assert_eq "$name" "$expected" "$actual"
}

echo "extract-frames: function/method extraction per language"

# Node — deepest frame is the last printed line (bootstrap.ts), which has no
# explicit fn name in `at file:line:col` form, so it should be <anonymous>.
run_case "node: deepest-first, <anonymous> + named + Object.<anonymous>" "node.txt" \
"/home/runner/work/repo/repo/src/bootstrap.ts${TAB}7${TAB}3${TAB}<anonymous>
/home/runner/work/repo/repo/src/index.ts${TAB}10${TAB}5${TAB}Object.<anonymous>
/home/runner/work/repo/repo/src/config.ts${TAB}42${TAB}17${TAB}parseConfig"

# Python — deepest is config.py:42 (printed last in traceback).
run_case "python: traceback, deepest frame first, fn names" "python.txt" \
"scripts/config.py${TAB}42${TAB}${TAB}parse_config
scripts/app.py${TAB}21${TAB}${TAB}main
scripts/bootstrap.py${TAB}7${TAB}${TAB}<module>"

# Ruby — deepest is lib/config.rb:42 (printed last), with method name `parse`.
run_case "ruby: 'in \`method'' frames" "ruby.txt" \
"lib/config.rb${TAB}42${TAB}${TAB}parse
app/runner.rb${TAB}21${TAB}${TAB}run
bin/bootstrap.rb${TAB}7${TAB}${TAB}<main>"

# Java/Kotlin — deepest is Bootstrap.java:7 (printed last). TSV is file/line/col/func.
run_case "java/kotlin: 'at pkg.Class.method(File:line)' frames" "java.txt" \
"Bootstrap.java${TAB}7${TAB}${TAB}com.example.Bootstrap.start
App.kt${TAB}21${TAB}${TAB}com.example.App.main
Config.java${TAB}42${TAB}${TAB}com.example.Config.parse"

# Go — function name lives on the line above the file:line; we capture file:line
# only and leave func blank. Deepest is cmd/bootstrap.go:7 (printed last).
run_case "go: file.go:line frames (func blank)" "go.txt" \
"/home/runner/work/repo/repo/cmd/bootstrap.go${TAB}7${TAB}${TAB}
/home/runner/work/repo/repo/internal/app.go${TAB}21${TAB}${TAB}
/home/runner/work/repo/repo/internal/config.go${TAB}42${TAB}${TAB}"

# tsc — diagnostics aren't a stack; deepest = last line.
run_case "tsc: 'file.ts(line,col): error' diagnostics" "tsc.txt" \
"src/bootstrap.ts${TAB}7${TAB}3${TAB}
src/app.ts${TAB}21${TAB}5${TAB}
src/config.ts${TAB}42${TAB}17${TAB}"

# Bash — errexit lines, no function names available.
run_case "bash: 'file.sh: line N: ...' frames (func blank)" "bash.txt" \
"scripts/ci/bootstrap.sh${TAB}7${TAB}${TAB}
scripts/ci/app.sh${TAB}21${TAB}${TAB}
scripts/ci/validate-retention.sh${TAB}42${TAB}${TAB}"

# Java assertion above used inline literals; the Bootstrap.java assertion has
# `Bootstrap.java${TAB}7${TAB}${TAB}` (col blank, func from `at ...` prefix).

echo
printf 'extract-frames: %d passed, %d failed\n' "$PASS" "$FAIL"
if [ "$FAIL" -gt 0 ]; then
  printf 'Failing cases:\n'
  for c in "${FAILED_CASES[@]}"; do printf '  - %s\n' "$c"; done
  exit 1
fi
