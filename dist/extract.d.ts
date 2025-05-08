// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
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
  __ZN6__asan9FakeStack17AddrIsInFakeStackEm(_0: number, _1: number): number;
  __ZN6__asan9FakeStack8AllocateEmmm(_0: number, _1: number, _2: number, _3: number): number;
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
  do_leak_check_fatal(): void;
  do_leak_check_recoverable(): number;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
