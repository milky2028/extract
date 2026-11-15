## Building libarchive

Use `scripts/build-libarchive.sh` (see README). It builds Emscripten's zlib and bzip2 ports into the sysroot
**before** running libarchive's `configure`, then fails if `configure` did not detect them.

Versions up to 0.19.3 were built without that step. `configure` silently compiled libarchive without deflate support,
so every deflate-compressed zip entry came back as uninitialized memory. (It was not caused by libarchive versions
newer than 3.7.2.)
