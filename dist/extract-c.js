
var Module = (() => {
  var _scriptName = import.meta.url;
  
  return (
function(moduleArg = {}) {
  var moduleRtn;

// Support for growable heap + pthreads, where the buffer may change, so JS views
// must be updated.
function GROWABLE_HEAP_I8() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP8;
}
function GROWABLE_HEAP_U8() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU8;
}
function GROWABLE_HEAP_I16() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP16;
}
function GROWABLE_HEAP_U16() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU16;
}
function GROWABLE_HEAP_I32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP32;
}
function GROWABLE_HEAP_U32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU32;
}
function GROWABLE_HEAP_F32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPF32;
}
function GROWABLE_HEAP_F64() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPF64;
}

var Module = moduleArg;

var readyPromiseResolve, readyPromiseReject;

var readyPromise = new Promise((resolve, reject) => {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});

[ "_malloc", "_free", "___indirect_function_table", "onRuntimeInitialized" ].forEach(prop => {
  if (!Object.getOwnPropertyDescriptor(readyPromise, prop)) {
    Object.defineProperty(readyPromise, prop, {
      get: () => abort("You are getting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),
      set: () => abort("You are setting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")
    });
  }
});

var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module["ENVIRONMENT"]) {
  throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
}

var ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && self.name == "em-pthread";

if (ENVIRONMENT_IS_PTHREAD) {
  assert(!globalThis.moduleLoaded, "module should only be loaded once on each pthread worker");
  globalThis.moduleLoaded = true;
}

Module.locateFile = url => {
  if (url.includes("worker")) {
    return globalThis.workerURL ?? url;
  }
  if (url.includes("wasm")) {
    return globalThis.wasmURL ?? url;
  }
};

var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
  throw toThrow;
};

var scriptDirectory = "";

function locateFile(path) {
  if (Module["locateFile"]) {
    return Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

var read_, readAsync, readBinary;

if (ENVIRONMENT_IS_SHELL) {
  if ((typeof process == "object" && typeof require === "function") || typeof window == "object" || typeof importScripts == "function") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href;
  } else if (typeof document != "undefined" && document.currentScript) {
    scriptDirectory = document.currentScript.src;
  }
  if (_scriptName) {
    scriptDirectory = _scriptName;
  }
  if (scriptDirectory.startsWith("blob:")) {
    scriptDirectory = "";
  } else {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
  }
  if (!(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
  {
    read_ = url => {
      var xhr = new XMLHttpRequest;
      xhr.open("GET", url, false);
      xhr.send(null);
      return xhr.responseText;
    };
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = url => {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
      };
    }
    readAsync = (url, onload, onerror) => {
      assert(!isFileURI(url), "readAsync does not work with file:// URLs");
      fetch(url, {
        credentials: "same-origin"
      }).then(response => {
        if (response.ok) {
          return response.arrayBuffer();
        }
        return Promise.reject(new Error(response.status + " : " + response.url));
      }).then(onload, onerror);
    };
  }
} else {
  throw new Error("environment detection error");
}

var out = Module["print"] || console.log.bind(console);

var err = Module["printErr"] || console.error.bind(console);

Object.assign(Module, moduleOverrides);

moduleOverrides = null;

checkIncomingModuleAPI();

if (Module["arguments"]) arguments_ = Module["arguments"];

legacyModuleProp("arguments", "arguments_");

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

legacyModuleProp("thisProgram", "thisProgram");

if (Module["quit"]) quit_ = Module["quit"];

legacyModuleProp("quit", "quit_");

assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");

assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");

assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");

assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");

assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");

legacyModuleProp("asm", "wasmExports");

legacyModuleProp("read", "read_");

legacyModuleProp("readAsync", "readAsync");

legacyModuleProp("readBinary", "readBinary");

legacyModuleProp("setWindowTitle", "setWindowTitle");

var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";

var PROXYFS = "PROXYFS is no longer included by default; build with -lproxyfs.js";

var WORKERFS = "WORKERFS is no longer included by default; build with -lworkerfs.js";

var FETCHFS = "FETCHFS is no longer included by default; build with -lfetchfs.js";

var ICASEFS = "ICASEFS is no longer included by default; build with -licasefs.js";

var JSFILEFS = "JSFILEFS is no longer included by default; build with -ljsfilefs.js";

var OPFS = "OPFS is no longer included by default; build with -lopfs.js";

var NODEFS = "NODEFS is no longer included by default; build with -lnodefs.js";

assert(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE, "Pthreads do not work in this environment yet (need Web Workers, or an alternative to them)");

assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");

var workerID = 0;

if (ENVIRONMENT_IS_PTHREAD) {
  var wasmPromiseResolve;
  var wasmPromiseReject;
  var receivedWasmModule;
  var initializedJS = false;
  function threadPrintErr(...args) {
    var text = args.join(" ");
    console.error(text);
  }
  if (!Module["printErr"]) err = threadPrintErr;
  dbg = threadPrintErr;
  function threadAlert(...args) {
    var text = args.join(" ");
    postMessage({
      cmd: "alert",
      text: text,
      threadId: _pthread_self()
    });
  }
  self.alert = threadAlert;
  Module["instantiateWasm"] = (info, receiveInstance) => new Promise((resolve, reject) => {
    wasmPromiseResolve = module => {
      var instance = new WebAssembly.Instance(module, getWasmImports());
      receiveInstance(instance);
      resolve();
    };
    wasmPromiseReject = reject;
  });
  self.onunhandledrejection = e => {
    throw e.reason || e;
  };
  function handleMessage(e) {
    try {
      var msgData = e["data"];
      var cmd = msgData["cmd"];
      if (cmd === "load") {
        workerID = msgData["workerID"];
        let messageQueue = [];
        self.onmessage = e => messageQueue.push(e);
        self.startWorker = instance => {
          postMessage({
            "cmd": "loaded"
          });
          for (let msg of messageQueue) {
            handleMessage(msg);
          }
          self.onmessage = handleMessage;
        };
        for (const handler of msgData["handlers"]) {
          if (!Module[handler] || Module[handler].proxy) {
            Module[handler] = (...args) => {
              postMessage({
                cmd: "callHandler",
                handler: handler,
                args: args
              });
            };
            if (handler == "print") out = Module[handler];
            if (handler == "printErr") err = Module[handler];
          }
        }
        wasmMemory = msgData["wasmMemory"];
        updateMemoryViews();
        wasmPromiseResolve(msgData["wasmModule"]);
      } else if (cmd === "run") {
        __emscripten_thread_init(msgData["pthread_ptr"], /*is_main=*/ 0, /*is_runtime=*/ 0, /*can_block=*/ 1, 0, 0);
        __emscripten_thread_mailbox_await(msgData["pthread_ptr"]);
        assert(msgData["pthread_ptr"]);
        establishStackSpace();
        PThread.receiveObjectTransfer(msgData);
        PThread.threadInitTLS();
        if (!initializedJS) {
          __embind_initialize_bindings();
          initializedJS = true;
        }
        try {
          invokeEntryPoint(msgData["start_routine"], msgData["arg"]);
        } catch (ex) {
          if (ex != "unwind") {
            throw ex;
          }
        }
      } else if (cmd === "cancel") {
        if (_pthread_self()) {
          __emscripten_thread_exit(-1);
        }
      } else if (msgData.target === "setimmediate") {} else if (cmd === "checkMailbox") {
        if (initializedJS) {
          checkMailbox();
        }
      } else if (cmd) {
        err(`worker: received unknown command ${cmd}`);
        err(msgData);
      }
    } catch (ex) {
      err(`worker: onmessage() captured an uncaught exception: ${ex}`);
      if (ex?.stack) err(ex.stack);
      __emscripten_thread_crashed();
      throw ex;
    }
  }
  self.onmessage = handleMessage;
}

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

legacyModuleProp("wasmBinary", "wasmBinary");

if (typeof WebAssembly != "object") {
  err("no native wasm support detected");
}

var wasmMemory;

var wasmModule;

var ABORT = false;

var EXITSTATUS;

/** @type {function(*, string=)} */ function assert(condition, text) {
  if (!condition) {
    abort("Assertion failed" + (text ? ": " + text : ""));
  }
}

var HEAP, /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /** @type {!Float64Array} */ HEAPF64;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module["HEAP8"] = HEAP8 = new Int8Array(b);
  Module["HEAP16"] = HEAP16 = new Int16Array(b);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
  Module["HEAP32"] = HEAP32 = new Int32Array(b);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
}

assert(!Module["STACK_SIZE"], "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");

assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, "JS engine does not provide full typed array support");

if (!ENVIRONMENT_IS_PTHREAD) {
  if (Module["wasmMemory"]) {
    wasmMemory = Module["wasmMemory"];
  } else {
    var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
    legacyModuleProp("INITIAL_MEMORY", "INITIAL_MEMORY");
    assert(INITIAL_MEMORY >= 65536, "INITIAL_MEMORY should be larger than STACK_SIZE, was " + INITIAL_MEMORY + "! (STACK_SIZE=" + 65536 + ")");
    wasmMemory = new WebAssembly.Memory({
      "initial": INITIAL_MEMORY / 65536,
      "maximum": 4294967296 / 65536,
      "shared": true
    });
    if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
      err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
      if (ENVIRONMENT_IS_NODE) {
        err("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)");
      }
      throw Error("bad memory");
    }
  }
  updateMemoryViews();
}

function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  if (max == 0) {
    max += 4;
  }
  GROWABLE_HEAP_U32()[((max) >>> 2) >>> 0] = 34821223;
  GROWABLE_HEAP_U32()[(((max) + (4)) >>> 2) >>> 0] = 2310721022;
  GROWABLE_HEAP_U32()[((0) >>> 2) >>> 0] = 1668509029;
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  if (max == 0) {
    max += 4;
  }
  var cookie1 = GROWABLE_HEAP_U32()[((max) >>> 2) >>> 0];
  var cookie2 = GROWABLE_HEAP_U32()[(((max) + (4)) >>> 2) >>> 0];
  if (cookie1 != 34821223 || cookie2 != 2310721022) {
    abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
  }
  if (GROWABLE_HEAP_U32()[((0) >>> 2) >>> 0] != 1668509029) /* 'emsc' */ {
    abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
  }
}

(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 25459;
  if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
})();

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

function preRun() {
  assert(!ENVIRONMENT_IS_PTHREAD);
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;
  if (ENVIRONMENT_IS_PTHREAD) return;
  checkStackCookie();
  callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
  checkStackCookie();
  if (ENVIRONMENT_IS_PTHREAD) return;
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnExit(cb) {}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;
  Module["monitorRunDependencies"]?.(runDependencies);
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != "undefined") {
      runDependencyWatcher = setInterval(() => {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err("still waiting on run dependencies:");
          }
          err(`dependency: ${dep}`);
        }
        if (shown) {
          err("(end of list)");
        }
      }, 1e4);
    }
  } else {
    err("warning: run dependency added without ID");
  }
}

function removeRunDependency(id) {
  runDependencies--;
  Module["monitorRunDependencies"]?.(runDependencies);
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err("warning: run dependency removed without ID");
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}

/** @param {string|number=} what */ function abort(what) {
  Module["onAbort"]?.(what);
  what = "Aborted(" + what + ")";
  err(what);
  ABORT = true;
  EXITSTATUS = 1;
  /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
  readyPromiseReject(e);
  throw e;
}

