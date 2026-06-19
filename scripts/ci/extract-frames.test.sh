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

echo
echo "extract-frames: edge cases"

# Edge: Node frames missing the column entirely. Function names must still be
# captured — the generic fallback would otherwise discard them.
run_case "edge/node-no-col: 'at fn (file:line)' preserves fn names" "node-no-col.txt" \
"src/bootstrap.ts${TAB}7${TAB}${TAB}<anonymous>
src/index.ts${TAB}10${TAB}${TAB}Object.<anonymous>
src/config.ts${TAB}42${TAB}${TAB}parseConfig"

# Edge: minified bundles + URL paths + "[as alias]" rename + bare URL frame.
# Verifies we treat URLs as file paths and don't truncate the rename suffix.
run_case "edge/node-minified: URL paths + [as alias] + bare URL frame" "node-minified.txt" \
"https://cdn.example.com/assets/runtime-9f8e7d.min.js${TAB}2${TAB}1024${TAB}<anonymous>
dist/bundle-A1b2C3d.min.js${TAB}1${TAB}54321${TAB}e.default [as render]
https://cdn.example.com/assets/index-AbC123.min.js${TAB}1${TAB}23456${TAB}t"

# Edge: mixed languages in one log (bash error, then a Python traceback, then a
# Node stack). Deepest-first across all dialects: the two Node frames printed
# last + the deepest Python frame above them.
run_case "edge/mixed: bash + python + node interleaved, deepest 3 across dialects" "mixed.txt" \
"src/runner.ts${TAB}88${TAB}9${TAB}Object.runNode
src/config.ts${TAB}42${TAB}17${TAB}parseConfig
scripts/wrapper.py${TAB}12${TAB}${TAB}<module>"

echo
echo "extract-frames: Windows paths"

# Edge: Windows drive letter + backslashes in Node frames.
run_case "edge/windows-node: drive letter + backslash paths in 'at fn (...)'" "windows-node.txt" \
"C:\\Users\\runner\\work\\repo\\src\\bootstrap.ts${TAB}7${TAB}3${TAB}<anonymous>
C:\\Users\\runner\\work\\repo\\src\\index.ts${TAB}10${TAB}5${TAB}Object.<anonymous>
C:\\Users\\runner\\work\\repo\\src\\config.ts${TAB}42${TAB}17${TAB}parseConfig"

# Edge: Windows paths inside Python 'File "..."' traceback (quoting protects the path).
run_case "edge/windows-python: drive letter + backslashes in 'File \"...\"' frames" "windows-python.txt" \
"C:\\Users\\runner\\work\\repo\\scripts\\config.py${TAB}42${TAB}${TAB}parse_config
C:\\Users\\runner\\work\\repo\\scripts\\app.py${TAB}21${TAB}${TAB}main
C:\\Users\\runner\\work\\repo\\scripts\\bootstrap.py${TAB}7${TAB}${TAB}<module>"

# Edge: Windows paths in tsc diagnostics — drive letter + backslashes must be
# preserved (previously the [A-Za-z0-9_./+-]+ class stripped them).
run_case "edge/windows-tsc: drive letter + backslashes in 'file.ts(line,col)'" "windows-tsc.txt" \
"C:\\Users\\runner\\work\\repo\\src\\bootstrap.ts${TAB}7${TAB}3${TAB}
C:\\Users\\runner\\work\\repo\\src\\app.ts${TAB}21${TAB}5${TAB}
C:\\Users\\runner\\work\\repo\\src\\config.ts${TAB}42${TAB}17${TAB}"

echo
echo "extract-frames: macOS runner formats"

# macOS Node — /Users/runner/... paths; should behave identically to the Linux
# Node case (validates the path prefix doesn't break the matcher).
run_case "macos/node: '/Users/runner/...' Node frames" "macos-node.txt" \
"/Users/runner/work/repo/src/bootstrap.ts${TAB}7${TAB}3${TAB}<anonymous>
/Users/runner/work/repo/src/index.ts${TAB}10${TAB}5${TAB}Object.<anonymous>
/Users/runner/work/repo/src/config.ts${TAB}42${TAB}17${TAB}parseConfig"

