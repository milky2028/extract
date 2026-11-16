// Lets the host app point Emscripten at bundler-hashed asset URLs.
Module.locateFile = (url, prefix) => {
  if (url.endsWith(".wasm.map")) {
    return globalThis.wasmSourceMapURL ?? prefix + url;
  }

  if (url.endsWith(".wasm")) {
    return globalThis.wasmURL ?? prefix + url;
  }

  return prefix + url;
};
