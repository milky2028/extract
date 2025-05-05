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
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
export type ExtractParams = {
  archive_source_path: EmbindString,
  extract_data: boolean,
  on_completion: VoidFunction,
  on_failure: (errorMessage: string) => void,
  on_entry: (name: string, buffer?: Uint8Array) => void
};

interface EmbindModule {
  extract(_0: ExtractParams): void;
  mount_filesystem(): boolean;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
