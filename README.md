# extract-zip-rar

libarchive compiled to WebAssembly for reading `.zip`/`.cbz` (stored, deflate, bzip2) and `.rar`/`.cbr` (RAR 4 and 5) archives.

Archives are read **by path, in chunks**. They are never copied into wasm memory, so archives of any size work (tested with 4.8 GB) using about 20 MB of wasm heap.

## Browser (dedicated worker)

```js
import init from 'extract-zip-rar';

const wasm = await init();
wasm.FS.mkdir('/input');
wasm.FS.mount(wasm.WORKERFS, { blobs: [{ name: 'archive', data: file }] }, '/input');

const handle = wasm.open_archive('/input/archive');
if (handle === 0) throw new Error(wasm.last_open_error());
try {
  for (let entry; (entry = wasm.next_entry(handle)) !== null; ) {
    if (entry.error) throw new Error(entry.error);
    if (!entry.isFile) continue;
    const bytes = wasm.read_entry(handle); // Uint8Array owned by JS, or { error }
    // or wasm.skip_entry(handle) to skip it cheaply
  }
} finally {
  wasm.close_archive(handle);
  wasm.FS.unmount('/input');
}
```

`next_entry` returns `null` at the end, `{ error }` on failure, or `{ path, isFile, size }`. `size` is `-1` when the archive does not record it up front.

Set `globalThis.wasmURL` before `init()` if your bundler renames `extract.wasm`.

## Node

`extract-zip-rar/node` exposes the same API, reading the real filesystem: `wasm.open_archive('/path/to/book.cbz')`.

## Building

```sh
source /path/to/emsdk/emsdk_env.sh   # Emscripten 7.0.0
LIBARCHIVE_SRC=/path/to/libarchive PREFIX=$PWD/../libarchive-dist scripts/build-libarchive.sh   # libarchive v3.8.11
LIBARCHIVE_PREFIX=$PWD/../libarchive-dist ./compile
node --test test/
```

`EXTRACT_SAMPLES="/a.cbz:/b.cbr" node --test test/` also verifies real archives.
