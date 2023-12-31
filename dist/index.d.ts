import { MainModule } from "./extract";

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

  HEAPU8: Uint8Array;

  setValue(ptr: number, value: ArrayLike<number>, type: LLVMStorageType): void;
  getValue(ptr: number, type: LLVMStorageType): void;

  FS: {
    writeFile(path: string, data: File): number;
  };
};

export default function initialize(): Promise<Extended & MainModule>;
