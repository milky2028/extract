// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
interface WasmModule {
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
interface EmbindModule {
  extract(_0: EmbindString, _1: boolean, _2: VoidFunction, _3: (errorMessage: string) => void, _4: (name: string, buffer?: Uint8Array) => void): void;
  mount_filesystem(_0: VoidFunction): void;
}

export type MainModule = WasmModule & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
