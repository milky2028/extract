Module.locateFile = (url) => {
  if (url.includes(".wasm.map")) {
    globalThis.wasmSourceMapURL ?? url;
  }

  if (url.includes("worker")) {
    return globalThis.workerURL ?? url;
  }

  if (url.includes("wasm")) {
    return globalThis.wasmURL ?? url;
  }
};