var emscriptenMemoryProfiler = {
  detailedHeapUsage: true,
  trackedCallstackMinSizeBytes: (typeof (new Error).stack == "undefined") ? Infinity : 16 * 1024 * 1024,
  trackedCallstackMinAllocCount: (typeof (new Error).stack == "undefined") ? Infinity : 1e4,
  hookStackAlloc: true,
  uiUpdateIntervalMsecs: 2e3,
  allocationsAtLoc: {},
  allocationSitePtrs: {},
  sizeOfAllocatedPtr: {},
  sizeOfPreRunAllocatedPtr: {},
  resizeMemorySources: [],
  sbrkSources: [],
  pagePreRunIsFinished: false,
  totalMemoryAllocated: 0,
  totalTimesMallocCalled: 0,
  totalTimesFreeCalled: 0,
  stackTopWatermark: Infinity,
  canvas: null,
  drawContext: null,
  truncDec(f = 0) {
    var str = f.toFixed(2);
    if (str.includes(".00", str.length - 3)) return str.substr(0, str.length - 3); else if (str.includes("0", str.length - 1)) return str.substr(0, str.length - 1); else return str;
  },
  formatBytes(bytes) {
    if (bytes >= 1e3 * 1024 * 1024) return emscriptenMemoryProfiler.truncDec(bytes / (1024 * 1024 * 1024)) + " GB"; else if (bytes >= 1e3 * 1024) return emscriptenMemoryProfiler.truncDec(bytes / (1024 * 1024)) + " MB"; else if (bytes >= 1e3) return emscriptenMemoryProfiler.truncDec(bytes / 1024) + " KB"; else return emscriptenMemoryProfiler.truncDec(bytes) + " B";
  },
  hsvToRgb(h, s, v) {
    var h_i = (h * 6) | 0;
    var f = h * 6 - h_i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var r, g, b;
    switch (h_i) {
     case 0:
      r = v;
      g = t;
      b = p;
      break;

     case 1:
      r = q;
      g = v;
      b = p;
      break;

     case 2:
      r = p;
      g = v;
      b = t;
      break;

     case 3:
      r = p;
      g = q;
      b = v;
      break;

     case 4:
      r = t;
      g = p;
      b = v;
      break;

     case 5:
      r = v;
      g = p;
      b = q;
      break;
    }
    function toHex(v) {
      v = (v * 255 | 0).toString(16);
      return (v.length == 1) ? "0" + v : v;
    }
    return "#" + toHex(r) + toHex(g) + toHex(b);
  },
  onSbrkGrow(oldLimit, newLimit) {
    var self = emscriptenMemoryProfiler;
    if (self.sbrkSources.length == 0) {
      self.sbrkSources.push({
        stack: "initial heap sbrk limit<br>",
        begin: 0,
        end: oldLimit,
        color: self.hsvToRgb(self.sbrkSources.length * .618033988749895 % 1, .5, .95)
      });
    }
    if (newLimit <= oldLimit) return;
    self.sbrkSources.push({
      stack: self.filterCallstackForHeapResize((new Error).stack.toString()),
      begin: oldLimit,
      end: newLimit,
      color: self.hsvToRgb(self.sbrkSources.length * .618033988749895 % 1, .5, .95)
    });
  },
  onMemoryResize(oldSize, newSize) {
    var self = emscriptenMemoryProfiler;
    if (self.resizeMemorySources.length == 0) {
      self.resizeMemorySources.push({
        stack: "initial heap size<br>",
        begin: 0,
        end: oldSize,
        color: self.resizeMemorySources.length % 2 ? "#ff00ff" : "#ff80ff"
      });
    }
    if (newSize <= oldSize) return;
    self.resizeMemorySources.push({
      stack: self.filterCallstackForHeapResize((new Error).stack.toString()),
      begin: oldSize,
      end: newSize,
      color: self.resizeMemorySources.length % 2 ? "#ff00ff" : "#ff80ff"
    });
    console.log("memory resize: " + oldSize + " " + newSize);
  },
  recordStackWatermark() {
    if (typeof runtimeInitialized == "undefined" || runtimeInitialized) {
      var self = emscriptenMemoryProfiler;
      self.stackTopWatermark = Math.min(self.stackTopWatermark, _emscripten_stack_get_current());
    }
  },
  onMalloc(ptr, size) {
    if (!ptr) return;
    if (emscriptenMemoryProfiler.sizeOfAllocatedPtr[ptr]) {
      return;
    }
    var self = emscriptenMemoryProfiler;
    self.totalMemoryAllocated += size;
    ++self.totalTimesMallocCalled;
    self.recordStackWatermark();
    self.sizeOfAllocatedPtr[ptr] = size;
    if (!self.pagePreRunIsFinished) self.sizeOfPreRunAllocatedPtr[ptr] = size;
    var loc = (new Error).stack.toString();
    self.allocationsAtLoc[loc] ||= [ 0, 0, self.filterCallstackForMalloc(loc) ];
    self.allocationsAtLoc[loc][0] += 1;
    self.allocationsAtLoc[loc][1] += size;
    self.allocationSitePtrs[ptr] = loc;
  },
  onFree(ptr) {
    if (!ptr) return;
    var self = emscriptenMemoryProfiler;
    var sz = self.sizeOfAllocatedPtr[ptr];
    if (!isNaN(sz)) self.totalMemoryAllocated -= sz; else {
      return;
    }
    self.recordStackWatermark();
    var loc = self.allocationSitePtrs[ptr];
    if (loc) {
      var allocsAtThisLoc = self.allocationsAtLoc[loc];
      if (allocsAtThisLoc) {
        allocsAtThisLoc[0] -= 1;
        allocsAtThisLoc[1] -= sz;
        if (allocsAtThisLoc[0] <= 0) delete self.allocationsAtLoc[loc];
      }
    }
    delete self.allocationSitePtrs[ptr];
    delete self.sizeOfAllocatedPtr[ptr];
    delete self.sizeOfPreRunAllocatedPtr[ptr];
    ++self.totalTimesFreeCalled;
  },
  onRealloc(oldAddress, newAddress, size) {
    emscriptenMemoryProfiler.onFree(oldAddress);
    emscriptenMemoryProfiler.onMalloc(newAddress, size);
  },
  onPreloadComplete() {
    emscriptenMemoryProfiler.pagePreRunIsFinished = true;
  },
  initialize() {
    Module["onMalloc"] = (ptr, size) => emscriptenMemoryProfiler.onMalloc(ptr, size);
    Module["onRealloc"] = (oldAddress, newAddress, size) => emscriptenMemoryProfiler.onRealloc(oldAddress, newAddress, size);
    Module["onFree"] = ptr => emscriptenMemoryProfiler.onFree(ptr);
    emscriptenMemoryProfiler.recordStackWatermark();
    Module["preRun"] ||= [];
    Module["preRun"].push(emscriptenMemoryProfiler.onPreloadComplete);
    if (emscriptenMemoryProfiler.hookStackAlloc && typeof stackAlloc == "function") {
      var prevStackAlloc = stackAlloc;
      var hookedStackAlloc = size => {
        var ptr = prevStackAlloc(size);
        emscriptenMemoryProfiler.recordStackWatermark();
        return ptr;
      };
      stackAlloc = hookedStackAlloc;
    }
    if (location.search.toLowerCase().includes("trackbytes=")) {
      emscriptenMemoryProfiler.trackedCallstackMinSizeBytes = parseInt(location.search.substr(location.search.toLowerCase().indexOf("trackbytes=") + "trackbytes=".length), undefined);
    }
    /* https://github.com/google/closure-compiler/issues/3230 / https://github.com/google/closure-compiler/issues/3548 */ if (location.search.toLowerCase().includes("trackcount=")) {
      emscriptenMemoryProfiler.trackedCallstackMinAllocCount = parseInt(location.search.substr(location.search.toLowerCase().indexOf("trackcount=") + "trackcount=".length), undefined);
    }
    emscriptenMemoryProfiler.memoryprofiler_summary = document.getElementById("memoryprofiler_summary");
    var div;
    if (!emscriptenMemoryProfiler.memoryprofiler_summary) {
      div = document.createElement("div");
      div.innerHTML = "<div style='border: 2px solid black; padding: 2px;'><canvas style='border: 1px solid black; margin-left: auto; margin-right: auto; display: block;' id='memoryprofiler_canvas' width='100%' height='50'></canvas><input type='checkbox' id='showHeapResizes' onclick='emscriptenMemoryProfiler.updateUi()'>Display heap and sbrk() resizes. Filter sbrk() and heap resize callstacks by keywords: <input type='text' id='sbrkFilter'>(reopen page with ?sbrkFilter=foo,bar query params to prepopulate this list)<br/>Track all allocation sites larger than <input id='memoryprofiler_min_tracked_alloc_size' type=number value=" + emscriptenMemoryProfiler.trackedCallstackMinSizeBytes + "></input> bytes, and all allocation sites with more than <input id='memoryprofiler_min_tracked_alloc_count' type=number value=" + emscriptenMemoryProfiler.trackedCallstackMinAllocCount + "></input> outstanding allocations. (visit this page via URL query params foo.html?trackbytes=1000&trackcount=100 to apply custom thresholds starting from page load)<br/><div id='memoryprofiler_summary'></div><input id='memoryprofiler_clear_alloc_stats' type='button' value='Clear alloc stats' ></input><br />Sort allocations by:<select id='memoryProfilerSort'><option value='bytes'>Bytes</option><option value='count'>Count</option><option value='fixed'>Fixed</option></select><div id='memoryprofiler_ptrs'></div>";
    }
    var populateHtmlBody = function() {
      if (div) {
        document.body.appendChild(div);
        function getValueOfParam(key) {
          var results = (new RegExp("[\\?&]" + key + "=([^&#]*)")).exec(location.href);
          return results ? results[1] : "";
        }
        if (document.getElementById("sbrkFilter").value = getValueOfParam("sbrkFilter")) {
          document.getElementById("showHeapResizes").checked = true;
        }
      }
      var self = emscriptenMemoryProfiler;
      self.memoryprofiler_summary = document.getElementById("memoryprofiler_summary");
      self.memoryprofiler_ptrs = document.getElementById("memoryprofiler_ptrs");
      document.getElementById("memoryprofiler_min_tracked_alloc_size").addEventListener("change", function(e) {
        self.trackedCallstackMinSizeBytes = parseInt(this.value, undefined);
      });
      /* https://github.com/google/closure-compiler/issues/3230 / https://github.com/google/closure-compiler/issues/3548 */ document.getElementById("memoryprofiler_min_tracked_alloc_count").addEventListener("change", function(e) {
        self.trackedCallstackMinAllocCount = parseInt(this.value, undefined);
      });
      document.getElementById("memoryprofiler_clear_alloc_stats").addEventListener("click", e => {
        self.allocationsAtLoc = {};
        self.allocationSitePtrs = {};
      });
      self.canvas = document.getElementById("memoryprofiler_canvas");
      self.canvas.width = document.documentElement.clientWidth - 32;
      self.drawContext = self.canvas.getContext("2d");
      self.updateUi();
      setInterval(() => emscriptenMemoryProfiler.updateUi(), self.uiUpdateIntervalMsecs);
    };
    if (document.body) populateHtmlBody(); else setTimeout(populateHtmlBody, 1e3);
  },
  bytesToPixelsRoundedDown(bytes) {
    return (bytes * emscriptenMemoryProfiler.canvas.width * emscriptenMemoryProfiler.canvas.height / GROWABLE_HEAP_I8().length) | 0;
  },
  bytesToPixelsRoundedUp(bytes) {
    return ((bytes * emscriptenMemoryProfiler.canvas.width * emscriptenMemoryProfiler.canvas.height + GROWABLE_HEAP_I8().length - 1) / GROWABLE_HEAP_I8().length) | 0;
  },
  fillLine(startBytes, endBytes) {
    var self = emscriptenMemoryProfiler;
    var startPixels = self.bytesToPixelsRoundedDown(startBytes);
    var endPixels = self.bytesToPixelsRoundedUp(endBytes);
    var x0 = (startPixels / self.canvas.height) | 0;
    var y0 = startPixels - x0 * self.canvas.height;
    var x1 = (endPixels / self.canvas.height) | 0;
    var y1 = endPixels - x1 * self.canvas.height;
    if (y0 > 0 && x0 < x1) {
      self.drawContext.fillRect(x0, y0, 1, self.canvas.height - y0);
      y0 = 0;
      ++x0;
    }
    if (y1 < self.canvas.height && x0 < x1) {
      self.drawContext.fillRect(x1, 0, 1, y1);
      y1 = self.canvas.height - 1;
      --x1;
    }
    self.drawContext.fillRect(x0, 0, x1 - x0 + 1, self.canvas.height);
  },
  fillRect(startBytes, endBytes, heightPercentage) {
    var self = emscriptenMemoryProfiler;
    var startPixels = self.bytesToPixelsRoundedDown(startBytes);
    var endPixels = self.bytesToPixelsRoundedUp(endBytes);
    var x0 = (startPixels / self.canvas.height) | 0;
    var x1 = (endPixels / self.canvas.height) | 0;
    self.drawContext.fillRect(x0, self.canvas.height * (1 - heightPercentage), x1 - x0 + 1, self.canvas.height);
  },
  countOpenALAudioDataSize() {
    if (typeof AL == "undefined" || !AL.currentContext) return 0;
    var totalMemory = 0;
    for (var i in AL.currentContext.buf) {
      var buffer = AL.currentContext.buf[i];
      for (var channel = 0; channel < buffer.numberOfChannels; ++channel) totalMemory += buffer.getChannelData(channel).length * 4;
    }
    return totalMemory;
  },
  printAllocsWithCyclingColors(colors, allocs) {
    var colorIndex = 0;
    for (var i in allocs) {
      emscriptenMemoryProfiler.drawContext.fillStyle = colors[colorIndex];
      colorIndex = (colorIndex + 1) % colors.length;
      var start = i | 0;
      var sz = allocs[start] | 0;
      emscriptenMemoryProfiler.fillLine(start, start + sz);
    }
  },
  filterURLsFromCallstack(callstack) {
    callstack = callstack.replace(/@((file)|(http))[\w:\/\.]*\/([\w\.]*)/g, "@$4");
    callstack = callstack.replace(/\n/g, "<br />");
    return callstack;
  },
  filterCallstackAfterFunctionName(callstack, func) {
    var i = callstack.indexOf(func);
    if (i != -1) {
      var end = callstack.indexOf("<br />", i);
      if (end != -1) {
        return callstack.substr(0, end);
      }
    }
    return callstack;
  },
  filterCallstackForMalloc(callstack) {
    var i = callstack.indexOf("emscripten_trace_record_");
    if (i != -1) {
      callstack = callstack.substr(callstack.indexOf("\n", i) + 1);
    }
    return emscriptenMemoryProfiler.filterURLsFromCallstack(callstack);
  },
  filterCallstackForHeapResize(callstack) {
    var i = callstack.indexOf("emscripten_asm_const_iii");
    var j = callstack.indexOf("growMemory");
    i = (i == -1) ? j : (j == -1 ? i : Math.min(i, j));
    if (i != -1) {
      callstack = callstack.substr(callstack.indexOf("\n", i) + 1);
    }
    callstack = callstack.replace(/(wasm-function\[\d+\]):0x[0-9a-f]+/g, "$1");
    return emscriptenMemoryProfiler.filterURLsFromCallstack(callstack);
  },
  printHeapResizeLog(heapResizes) {
    var html = "";
    for (var i = 0; i < heapResizes.length; ++i) {
      var j = i + 1;
      while (j < heapResizes.length) {
        if ((heapResizes[j].filteredStack || heapResizes[j].stack) == (heapResizes[i].filteredStack || heapResizes[i].stack)) {
          ++j;
        } else {
          break;
        }
      }
      var resizeFirst = heapResizes[i];
      var resizeLast = heapResizes[j - 1];
      var count = j - i;
      html += '<div style="background-color: ' + resizeFirst.color + '"><b>' + resizeFirst.begin + "-" + resizeLast.end + " (" + count + " times, " + emscriptenMemoryProfiler.formatBytes(resizeLast.end - resizeFirst.begin) + ")</b>:" + (resizeFirst.filteredStack || resizeFirst.stack) + "</div><br>";
      i = j - 1;
    }
    return html;
  },
  updateUi() {
    if (document.body.style.overflow != "") document.body.style.overflow = "";
    function colorBar(color) {
      return '<span style="padding:0px; border:solid 1px black; width:28px;height:14px; vertical-align:middle; display:inline-block; background-color:' + color + ';"></span>';
    }
    function nBits(n) {
      var i = 0;
      while (n >= 1) {
        ++i;
        n /= 2;
      }
      return i;
    }
    function toHex(i, width) {
      var str = i.toString(16);
      while (str.length < width) str = "0" + str;
      return "0x" + str;
    }
    var self = emscriptenMemoryProfiler;
    if (self.canvas.width != document.documentElement.clientWidth - 32) {
      self.canvas.width = document.documentElement.clientWidth - 32;
    }
    if (typeof runtimeInitialized != "undefined" && !runtimeInitialized) {
      return;
    }
    var stackBase = _emscripten_stack_get_base();
    var stackMax = _emscripten_stack_get_end();
    var stackCurrent = _emscripten_stack_get_current();
    var width = (nBits(GROWABLE_HEAP_I8().length) + 3) / 4;
    var html = "Total HEAP size: " + self.formatBytes(GROWABLE_HEAP_I8().length) + ".";
    html += "<br />" + colorBar("#202020") + "STATIC memory area size: " + self.formatBytes(stackMax - 1024);
    html += ". 1024: " + toHex(1024, width);
    html += "<br />" + colorBar("#FF8080") + "STACK memory area size: " + self.formatBytes(stackBase - stackMax);
    html += ". STACK_BASE: " + toHex(stackBase, width);
    html += ". STACKTOP: " + toHex(stackCurrent, width);
    html += ". STACK_MAX: " + toHex(stackMax, width) + ".";
    html += "<br />STACK memory area used now (should be zero): " + self.formatBytes(stackBase - stackCurrent) + "." + colorBar("#FFFF00") + " STACK watermark highest seen usage (approximate lower-bound!): " + self.formatBytes(stackBase - self.stackTopWatermark);
    var heap_base = Module["___heap_base"];
    var heap_end = _sbrk();
    html += "<br />DYNAMIC memory area size: " + self.formatBytes(heap_end - heap_base);
    html += ". start: " + toHex(heap_base, width);
    html += ". end: " + toHex(heap_end, width) + ".";
    html += "<br />" + colorBar("#6699CC") + colorBar("#003366") + colorBar("#0000FF") + "DYNAMIC memory area used: " + self.formatBytes(self.totalMemoryAllocated) + " (" + (self.totalMemoryAllocated * 100 / (GROWABLE_HEAP_I8().length - heap_base)).toFixed(2) + "% of all dynamic memory and unallocated heap)";
    html += "<br />Free memory: " + colorBar("#70FF70") + "DYNAMIC: " + self.formatBytes(heap_end - heap_base - self.totalMemoryAllocated) + ", " + colorBar("#FFFFFF") + "Unallocated HEAP: " + self.formatBytes(GROWABLE_HEAP_I8().length - heap_end) + " (" + ((GROWABLE_HEAP_I8().length - heap_base - self.totalMemoryAllocated) * 100 / (GROWABLE_HEAP_I8().length - heap_base)).toFixed(2) + "% of all dynamic memory and unallocated heap)";
    var preloadedMemoryUsed = 0;
    for (var i in self.sizeOfPreRunAllocatedPtr) preloadedMemoryUsed += self.sizeOfPreRunAllocatedPtr[i] | 0;
    html += "<br />" + colorBar("#FF9900") + colorBar("#FFDD33") + "Preloaded memory used, most likely memory reserved by files in the virtual filesystem : " + self.formatBytes(preloadedMemoryUsed);
    html += "<br />OpenAL audio data: " + self.formatBytes(self.countOpenALAudioDataSize()) + " (outside HEAP)";
    html += "<br /># of total malloc()s/free()s performed in app lifetime: " + self.totalTimesMallocCalled + "/" + self.totalTimesFreeCalled + " (currently alive pointers: " + (self.totalTimesMallocCalled - self.totalTimesFreeCalled) + ")";
    self.drawContext.fillStyle = "#FFFFFF";
    self.drawContext.fillRect(0, 0, self.canvas.width, self.canvas.height);
    self.drawContext.fillStyle = "#FF8080";
    self.fillLine(stackMax, stackBase);
    self.drawContext.fillStyle = "#FFFF00";
    self.fillLine(self.stackTopWatermark, stackBase);
    self.drawContext.fillStyle = "#FF0000";
    self.fillLine(stackCurrent, stackBase);
    self.drawContext.fillStyle = "#70FF70";
    self.fillLine(heap_base, heap_end);
    if (self.detailedHeapUsage) {
      self.printAllocsWithCyclingColors([ "#6699CC", "#003366", "#0000FF" ], self.sizeOfAllocatedPtr);
      self.printAllocsWithCyclingColors([ "#FF9900", "#FFDD33" ], self.sizeOfPreRunAllocatedPtr);
    } else {
      self.drawContext.fillStyle = "#0000FF";
      self.fillLine(heap_base, heap_base + self.totalMemoryAllocated);
    }
    if (document.getElementById("showHeapResizes").checked) {
      for (var i in self.resizeMemorySources) {
        var resize = self.resizeMemorySources[i];
        self.drawContext.fillStyle = resize.color;
        self.fillRect(resize.begin, resize.end, .5);
      }
      var uniqueSources = {};
      var filterWords = document.getElementById("sbrkFilter").value.split(",");
      for (var i in self.sbrkSources) {
        var sbrk = self.sbrkSources[i];
        var stack = sbrk.stack;
        for (var j in filterWords) {
          var s = filterWords[j].trim();
          if (s.length > 0) stack = self.filterCallstackAfterFunctionName(stack, s);
        }
        sbrk.filteredStack = stack;
        uniqueSources[stack] ||= self.hsvToRgb(Object.keys(uniqueSources).length * .618033988749895 % 1, .5, .95);
        self.drawContext.fillStyle = sbrk.color = uniqueSources[stack];
        self.fillRect(sbrk.begin, sbrk.end, .25);
      }
      function line(x0, y0, x1, y1) {
        self.drawContext.beginPath();
        self.drawContext.moveTo(x0, y0);
        self.drawContext.lineTo(x1, y1);
        self.drawContext.lineWidth = 2;
        self.drawContext.stroke();
      }
      if (self.sbrkSources.length > 0) line(0, .75 * self.canvas.height, self.canvas.width, .75 * self.canvas.height);
      if (self.resizeMemorySources.length > 0) line(0, .5 * self.canvas.height, self.canvas.width, .5 * self.canvas.height);
    }
    self.memoryprofiler_summary.innerHTML = html;
    var sort = document.getElementById("memoryProfilerSort");
    var sortOrder = sort.options[sort.selectedIndex].value;
    html = "";
    if (document.getElementById("showHeapResizes").checked) {
      html += '<div style="background-color: #c0c0c0"><h4>Heap resize locations:</h4>';
      html += self.printHeapResizeLog(self.resizeMemorySources);
      html += "</div>";
      html += '<div style="background-color: #c0c0ff"><h4>Memory sbrk() locations:</h4>';
      html += self.printHeapResizeLog(self.sbrkSources);
      html += "</div>";
    } else {
      if (Object.keys(self.allocationsAtLoc).length > 0) {
        var calls = [];
        for (var i in self.allocationsAtLoc) {
          if (self.allocationsAtLoc[i][0] >= self.trackedCallstackMinAllocCount || self.allocationsAtLoc[i][1] >= self.trackedCallstackMinSizeBytes) {
            calls.push(self.allocationsAtLoc[i]);
          }
        }
        if (calls.length > 0) {
          if (sortOrder != "fixed") {
            var sortIdx = (sortOrder == "count") ? 0 : 1;
            calls.sort((a, b) => b[sortIdx] - a[sortIdx]);
          }
          html += "<h4>Allocation sites with more than " + self.formatBytes(self.trackedCallstackMinSizeBytes) + " of accumulated allocations, or more than " + self.trackedCallstackMinAllocCount + " simultaneously outstanding allocations:</h4>";
          for (var i in calls) {
            html += "<b>" + self.formatBytes(calls[i][1]) + "/" + calls[i][0] + " allocs</b>: " + calls[i][2] + "<br />";
          }
        }
      }
    }
    self.memoryprofiler_ptrs.innerHTML = html;
  }
};

function memoryprofiler_add_hooks() {
  emscriptenMemoryProfiler.initialize();
}

if (typeof document != "undefined" && typeof window != "undefined" && typeof process == "undefined") {
  emscriptenMemoryProfiler.initialize();
}

globalThis.emscriptenMemoryProfiler = emscriptenMemoryProfiler;

var FS = {
  error() {
    abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
  },
  init() {
    FS.error();
  },
  createDataFile() {
    FS.error();
  },
  createPreloadedFile() {
    FS.error();
  },
  createLazyFile() {
    FS.error();
  },
  open() {
    FS.error();
  },
  mkdev() {
    FS.error();
  },
  registerDevice() {
    FS.error();
  },
  analyzePath() {
    FS.error();
  },
  ErrnoError() {
    FS.error();
  }
};

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

var dataURIPrefix = "data:application/octet-stream;base64,";

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = filename => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

function createExportWrapper(name, nargs) {
  return (...args) => {
    assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
    var f = wasmExports[name];
    assert(f, `exported native function \`${name}\` not found`);
    assert(args.length <= nargs, `native function \`${name}\` called with ${args.length} args but expects ${nargs}`);
    return f(...args);
  };
}

function findWasmBinary() {
  if (Module["locateFile"]) {
    var f = "extract-c.wasm";
    if (!isDataURI(f)) {
      return locateFile(f);
    }
    return f;
  }
  return new URL("extract-c.wasm", import.meta.url).href;
}

var wasmBinaryFile;

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
}

