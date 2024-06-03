// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
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
     */
    function UTF8ToString(ptr: number, maxBytesToRead?: number): string;
    let HEAPF32: any;
    let HEAPF64: any;
    let HEAP_DATA_VIEW: any;
    let HEAP8: any;
    let HEAPU8: any;
    let HEAP16: any;
    let HEAPU16: any;
    let HEAP32: any;
    let HEAPU32: any;
    let HEAP64: any;
    let HEAPU64: any;
}
interface WasmModule {
  _free(_0: number): void;
  _malloc(_0: number): number;
}

interface EmbindModule {
  get_buffer(_0: number, _1: number): any;
  free_buffer(_0: number): void;
  END_OF_FILE: number;
  ENTRY_ERROR: number;
  open_archive(_0: number, _1: number): number;
  close_archive(_0: number): void;
  skip_extraction(_0: number): void;
  get_next_entry(_0: number): number;
  get_entry_size(_0: number): number;
  get_entry_name(_0: number): string;
  read_entry_data(_0: number, _1: number): number;
  entry_is_file(_0: number): boolean;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
