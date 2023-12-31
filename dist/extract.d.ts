export interface stringVector {
  size(): number;
  push_back(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  resize(_0: number, _1: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  set(_0: number, _1: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): boolean;
  get(_0: number): any;
  delete(): void;
}

export interface MainModule {
  stringVector: {new(): stringVector};
  extract_book(_0: number, _1: number, _2: number): boolean;
  list_files(_0: number, _1: number): stringVector;
  get_buffer(_0: number, _1: number): any;
}