function getBinaryPromise(binaryFile) {
  if (!wasmBinary) {
    return new Promise((resolve, reject) => {
      readAsync(binaryFile, response => resolve(new Uint8Array(/** @type{!ArrayBuffer} */ (response))), error => {
        try {
          resolve(getBinarySync(binaryFile));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(receiver, reason => {
    err(`failed to asynchronously prepare wasm: ${reason}`);
    if (isFileURI(wasmBinaryFile)) {
      err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    }
    abort(reason);
  });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
  if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && typeof fetch == "function") {
    return fetch(binaryFile, {
      credentials: "same-origin"
    }).then(response => {
      /** @suppress {checkTypes} */ var result = WebAssembly.instantiateStreaming(response, imports);
      return result.then(callback, function(reason) {
        err(`wasm streaming compile failed: ${reason}`);
        err("falling back to ArrayBuffer instantiation");
        return instantiateArrayBuffer(binaryFile, imports, callback);
      });
    });
  }
  return instantiateArrayBuffer(binaryFile, imports, callback);
}

function getWasmImports() {
  assignWasmImports();
  return {
    "env": wasmImports,
    "wasi_snapshot_preview1": wasmImports
  };
}

function createWasm() {
  var info = getWasmImports();
  /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
    wasmExports = instance.exports;
    wasmExports = applySignatureConversions(wasmExports);
    registerTLSInit(wasmExports["_emscripten_tls_init"]);
    wasmTable = wasmExports["__indirect_function_table"];
    assert(wasmTable, "table not found in wasm exports");
    addOnInit(wasmExports["__wasm_call_ctors"]);
    wasmModule = module;
    removeRunDependency("wasm-instantiate");
    return wasmExports;
  }
  addRunDependency("wasm-instantiate");
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
    trueModule = null;
    receiveInstance(result["instance"], result["module"]);
  }
  if (Module["instantiateWasm"]) {
    try {
      return Module["instantiateWasm"](info, receiveInstance);
    } catch (e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
      readyPromiseReject(e);
    }
  }
  if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
  instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
  return {};
}

var tempDouble;

var tempI64;

function legacyModuleProp(prop, newName, incoming = true) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get() {
        let extra = incoming ? " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)" : "";
        abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);
      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
  }
}

function isExportedByForceFilesystem(name) {
  return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || name === "removeRunDependency";
}

function missingGlobal(sym, msg) {
  if (typeof globalThis != "undefined") {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get() {
        warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
        return undefined;
      }
    });
  }
}

missingGlobal("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");

missingGlobal("asm", "Please use wasmExports instead");

function missingLibrarySymbol(sym) {
  if (typeof globalThis != "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get() {
        var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
        var librarySymbol = sym;
        if (!librarySymbol.startsWith("_")) {
          librarySymbol = "$" + sym;
        }
        msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
        if (isExportedByForceFilesystem(sym)) {
          msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
        }
        warnOnce(msg);
        return undefined;
      }
    });
  }
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (ENVIRONMENT_IS_PTHREAD) {
    return;
  }
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get() {
        var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
        if (isExportedByForceFilesystem(sym)) {
          msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
        }
        abort(msg);
      }
    });
  }
}

function dbg(...args) {
  console.warn(...args);
}

var ASM_CONSTS = {
  286732: ($0, $1, $2) => {
    const event = new CustomEvent(UTF8ToString($0), {
      detail: {
        type: UTF8ToString($1),
        data: UTF8ToString($2)
      }
    });
    dispatchEvent(event);
  }
};

/** @constructor */ function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = `Program terminated with exit(${status})`;
  this.status = status;
}

var terminateWorker = worker => {
  worker.terminate();
  worker.onmessage = e => {
    var cmd = e["data"]["cmd"];
    err(`received "${cmd}" command from terminated worker: ${worker.workerID}`);
  };
};

var killThread = pthread_ptr => {
  assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! killThread() can only ever be called from main application thread!");
  assert(pthread_ptr, "Internal Error! Null pthread_ptr in killThread!");
  var worker = PThread.pthreads[pthread_ptr];
  delete PThread.pthreads[pthread_ptr];
  terminateWorker(worker);
  __emscripten_thread_free_data(pthread_ptr);
  PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
  worker.pthread_ptr = 0;
};

var cancelThread = pthread_ptr => {
  assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cancelThread() can only ever be called from main application thread!");
  assert(pthread_ptr, "Internal Error! Null pthread_ptr in cancelThread!");
  var worker = PThread.pthreads[pthread_ptr];
  worker.postMessage({
    "cmd": "cancel"
  });
};

var cleanupThread = pthread_ptr => {
  assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cleanupThread() can only ever be called from main application thread!");
  assert(pthread_ptr, "Internal Error! Null pthread_ptr in cleanupThread!");
  var worker = PThread.pthreads[pthread_ptr];
  assert(worker);
  PThread.returnWorkerToPool(worker);
};

var zeroMemory = (address, size) => {
  GROWABLE_HEAP_U8().fill(0, address, address + size);
  return address;
};

var spawnThread = threadParams => {
  assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! spawnThread() can only ever be called from main application thread!");
  assert(threadParams.pthread_ptr, "Internal error, no pthread ptr!");
  var worker = PThread.getNewWorker();
  if (!worker) {
    return 6;
  }
  assert(!worker.pthread_ptr, "Internal error!");
  PThread.runningWorkers.push(worker);
  PThread.pthreads[threadParams.pthread_ptr] = worker;
  worker.pthread_ptr = threadParams.pthread_ptr;
  var msg = {
    "cmd": "run",
    "start_routine": threadParams.startRoutine,
    "arg": threadParams.arg,
    "pthread_ptr": threadParams.pthread_ptr
  };
  worker.postMessage(msg, threadParams.transferList);
  return 0;
};

var runtimeKeepaliveCounter = 0;

var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

var stackSave = () => _emscripten_stack_get_current();

var stackRestore = val => __emscripten_stack_restore(val);

var stackAlloc = sz => __emscripten_stack_alloc(sz);

var convertI32PairToI53Checked = (lo, hi) => {
  assert(lo == (lo >>> 0) || lo == (lo | 0));
  assert(hi === (hi | 0));
  return ((hi + 2097152) >>> 0 < 4194305 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
};

/** @type{function(number, (number|boolean), ...number)} */ var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => {
  var serializedNumCallArgs = callArgs.length;
  var sp = stackSave();
  var args = stackAlloc(serializedNumCallArgs * 8);
  var b = ((args) >>> 3);
  for (var i = 0; i < callArgs.length; i++) {
    var arg = callArgs[i];
    GROWABLE_HEAP_F64()[b + i >>> 0] = arg;
  }
  var rtn = __emscripten_run_on_main_thread_js(funcIndex, emAsmAddr, serializedNumCallArgs, args, sync);
  stackRestore(sp);
  return rtn;
};

function _proc_exit(code) {
  if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 0, 1, code);
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    PThread.terminateAllThreads();
    Module["onExit"]?.(code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}

var handleException = e => {
  if (e instanceof ExitStatus || e == "unwind") {
    return EXITSTATUS;
  }
  checkStackCookie();
  if (e instanceof WebAssembly.RuntimeError) {
    if (_emscripten_stack_get_current() <= 0) {
      err("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)");
    }
  }
  quit_(1, e);
};

function exitOnMainThread(returnCode) {
  if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
  _exit(returnCode);
}

/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
  EXITSTATUS = status;
  checkUnflushedContent();
  if (ENVIRONMENT_IS_PTHREAD) {
    assert(!implicit);
    exitOnMainThread(status);
    throw "unwind";
  }
  if (keepRuntimeAlive() && !implicit) {
    var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
    readyPromiseReject(msg);
    err(msg);
  }
  _proc_exit(status);
};

var _exit = exitJS;

var ptrToString = ptr => {
  assert(typeof ptr === "number");
  return "0x" + ptr.toString(16).padStart(8, "0");
};

var PThread = {
  unusedWorkers: [],
  runningWorkers: [],
  tlsInitFunctions: [],
  pthreads: {},
  nextWorkerID: 1,
  debugInit() {
    function pthreadLogPrefix() {
      var t = 0;
      if (runtimeInitialized && typeof _pthread_self != "undefined") {
        t = _pthread_self();
      }
      return "w:" + workerID + ",t:" + ptrToString(t) + ": ";
    }
    var origDbg = dbg;
    dbg = (...args) => origDbg(pthreadLogPrefix() + args.join(" "));
  },
  init() {
    PThread.debugInit();
    if (ENVIRONMENT_IS_PTHREAD) {
      PThread.initWorker();
    } else {
      PThread.initMainThread();
    }
  },
  initMainThread() {
    var pthreadPoolSize = navigator.hardwareConcurrency;
    while (pthreadPoolSize--) {
      PThread.allocateUnusedWorker();
    }
    addOnPreRun(() => {
      addRunDependency("loading-workers");
      PThread.loadWasmModuleToAllWorkers(() => removeRunDependency("loading-workers"));
    });
  },
  initWorker() {
    noExitRuntime = false;
  },
  setExitStatus: status => EXITSTATUS = status,
  terminateAllThreads__deps: [ "$terminateWorker" ],
  terminateAllThreads: () => {
    assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! terminateAllThreads() can only ever be called from main application thread!");
    for (var worker of PThread.runningWorkers) {
      terminateWorker(worker);
    }
    for (var worker of PThread.unusedWorkers) {
      terminateWorker(worker);
    }
    PThread.unusedWorkers = [];
    PThread.runningWorkers = [];
    PThread.pthreads = [];
  },
  returnWorkerToPool: worker => {
    var pthread_ptr = worker.pthread_ptr;
    delete PThread.pthreads[pthread_ptr];
    PThread.unusedWorkers.push(worker);
    PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
    worker.pthread_ptr = 0;
    __emscripten_thread_free_data(pthread_ptr);
  },
  receiveObjectTransfer(data) {},
  threadInitTLS() {
    PThread.tlsInitFunctions.forEach(f => f());
  },
  loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
    worker.onmessage = e => {
      var d = e["data"];
      var cmd = d["cmd"];
      if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
        var targetWorker = PThread.pthreads[d["targetThread"]];
        if (targetWorker) {
          targetWorker.postMessage(d, d["transferList"]);
        } else {
          err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d["targetThread"]}, but that thread no longer exists!`);
        }
        return;
      }
      if (cmd === "checkMailbox") {
        checkMailbox();
      } else if (cmd === "spawnThread") {
        spawnThread(d);
      } else if (cmd === "cleanupThread") {
        cleanupThread(d["thread"]);
      } else if (cmd === "killThread") {
        killThread(d["thread"]);
      } else if (cmd === "cancelThread") {
        cancelThread(d["thread"]);
      } else if (cmd === "loaded") {
        worker.loaded = true;
        onFinishedLoading(worker);
      } else if (cmd === "alert") {
        alert(`Thread ${d["threadId"]}: ${d["text"]}`);
      } else if (d.target === "setimmediate") {
        worker.postMessage(d);
      } else if (cmd === "callHandler") {
        Module[d["handler"]](...d["args"]);
      } else if (cmd) {
        err(`worker sent an unknown command ${cmd}`);
      }
    };
    worker.onerror = e => {
      var message = "worker sent an error!";
      if (worker.pthread_ptr) {
        message = `Pthread ${ptrToString(worker.pthread_ptr)} sent an error!`;
      }
      err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
      throw e;
    };
    assert(wasmMemory instanceof WebAssembly.Memory, "WebAssembly memory should have been loaded by now!");
    assert(wasmModule instanceof WebAssembly.Module, "WebAssembly Module should have been loaded by now!");
    var handlers = [];
    var knownHandlers = [ "onExit", "onAbort", "print", "printErr" ];
    for (var handler of knownHandlers) {
      if (Module.propertyIsEnumerable(handler)) {
        handlers.push(handler);
      }
    }
    worker.workerID = PThread.nextWorkerID++;
    worker.postMessage({
      "cmd": "load",
      "handlers": handlers,
      "wasmMemory": wasmMemory,
      "wasmModule": wasmModule,
      "workerID": worker.workerID
    });
  }),
  loadWasmModuleToAllWorkers(onMaybeReady) {
    if (ENVIRONMENT_IS_PTHREAD) {
      return onMaybeReady();
    }
    let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
    pthreadPoolReady.then(onMaybeReady);
  },
  allocateUnusedWorker() {
    var worker;
    var workerOptions = {
      "type": "module",
      "name": "em-pthread"
    };
    worker = new Worker(new URL(import.meta.url), workerOptions);
    PThread.unusedWorkers.push(worker);
  },
  getNewWorker() {
    if (PThread.unusedWorkers.length == 0) {
      err("Tried to spawn a new thread, but the thread pool is exhausted.\n" + "This might result in a deadlock unless some threads eventually exit or the code explicitly breaks out to the event loop.\n" + "If you want to increase the pool size, use setting `-sPTHREAD_POOL_SIZE=...`." + "\nIf you want to throw an explicit error instead of the risk of deadlocking in those cases, use setting `-sPTHREAD_POOL_SIZE_STRICT=2`.");
      PThread.allocateUnusedWorker();
      PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
    }
    return PThread.unusedWorkers.pop();
  }
};

var callRuntimeCallbacks = callbacks => {
  while (callbacks.length > 0) {
    callbacks.shift()(Module);
  }
};

var establishStackSpace = () => {
  var pthread_ptr = _pthread_self();
  var stackHigh = GROWABLE_HEAP_U32()[(((pthread_ptr) + (52)) >>> 2) >>> 0];
  var stackSize = GROWABLE_HEAP_U32()[(((pthread_ptr) + (56)) >>> 2) >>> 0];
  var stackLow = stackHigh - stackSize;
  assert(stackHigh != 0);
  assert(stackLow != 0);
  assert(stackHigh > stackLow, "stackHigh must be higher then stackLow");
  _emscripten_stack_set_limits(stackHigh, stackLow);
  stackRestore(stackHigh);
  writeStackCookie();
};

/**
     * @param {number} ptr
     * @param {string} type
     */ function getValue(ptr, type = "i8") {
  if (type.endsWith("*")) type = "*";
  switch (type) {
   case "i1":
    return GROWABLE_HEAP_I8()[ptr >>> 0];

   case "i8":
    return GROWABLE_HEAP_I8()[ptr >>> 0];

   case "i16":
    return GROWABLE_HEAP_I16()[((ptr) >>> 1) >>> 0];

   case "i32":
    return GROWABLE_HEAP_I32()[((ptr) >>> 2) >>> 0];

   case "i64":
    abort("to do getValue(i64) use WASM_BIGINT");

   case "float":
    return GROWABLE_HEAP_F32()[((ptr) >>> 2) >>> 0];

   case "double":
    return GROWABLE_HEAP_F64()[((ptr) >>> 3) >>> 0];

   case "*":
    return GROWABLE_HEAP_U32()[((ptr) >>> 2) >>> 0];

   default:
    abort(`invalid type for getValue: ${type}`);
  }
}

var wasmTableMirror = [];

/** @type {WebAssembly.Table} */ var wasmTable;

var getWasmTableEntry = funcPtr => {
  var func = wasmTableMirror[funcPtr];
  if (!func) {
    if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
  }
  assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
  return func;
};

var invokeEntryPoint = (ptr, arg) => {
  runtimeKeepaliveCounter = 0;
  var result = getWasmTableEntry(ptr)(arg);
  checkStackCookie();
  function finish(result) {
    if (keepRuntimeAlive()) {
      PThread.setExitStatus(result);
    } else {
      __emscripten_thread_exit(result);
    }
  }
  finish(result);
};

var noExitRuntime = Module["noExitRuntime"] || true;

var registerTLSInit = tlsInitFunc => PThread.tlsInitFunctions.push(tlsInitFunc);

/**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */ function setValue(ptr, value, type = "i8") {
  if (type.endsWith("*")) type = "*";
  switch (type) {
   case "i1":
    GROWABLE_HEAP_I8()[ptr >>> 0] = value;
    break;

   case "i8":
    GROWABLE_HEAP_I8()[ptr >>> 0] = value;
    break;

   case "i16":
    GROWABLE_HEAP_I16()[((ptr) >>> 1) >>> 0] = value;
    break;

   case "i32":
    GROWABLE_HEAP_I32()[((ptr) >>> 2) >>> 0] = value;
    break;

   case "i64":
    abort("to do setValue(i64) use WASM_BIGINT");

   case "float":
    GROWABLE_HEAP_F32()[((ptr) >>> 2) >>> 0] = value;
    break;

   case "double":
    GROWABLE_HEAP_F64()[((ptr) >>> 3) >>> 0] = value;
    break;

   case "*":
    GROWABLE_HEAP_U32()[((ptr) >>> 2) >>> 0] = value;
    break;

   default:
    abort(`invalid type for setValue: ${type}`);
  }
}

var warnOnce = text => {
  warnOnce.shown ||= {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
};

var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

/**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
  idx >>>= 0;
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr));
  }
  var str = "";
  while (idx < endPtr) {
    var u0 = heapOrArray[idx++];
    if (!(u0 & 128)) {
      str += String.fromCharCode(u0);
      continue;
    }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 224) == 192) {
      str += String.fromCharCode(((u0 & 31) << 6) | u1);
      continue;
    }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 240) == 224) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte " + ptrToString(u0) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }
    if (u0 < 65536) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 65536;
      str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
    }
  }
  return str;
};

/**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => {
  assert(typeof ptr == "number", `UTF8ToString expects a number (got ${typeof ptr})`);
  ptr >>>= 0;
  return ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : "";
};

function ___assert_fail(condition, filename, line, func) {
  condition >>>= 0;
  filename >>>= 0;
  func >>>= 0;
  abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
}

class ExceptionInfo {
  constructor(excPtr) {
    this.excPtr = excPtr;
    this.ptr = excPtr - 24;
  }
  set_type(type) {
    GROWABLE_HEAP_U32()[(((this.ptr) + (4)) >>> 2) >>> 0] = type;
  }
  get_type() {
    return GROWABLE_HEAP_U32()[(((this.ptr) + (4)) >>> 2) >>> 0];
  }
  set_destructor(destructor) {
    GROWABLE_HEAP_U32()[(((this.ptr) + (8)) >>> 2) >>> 0] = destructor;
  }
  get_destructor() {
    return GROWABLE_HEAP_U32()[(((this.ptr) + (8)) >>> 2) >>> 0];
  }
  set_caught(caught) {
    caught = caught ? 1 : 0;
    GROWABLE_HEAP_I8()[(this.ptr) + (12) >>> 0] = caught;
  }
  get_caught() {
    return GROWABLE_HEAP_I8()[(this.ptr) + (12) >>> 0] != 0;
  }
  set_rethrown(rethrown) {
    rethrown = rethrown ? 1 : 0;
    GROWABLE_HEAP_I8()[(this.ptr) + (13) >>> 0] = rethrown;
  }
  get_rethrown() {
    return GROWABLE_HEAP_I8()[(this.ptr) + (13) >>> 0] != 0;
  }
  init(type, destructor) {
    this.set_adjusted_ptr(0);
    this.set_type(type);
    this.set_destructor(destructor);
  }
  set_adjusted_ptr(adjustedPtr) {
    GROWABLE_HEAP_U32()[(((this.ptr) + (16)) >>> 2) >>> 0] = adjustedPtr;
  }
  get_adjusted_ptr() {
    return GROWABLE_HEAP_U32()[(((this.ptr) + (16)) >>> 2) >>> 0];
  }
  get_exception_ptr() {
    var isPointer = ___cxa_is_pointer_type(this.get_type());
    if (isPointer) {
      return GROWABLE_HEAP_U32()[((this.excPtr) >>> 2) >>> 0];
    }
    var adjusted = this.get_adjusted_ptr();
    if (adjusted !== 0) return adjusted;
    return this.excPtr;
  }
}

var exceptionLast = 0;

var uncaughtExceptionCount = 0;

function ___cxa_throw(ptr, type, destructor) {
  ptr >>>= 0;
  type >>>= 0;
  destructor >>>= 0;
  var info = new ExceptionInfo(ptr);
  info.init(type, destructor);
  exceptionLast = ptr;
  uncaughtExceptionCount++;
  assert(false, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
}

function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
  if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
  return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg);
}

function ___pthread_create_js(pthread_ptr, attr, startRoutine, arg) {
  pthread_ptr >>>= 0;
  attr >>>= 0;
  startRoutine >>>= 0;
  arg >>>= 0;
  if (typeof SharedArrayBuffer == "undefined") {
    err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
    return 6;
  }
  var transferList = [];
  var error = 0;
  if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
    return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
  }
  if (error) return error;
  var threadParams = {
    startRoutine: startRoutine,
    pthread_ptr: pthread_ptr,
    arg: arg,
    transferList: transferList
  };
  if (ENVIRONMENT_IS_PTHREAD) {
    threadParams.cmd = "spawnThread";
    postMessage(threadParams, transferList);
    return 0;
  }
  return spawnThread(threadParams);
}

function ___pthread_kill_js(thread, signal) {
  thread >>>= 0;
  if (signal === 33) {
    if (!ENVIRONMENT_IS_PTHREAD) cancelThread(thread); else postMessage({
      "cmd": "cancelThread",
      "thread": thread
    });
  } else {
    if (!ENVIRONMENT_IS_PTHREAD) killThread(thread); else postMessage({
      "cmd": "killThread",
      "thread": thread
    });
  }
  return 0;
}

var __abort_js = () => {
  abort("native code called abort()");
};

function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {
  primitiveType >>>= 0;
  name >>>= 0;
  size >>>= 0;
}

var embind_init_charCodes = () => {
  var codes = new Array(256);
  for (var i = 0; i < 256; ++i) {
    codes[i] = String.fromCharCode(i);
  }
  embind_charCodes = codes;
};

var embind_charCodes;

var readLatin1String = ptr => {
  var ret = "";
  var c = ptr;
  while (GROWABLE_HEAP_U8()[c >>> 0]) {
    ret += embind_charCodes[GROWABLE_HEAP_U8()[c++ >>> 0]];
  }
  return ret;
};

var awaitingDependencies = {};

var registeredTypes = {};

var typeDependencies = {};

var BindingError;

var throwBindingError = message => {
  throw new BindingError(message);
};

var InternalError;

var throwInternalError = message => {
  throw new InternalError(message);
};

var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
  myTypes.forEach(function(type) {
    typeDependencies[type] = dependentTypes;
  });
  function onComplete(typeConverters) {
    var myTypeConverters = getTypeConverters(typeConverters);
    if (myTypeConverters.length !== myTypes.length) {
      throwInternalError("Mismatched type converter count");
    }
    for (var i = 0; i < myTypes.length; ++i) {
      registerType(myTypes[i], myTypeConverters[i]);
    }
  }
  var typeConverters = new Array(dependentTypes.length);
  var unregisteredTypes = [];
  var registered = 0;
  dependentTypes.forEach((dt, i) => {
    if (registeredTypes.hasOwnProperty(dt)) {
      typeConverters[i] = registeredTypes[dt];
    } else {
      unregisteredTypes.push(dt);
      if (!awaitingDependencies.hasOwnProperty(dt)) {
        awaitingDependencies[dt] = [];
      }
      awaitingDependencies[dt].push(() => {
        typeConverters[i] = registeredTypes[dt];
        ++registered;
        if (registered === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      });
    }
  });
  if (0 === unregisteredTypes.length) {
    onComplete(typeConverters);
  }
};

/** @param {Object=} options */ function sharedRegisterType(rawType, registeredInstance, options = {}) {
  var name = registeredInstance.name;
  if (!rawType) {
    throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
  }
  if (registeredTypes.hasOwnProperty(rawType)) {
    if (options.ignoreDuplicateRegistrations) {
      return;
    } else {
      throwBindingError(`Cannot register type '${name}' twice`);
    }
  }
  registeredTypes[rawType] = registeredInstance;
  delete typeDependencies[rawType];
  if (awaitingDependencies.hasOwnProperty(rawType)) {
    var callbacks = awaitingDependencies[rawType];
    delete awaitingDependencies[rawType];
    callbacks.forEach(cb => cb());
  }
}

/** @param {Object=} options */ function registerType(rawType, registeredInstance, options = {}) {
  if (!("argPackAdvance" in registeredInstance)) {
    throw new TypeError("registerType registeredInstance requires argPackAdvance");
  }
  return sharedRegisterType(rawType, registeredInstance, options);
}

var GenericWireTypeSize = 8;

/** @suppress {globalThis} */ function __embind_register_bool(rawType, name, trueValue, falseValue) {
  rawType >>>= 0;
  name >>>= 0;
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    "fromWireType": function(wt) {
      return !!wt;
    },
    "toWireType": function(destructors, o) {
      return o ? trueValue : falseValue;
    },
    "argPackAdvance": GenericWireTypeSize,
    "readValueFromPointer": function(pointer) {
      return this["fromWireType"](GROWABLE_HEAP_U8()[pointer >>> 0]);
    },
    destructorFunction: null
  });
}

var emval_freelist = [];

var emval_handles = [];

function __emval_decref(handle) {
  handle >>>= 0;
  if (handle > 9 && 0 === --emval_handles[handle + 1]) {
    assert(emval_handles[handle] !== undefined, `Decref for unallocated handle.`);
    emval_handles[handle] = undefined;
    emval_freelist.push(handle);
  }
}

var count_emval_handles = () => emval_handles.length / 2 - 5 - emval_freelist.length;

var init_emval = () => {
  emval_handles.push(0, 1, undefined, 1, null, 1, true, 1, false, 1);
  assert(emval_handles.length === 5 * 2);
  Module["count_emval_handles"] = count_emval_handles;
};

var Emval = {
  toValue: handle => {
    if (!handle) {
      throwBindingError("Cannot use deleted val. handle = " + handle);
    }
    assert(handle === 2 || emval_handles[handle] !== undefined && handle % 2 === 0, `invalid handle: ${handle}`);
    return emval_handles[handle];
  },
  toHandle: value => {
    switch (value) {
     case undefined:
      return 2;

     case null:
      return 4;

     case true:
      return 6;

     case false:
      return 8;

     default:
      {
        const handle = emval_freelist.pop() || emval_handles.length;
        emval_handles[handle] = value;
        emval_handles[handle + 1] = 1;
        return handle;
      }
    }
  }
};

/** @suppress {globalThis} */ function readPointer(pointer) {
  return this["fromWireType"](GROWABLE_HEAP_U32()[((pointer) >>> 2) >>> 0]);
}

var EmValType = {
  name: "emscripten::val",
  "fromWireType": handle => {
    var rv = Emval.toValue(handle);
    __emval_decref(handle);
    return rv;
  },
  "toWireType": (destructors, value) => Emval.toHandle(value),
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": readPointer,
  destructorFunction: null
};

function __embind_register_emval(rawType) {
  rawType >>>= 0;
  return registerType(rawType, EmValType);
}

var embindRepr = v => {
  if (v === null) {
    return "null";
  }
  var t = typeof v;
  if (t === "object" || t === "array" || t === "function") {
    return v.toString();
  } else {
    return "" + v;
  }
};

var floatReadValueFromPointer = (name, width) => {
  switch (width) {
   case 4:
    return function(pointer) {
      return this["fromWireType"](GROWABLE_HEAP_F32()[((pointer) >>> 2) >>> 0]);
    };

   case 8:
    return function(pointer) {
      return this["fromWireType"](GROWABLE_HEAP_F64()[((pointer) >>> 3) >>> 0]);
    };

   default:
    throw new TypeError(`invalid float width (${width}): ${name}`);
  }
};

var __embind_register_float = function(rawType, name, size) {
  rawType >>>= 0;
  name >>>= 0;
  size >>>= 0;
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    "fromWireType": value => value,
    "toWireType": (destructors, value) => {
      if (typeof value != "number" && typeof value != "boolean") {
        throw new TypeError(`Cannot convert ${embindRepr(value)} to ${this.name}`);
      }
      return value;
    },
    "argPackAdvance": GenericWireTypeSize,
    "readValueFromPointer": floatReadValueFromPointer(name, size),
    destructorFunction: null
  });
};

var createNamedFunction = (name, body) => Object.defineProperty(body, "name", {
  value: name
});

var runDestructors = destructors => {
  while (destructors.length) {
    var ptr = destructors.pop();
    var del = destructors.pop();
    del(ptr);
  }
};

function usesDestructorStack(argTypes) {
  for (var i = 1; i < argTypes.length; ++i) {
    if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
      return true;
    }
  }
  return false;
}

function newFunc(constructor, argumentList) {
  if (!(constructor instanceof Function)) {
    throw new TypeError(`new_ called with constructor type ${typeof (constructor)} which is not a function`);
  }
  /*
       * Previously, the following line was just:
       *   function dummy() {};
       * Unfortunately, Chrome was preserving 'dummy' as the object's name, even
       * though at creation, the 'dummy' has the correct constructor name.  Thus,
       * objects created with IMVU.new would show up in the debugger as 'dummy',
       * which isn't very helpful.  Using IMVU.createNamedFunction addresses the
       * issue.  Doubly-unfortunately, there's no way to write a test for this
       * behavior.  -NRD 2013.02.22
       */ var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {});
  dummy.prototype = constructor.prototype;
  var obj = new dummy;
  var r = constructor.apply(obj, argumentList);
  return (r instanceof Object) ? r : obj;
}

function createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync) {
  var needsDestructorStack = usesDestructorStack(argTypes);
  var argCount = argTypes.length;
  var argsList = "";
  var argsListWired = "";
  for (var i = 0; i < argCount - 2; ++i) {
    argsList += (i !== 0 ? ", " : "") + "arg" + i;
    argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
  }
  var invokerFnBody = `\n        return function (${argsList}) {\n        if (arguments.length !== ${argCount - 2}) {\n          throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ${argCount - 2}');\n        }`;
  invokerFnBody += `Module.emscripten_trace_enter_context('embind::' + humanName );\n`;
  if (needsDestructorStack) {
    invokerFnBody += "var destructors = [];\n";
  }
  var dtorStack = needsDestructorStack ? "destructors" : "null";
  var args1 = [ "humanName", "throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam" ];
  args1.push("Module");
  if (isClassMethodFunc) {
    invokerFnBody += "var thisWired = classParam['toWireType'](" + dtorStack + ", this);\n";
  }
  for (var i = 0; i < argCount - 2; ++i) {
    invokerFnBody += "var arg" + i + "Wired = argType" + i + "['toWireType'](" + dtorStack + ", arg" + i + ");\n";
    args1.push("argType" + i);
  }
  if (isClassMethodFunc) {
    argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
  }
  invokerFnBody += (returns || isAsync ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
  var returnVal = returns ? "rv" : "";
  if (needsDestructorStack) {
    invokerFnBody += "runDestructors(destructors);\n";
  } else {
    for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
      var paramName = (i === 1 ? "thisWired" : ("arg" + (i - 2) + "Wired"));
      if (argTypes[i].destructorFunction !== null) {
        invokerFnBody += `${paramName}_dtor(${paramName});\n`;
        args1.push(`${paramName}_dtor`);
      }
    }
  }
  if (returns) {
    invokerFnBody += "var ret = retType['fromWireType'](rv);\n" + "Module.emscripten_trace_exit_context();\n" + "return ret;\n";
  } else {
    invokerFnBody += "Module.emscripten_trace_exit_context();\n";
  }
  invokerFnBody += "}\n";
  invokerFnBody = `if (arguments.length !== ${args1.length}){ throw new Error(humanName + "Expected ${args1.length} closure arguments " + arguments.length + " given."); }\n${invokerFnBody}`;
  return [ args1, invokerFnBody ];
}

function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, /** boolean= */ isAsync) {
  var argCount = argTypes.length;
  if (argCount < 2) {
    throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  assert(!isAsync, "Async bindings are only supported with JSPI.");
  var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
  var needsDestructorStack = usesDestructorStack(argTypes);
  var returns = (argTypes[0].name !== "void");
  var closureArgs = [ humanName, throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1] ];
  closureArgs.push(Module);
  for (var i = 0; i < argCount - 2; ++i) {
    closureArgs.push(argTypes[i + 2]);
  }
  if (!needsDestructorStack) {
    for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
      if (argTypes[i].destructorFunction !== null) {
        closureArgs.push(argTypes[i].destructorFunction);
      }
    }
  }
  let [args, invokerFnBody] = createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync);
  args.push(invokerFnBody);
  var invokerFn = newFunc(Function, args)(...closureArgs);
  return createNamedFunction(humanName, invokerFn);
}

