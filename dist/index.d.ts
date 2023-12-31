type ReadCallback = (path: string, buffer: Uint8Array) => void;

type LLVMStorageType =
  | "i8"
  | "i16"
  | "i32"
  | "i64"
  | "float"
  | "double"
  | "i8*"
  | "i16*"
  | "i32*"
  | "i64*"
  | "float*"
  | "double*";

type Extended = {
  _malloc(size: number): number;
  _free(ptr: number): void;
  addFunction(func: Function, types: string): number;
  UTF8ToString(ptr: number, maxLength?: number): string;

  extract_book(
    file_name:
      | ArrayBuffer
      | Uint8Array
      | Uint8ClampedArray
      | Int8Array
      | string,
    file_ptr: number,
    file_size: number,
    read_callback_ptr: number
  ): boolean;
  get_buffer(ptr: number, size: number): Uint8Array;

  HEAPU8: Uint8Array;
  FS: {
    writeFile(path: string, data: File): number;
  };
};

export default function initialize(): Promise<Extended>;
