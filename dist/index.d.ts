import { MainModule } from "./extract";

type Extended = {
  _malloc(size: number): number;

  HEAPU8: {
    set(bytes: ArrayLike<number>, ptr: number);
  };

  FS: {
    writeFile(path: string, data: File): number;
  };
};

export default function initialize(): Promise<Extended & MainModule>;
