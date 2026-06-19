#!/usr/bin/env bash
# Extract up to N deepest-first stack frames from a failing-test output file.
#
# Usage:
#   scripts/ci/extract-frames.sh <output-file> [max-frames]
#
# Emits TAB-separated records on stdout, one per frame:
#   file<TAB>line<TAB>col<TAB>func
#
# Column and func may be empty. Frames are deduped by file:line. Paths are
# emitted exactly as found in the input (the caller is responsible for any
# absolute-to-repo-relative normalisation, since that needs $GITHUB_WORKSPACE).
#
# Supports stack-frame formats from:
#   - Node.js     ("at fn (file:line:col)" / "at file:line:col")
#   - Python      ('  File "x.py", line 42, in funcname')
#   - Ruby        ("file.rb:42:in `method'")
#   - Java/Kotlin ("at pkg.Class.method(File.kt:42)")
#   - Go          ("file.go:42 +0xab")
#   - tsc         ("file.ts(42,10): error TS...")
#   - Bash xtrace ("scripts/foo.sh: line 42: ...")
#   - Generic     ("path/file.ext:42[:col]")

set -u

INPUT="${1:-}"
MAX_FRAMES="${2:-3}"

if [ -z "$INPUT" ] || [ ! -r "$INPUT" ]; then
  echo "extract-frames: input file missing or unreadable: $INPUT" >&2
  exit 2
fi

# Reverse so deepest frame (printed last) is considered first.
REVERSED=$(tac "$INPUT" 2>/dev/null || tail -r "$INPUT" 2>/dev/null || cat "$INPUT")

KEYS_FILE=$(mktemp)
FRAME_COUNT=0
trap 'rm -f "$KEYS_FILE"' EXIT