var ensureOverloadTable = (proto, methodName, humanName) => {
  if (undefined === proto[methodName].overloadTable) {
    var prevFunc = proto[methodName];
    proto[methodName] = function(...args) {
      if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
        throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);
      }
      return proto[methodName].overloadTable[args.length].apply(this, args);
    };
    proto[methodName].overloadTable = [];
    proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
  }
};

/** @param {number=} numArguments */ var exposePublicSymbol = (name, value, numArguments) => {
  if (Module.hasOwnProperty(name)) {
    if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
      throwBindingError(`Cannot register public name '${name}' twice`);
    }
    ensureOverloadTable(Module, name, name);
    if (Module.hasOwnProperty(numArguments)) {
      throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
    }
    Module[name].overloadTable[numArguments] = value;
  } else {
    Module[name] = value;
    if (undefined !== numArguments) {
      Module[name].numArguments = numArguments;
    }
  }
};

var heap32VectorToArray = (count, firstElement) => {
  var array = [];
  for (var i = 0; i < count; i++) {
    array.push(GROWABLE_HEAP_U32()[(((firstElement) + (i * 4)) >>> 2) >>> 0]);
  }
  return array;
};

/** @param {number=} numArguments */ var replacePublicSymbol = (name, value, numArguments) => {
  if (!Module.hasOwnProperty(name)) {
    throwInternalError("Replacing nonexistent public symbol");
  }
  if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
    Module[name].overloadTable[numArguments] = value;
  } else {
    Module[name] = value;
    Module[name].argCount = numArguments;
  }
};

var dynCallLegacy = (sig, ptr, args) => {
  sig = sig.replace(/p/g, "i");
  assert(("dynCall_" + sig) in Module, `bad function pointer type - dynCall function not found for sig '${sig}'`);
  if (args?.length) {
    assert(args.length === sig.substring(1).replace(/j/g, "--").length);
  } else {
    assert(sig.length == 1);
  }
  var f = Module["dynCall_" + sig];
  return f(ptr, ...args);
};

var dynCall = (sig, ptr, args = []) => {
  if (sig.includes("j")) {
    return dynCallLegacy(sig, ptr, args);
  }
  assert(getWasmTableEntry(ptr), `missing table entry in dynCall: ${ptr}`);
  var rtn = getWasmTableEntry(ptr)(...args);
  return sig[0] == "p" ? rtn >>> 0 : rtn;
};

var getDynCaller = (sig, ptr) => {
  assert(sig.includes("j") || sig.includes("p"), "getDynCaller should only be called with i64 sigs");
  return (...args) => dynCall(sig, ptr, args);
};

var embind__requireFunction = (signature, rawFunction) => {
  signature = readLatin1String(signature);
  function makeDynCaller() {
    if (signature.includes("j")) {
      return getDynCaller(signature, rawFunction);
    }
    if (signature.includes("p")) {
      return getDynCaller(signature, rawFunction);
    }
    return getWasmTableEntry(rawFunction);
  }
  var fp = makeDynCaller();
  if (typeof fp != "function") {
    throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
  }
  return fp;
};

var extendError = (baseErrorType, errorName) => {
  var errorClass = createNamedFunction(errorName, function(message) {
    this.name = errorName;
    this.message = message;
    var stack = (new Error(message)).stack;
    if (stack !== undefined) {
      this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
    }
  });
  errorClass.prototype = Object.create(baseErrorType.prototype);
  errorClass.prototype.constructor = errorClass;
  errorClass.prototype.toString = function() {
    if (this.message === undefined) {
      return this.name;
    } else {
      return `${this.name}: ${this.message}`;
    }
  };
  return errorClass;
};

var UnboundTypeError;

var getTypeName = type => {
  var ptr = ___getTypeName(type);
  var rv = readLatin1String(ptr);
  _free(ptr);
  return rv;
};

var throwUnboundTypeError = (message, types) => {
  var unboundTypes = [];
  var seen = {};
  function visit(type) {
    if (seen[type]) {
      return;
    }
    if (registeredTypes[type]) {
      return;
    }
    if (typeDependencies[type]) {
      typeDependencies[type].forEach(visit);
      return;
    }
    unboundTypes.push(type);
    seen[type] = true;
  }
  types.forEach(visit);
  throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([ ", " ]));
};

var getFunctionName = signature => {
  signature = signature.trim();
  const argsIndex = signature.indexOf("(");
  if (argsIndex !== -1) {
    assert(signature[signature.length - 1] == ")", "Parentheses for argument names should match.");
    return signature.substr(0, argsIndex);
  } else {
    return signature;
  }
};

function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn, isAsync) {
  name >>>= 0;
  rawArgTypesAddr >>>= 0;
  signature >>>= 0;
  rawInvoker >>>= 0;
  fn >>>= 0;
  var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
  name = readLatin1String(name);
  name = getFunctionName(name);
  rawInvoker = embind__requireFunction(signature, rawInvoker);
  exposePublicSymbol(name, function() {
    throwUnboundTypeError(`Cannot call ${name} due to unbound types`, argTypes);
  }, argCount - 1);
  whenDependentTypesAreResolved([], argTypes, argTypes => {
    var invokerArgsArray = [ argTypes[0], /* return value */ null ].concat(/* no class 'this'*/ argTypes.slice(1));
    /* actual params */ replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, /* no class 'this'*/ rawInvoker, fn, isAsync), argCount - 1);
    return [];
  });
}

var integerReadValueFromPointer = (name, width, signed) => {
  switch (width) {
   case 1:
    return signed ? pointer => GROWABLE_HEAP_I8()[pointer >>> 0] : pointer => GROWABLE_HEAP_U8()[pointer >>> 0];

   case 2:
    return signed ? pointer => GROWABLE_HEAP_I16()[((pointer) >>> 1) >>> 0] : pointer => GROWABLE_HEAP_U16()[((pointer) >>> 1) >>> 0];

   case 4:
    return signed ? pointer => GROWABLE_HEAP_I32()[((pointer) >>> 2) >>> 0] : pointer => GROWABLE_HEAP_U32()[((pointer) >>> 2) >>> 0];

   default:
    throw new TypeError(`invalid integer width (${width}): ${name}`);
  }
};

/** @suppress {globalThis} */ function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
  primitiveType >>>= 0;
  name >>>= 0;
  size >>>= 0;
  name = readLatin1String(name);
  if (maxRange === -1) {
    maxRange = 4294967295;
  }
  var fromWireType = value => value;
  if (minRange === 0) {
    var bitshift = 32 - 8 * size;
    fromWireType = value => (value << bitshift) >>> bitshift;
  }
  var isUnsignedType = (name.includes("unsigned"));
  var checkAssertions = (value, toTypeName) => {
    if (typeof value != "number" && typeof value != "boolean") {
      throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${toTypeName}`);
    }
    if (value < minRange || value > maxRange) {
      throw new TypeError(`Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${name}", which is outside the valid range [${minRange}, ${maxRange}]!`);
    }
  };
  var toWireType;
  if (isUnsignedType) {
    toWireType = function(destructors, value) {
      checkAssertions(value, this.name);
      return value >>> 0;
    };
  } else {
    toWireType = function(destructors, value) {
      checkAssertions(value, this.name);
      return value;
    };
  }
  registerType(primitiveType, {
    name: name,
    "fromWireType": fromWireType,
    "toWireType": toWireType,
    "argPackAdvance": GenericWireTypeSize,
    "readValueFromPointer": integerReadValueFromPointer(name, size, minRange !== 0),
    destructorFunction: null
  });
}

