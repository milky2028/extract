// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
interface WasmModule {
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

export type MainModule = WasmModule & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
