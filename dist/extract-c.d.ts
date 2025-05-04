// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
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

export type MainModule = WasmModule & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