while IFS= read -r LINE; do
  [ "$FRAME_COUNT" -ge "$MAX_FRAMES" ] && break
  F_FILE=""; F_LINE=""; F_COL=""; F_FUNC=""

  # Node stack: "at funcName (file:line:col)" / "at Class.method (file:line:col)" / "at file:line:col"
  if echo "$LINE" | grep -qE '^[[:space:]]*at .+\.(ts|tsx|js|jsx|mjs|cjs):[0-9]+:[0-9]+\)?[[:space:]]*$'; then
    if echo "$LINE" | grep -qE '\([^()]*:[0-9]+:[0-9]+\)'; then
      F_FUNC=$(echo "$LINE" | sed -E 's/^[[:space:]]*at[[:space:]]+(.+)[[:space:]]+\([^()]*:[0-9]+:[0-9]+\)[[:space:]]*$/\1/' | tr -d '\n\r')
      INNER=$(echo "$LINE" | sed -E 's/.*\(([^()]+:[0-9]+:[0-9]+)\).*/\1/')
    else
      F_FUNC="<anonymous>"
      INNER=$(echo "$LINE" | sed -E 's/^[[:space:]]*at[[:space:]]+(.+)$/\1/')
    fi
    F_FILE=$(echo "$INNER" | sed -E 's/^(.+):[0-9]+:[0-9]+$/\1/')
    F_LINE=$(echo "$INNER" | sed -E 's/^.+:([0-9]+):[0-9]+$/\1/')
    F_COL=$(echo  "$INNER" | sed -E 's/^.+:[0-9]+:([0-9]+)$/\1/')
  fi

  # Node stack without column: "at fn (file:line)" / "at file:line". Preserves
  # function names that the generic fallback would otherwise discard.
  if [ -z "$F_FILE" ] && echo "$LINE" | grep -qE '^[[:space:]]*at .+\.(ts|tsx|js|jsx|mjs|cjs):[0-9]+\)?[[:space:]]*$'; then
    if echo "$LINE" | grep -qE '\([^()]+:[0-9]+\)[[:space:]]*$'; then
      F_FUNC=$(echo "$LINE" | sed -E 's/^[[:space:]]*at[[:space:]]+(.+)[[:space:]]+\([^()]+:[0-9]+\)[[:space:]]*$/\1/' | tr -d '\n\r')
      INNER=$(echo "$LINE" | sed -E 's/.*\(([^()]+:[0-9]+)\).*/\1/')
    else
      F_FUNC="<anonymous>"
      INNER=$(echo "$LINE" | sed -E 's/^[[:space:]]*at[[:space:]]+(.+)$/\1/')
    fi
    F_FILE=$(echo "$INNER" | sed -E 's/^(.+):[0-9]+$/\1/')
    F_LINE=$(echo "$INNER" | sed -E 's/^.+:([0-9]+)$/\1/')
  fi

  # Python traceback: '  File "x.py", line 42, in funcname'
  if [ -z "$F_FILE" ] && echo "$LINE" | grep -qE 'File "[^"]+\.py", line [0-9]+'; then
    F_FILE=$(echo "$LINE" | sed -E 's/.*File "([^"]+)", line [0-9]+.*/\1/')
    F_LINE=$(echo "$LINE" | sed -E 's/.*File "[^"]+", line ([0-9]+).*/\1/')
    if echo "$LINE" | grep -qE ', in [^ ]+'; then
      F_FUNC=$(echo "$LINE" | sed -E 's/.*, in ([^[:space:]]+).*/\1/')
    fi
  fi

  # Ruby: "file.rb:42:in `method'"
  if [ -z "$F_FILE" ] && echo "$LINE" | grep -qE "\.rb:[0-9]+:in [\`']"; then
    F_FILE=$(echo "$LINE" | sed -E "s/.*[[:space:](]([A-Za-z0-9_./+-]+\.rb):[0-9]+:in.*/\1/")
    [ "$F_FILE" = "$LINE" ] && F_FILE=$(echo "$LINE" | grep -oE '[A-Za-z0-9_./+-]+\.rb' | tail -n 1)
    F_LINE=$(echo "$LINE" | sed -E "s/.*\.rb:([0-9]+):in.*/\1/")
    F_FUNC=$(echo "$LINE" | sed -E "s/.*in [\`']([^']+)'.*/\1/")
  fi

  # Java/Kotlin: "at pkg.Class.method(File.kt:42)"
  if [ -z "$F_FILE" ] && echo "$LINE" | grep -qE 'at [A-Za-z0-9_.$<>]+\([A-Za-z0-9_./+-]+\.(java|kt):[0-9]+\)'; then
    F_FUNC=$(echo "$LINE" | sed -E 's/^[[:space:]]*at[[:space:]]+([A-Za-z0-9_.$<>]+)\(.*$/\1/')
    F_FILE=$(echo "$LINE" | sed -E 's/.*\(([A-Za-z0-9_./+-]+\.(java|kt)):[0-9]+\).*/\1/')
    F_LINE=$(echo "$LINE" | sed -E 's/.*\([A-Za-z0-9_./+-]+\.(java|kt):([0-9]+)\).*/\2/')
  fi

  # Go: "\tfile.go:42 +0xab"
  if [ -z "$F_FILE" ] && echo "$LINE" | grep -qE '([A-Za-z0-9_./+-]+\.go):[0-9]+'; then
    RAW=$(echo "$LINE" | grep -oE '([A-Za-z0-9_./+-]+\.go):[0-9]+' | tail -n 1)
    F_FILE=$(echo "$RAW" | sed -E 's/:[0-9]+$//')
    F_LINE=$(echo "$RAW" | sed -E 's/.*:([0-9]+)$/\1/')
  fi

  # tsc diagnostics: "file.ts(42,10): error" — accepts POSIX and Windows paths
  # (drive letter + backslashes). The path is anything non-space up to ".ext(".
  if [ -z "$F_FILE" ] && echo "$LINE" | grep -qE '[^[:space:]]+\.(ts|tsx|js|jsx)\([0-9]+,[0-9]+\)'; then
    RAW=$(echo "$LINE" | grep -oE '[^[:space:]]+\.(ts|tsx|js|jsx)\([0-9]+,[0-9]+\)' | tail -n 1)
    F_FILE=$(echo "$RAW" | sed -E 's/\([0-9]+,[0-9]+\)$//')
    F_LINE=$(echo "$RAW" | sed -E 's/.*\(([0-9]+),[0-9]+\)$/\1/')
    F_COL=$(echo  "$RAW" | sed -E 's/.*\([0-9]+,([0-9]+)\)$/\1/')
  fi

  # Bash xtrace / errexit: "scripts/foo.sh: line 42: cmd: not found"
  if [ -z "$F_FILE" ] && echo "$LINE" | grep -qE '([A-Za-z0-9_./+-]+\.(sh|bash|zsh)): ?line [0-9]+'; then
    RAW=$(echo "$LINE" | grep -oE '([A-Za-z0-9_./+-]+\.(sh|bash|zsh)): ?line [0-9]+' | tail -n 1)
    F_FILE=$(echo "$RAW" | sed -E 's/: ?line [0-9]+$//')
    F_LINE=$(echo "$RAW" | sed -E 's/.*line ([0-9]+)$/\1/')
  fi

  # Generic fallback: "path/file.ext:line[:col]"
  if [ -z "$F_FILE" ] && echo "$LINE" | grep -qE '([A-Za-z0-9_./+-]+\.(sh|ts|tsx|js|jsx|mjs|cjs|bash|py|rb|go)):[0-9]+(:[0-9]+)?'; then
    RAW=$(echo "$LINE" | grep -oE '([A-Za-z0-9_./+-]+\.(sh|ts|tsx|js|jsx|mjs|cjs|bash|py|rb|go)):[0-9]+(:[0-9]+)?' | tail -n 1)
    F_FILE=$(echo "$RAW" | awk -F: '{print $1}')
    F_LINE=$(echo "$RAW" | awk -F: '{print $2}')
    F_COL=$(echo  "$RAW" | awk -F: '{print $3}')
  fi

  if [ -n "$F_FILE" ] && [ -n "$F_LINE" ]; then
    F_FUNC=$(echo "$F_FUNC" | tr -d '`"\\' | cut -c1-80)
    KEY="${F_FILE}:${F_LINE}"
    if ! grep -Fxq "$KEY" "$KEYS_FILE" 2>/dev/null; then
      echo "$KEY" >> "$KEYS_FILE"
      printf '%s\t%s\t%s\t%s\n' "$F_FILE" "$F_LINE" "$F_COL" "$F_FUNC"
      FRAME_COUNT=$((FRAME_COUNT + 1))
    fi
  fi
done <<< "$REVERSED"
