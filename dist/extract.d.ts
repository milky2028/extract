export interface VectorOfStrings {
  size(): number;
  push_back(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  resize(_0: number, _1: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  set(_0: number, _1: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): boolean;
  get(_0: number): any;
  delete(): void;
}

export interface MainModule {
  VectorOfStrings: {new(): VectorOfStrings};
  get_archive(_0: number, _1: number): number;
  list_all_entries(_0: number, _1: number): VectorOfStrings;
  extract_chunks(_0: number, _1: number, _2: number): void;
  get_buffer(_0: number, _1: number): any;
}