function __embind_register_memory_view(rawType, dataTypeIndex, name) {
  rawType >>>= 0;
  name >>>= 0;
  var typeMapping = [ Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array ];
  var TA = typeMapping[dataTypeIndex];
  function decodeMemoryView(handle) {
    var size = GROWABLE_HEAP_U32()[((handle) >>> 2) >>> 0];
    var data = GROWABLE_HEAP_U32()[(((handle) + (4)) >>> 2) >>> 0];
    return new TA(GROWABLE_HEAP_I8().buffer, data, size);
  }
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    "fromWireType": decodeMemoryView,
    "argPackAdvance": GenericWireTypeSize,
    "readValueFromPointer": decodeMemoryView
  }, {
    ignoreDuplicateRegistrations: true
  });
}

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
  outIdx >>>= 0;
  assert(typeof str === "string", `stringToUTF8Array expects a string (got ${typeof str})`);
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i);
      u = 65536 + ((u & 1023) << 10) | (u1 & 1023);
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++ >>> 0] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++ >>> 0] = 192 | (u >> 6);
      heap[outIdx++ >>> 0] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++ >>> 0] = 224 | (u >> 12);
      heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
      heap[outIdx++ >>> 0] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u > 1114111) warnOnce("Invalid Unicode code point " + ptrToString(u) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
      heap[outIdx++ >>> 0] = 240 | (u >> 18);
      heap[outIdx++ >>> 0] = 128 | ((u >> 12) & 63);
      heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
      heap[outIdx++ >>> 0] = 128 | (u & 63);
    }
  }
  heap[outIdx >>> 0] = 0;
  return outIdx - startIdx;
};

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
  assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);
};

var lengthBytesUTF8 = str => {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var c = str.charCodeAt(i);
    if (c <= 127) {
      len++;
    } else if (c <= 2047) {
      len += 2;
    } else if (c >= 55296 && c <= 57343) {
      len += 4;
      ++i;
    } else {
      len += 3;
    }
  }
  return len;
};

function __embind_register_std_string(rawType, name) {
  rawType >>>= 0;
  name >>>= 0;
  name = readLatin1String(name);
  var stdStringIsUTF8 = (name === "std::string");
  registerType(rawType, {
    name: name,
    "fromWireType"(value) {
      var length = GROWABLE_HEAP_U32()[((value) >>> 2) >>> 0];
      var payload = value + 4;
      var str;
      if (stdStringIsUTF8) {
        var decodeStartPtr = payload;
        for (var i = 0; i <= length; ++i) {
          var currentBytePtr = payload + i;
          if (i == length || GROWABLE_HEAP_U8()[currentBytePtr >>> 0] == 0) {
            var maxRead = currentBytePtr - decodeStartPtr;
            var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
            if (str === undefined) {
              str = stringSegment;
            } else {
              str += String.fromCharCode(0);
              str += stringSegment;
            }
            decodeStartPtr = currentBytePtr + 1;
          }
        }
      } else {
        var a = new Array(length);
        for (var i = 0; i < length; ++i) {
          a[i] = String.fromCharCode(GROWABLE_HEAP_U8()[payload + i >>> 0]);
        }
        str = a.join("");
      }
      _free(value);
      return str;
    },
    "toWireType"(destructors, value) {
      if (value instanceof ArrayBuffer) {
        value = new Uint8Array(value);
      }
      var length;
      var valueIsOfTypeString = (typeof value == "string");
      if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
        throwBindingError("Cannot pass non-string to std::string");
      }
      if (stdStringIsUTF8 && valueIsOfTypeString) {
        length = lengthBytesUTF8(value);
      } else {
        length = value.length;
      }
      var base = _malloc(4 + length + 1);
      var ptr = base + 4;
      GROWABLE_HEAP_U32()[((base) >>> 2) >>> 0] = length;
      if (stdStringIsUTF8 && valueIsOfTypeString) {
        stringToUTF8(value, ptr, length + 1);
      } else {
        if (valueIsOfTypeString) {
          for (var i = 0; i < length; ++i) {
            var charCode = value.charCodeAt(i);
            if (charCode > 255) {
              _free(ptr);
              throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
            }
            GROWABLE_HEAP_U8()[ptr + i >>> 0] = charCode;
          }
        } else {
          for (var i = 0; i < length; ++i) {
            GROWABLE_HEAP_U8()[ptr + i >>> 0] = value[i];
          }
        }
      }
      if (destructors !== null) {
        destructors.push(_free, base);
      }
      return base;
    },
    "argPackAdvance": GenericWireTypeSize,
    "readValueFromPointer": readPointer,
    destructorFunction(ptr) {
      _free(ptr);
    }
  });
}

var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;

var UTF16ToString = (ptr, maxBytesToRead) => {
  assert(ptr % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
  var endPtr = ptr;
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  while (!(idx >= maxIdx) && GROWABLE_HEAP_U16()[idx >>> 0]) ++idx;
  endPtr = idx << 1;
  if (endPtr - ptr > 32 && UTF16Decoder) return UTF16Decoder.decode(GROWABLE_HEAP_U8().slice(ptr, endPtr));
  var str = "";
  for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
    var codeUnit = GROWABLE_HEAP_I16()[(((ptr) + (i * 2)) >>> 1) >>> 0];
    if (codeUnit == 0) break;
    str += String.fromCharCode(codeUnit);
  }
  return str;
};

var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
  assert(outPtr % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
  assert(typeof maxBytesToWrite == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  maxBytesToWrite ??= 2147483647;
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2;
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length * 2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    var codeUnit = str.charCodeAt(i);
    GROWABLE_HEAP_I16()[((outPtr) >>> 1) >>> 0] = codeUnit;
    outPtr += 2;
  }
  GROWABLE_HEAP_I16()[((outPtr) >>> 1) >>> 0] = 0;
  return outPtr - startPtr;
};

var lengthBytesUTF16 = str => str.length * 2;

var UTF32ToString = (ptr, maxBytesToRead) => {
  assert(ptr % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
  var i = 0;
  var str = "";
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = GROWABLE_HEAP_I32()[(((ptr) + (i * 4)) >>> 2) >>> 0];
    if (utf32 == 0) break;
    ++i;
    if (utf32 >= 65536) {
      var ch = utf32 - 65536;
      str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
};

var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
  outPtr >>>= 0;
  assert(outPtr % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
  assert(typeof maxBytesToWrite == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  maxBytesToWrite ??= 2147483647;
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 55296 && codeUnit <= 57343) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 65536 + ((codeUnit & 1023) << 10) | (trailSurrogate & 1023);
    }
    GROWABLE_HEAP_I32()[((outPtr) >>> 2) >>> 0] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  GROWABLE_HEAP_I32()[((outPtr) >>> 2) >>> 0] = 0;
  return outPtr - startPtr;
};

var lengthBytesUTF32 = str => {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
    len += 4;
  }
  return len;
};

var __embind_register_std_wstring = function(rawType, charSize, name) {
  rawType >>>= 0;
  charSize >>>= 0;
  name >>>= 0;
  name = readLatin1String(name);
  var decodeString, encodeString, readCharAt, lengthBytesUTF;
  if (charSize === 2) {
    decodeString = UTF16ToString;
    encodeString = stringToUTF16;
    lengthBytesUTF = lengthBytesUTF16;
    readCharAt = pointer => GROWABLE_HEAP_U16()[((pointer) >>> 1) >>> 0];
  } else if (charSize === 4) {
    decodeString = UTF32ToString;
    encodeString = stringToUTF32;
    lengthBytesUTF = lengthBytesUTF32;
    readCharAt = pointer => GROWABLE_HEAP_U32()[((pointer) >>> 2) >>> 0];
  }
  registerType(rawType, {
    name: name,
    "fromWireType": value => {
      var length = GROWABLE_HEAP_U32()[((value) >>> 2) >>> 0];
      var str;
      var decodeStartPtr = value + 4;
      for (var i = 0; i <= length; ++i) {
        var currentBytePtr = value + 4 + i * charSize;
        if (i == length || readCharAt(currentBytePtr) == 0) {
          var maxReadBytes = currentBytePtr - decodeStartPtr;
          var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
          if (str === undefined) {
            str = stringSegment;
          } else {
            str += String.fromCharCode(0);
            str += stringSegment;
          }
          decodeStartPtr = currentBytePtr + charSize;
        }
      }
      _free(value);
      return str;
    },
    "toWireType": (destructors, value) => {
      if (!(typeof value == "string")) {
        throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
      }
      var length = lengthBytesUTF(value);
      var ptr = _malloc(4 + length + charSize);
      GROWABLE_HEAP_U32()[((ptr) >>> 2) >>> 0] = length / charSize;
      encodeString(value, ptr + 4, length + charSize);
      if (destructors !== null) {
        destructors.push(_free, ptr);
      }
      return ptr;
    },
    "argPackAdvance": GenericWireTypeSize,
    "readValueFromPointer": readPointer,
    destructorFunction(ptr) {
      _free(ptr);
    }
  });
};

var __embind_register_void = function(rawType, name) {
  rawType >>>= 0;
  name >>>= 0;
  name = readLatin1String(name);
  registerType(rawType, {
    isVoid: true,
    name: name,
    "argPackAdvance": 0,
    "fromWireType": () => undefined,
    "toWireType": (destructors, o) => undefined
  });
};

var nowIsMonotonic = 1;

var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

function __emscripten_init_main_thread_js(tb) {
  tb >>>= 0;
  __emscripten_thread_init(tb, /*is_main=*/ !ENVIRONMENT_IS_WORKER, /*is_runtime=*/ 1, /*can_block=*/ !ENVIRONMENT_IS_WEB, /*default_stacksize=*/ 65536, /*start_profiling=*/ false);
  PThread.threadInitTLS();
}

var maybeExit = () => {
  if (!keepRuntimeAlive()) {
    try {
      if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS); else _exit(EXITSTATUS);
    } catch (e) {
      handleException(e);
    }
  }
};

var callUserCallback = func => {
  if (ABORT) {
    err("user callback triggered after runtime exited or application aborted.  Ignoring.");
    return;
  }
  try {
    func();
    maybeExit();
  } catch (e) {
    handleException(e);
  }
};

function __emscripten_thread_mailbox_await(pthread_ptr) {
  pthread_ptr >>>= 0;
  if (typeof Atomics.waitAsync === "function") {
    var wait = Atomics.waitAsync(GROWABLE_HEAP_I32(), ((pthread_ptr) >>> 2), pthread_ptr);
    assert(wait.async);
    wait.value.then(checkMailbox);
    var waitingAsync = pthread_ptr + 128;
    Atomics.store(GROWABLE_HEAP_I32(), ((waitingAsync) >>> 2), 1);
  }
}

var checkMailbox = () => {
  var pthread_ptr = _pthread_self();
  if (pthread_ptr) {
    __emscripten_thread_mailbox_await(pthread_ptr);
    callUserCallback(__emscripten_check_mailbox);
  }
};

function __emscripten_notify_mailbox_postmessage(targetThreadId, currThreadId, mainThreadId) {
  targetThreadId >>>= 0;
  currThreadId >>>= 0;
  mainThreadId >>>= 0;
  if (targetThreadId == currThreadId) {
    setTimeout(checkMailbox);
  } else if (ENVIRONMENT_IS_PTHREAD) {
    postMessage({
      "targetThread": targetThreadId,
      "cmd": "checkMailbox"
    });
  } else {
    var worker = PThread.pthreads[targetThreadId];
    if (!worker) {
      err(`Cannot send message to thread with ID ${targetThreadId}, unknown thread ID!`);
      return;
    }
    worker.postMessage({
      "cmd": "checkMailbox"
    });
  }
}

var proxiedJSCallArgs = [];

function __emscripten_receive_on_main_thread_js(funcIndex, emAsmAddr, callingThread, numCallArgs, args) {
  emAsmAddr >>>= 0;
  callingThread >>>= 0;
  args >>>= 0;
  proxiedJSCallArgs.length = numCallArgs;
  var b = ((args) >>> 3);
  for (var i = 0; i < numCallArgs; i++) {
    proxiedJSCallArgs[i] = GROWABLE_HEAP_F64()[b + i >>> 0];
  }
  var func = emAsmAddr ? ASM_CONSTS[emAsmAddr] : proxiedFunctionTable[funcIndex];
  assert(!(funcIndex && emAsmAddr));
  assert(func.length == numCallArgs, "Call args mismatch in _emscripten_receive_on_main_thread_js");
  PThread.currentProxiedOperationCallerThread = callingThread;
  var rtn = func(...proxiedJSCallArgs);
  PThread.currentProxiedOperationCallerThread = 0;
  assert(typeof rtn != "bigint");
  return rtn;
}

function __emscripten_thread_cleanup(thread) {
  thread >>>= 0;
  if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread); else postMessage({
    "cmd": "cleanupThread",
    "thread": thread
  });
}

function __emscripten_thread_set_strongref(thread) {
  thread >>>= 0;
}

var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

var MONTH_DAYS_LEAP_CUMULATIVE = [ 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ];

var MONTH_DAYS_REGULAR_CUMULATIVE = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];

var ydayFromDate = date => {
  var leap = isLeapYear(date.getFullYear());
  var monthDaysCumulative = (leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE);
  var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
  return yday;
};

function __localtime_js(time_low, time_high, tmPtr) {
  var time = convertI32PairToI53Checked(time_low, time_high);
  tmPtr >>>= 0;
  var date = new Date(time * 1e3);
  GROWABLE_HEAP_I32()[((tmPtr) >>> 2) >>> 0] = date.getSeconds();
  GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >>> 2) >>> 0] = date.getMinutes();
  GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >>> 2) >>> 0] = date.getHours();
  GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >>> 2) >>> 0] = date.getDate();
  GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >>> 2) >>> 0] = date.getMonth();
  GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >>> 2) >>> 0] = date.getFullYear() - 1900;
  GROWABLE_HEAP_I32()[(((tmPtr) + (24)) >>> 2) >>> 0] = date.getDay();
  var yday = ydayFromDate(date) | 0;
  GROWABLE_HEAP_I32()[(((tmPtr) + (28)) >>> 2) >>> 0] = yday;
  GROWABLE_HEAP_I32()[(((tmPtr) + (36)) >>> 2) >>> 0] = -(date.getTimezoneOffset() * 60);
  var start = new Date(date.getFullYear(), 0, 1);
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
  GROWABLE_HEAP_I32()[(((tmPtr) + (32)) >>> 2) >>> 0] = dst;
}

/** @suppress {duplicate } */ var setTempRet0 = val => __emscripten_tempret_set(val);

var _setTempRet0 = setTempRet0;

var __mktime_js = function(tmPtr) {
  tmPtr >>>= 0;
  var ret = (() => {
    var date = new Date(GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >>> 2) >>> 0] + 1900, GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >>> 2) >>> 0], GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >>> 2) >>> 0], GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >>> 2) >>> 0], GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >>> 2) >>> 0], GROWABLE_HEAP_I32()[((tmPtr) >>> 2) >>> 0], 0);
    var dst = GROWABLE_HEAP_I32()[(((tmPtr) + (32)) >>> 2) >>> 0];
    var guessedOffset = date.getTimezoneOffset();
    var start = new Date(date.getFullYear(), 0, 1);
    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dstOffset = Math.min(winterOffset, summerOffset);
    if (dst < 0) {
      GROWABLE_HEAP_I32()[(((tmPtr) + (32)) >>> 2) >>> 0] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
    } else if ((dst > 0) != (dstOffset == guessedOffset)) {
      var nonDstOffset = Math.max(winterOffset, summerOffset);
      var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
      date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
    }
    GROWABLE_HEAP_I32()[(((tmPtr) + (24)) >>> 2) >>> 0] = date.getDay();
    var yday = ydayFromDate(date) | 0;
    GROWABLE_HEAP_I32()[(((tmPtr) + (28)) >>> 2) >>> 0] = yday;
    GROWABLE_HEAP_I32()[((tmPtr) >>> 2) >>> 0] = date.getSeconds();
    GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >>> 2) >>> 0] = date.getMinutes();
    GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >>> 2) >>> 0] = date.getHours();
    GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >>> 2) >>> 0] = date.getDate();
    GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >>> 2) >>> 0] = date.getMonth();
    GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >>> 2) >>> 0] = date.getYear();
    var timeMs = date.getTime();
    if (isNaN(timeMs)) {
      return -1;
    }
    return timeMs / 1e3;
  })();
  return (setTempRet0((tempDouble = ret, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0)), 
  ret >>> 0);
};

var __tzset_js = function(timezone, daylight, std_name, dst_name) {
  timezone >>>= 0;
  daylight >>>= 0;
  std_name >>>= 0;
  dst_name >>>= 0;
  var currentYear = (new Date).getFullYear();
  var winter = new Date(currentYear, 0, 1);
  var summer = new Date(currentYear, 6, 1);
  var winterOffset = winter.getTimezoneOffset();
  var summerOffset = summer.getTimezoneOffset();
  var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  GROWABLE_HEAP_U32()[((timezone) >>> 2) >>> 0] = stdTimezoneOffset * 60;
  GROWABLE_HEAP_I32()[((daylight) >>> 2) >>> 0] = Number(winterOffset != summerOffset);
  var extractZone = date => date.toLocaleTimeString(undefined, {
    hour12: false,
    timeZoneName: "short"
  }).split(" ")[1];
  var winterName = extractZone(winter);
  var summerName = extractZone(summer);
  assert(winterName);
  assert(summerName);
  assert(lengthBytesUTF8(winterName) <= 16, `timezone name truncated to fit in TZNAME_MAX (${winterName})`);
  assert(lengthBytesUTF8(summerName) <= 16, `timezone name truncated to fit in TZNAME_MAX (${summerName})`);
  if (summerOffset < winterOffset) {
    stringToUTF8(winterName, std_name, 17);
    stringToUTF8(summerName, dst_name, 17);
  } else {
    stringToUTF8(winterName, dst_name, 17);
    stringToUTF8(summerName, std_name, 17);
  }
};

function __wasmfs_copy_preloaded_file_data(index, buffer) {
  buffer >>>= 0;
  return GROWABLE_HEAP_U8().set(wasmFSPreloadedFiles[index].fileData, buffer >>> 0);
}

var wasmFSPreloadedDirs = [];

var __wasmfs_get_num_preloaded_dirs = () => wasmFSPreloadedDirs.length;

var wasmFSPreloadedFiles = [];

var wasmFSPreloadingFlushed = false;

var __wasmfs_get_num_preloaded_files = () => {
  wasmFSPreloadingFlushed = true;
  return wasmFSPreloadedFiles.length;
};

function __wasmfs_get_preloaded_child_path(index, childNameBuffer) {
  childNameBuffer >>>= 0;
  var s = wasmFSPreloadedDirs[index].childName;
  var len = lengthBytesUTF8(s) + 1;
  stringToUTF8(s, childNameBuffer, len);
}

