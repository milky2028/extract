#!/usr/bin/env bash
# Runs the test suite against an AddressSanitizer build (out-of-bounds reads/writes,
# use-after-free, stack overflow). Slow, so it is separate from `npm test`.
#
#   LIBARCHIVE_PREFIX=/path/to/libarchive-dist scripts/test-asan.sh
#
# Also honours EXTRACT_SAMPLES (see test/extract.test.mjs). Needs emsdk on PATH.
set -euo pipefail

: "${LIBARCHIVE_PREFIX:?set LIBARCHIVE_PREFIX (see scripts/build-libarchive.sh)}"

out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT

em++ src/extract.cpp \
  -std=c++20 \
  -I"$LIBARCHIVE_PREFIX/include" \
  -L"$LIBARCHIVE_PREFIX/lib" \
  -larchive \
  -sUSE_ZLIB=1 \
  -sUSE_BZIP2=1 \
  -lembind \
  -sEXPORT_ES6 \
  -sALLOW_MEMORY_GROWTH \
  -sSTACK_SIZE=1MB \
  -sFILESYSTEM=0 \
  -fno-exceptions \
  --pre-js src/locateFile.js \
  -sENVIRONMENT=node \
  -O0 -g -fsanitize=address -sASSERTIONS=2 \
  -o "$out/extract.node.js"

EXTRACT_MODULE="$out/extract.node.js" node --test test/
