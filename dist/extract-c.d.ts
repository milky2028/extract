// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
interface WasmModule {
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
interface EmbindModule {
  extract(_0: EmbindString, _1: EmbindString, _2: boolean, _3: () => void, _4: (errorMessage: string) => void, _5: (buffer: any, name: string, size: number) => void): void;
  mount_filesystem(_0: any): void;
}

export type MainModule = WasmModule & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