var __wasmfs_get_preloaded_file_mode = index => wasmFSPreloadedFiles[index].mode;

function __wasmfs_get_preloaded_file_size(index) {
  return wasmFSPreloadedFiles[index].fileData.length;
}

function __wasmfs_get_preloaded_parent_path(index, parentPathBuffer) {
  parentPathBuffer >>>= 0;
  var s = wasmFSPreloadedDirs[index].parentPath;
  var len = lengthBytesUTF8(s) + 1;
  stringToUTF8(s, parentPathBuffer, len);
}

function __wasmfs_get_preloaded_path_name(index, fileNameBuffer) {
  fileNameBuffer >>>= 0;
  var s = wasmFSPreloadedFiles[index].pathName;
  var len = lengthBytesUTF8(s) + 1;
  stringToUTF8(s, fileNameBuffer, len);
}

class HandleAllocator {
  constructor() {
    this.allocated = [ undefined ];
    this.freelist = [];
  }
  get(id) {
    assert(this.allocated[id] !== undefined, `invalid handle: ${id}`);
    return this.allocated[id];
  }
  has(id) {
    return this.allocated[id] !== undefined;
  }
  allocate(handle) {
    var id = this.freelist.pop() || this.allocated.length;
    this.allocated[id] = handle;
    return id;
  }
  free(id) {
    assert(this.allocated[id] !== undefined);
    this.allocated[id] = undefined;
    this.freelist.push(id);
  }
}

var wasmfsOPFSAccessHandles = new HandleAllocator;

var wasmfsOPFSProxyFinish = ctx => {
  _emscripten_proxy_finish(ctx);
};

async function __wasmfs_opfs_close_access(ctx, accessID, errPtr) {
  ctx >>>= 0;
  errPtr >>>= 0;
  let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
  try {
    await accessHandle.close();
  } catch {
    let err = -29;
    GROWABLE_HEAP_I32()[((errPtr) >>> 2) >>> 0] = err;
  }
  wasmfsOPFSAccessHandles.free(accessID);
  wasmfsOPFSProxyFinish(ctx);
}

var wasmfsOPFSBlobs = new HandleAllocator;

var __wasmfs_opfs_close_blob = blobID => {
  wasmfsOPFSBlobs.free(blobID);
};

async function __wasmfs_opfs_flush_access(ctx, accessID, errPtr) {
  ctx >>>= 0;
  errPtr >>>= 0;
  let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
  try {
    await accessHandle.flush();
  } catch {
    let err = -29;
    GROWABLE_HEAP_I32()[((errPtr) >>> 2) >>> 0] = err;
  }
  wasmfsOPFSProxyFinish(ctx);
}

var wasmfsOPFSDirectoryHandles = new HandleAllocator;

var __wasmfs_opfs_free_directory = dirID => {
  wasmfsOPFSDirectoryHandles.free(dirID);
};

var wasmfsOPFSFileHandles = new HandleAllocator;

var __wasmfs_opfs_free_file = fileID => {
  wasmfsOPFSFileHandles.free(fileID);
};

async function wasmfsOPFSGetOrCreateFile(parent, name, create) {
  let parentHandle = wasmfsOPFSDirectoryHandles.get(parent);
  let fileHandle;
  try {
    fileHandle = await parentHandle.getFileHandle(name, {
      create: create
    });
  } catch (e) {
    if (e.name === "NotFoundError") {
      return -20;
    }
    if (e.name === "TypeMismatchError") {
      return -31;
    }
    err("unexpected error:", e, e.stack);
    return -29;
  }
  return wasmfsOPFSFileHandles.allocate(fileHandle);
}

async function wasmfsOPFSGetOrCreateDir(parent, name, create) {
  let parentHandle = wasmfsOPFSDirectoryHandles.get(parent);
  let childHandle;
  try {
    childHandle = await parentHandle.getDirectoryHandle(name, {
      create: create
    });
  } catch (e) {
    if (e.name === "NotFoundError") {
      return -20;
    }
    if (e.name === "TypeMismatchError") {
      return -54;
    }
    err("unexpected error:", e, e.stack);
    return -29;
  }
  return wasmfsOPFSDirectoryHandles.allocate(childHandle);
}

async function __wasmfs_opfs_get_child(ctx, parent, namePtr, childTypePtr, childIDPtr) {
  ctx >>>= 0;
  namePtr >>>= 0;
  childTypePtr >>>= 0;
  childIDPtr >>>= 0;
  let name = UTF8ToString(namePtr);
  let childType = 1;
  let childID = await wasmfsOPFSGetOrCreateFile(parent, name, false);
  if (childID == -31) {
    childType = 2;
    childID = await wasmfsOPFSGetOrCreateDir(parent, name, false);
  }
  GROWABLE_HEAP_I32()[((childTypePtr) >>> 2) >>> 0] = childType;
  GROWABLE_HEAP_I32()[((childIDPtr) >>> 2) >>> 0] = childID;
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_get_entries(ctx, dirID, entriesPtr, errPtr) {
  ctx >>>= 0;
  entriesPtr >>>= 0;
  errPtr >>>= 0;
  let dirHandle = wasmfsOPFSDirectoryHandles.get(dirID);
  try {
    let iter = dirHandle.entries();
    for (let entry; entry = await iter.next(), !entry.done; ) {
      let [name, child] = entry.value;
      let sp = stackSave();
      let namePtr = stringToUTF8OnStack(name);
      let type = child.kind == "file" ? 1 : 2;
      __wasmfs_opfs_record_entry(entriesPtr, namePtr, type);
      stackRestore(sp);
    }
  } catch {
    let err = -29;
    GROWABLE_HEAP_I32()[((errPtr) >>> 2) >>> 0] = err;
  }
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_get_size_access(ctx, accessID, sizePtr) {
  ctx >>>= 0;
  sizePtr >>>= 0;
  let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
  let size;
  try {
    size = await accessHandle.getSize();
  } catch {
    size = -29;
  }
  (tempI64 = [ size >>> 0, (tempDouble = size, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  GROWABLE_HEAP_I32()[((sizePtr) >>> 2) >>> 0] = tempI64[0], GROWABLE_HEAP_I32()[(((sizePtr) + (4)) >>> 2) >>> 0] = tempI64[1]);
  wasmfsOPFSProxyFinish(ctx);
}

var __wasmfs_opfs_get_size_blob = blobID => wasmfsOPFSBlobs.get(blobID).size;

async function __wasmfs_opfs_get_size_file(ctx, fileID, sizePtr) {
  ctx >>>= 0;
  sizePtr >>>= 0;
  let fileHandle = wasmfsOPFSFileHandles.get(fileID);
  let size;
  try {
    size = (await fileHandle.getFile()).size;
  } catch {
    size = -29;
  }
  (tempI64 = [ size >>> 0, (tempDouble = size, (+(Math.abs(tempDouble))) >= 1 ? (tempDouble > 0 ? (+(Math.floor((tempDouble) / 4294967296))) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296))))) >>> 0) : 0) ], 
  GROWABLE_HEAP_I32()[((sizePtr) >>> 2) >>> 0] = tempI64[0], GROWABLE_HEAP_I32()[(((sizePtr) + (4)) >>> 2) >>> 0] = tempI64[1]);
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_init_root_directory(ctx) {
  ctx >>>= 0;
  if (wasmfsOPFSDirectoryHandles.allocated.length == 1) {
    /** @suppress {checkTypes} */ let root = await navigator.storage.getDirectory();
    wasmfsOPFSDirectoryHandles.allocated.push(root);
  }
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_insert_directory(ctx, parent, namePtr, childIDPtr) {
  ctx >>>= 0;
  namePtr >>>= 0;
  childIDPtr >>>= 0;
  let name = UTF8ToString(namePtr);
  let childID = await wasmfsOPFSGetOrCreateDir(parent, name, true);
  GROWABLE_HEAP_I32()[((childIDPtr) >>> 2) >>> 0] = childID;
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_insert_file(ctx, parent, namePtr, childIDPtr) {
  ctx >>>= 0;
  namePtr >>>= 0;
  childIDPtr >>>= 0;
  let name = UTF8ToString(namePtr);
  let childID = await wasmfsOPFSGetOrCreateFile(parent, name, true);
  GROWABLE_HEAP_I32()[((childIDPtr) >>> 2) >>> 0] = childID;
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_move_file(ctx, fileID, newParentID, namePtr, errPtr) {
  ctx >>>= 0;
  namePtr >>>= 0;
  errPtr >>>= 0;
  let name = UTF8ToString(namePtr);
  let fileHandle = wasmfsOPFSFileHandles.get(fileID);
  let newDirHandle = wasmfsOPFSDirectoryHandles.get(newParentID);
  try {
    await fileHandle.move(newDirHandle, name);
  } catch {
    let err = -29;
    GROWABLE_HEAP_I32()[((errPtr) >>> 2) >>> 0] = err;
  }
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_open_access(ctx, fileID, accessIDPtr) {
  ctx >>>= 0;
  accessIDPtr >>>= 0;
  let fileHandle = wasmfsOPFSFileHandles.get(fileID);
  let accessID;
  try {
    let accessHandle;
    /** @suppress {checkTypes} */ var len = FileSystemFileHandle.prototype.createSyncAccessHandle.length;
    if (len == 0) {
      accessHandle = await fileHandle.createSyncAccessHandle();
    } else {
      accessHandle = await fileHandle.createSyncAccessHandle({
        mode: "in-place"
      });
    }
    accessID = wasmfsOPFSAccessHandles.allocate(accessHandle);
  } catch (e) {
    if (e.name === "InvalidStateError" || e.name === "NoModificationAllowedError") {
      accessID = -2;
    } else {
      err("unexpected error:", e, e.stack);
      accessID = -29;
    }
  }
  GROWABLE_HEAP_I32()[((accessIDPtr) >>> 2) >>> 0] = accessID;
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_open_blob(ctx, fileID, blobIDPtr) {
  ctx >>>= 0;
  blobIDPtr >>>= 0;
  let fileHandle = wasmfsOPFSFileHandles.get(fileID);
  let blobID;
  try {
    let blob = await fileHandle.getFile();
    blobID = wasmfsOPFSBlobs.allocate(blob);
  } catch (e) {
    if (e.name === "NotAllowedError") {
      blobID = -2;
    } else {
      err("unexpected error:", e, e.stack);
      blobID = -29;
    }
  }
  GROWABLE_HEAP_I32()[((blobIDPtr) >>> 2) >>> 0] = blobID;
  wasmfsOPFSProxyFinish(ctx);
}

function __wasmfs_opfs_read_access(accessID, bufPtr, len, pos) {
  bufPtr >>>= 0;
  let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
  let data = GROWABLE_HEAP_U8().subarray(bufPtr >>> 0, bufPtr + len >>> 0);
  try {
    return accessHandle.read(data, {
      at: pos
    });
  } catch (e) {
    if (e.name == "TypeError") {
      return -28;
    }
    err("unexpected error:", e, e.stack);
    return -29;
  }
}

async function __wasmfs_opfs_read_blob(ctx, blobID, bufPtr, len, pos, nreadPtr) {
  ctx >>>= 0;
  bufPtr >>>= 0;
  nreadPtr >>>= 0;
  let blob = wasmfsOPFSBlobs.get(blobID);
  let slice = blob.slice(pos, pos + len);
  let nread = 0;
  try {
    let buf = await slice.arrayBuffer();
    let data = new Uint8Array(buf);
    GROWABLE_HEAP_U8().set(data, bufPtr >>> 0);
    nread += data.length;
  } catch (e) {
    if (e instanceof RangeError) {
      nread = -21;
    } else {
      err("unexpected error:", e, e.stack);
      nread = -29;
    }
  }
  GROWABLE_HEAP_I32()[((nreadPtr) >>> 2) >>> 0] = nread;
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_remove_child(ctx, dirID, namePtr, errPtr) {
  ctx >>>= 0;
  namePtr >>>= 0;
  errPtr >>>= 0;
  let name = UTF8ToString(namePtr);
  let dirHandle = wasmfsOPFSDirectoryHandles.get(dirID);
  try {
    await dirHandle.removeEntry(name);
  } catch {
    let err = -29;
    GROWABLE_HEAP_I32()[((errPtr) >>> 2) >>> 0] = err;
  }
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_set_size_access(ctx, accessID, size_low, size_high, errPtr) {
  ctx >>>= 0;
  var size = convertI32PairToI53Checked(size_low, size_high);
  errPtr >>>= 0;
  let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
  try {
    await accessHandle.truncate(size);
  } catch {
    let err = -29;
    GROWABLE_HEAP_I32()[((errPtr) >>> 2) >>> 0] = err;
  }
  wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_set_size_file(ctx, fileID, size_low, size_high, errPtr) {
  ctx >>>= 0;
  var size = convertI32PairToI53Checked(size_low, size_high);
  errPtr >>>= 0;
  let fileHandle = wasmfsOPFSFileHandles.get(fileID);
  try {
    let writable = await fileHandle.createWritable({
      keepExistingData: true
    });
    await writable.truncate(size);
    await writable.close();
  } catch {
    let err = -29;
    GROWABLE_HEAP_I32()[((errPtr) >>> 2) >>> 0] = err;
  }
  wasmfsOPFSProxyFinish(ctx);
}

function __wasmfs_opfs_write_access(accessID, bufPtr, len, pos) {
  bufPtr >>>= 0;
  let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
  let data = GROWABLE_HEAP_U8().subarray(bufPtr >>> 0, bufPtr + len >>> 0);
  try {
    return accessHandle.write(data, {
      at: pos
    });
  } catch (e) {
    if (e.name == "TypeError") {
      return -28;
    }
    err("unexpected error:", e, e.stack);
    return -29;
  }
}

var FS_stdin_getChar_buffer = [];

/** @type {function(string, boolean=, number=)} */ function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

var FS_stdin_getChar = () => {
  if (!FS_stdin_getChar_buffer.length) {
    var result = null;
    if (typeof window != "undefined" && typeof window.prompt == "function") {
      result = window.prompt("Input: ");
      if (result !== null) {
        result += "\n";
      }
    } else {}
    if (!result) {
      return null;
    }
    FS_stdin_getChar_buffer = intArrayFromString(result, true);
  }
  return FS_stdin_getChar_buffer.shift();
};

var __wasmfs_stdin_get_char = () => {
  var c = FS_stdin_getChar();
  if (typeof c === "number") {
    return c;
  }
  return -1;
};

var __wasmfs_thread_utils_heartbeat = function(queue) {
  queue >>>= 0;
  var intervalID = setInterval(() => {
    if (ABORT) {
      clearInterval(intervalID);
    } else {
      _emscripten_proxy_execute_queue(queue);
    }
  }, 50);
};

var readEmAsmArgsArray = [];

var readEmAsmArgs = (sigPtr, buf) => {
  assert(Array.isArray(readEmAsmArgsArray));
  assert(buf % 16 == 0);
  readEmAsmArgsArray.length = 0;
  var ch;
  while (ch = GROWABLE_HEAP_U8()[sigPtr++ >>> 0]) {
    var chr = String.fromCharCode(ch);
    var validChars = [ "d", "f", "i", "p" ];
    assert(validChars.includes(chr), `Invalid character ${ch}("${chr}") in readEmAsmArgs! Use only [${validChars}], and do not specify "v" for void return argument.`);
    var wide = (ch != 105);
    wide &= (ch != 112);
    buf += wide && (buf % 8) ? 4 : 0;
    readEmAsmArgsArray.push(ch == 112 ? GROWABLE_HEAP_U32()[((buf) >>> 2) >>> 0] : ch == 105 ? GROWABLE_HEAP_I32()[((buf) >>> 2) >>> 0] : GROWABLE_HEAP_F64()[((buf) >>> 3) >>> 0]);
    buf += wide ? 8 : 4;
  }
  return readEmAsmArgsArray;
};

var runMainThreadEmAsm = (emAsmAddr, sigPtr, argbuf, sync) => {
  var args = readEmAsmArgs(sigPtr, argbuf);
  if (ENVIRONMENT_IS_PTHREAD) {
    return proxyToMainThread(0, emAsmAddr, sync, ...args);
  }
  assert(ASM_CONSTS.hasOwnProperty(emAsmAddr), `No EM_ASM constant found at address ${emAsmAddr}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
  return ASM_CONSTS[emAsmAddr](...args);
};

function _emscripten_asm_const_int_sync_on_main_thread(emAsmAddr, sigPtr, argbuf) {
  emAsmAddr >>>= 0;
  sigPtr >>>= 0;
  argbuf >>>= 0;
  return runMainThreadEmAsm(emAsmAddr, sigPtr, argbuf, 1);
}

var _emscripten_check_blocking_allowed = () => {
  if (ENVIRONMENT_IS_WORKER) return;
  warnOnce("Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread");
};

var _emscripten_date_now = () => Date.now();

function _emscripten_err(str) {
  str >>>= 0;
  return err(UTF8ToString(str));
}

var runtimeKeepalivePush = () => {
  runtimeKeepaliveCounter += 1;
};

var _emscripten_exit_with_live_runtime = () => {
  runtimeKeepalivePush();
  throw "unwind";
};

var _emscripten_get_now;

_emscripten_get_now = () => performance.timeOrigin + performance.now();

var _emscripten_has_asyncify = () => 0;

function _emscripten_out(str) {
  str >>>= 0;
  return out(UTF8ToString(str));
}

var getHeapMax = () => 4294901760;

var growMemory = size => {
  var b = wasmMemory.buffer;
  var pages = (size - b.byteLength + 65535) / 65536;
  var oldHeapSize = b.byteLength;
  try {
    wasmMemory.grow(pages);
    updateMemoryViews();
    if (typeof emscriptenMemoryProfiler != "undefined") {
      emscriptenMemoryProfiler.onMemoryResize(oldHeapSize, b.byteLength);
    }
    return 1;
  } /*success*/ catch (e) {
    err(`growMemory: Attempted to grow heap from ${b.byteLength} bytes to ${size} bytes, but got error: ${e}`);
  }
};

function _emscripten_resize_heap(requestedSize) {
  requestedSize >>>= 0;
  var oldSize = GROWABLE_HEAP_U8().length;
  if (requestedSize <= oldSize) {
    return false;
  }
  _emscripten_trace_report_memory_layout();
  var maxHeapSize = getHeapMax();
  if (requestedSize > maxHeapSize) {
    err(`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
    return false;
  }
  var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
    var replacement = growMemory(newSize);
    if (replacement) {
      traceLogMessage("Emscripten", `Enlarging memory arrays from ${oldSize} to ${newSize}`);
      _emscripten_trace_report_memory_layout();
      return true;
    }
  }
  err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
  return false;
}

var traceConfigure = (collector_url, application) => {
  EmscriptenTrace.configure(collector_url, application);
};

var _emscripten_trace_configure_for_google_wtf = () => {
  EmscriptenTrace.configureForGoogleWTF();
};

var traceEnterContext = name => {
  if (EmscriptenTrace.postEnabled) {
    var now = EmscriptenTrace.now();
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_ENTER_CONTEXT, now, name ]);
  }
  if (EmscriptenTrace.googleWTFEnabled) {
    EmscriptenTrace.googleWTFEnterScope(name);
  }
};

var _emscripten_trace_exit_context = () => {
  if (EmscriptenTrace.postEnabled) {
    var now = EmscriptenTrace.now();
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_EXIT_CONTEXT, now ]);
  }
  if (EmscriptenTrace.googleWTFEnabled) {
    EmscriptenTrace.googleWTFExitScope();
  }
};

var traceLogMessage = (channel, message) => {
  if (EmscriptenTrace.postEnabled) {
    var now = EmscriptenTrace.now();
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_LOG_MESSAGE, now, channel, message ]);
  }
};

var traceMark = message => {
  if (EmscriptenTrace.postEnabled) {
    var now = EmscriptenTrace.now();
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_LOG_MESSAGE, now, "MARK", message ]);
  }
  if (EmscriptenTrace.googleWTFEnabled) {
    window["wtf"].trace.mark(message);
  }
};