# Clang/GCC diagnostics: 'file.cpp:42:17: error: ...' — no function name available.
run_case "macos/clang: 'file.cpp:line:col: error:' diagnostics" "macos-clang.txt" \
"/Users/runner/work/repo/include/bootstrap.hpp${TAB}7${TAB}3${TAB}
/Users/runner/work/repo/src/app.cpp${TAB}21${TAB}5${TAB}
/Users/runner/work/repo/src/config.cpp${TAB}42${TAB}17${TAB}"

# AddressSanitizer / lldb stack frames: '#N 0x... in Func::method(args) file.cpp:line:col'
# Function name (with namespaces, args, and parens) must survive the extraction.
run_case "macos/asan: '#N 0x... in Func::method(args) file.cpp:line:col'" "macos-asan.txt" \
"/Users/runner/work/repo/src/bootstrap.cpp${TAB}7${TAB}3${TAB}main
/Users/runner/work/repo/src/app.cpp${TAB}21${TAB}5${TAB}App::run()
/Users/runner/work/repo/src/config.cpp${TAB}42${TAB}17${TAB}Config::parse(int)"

echo
echo "extract-frames: LLDB backtraces"

# Symbolicated LLDB frames — module`Func(args) at file:line:col. Function name
# preserves namespaces and full arg list (including pointer values).
run_case "lldb/symbolicated: 'frame #N: 0x... mod\`Func(args) at file:line:col'" "lldb-symbolicated.txt" \
"/Users/runner/work/repo/src/bootstrap.cpp${TAB}7${TAB}3${TAB}main(argc=1, argv=0x00007ffeefbff5c0)
/Users/runner/work/repo/src/app.cpp${TAB}21${TAB}5${TAB}App::run()
/Users/runner/work/repo/src/config.cpp${TAB}42${TAB}17${TAB}Config::parse(this=0x00007ffeefbff520, n=42)"

# Unsymbolicated LLDB — no 'at file:line', just 'module + offset' or
# '___lldb_unnamed_symbol'. Extractor must emit nothing (no usable source ref).
run_case "lldb/unsymbolicated: stripped frames produce no output" "lldb-unsymbolicated.txt" \
""

# Mixed symbolicated + unsymbolicated — only the symbolicated frames should
# survive, in deepest-first order.
run_case "lldb/mixed: skips stripped frames, keeps symbolicated in deepest-first order" "lldb-mixed.txt" \
"/Users/runner/work/repo/src/bootstrap.cpp${TAB}7${TAB}3${TAB}main(argc=1, argv=0x...)
/Users/runner/work/repo/src/app.cpp${TAB}21${TAB}5${TAB}App::run()
/Users/runner/work/repo/src/config.cpp${TAB}42${TAB}17${TAB}Config::parse(this=0x..., n=42)"

# Demangled C++ symbols — templates (`<...>`), operator overloads (`operator()`),
# destructors (`~Service`), const-qualified methods, and reference args
# (`int const&`) must all pass through the LLDB extractor unmodified.
run_case "lldb/demangled-cxx: templates, operator(), dtor, const& args preserved" "lldb-demangled-cxx.txt" \
"/Users/runner/work/repo/src/bootstrap.cpp${TAB}7${TAB}3${TAB}example::ns::Service::~Service()
/Users/runner/work/repo/src/app.cpp${TAB}21${TAB}5${TAB}example::Parser<std::string>::operator()(std::string const&) const
/Users/runner/work/repo/src/config.cpp${TAB}42${TAB}17${TAB}std::vector<int>::push_back(int const&)"


echo
printf 'extract-frames: %d passed, %d failed\n' "$PASS" "$FAIL"
if [ "$FAIL" -gt 0 ]; then
  printf 'Failing cases:\n'
  for c in "${FAILED_CASES[@]}"; do printf '  - %s\n' "$c"; done
  exit 1
fi
