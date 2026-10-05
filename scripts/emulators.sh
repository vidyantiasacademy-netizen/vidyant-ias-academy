#!/usr/bin/env bash
# Starts the Firebase emulators. firebase-tools needs Java 21+; if Homebrew's
# keg-only openjdk@21 is installed, use it for this process only, so the
# machine's default `java` (which other projects may depend on) is untouched.
set -euo pipefail

if command -v brew >/dev/null 2>&1; then
  jdk="$(brew --prefix openjdk@21 2>/dev/null || true)"
  if [ -n "$jdk" ] && [ -x "$jdk/bin/java" ]; then
    export JAVA_HOME="$jdk"
    export PATH="$jdk/bin:$PATH"
  fi
fi

exec firebase emulators:start --project vidyantias "$@"