var EmscriptenTrace = {
  worker: null,
  collectorEnabled: false,
  googleWTFEnabled: false,
  testingEnabled: false,
  googleWTFData: {
    scopeStack: [],
    cachedScopes: {}
  },
  DATA_VERSION: 1,
  EVENT_ALLOCATE: "allocate",
  EVENT_ANNOTATE_TYPE: "annotate-type",
  EVENT_APPLICATION_NAME: "application-name",
  EVENT_ASSOCIATE_STORAGE_SIZE: "associate-storage-size",
  EVENT_ENTER_CONTEXT: "enter-context",
  EVENT_EXIT_CONTEXT: "exit-context",
  EVENT_FRAME_END: "frame-end",
  EVENT_FRAME_RATE: "frame-rate",
  EVENT_FRAME_START: "frame-start",
  EVENT_FREE: "free",
  EVENT_LOG_MESSAGE: "log-message",
  EVENT_MEMORY_LAYOUT: "memory-layout",
  EVENT_OFF_HEAP: "off-heap",
  EVENT_REALLOCATE: "reallocate",
  EVENT_REPORT_ERROR: "report-error",
  EVENT_SESSION_NAME: "session-name",
  EVENT_TASK_ASSOCIATE_DATA: "task-associate-data",
  EVENT_TASK_END: "task-end",
  EVENT_TASK_RESUME: "task-resume",
  EVENT_TASK_START: "task-start",
  EVENT_TASK_SUSPEND: "task-suspend",
  EVENT_USER_NAME: "user-name",
  init: () => {
    Module["emscripten_trace_configure"] = traceConfigure;
    Module["emscripten_trace_configure_for_google_wtf"] = _emscripten_trace_configure_for_google_wtf;
    Module["emscripten_trace_enter_context"] = traceEnterContext;
    Module["emscripten_trace_exit_context"] = _emscripten_trace_exit_context;
    Module["emscripten_trace_log_message"] = traceLogMessage;
    Module["emscripten_trace_mark"] = traceMark;
  },
  loadWorkerViaXHR: (url, ready, scope) => {
    var req = new XMLHttpRequest;
    req.addEventListener("load", function() {
      var blob = new Blob([ this.responseText ], {
        type: "text/javascript"
      });
      var worker = new Worker(window.URL.createObjectURL(blob));
      ready?.call(scope, worker);
    }, req);
    req.open("get", url, false);
    req.send();
  },
  configure: (collector_url, application) => {
    EmscriptenTrace.now = _emscripten_get_now;
    var now = new Date;
    var session_id = now.getTime().toString() + "_" + Math.floor((Math.random() * 100) + 1).toString();
    EmscriptenTrace.loadWorkerViaXHR(collector_url + "worker.js", function(worker) {
      EmscriptenTrace.worker = worker;
      EmscriptenTrace.worker.addEventListener("error", function(e) {
        out("TRACE WORKER ERROR:");
        out(e);
      }, false);
      EmscriptenTrace.worker.postMessage({
        "cmd": "configure",
        "data_version": EmscriptenTrace.DATA_VERSION,
        "session_id": session_id,
        "url": collector_url
      });
      EmscriptenTrace.configured = true;
      EmscriptenTrace.collectorEnabled = true;
      EmscriptenTrace.postEnabled = true;
    });
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_APPLICATION_NAME, application ]);
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_SESSION_NAME, now.toISOString() ]);
  },
  configureForTest: () => {
    EmscriptenTrace.postEnabled = true;
    EmscriptenTrace.testingEnabled = true;
    EmscriptenTrace.now = function() {
      return 0;
    };
  },
  configureForGoogleWTF: () => {
    if (window && window["wtf"]) {
      EmscriptenTrace.googleWTFEnabled = true;
    } else {
      out("GOOGLE WTF NOT AVAILABLE TO ENABLE");
    }
  },
  post: entry => {
    if (EmscriptenTrace.postEnabled && EmscriptenTrace.collectorEnabled) {
      EmscriptenTrace.worker.postMessage({
        "cmd": "post",
        "entry": entry
      });
    } else if (EmscriptenTrace.postEnabled && EmscriptenTrace.testingEnabled) {
      out("Tracing " + entry);
    }
  },
  googleWTFEnterScope: name => {
    var scopeEvent = EmscriptenTrace.googleWTFData["cachedScopes"][name];
    if (!scopeEvent) {
      scopeEvent = window["wtf"].trace.events.createScope(name);
      EmscriptenTrace.googleWTFData["cachedScopes"][name] = scopeEvent;
    }
    var scope = scopeEvent();
    EmscriptenTrace.googleWTFData["scopeStack"].push(scope);
  },
  googleWTFExitScope: () => {
    var scope = EmscriptenTrace.googleWTFData["scopeStack"].pop();
    window["wtf"].trace.leaveScope(scope);
  }
};

function _emscripten_trace_record_allocation(address, size) {
  address >>>= 0;
  if (typeof Module["onMalloc"] == "function") Module["onMalloc"](address, size);
  if (EmscriptenTrace.postEnabled) {
    var now = EmscriptenTrace.now();
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_ALLOCATE, now, address, size ]);
  }
}

function _emscripten_trace_record_free(address) {
  address >>>= 0;
  if (typeof Module["onFree"] == "function") Module["onFree"](address);
  if (EmscriptenTrace.postEnabled) {
    var now = EmscriptenTrace.now();
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_FREE, now, address ]);
  }
}

function _emscripten_trace_record_reallocation(old_address, new_address, size) {
  old_address >>>= 0;
  new_address >>>= 0;
  if (typeof Module["onRealloc"] == "function") Module["onRealloc"](old_address, new_address, size);
  if (EmscriptenTrace.postEnabled) {
    var now = EmscriptenTrace.now();
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_REALLOCATE, now, old_address, new_address, size ]);
  }
}

var _emscripten_trace_report_memory_layout = () => {
  if (EmscriptenTrace.postEnabled) {
    var memory_layout = {
      "static_base": 1024,
      "stack_base": _emscripten_stack_get_base(),
      "stack_top": _emscripten_stack_get_current(),
      "stack_max": _emscripten_stack_get_end(),
      "dynamic_top": _sbrk(0),
      "total_memory": GROWABLE_HEAP_I8().length
    };
    var now = EmscriptenTrace.now();
    EmscriptenTrace.post([ EmscriptenTrace.EVENT_MEMORY_LAYOUT, now, memory_layout ]);
  }
};

var _emscripten_unwind_to_js_event_loop = () => {
  throw "unwind";
};

var ENV = {};

var getExecutableName = () => thisProgram || "./this.program";

var getEnvStrings = () => {
  if (!getEnvStrings.strings) {
    var lang = ((typeof navigator == "object" && navigator.languages && navigator.languages[0]) || "C").replace("-", "_") + ".UTF-8";
    var env = {
      "USER": "web_user",
      "LOGNAME": "web_user",
      "PATH": "/",
      "PWD": "/",
      "HOME": "/home/web_user",
      "LANG": lang,
      "_": getExecutableName()
    };
    for (var x in ENV) {
      if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
    }
    var strings = [];
    for (var x in env) {
      strings.push(`${x}=${env[x]}`);
    }
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
};

var stringToAscii = (str, buffer) => {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
    GROWABLE_HEAP_I8()[buffer++ >>> 0] = str.charCodeAt(i);
  }
  GROWABLE_HEAP_I8()[buffer >>> 0] = 0;
};

var _environ_get = function(__environ, environ_buf) {
  if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 0, 1, __environ, environ_buf);
  __environ >>>= 0;
  environ_buf >>>= 0;
  var bufSize = 0;
  getEnvStrings().forEach((string, i) => {
    var ptr = environ_buf + bufSize;
    GROWABLE_HEAP_U32()[(((__environ) + (i * 4)) >>> 2) >>> 0] = ptr;
    stringToAscii(string, ptr);
    bufSize += string.length + 1;
  });
  return 0;
};

var _environ_sizes_get = function(penviron_count, penviron_buf_size) {
  if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 0, 1, penviron_count, penviron_buf_size);
  penviron_count >>>= 0;
  penviron_buf_size >>>= 0;
  var strings = getEnvStrings();
  GROWABLE_HEAP_U32()[((penviron_count) >>> 2) >>> 0] = strings.length;
  var bufSize = 0;
  strings.forEach(string => bufSize += string.length + 1);
  GROWABLE_HEAP_U32()[((penviron_buf_size) >>> 2) >>> 0] = bufSize;
  return 0;
};

var initRandomFill = () => {
  if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
    return view => (view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))), 
    view);
  } else abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
};

var randomFill = view => (randomFill = initRandomFill())(view);

function _getentropy(buffer, size) {
  buffer >>>= 0;
  size >>>= 0;
  randomFill(GROWABLE_HEAP_U8().subarray(buffer >>> 0, buffer + size >>> 0));
  return 0;
}

var arraySum = (array, index) => {
  var sum = 0;
  for (var i = 0; i <= index; sum += array[i++]) {}
  return sum;
};

var MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var addDays = (date, days) => {
  var newDate = new Date(date.getTime());
  while (days > 0) {
    var leap = isLeapYear(newDate.getFullYear());
    var currentMonth = newDate.getMonth();
    var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
    if (days > daysInCurrentMonth - newDate.getDate()) {
      days -= (daysInCurrentMonth - newDate.getDate() + 1);
      newDate.setDate(1);
      if (currentMonth < 11) {
        newDate.setMonth(currentMonth + 1);
      } else {
        newDate.setMonth(0);
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
    } else {
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    }
  }
  return newDate;
};

var writeArrayToMemory = (array, buffer) => {
  assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
  GROWABLE_HEAP_I8().set(array, buffer >>> 0);
};

function _strftime(s, maxsize, format, tm) {
  s >>>= 0;
  maxsize >>>= 0;
  format >>>= 0;
  tm >>>= 0;
  var tm_zone = GROWABLE_HEAP_U32()[(((tm) + (40)) >>> 2) >>> 0];
  var date = {
    tm_sec: GROWABLE_HEAP_I32()[((tm) >>> 2) >>> 0],
    tm_min: GROWABLE_HEAP_I32()[(((tm) + (4)) >>> 2) >>> 0],
    tm_hour: GROWABLE_HEAP_I32()[(((tm) + (8)) >>> 2) >>> 0],
    tm_mday: GROWABLE_HEAP_I32()[(((tm) + (12)) >>> 2) >>> 0],
    tm_mon: GROWABLE_HEAP_I32()[(((tm) + (16)) >>> 2) >>> 0],
    tm_year: GROWABLE_HEAP_I32()[(((tm) + (20)) >>> 2) >>> 0],
    tm_wday: GROWABLE_HEAP_I32()[(((tm) + (24)) >>> 2) >>> 0],
    tm_yday: GROWABLE_HEAP_I32()[(((tm) + (28)) >>> 2) >>> 0],
    tm_isdst: GROWABLE_HEAP_I32()[(((tm) + (32)) >>> 2) >>> 0],
    tm_gmtoff: GROWABLE_HEAP_I32()[(((tm) + (36)) >>> 2) >>> 0],
    tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
  };
  var pattern = UTF8ToString(format);
  var EXPANSION_RULES_1 = {
    "%c": "%a %b %d %H:%M:%S %Y",
    "%D": "%m/%d/%y",
    "%F": "%Y-%m-%d",
    "%h": "%b",
    "%r": "%I:%M:%S %p",
    "%R": "%H:%M",
    "%T": "%H:%M:%S",
    "%x": "%m/%d/%y",
    "%X": "%H:%M:%S",
    "%Ec": "%c",
    "%EC": "%C",
    "%Ex": "%m/%d/%y",
    "%EX": "%H:%M:%S",
    "%Ey": "%y",
    "%EY": "%Y",
    "%Od": "%d",
    "%Oe": "%e",
    "%OH": "%H",
    "%OI": "%I",
    "%Om": "%m",
    "%OM": "%M",
    "%OS": "%S",
    "%Ou": "%u",
    "%OU": "%U",
    "%OV": "%V",
    "%Ow": "%w",
    "%OW": "%W",
    "%Oy": "%y"
  };
  for (var rule in EXPANSION_RULES_1) {
    pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
  }
  var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
  var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  function leadingSomething(value, digits, character) {
    var str = typeof value == "number" ? value.toString() : (value || "");
    while (str.length < digits) {
      str = character[0] + str;
    }
    return str;
  }
  function leadingNulls(value, digits) {
    return leadingSomething(value, digits, "0");
  }
  function compareByDay(date1, date2) {
    function sgn(value) {
      return value < 0 ? -1 : (value > 0 ? 1 : 0);
    }
    var compare;
    if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
      if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
        compare = sgn(date1.getDate() - date2.getDate());
      }
    }
    return compare;
  }
  function getFirstWeekStartDate(janFourth) {
    switch (janFourth.getDay()) {
     case 0:
      return new Date(janFourth.getFullYear() - 1, 11, 29);

     case 1:
      return janFourth;

     case 2:
      return new Date(janFourth.getFullYear(), 0, 3);

     case 3:
      return new Date(janFourth.getFullYear(), 0, 2);

     case 4:
      return new Date(janFourth.getFullYear(), 0, 1);

     case 5:
      return new Date(janFourth.getFullYear() - 1, 11, 31);

     case 6:
      return new Date(janFourth.getFullYear() - 1, 11, 30);
    }
  }
  function getWeekBasedYear(date) {
    var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
    var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
    var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
    var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
    var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
    if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
      if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
        return thisDate.getFullYear() + 1;
      }
      return thisDate.getFullYear();
    }
    return thisDate.getFullYear() - 1;
  }
  var EXPANSION_RULES_2 = {
    "%a": date => WEEKDAYS[date.tm_wday].substring(0, 3),
    "%A": date => WEEKDAYS[date.tm_wday],
    "%b": date => MONTHS[date.tm_mon].substring(0, 3),
    "%B": date => MONTHS[date.tm_mon],
    "%C": date => {
      var year = date.tm_year + 1900;
      return leadingNulls((year / 100) | 0, 2);
    },
    "%d": date => leadingNulls(date.tm_mday, 2),
    "%e": date => leadingSomething(date.tm_mday, 2, " "),
    "%g": date => getWeekBasedYear(date).toString().substring(2),
    "%G": getWeekBasedYear,
    "%H": date => leadingNulls(date.tm_hour, 2),
    "%I": date => {
      var twelveHour = date.tm_hour;
      if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
      return leadingNulls(twelveHour, 2);
    },
    "%j": date => leadingNulls(date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1), 3),
    "%m": date => leadingNulls(date.tm_mon + 1, 2),
    "%M": date => leadingNulls(date.tm_min, 2),
    "%n": () => "\n",
    "%p": date => {
      if (date.tm_hour >= 0 && date.tm_hour < 12) {
        return "AM";
      }
      return "PM";
    },
    "%S": date => leadingNulls(date.tm_sec, 2),
    "%t": () => "\t",
    "%u": date => date.tm_wday || 7,
    "%U": date => {
      var days = date.tm_yday + 7 - date.tm_wday;
      return leadingNulls(Math.floor(days / 7), 2);
    },
    "%V": date => {
      var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
      if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
        val++;
      }
      if (!val) {
        val = 52;
        var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
        if (dec31 == 4 || (dec31 == 5 && isLeapYear(date.tm_year % 400 - 1))) {
          val++;
        }
      } else if (val == 53) {
        var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
        if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
      }
      return leadingNulls(val, 2);
    },
    "%w": date => date.tm_wday,
    "%W": date => {
      var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
      return leadingNulls(Math.floor(days / 7), 2);
    },
    "%y": date => (date.tm_year + 1900).toString().substring(2),
    "%Y": date => date.tm_year + 1900,
    "%z": date => {
      var off = date.tm_gmtoff;
      var ahead = off >= 0;
      off = Math.abs(off) / 60;
      off = (off / 60) * 100 + (off % 60);
      return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
    },
    "%Z": date => date.tm_zone,
    "%%": () => "%"
  };
  pattern = pattern.replace(/%%/g, "\0\0");
  for (var rule in EXPANSION_RULES_2) {
    if (pattern.includes(rule)) {
      pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
    }
  }
  pattern = pattern.replace(/\0\0/g, "%");
  var bytes = intArrayFromString(pattern, false);
  if (bytes.length > maxsize) {
    return 0;
  }
  writeArrayToMemory(bytes, s);
  return bytes.length - 1;
}

function _strftime_l(s, maxsize, format, tm, loc) {
  s >>>= 0;
  maxsize >>>= 0;
  format >>>= 0;
  tm >>>= 0;
  loc >>>= 0;
  return _strftime(s, maxsize, format, tm);
}

PThread.init();

embind_init_charCodes();

BindingError = Module["BindingError"] = class BindingError extends Error {
  constructor(message) {
    super(message);
    this.name = "BindingError";
  }
};

InternalError = Module["InternalError"] = class InternalError extends Error {
  constructor(message) {
    super(message);
    this.name = "InternalError";
  }
};

init_emval();

UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");

EmscriptenTrace.init();

var proxiedFunctionTable = [ _proc_exit, exitOnMainThread, pthreadCreateProxied, _environ_get, _environ_sizes_get ];

function checkIncomingModuleAPI() {
  ignoredModuleProp("fetchSettings");
}

var wasmImports;

