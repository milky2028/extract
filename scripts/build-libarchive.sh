#!/usr/bin/env bash
# Builds a static libarchive for Emscripten with zlib + bzip2 support.
#
#   LIBARCHIVE_SRC=/path/to/libarchive PREFIX=/path/to/install scripts/build-libarchive.sh
#
# The Emscripten zlib/bzip2 ports must be in the sysroot *before* configure runs,
# otherwise configure silently disables deflate (this is what broke 0.19.x).
set -euo pipefail

: "${LIBARCHIVE_SRC:?set LIBARCHIVE_SRC to a libarchive checkout}"
: "${PREFIX:?set PREFIX to the install directory}"

embuilder build zlib bzip2

cd "$LIBARCHIVE_SRC"
[ -f configure ] || ./build/autogen.sh

emconfigure ./configure \
  --prefix="$PREFIX" \
  --enable-static --disable-shared \
  --disable-bsdtar --disable-bsdcpio --disable-bsdcat --disable-bsdunzip \
  --disable-acl --disable-xattr \
  --with-zlib --with-bz2lib \
  --without-xml2 --without-expat --without-openssl --without-lz4 --without-zstd \
  --without-lzma --without-libb2 --without-cng --without-mbedtls --without-nettle

for feature in HAVE_ZLIB_H HAVE_BZLIB_H; do
  grep -q "#define $feature 1" config.h || { echo "error: $feature not detected by configure" >&2; exit 1; }
done

emmake make -j"$(nproc)" libarchive.la
emmake make install-libLTLIBRARIES install-includeHEADERS
