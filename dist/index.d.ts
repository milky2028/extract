import { MainModule } from "./extract";

type ReadCallback = (path: string, buffer: Uint8Array) => void;

// type Vector =

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

  // extract_book(
  //   archive_file_ptr: number,
  //   archive_file_size: number,
  //   read_callback_ptr: number
  // ): boolean;
  // get_buffer(buffer_ptr: number, buffer_size: number): Uint8Array;
  // list_files(archive_file_ptr: number, archive_file_size: number): string[];

  HEAPU8: Uint8Array;
  FS: {
    writeFile(path: string, data: File): number;
  };
};

export default function initialize(): Promise<Extended & MainModule>;
