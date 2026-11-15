// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
interface WasmModule {
  ___set_stack_limits(_0: number, _1: number): void;
}

export type ArchiveSource = { readonly size: number; read(offset: number, length: number): Uint8Array | null };

export type ReadEntryResult = {
  data?: Uint8Array | undefined,
  error?: string | undefined
};

export type OpenResult = {
  handle?: number | undefined,
  error?: string | undefined
};

export type ArchiveEntry = {
  path: string,
  isFile: boolean,
  size: number
};

export type NextEntryResult = {
  entry?: ArchiveEntry | undefined,
  error?: string | undefined
};

interface EmbindModule {
  open_archive(_0: ArchiveSource): OpenResult;
  close_archive(_0: number): void;
  read_entry(_0: number): ReadEntryResult;
  skip_entry(_0: number): boolean;
  next_entry(_0: number): NextEntryResult;
  memory_bytes(): number;
  libarchive_version(): string;
}

export type MainModule = WasmModule & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