function assignWasmImports() {
  wasmImports = {
    /** @export */ __assert_fail: ___assert_fail,
    /** @export */ __cxa_throw: ___cxa_throw,
    /** @export */ __pthread_create_js: ___pthread_create_js,
    /** @export */ __pthread_kill_js: ___pthread_kill_js,
    /** @export */ _abort_js: __abort_js,
    /** @export */ _embind_register_bigint: __embind_register_bigint,
    /** @export */ _embind_register_bool: __embind_register_bool,
    /** @export */ _embind_register_emval: __embind_register_emval,
    /** @export */ _embind_register_float: __embind_register_float,
    /** @export */ _embind_register_function: __embind_register_function,
    /** @export */ _embind_register_integer: __embind_register_integer,
    /** @export */ _embind_register_memory_view: __embind_register_memory_view,
    /** @export */ _embind_register_std_string: __embind_register_std_string,
    /** @export */ _embind_register_std_wstring: __embind_register_std_wstring,
    /** @export */ _embind_register_void: __embind_register_void,
    /** @export */ _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
    /** @export */ _emscripten_init_main_thread_js: __emscripten_init_main_thread_js,
    /** @export */ _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
    /** @export */ _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
    /** @export */ _emscripten_thread_cleanup: __emscripten_thread_cleanup,
    /** @export */ _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
    /** @export */ _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
    /** @export */ _localtime_js: __localtime_js,
    /** @export */ _mktime_js: __mktime_js,
    /** @export */ _tzset_js: __tzset_js,
    /** @export */ _wasmfs_copy_preloaded_file_data: __wasmfs_copy_preloaded_file_data,
    /** @export */ _wasmfs_get_num_preloaded_dirs: __wasmfs_get_num_preloaded_dirs,
    /** @export */ _wasmfs_get_num_preloaded_files: __wasmfs_get_num_preloaded_files,
    /** @export */ _wasmfs_get_preloaded_child_path: __wasmfs_get_preloaded_child_path,
    /** @export */ _wasmfs_get_preloaded_file_mode: __wasmfs_get_preloaded_file_mode,
    /** @export */ _wasmfs_get_preloaded_file_size: __wasmfs_get_preloaded_file_size,
    /** @export */ _wasmfs_get_preloaded_parent_path: __wasmfs_get_preloaded_parent_path,
    /** @export */ _wasmfs_get_preloaded_path_name: __wasmfs_get_preloaded_path_name,
    /** @export */ _wasmfs_opfs_close_access: __wasmfs_opfs_close_access,
    /** @export */ _wasmfs_opfs_close_blob: __wasmfs_opfs_close_blob,
    /** @export */ _wasmfs_opfs_flush_access: __wasmfs_opfs_flush_access,
    /** @export */ _wasmfs_opfs_free_directory: __wasmfs_opfs_free_directory,
    /** @export */ _wasmfs_opfs_free_file: __wasmfs_opfs_free_file,
    /** @export */ _wasmfs_opfs_get_child: __wasmfs_opfs_get_child,
    /** @export */ _wasmfs_opfs_get_entries: __wasmfs_opfs_get_entries,
    /** @export */ _wasmfs_opfs_get_size_access: __wasmfs_opfs_get_size_access,
    /** @export */ _wasmfs_opfs_get_size_blob: __wasmfs_opfs_get_size_blob,
    /** @export */ _wasmfs_opfs_get_size_file: __wasmfs_opfs_get_size_file,
    /** @export */ _wasmfs_opfs_init_root_directory: __wasmfs_opfs_init_root_directory,
    /** @export */ _wasmfs_opfs_insert_directory: __wasmfs_opfs_insert_directory,
    /** @export */ _wasmfs_opfs_insert_file: __wasmfs_opfs_insert_file,
    /** @export */ _wasmfs_opfs_move_file: __wasmfs_opfs_move_file,
    /** @export */ _wasmfs_opfs_open_access: __wasmfs_opfs_open_access,
    /** @export */ _wasmfs_opfs_open_blob: __wasmfs_opfs_open_blob,
    /** @export */ _wasmfs_opfs_read_access: __wasmfs_opfs_read_access,
    /** @export */ _wasmfs_opfs_read_blob: __wasmfs_opfs_read_blob,
    /** @export */ _wasmfs_opfs_remove_child: __wasmfs_opfs_remove_child,
    /** @export */ _wasmfs_opfs_set_size_access: __wasmfs_opfs_set_size_access,
    /** @export */ _wasmfs_opfs_set_size_file: __wasmfs_opfs_set_size_file,
    /** @export */ _wasmfs_opfs_write_access: __wasmfs_opfs_write_access,
    /** @export */ _wasmfs_stdin_get_char: __wasmfs_stdin_get_char,
    /** @export */ _wasmfs_thread_utils_heartbeat: __wasmfs_thread_utils_heartbeat,
    /** @export */ emscripten_asm_const_int_sync_on_main_thread: _emscripten_asm_const_int_sync_on_main_thread,
    /** @export */ emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
    /** @export */ emscripten_date_now: _emscripten_date_now,
    /** @export */ emscripten_err: _emscripten_err,
    /** @export */ emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
    /** @export */ emscripten_get_now: _emscripten_get_now,
    /** @export */ emscripten_has_asyncify: _emscripten_has_asyncify,
    /** @export */ emscripten_out: _emscripten_out,
    /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
    /** @export */ emscripten_trace_record_allocation: _emscripten_trace_record_allocation,
    /** @export */ emscripten_trace_record_free: _emscripten_trace_record_free,
    /** @export */ emscripten_trace_record_reallocation: _emscripten_trace_record_reallocation,
    /** @export */ emscripten_unwind_to_js_event_loop: _emscripten_unwind_to_js_event_loop,
    /** @export */ environ_get: _environ_get,
    /** @export */ environ_sizes_get: _environ_sizes_get,
    /** @export */ exit: _exit,
    /** @export */ getentropy: _getentropy,
    /** @export */ memory: wasmMemory,
    /** @export */ proc_exit: _proc_exit,
    /** @export */ strftime_l: _strftime_l
  };
}

var wasmExports = createWasm();

var ___wasm_call_ctors = createExportWrapper("__wasm_call_ctors", 0);

var ___getTypeName = createExportWrapper("__getTypeName", 1);

var __embind_initialize_bindings = createExportWrapper("_embind_initialize_bindings", 0);

var _free = Module["_free"] = createExportWrapper("free", 1);

var _malloc = Module["_malloc"] = createExportWrapper("malloc", 1);

var _pthread_self = () => (_pthread_self = wasmExports["pthread_self"])();

var _fflush = createExportWrapper("fflush", 1);

var __emscripten_tls_init = createExportWrapper("_emscripten_tls_init", 0);

var __emscripten_thread_init = createExportWrapper("_emscripten_thread_init", 6);

var __emscripten_thread_crashed = createExportWrapper("_emscripten_thread_crashed", 0);

var _emscripten_main_thread_process_queued_calls = createExportWrapper("emscripten_main_thread_process_queued_calls", 0);

var _emscripten_main_runtime_thread_id = createExportWrapper("emscripten_main_runtime_thread_id", 0);

var _emscripten_proxy_execute_queue = createExportWrapper("emscripten_proxy_execute_queue", 1);

var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"])();

var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"])();

var _emscripten_proxy_finish = createExportWrapper("emscripten_proxy_finish", 1);

var __emscripten_run_on_main_thread_js = createExportWrapper("_emscripten_run_on_main_thread_js", 5);

var __emscripten_thread_free_data = createExportWrapper("_emscripten_thread_free_data", 1);

var __emscripten_thread_exit = createExportWrapper("_emscripten_thread_exit", 1);

var _sbrk = createExportWrapper("sbrk", 1);

var __emscripten_check_mailbox = createExportWrapper("_emscripten_check_mailbox", 0);

var __emscripten_tempret_set = createExportWrapper("_emscripten_tempret_set", 1);

var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports["emscripten_stack_init"])();

var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"])(a0, a1);

var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"])();

var __emscripten_stack_restore = a0 => (__emscripten_stack_restore = wasmExports["_emscripten_stack_restore"])(a0);

var __emscripten_stack_alloc = a0 => (__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"])(a0);

var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();

var ___cxa_is_pointer_type = createExportWrapper("__cxa_is_pointer_type", 1);

var __wasmfs_opfs_record_entry = createExportWrapper("_wasmfs_opfs_record_entry", 3);

var _wasmfs_flush = createExportWrapper("wasmfs_flush", 0);

var dynCall_jii = Module["dynCall_jii"] = createExportWrapper("dynCall_jii", 3);

var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji", 5);

var dynCall_jiij = Module["dynCall_jiij"] = createExportWrapper("dynCall_jiij", 5);

var dynCall_jiiji = Module["dynCall_jiiji"] = createExportWrapper("dynCall_jiiji", 6);

var dynCall_viijii = Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii", 7);

var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij", 7);

var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj", 9);

var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj", 10);

var dynCall_ji = Module["dynCall_ji"] = createExportWrapper("dynCall_ji", 2);

var dynCall_iiiij = Module["dynCall_iiiij"] = createExportWrapper("dynCall_iiiij", 6);

var dynCall_iij = Module["dynCall_iij"] = createExportWrapper("dynCall_iij", 4);

var ___heap_base = Module["___heap_base"] = 293296;

function applySignatureConversions(wasmExports) {
  wasmExports = Object.assign({}, wasmExports);
  var makeWrapper_pp = f => a0 => f(a0) >>> 0;
  var makeWrapper_p = f => () => f() >>> 0;
  var makeWrapper_pP = f => a0 => f(a0) >>> 0;
  wasmExports["__getTypeName"] = makeWrapper_pp(wasmExports["__getTypeName"]);
  wasmExports["malloc"] = makeWrapper_pp(wasmExports["malloc"]);
  wasmExports["pthread_self"] = makeWrapper_p(wasmExports["pthread_self"]);
  wasmExports["emscripten_main_runtime_thread_id"] = makeWrapper_p(wasmExports["emscripten_main_runtime_thread_id"]);
  wasmExports["emscripten_stack_get_base"] = makeWrapper_p(wasmExports["emscripten_stack_get_base"]);
  wasmExports["emscripten_stack_get_end"] = makeWrapper_p(wasmExports["emscripten_stack_get_end"]);
  wasmExports["sbrk"] = makeWrapper_pP(wasmExports["sbrk"]);
  wasmExports["_emscripten_stack_alloc"] = makeWrapper_pp(wasmExports["_emscripten_stack_alloc"]);
  wasmExports["emscripten_stack_get_current"] = makeWrapper_p(wasmExports["emscripten_stack_get_current"]);
  return wasmExports;
}

var missingLibrarySymbols = [ "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertU32PairToI53", "getTempRet0", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "emscriptenLog", "runEmAsmFunction", "jstoi_q", "listenOnce", "autoResumeAudioContext", "runtimeKeepalivePop", "asmjsMangle", "asyncLoad", "alignMemory", "mmapAlloc", "getNativeTypeSize", "STACK_SIZE", "STACK_ALIGN", "POINTER_SIZE", "ASSERTIONS", "getCFunc", "ccall", "cwrap", "uleb128Encode", "sigToWasmTypes", "generateFuncType", "convertJsFunctionToWasm", "getEmptyTableSlot", "updateTableMap", "getFunctionAddress", "addFunction", "removeFunction", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "intArrayToString", "AsciiToString", "stringToNewUTF8", "stringToUTF8OnStack", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSizeCallingThread", "setCanvasElementSizeMainThread", "setCanvasElementSize", "getCanvasSizeCallingThread", "getCanvasSizeMainThread", "getCanvasElementSize", "jsStackTrace", "getCallstack", "convertPCtoSourceLocation", "checkWasiClock", "flush_NO_FILESYSTEM", "wasiRightsToMuslOFlags", "wasiOFlagsToMuslOFlags", "createDyncallWrapper", "safeSetTimeout", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "getPromise", "makePromise", "idsToPromises", "makePromiseCallback", "findMatchingCatch", "Browser_asyncPrepareDataCounter", "setMainLoop", "FS_createPreloadedFile", "FS_modeStringToFlags", "FS_getMode", "FS_unlink", "FS_createDataFile", "FS_mknod", "FS_create", "FS_writeFile", "FS_mkdir", "FS_mkdirTree", "wasmfsNodeConvertNodeCode", "wasmfsTry", "wasmfsNodeFixStat", "wasmfsNodeLstat", "wasmfsNodeFstat", "heapObjectForWebGLType", "toTypedArrayIndex", "webgl_enable_ANGLE_instanced_arrays", "webgl_enable_OES_vertex_array_object", "webgl_enable_WEBGL_draw_buffers", "webgl_enable_WEBGL_multi_draw", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "colorChannelsInGlTextureFormat", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "__glGetActiveAttribOrUniform", "writeGLArray", "emscripten_webgl_destroy_context_before_on_calling_thread", "registerWebGlEventCallback", "runAndAbortIfError", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "writeStringToMemory", "writeAsciiToMemory", "setErrNo", "demangle", "stackTrace", "getFunctionArgsName", "requireRegisteredType", "createJsInvokerSignature", "init_embind", "getBasestPointer", "registerInheritedInstance", "unregisterInheritedInstance", "getInheritedInstance", "getInheritedInstanceCount", "getLiveInheritedInstances", "enumReadValueFromPointer", "genericPointerToWireType", "constNoSmartPtrRawPointerToWireType", "nonConstNoSmartPtrRawPointerToWireType", "init_RegisteredPointer", "RegisteredPointer", "RegisteredPointer_fromWireType", "runDestructor", "releaseClassHandle", "detachFinalizer", "attachFinalizer", "makeClassHandle", "init_ClassHandle", "ClassHandle", "throwInstanceAlreadyDeleted", "flushPendingDeletes", "setDelayFunction", "RegisteredClass", "shallowCopyInternalPointer", "downcastPointer", "upcastPointer", "validateThis", "char_0", "char_9", "makeLegalFunctionName", "getStringOrSymbol", "emval_get_global", "emval_returnValue", "emval_lookupTypes", "emval_addMethodCaller" ];

missingLibrarySymbols.forEach(missingLibrarySymbol);

var unexportedSymbols = [ "run", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "addOnPostRun", "addRunDependency", "removeRunDependency", "out", "err", "callMain", "abort", "wasmMemory", "wasmExports", "GROWABLE_HEAP_I8", "GROWABLE_HEAP_U8", "GROWABLE_HEAP_I16", "GROWABLE_HEAP_U16", "GROWABLE_HEAP_I32", "GROWABLE_HEAP_U32", "GROWABLE_HEAP_F32", "GROWABLE_HEAP_F64", "writeStackCookie", "checkStackCookie", "convertI32PairToI53Checked", "stackSave", "stackRestore", "stackAlloc", "setTempRet0", "ptrToString", "zeroMemory", "exitJS", "getHeapMax", "growMemory", "ENV", "MONTH_DAYS_REGULAR", "MONTH_DAYS_LEAP", "MONTH_DAYS_REGULAR_CUMULATIVE", "MONTH_DAYS_LEAP_CUMULATIVE", "isLeapYear", "ydayFromDate", "arraySum", "addDays", "ERRNO_CODES", "ERRNO_MESSAGES", "DNS", "Protocols", "Sockets", "initRandomFill", "randomFill", "timers", "warnOnce", "readEmAsmArgsArray", "readEmAsmArgs", "runMainThreadEmAsm", "jstoi_s", "getExecutableName", "dynCallLegacy", "getDynCaller", "dynCall", "handleException", "keepRuntimeAlive", "runtimeKeepalivePush", "callUserCallback", "maybeExit", "HandleAllocator", "wasmTable", "noExitRuntime", "freeTableIndexes", "functionsInTableMap", "setValue", "getValue", "PATH", "PATH_FS", "UTF8Decoder", "UTF8ArrayToString", "UTF8ToString", "stringToUTF8Array", "stringToUTF8", "lengthBytesUTF8", "intArrayFromString", "stringToAscii", "UTF16Decoder", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "writeArrayToMemory", "JSEvents", "specialHTMLTargets", "findCanvasEventTarget", "currentFullscreenStrategy", "restoreOldWindowedStyle", "UNWIND_CACHE", "ExitStatus", "getEnvStrings", "promiseMap", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "Browser", "getPreloadedImageData__data", "wget", "preloadPlugins", "FS_stdin_getChar_buffer", "FS_stdin_getChar", "FS_createPath", "FS_createDevice", "FS_readFile", "MEMFS", "wasmFSPreloadedFiles", "wasmFSPreloadedDirs", "wasmFSPreloadingFlushed", "wasmFSDevices", "wasmFSDeviceStreams", "FS", "wasmFS$JSMemoryFiles", "wasmFS$backends", "wasmfsNodeIsWindows", "wasmfsOPFSDirectoryHandles", "wasmfsOPFSFileHandles", "wasmfsOPFSAccessHandles", "wasmfsOPFSBlobs", "wasmfsOPFSProxyFinish", "wasmfsOPFSGetOrCreateFile", "wasmfsOPFSGetOrCreateDir", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "miniTempWebGLIntBuffers", "GL", "AL", "GLUT", "EGL", "GLEW", "IDBStore", "SDL", "SDL_gfx", "allocateUTF8", "allocateUTF8OnStack", "print", "printErr", "EmscriptenTrace", "traceConfigure", "traceLogMessage", "traceMark", "traceEnterContext", "PThread", "terminateWorker", "killThread", "cleanupThread", "registerTLSInit", "cancelThread", "spawnThread", "exitOnMainThread", "proxyToMainThread", "proxiedJSCallArgs", "invokeEntryPoint", "checkMailbox", "InternalError", "BindingError", "throwInternalError", "throwBindingError", "registeredTypes", "awaitingDependencies", "typeDependencies", "tupleRegistrations", "structRegistrations", "sharedRegisterType", "whenDependentTypesAreResolved", "embind_charCodes", "embind_init_charCodes", "readLatin1String", "getTypeName", "getFunctionName", "heap32VectorToArray", "usesDestructorStack", "createJsInvoker", "UnboundTypeError", "PureVirtualError", "GenericWireTypeSize", "EmValType", "throwUnboundTypeError", "ensureOverloadTable", "exposePublicSymbol", "replacePublicSymbol", "extendError", "createNamedFunction", "embindRepr", "registeredInstances", "registeredPointers", "registerType", "integerReadValueFromPointer", "floatReadValueFromPointer", "readPointer", "runDestructors", "newFunc", "craftInvokerFunction", "embind__requireFunction", "finalizationRegistry", "detachFinalizer_deps", "deletionQueue", "delayFunction", "emval_freelist", "emval_handles", "emval_symbols", "init_emval", "count_emval_handles", "Emval", "emval_methodCallers", "reflectConstruct" ];

unexportedSymbols.forEach(unexportedRuntimeSymbol);

var calledRun;

dependenciesFulfilled = function runCaller() {
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
};

function stackCheckInit() {
  assert(!ENVIRONMENT_IS_PTHREAD);
  _emscripten_stack_init();
  writeStackCookie();
}

function run() {
  if (runDependencies > 0) {
    return;
  }
  if (!ENVIRONMENT_IS_PTHREAD) stackCheckInit();
  if (ENVIRONMENT_IS_PTHREAD) {
    readyPromiseResolve(Module);
    initRuntime();
    startWorker(Module);
    return;
  }
  preRun();
  if (runDependencies > 0) {
    return;
  }
  function doRun() {
    if (calledRun) return;
    calledRun = true;
    Module["calledRun"] = true;
    if (ABORT) return;
    initRuntime();
    readyPromiseResolve(Module);
    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
    assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
    postRun();
  }
  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(function() {
      setTimeout(function() {
        Module["setStatus"]("");
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = x => {
    has = true;
  };
  try {
    _wasmfs_flush();
  } catch (e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
    warnOnce("(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)");
  }
}

if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
  while (Module["preInit"].length > 0) {
    Module["preInit"].pop()();
  }
}

run();

moduleRtn = readyPromise;

for (const prop of Object.keys(Module)) {
  if (!(prop in moduleArg)) {
    Object.defineProperty(moduleArg, prop, {
      configurable: true,
      get() {
        abort(`Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
      }
    });
  }
}


  return moduleRtn;
}
);
})();
export default Module;
var isPthread = globalThis.self?.name === 'em-pthread';
// When running as a pthread, construct a new instance on startup
isPthread && Module();
