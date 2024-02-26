import { MainModule } from "./extract";

declare global {
  namespace WebAssembly {
    export const Exception: unknown;
  }
}

type Extended = {
  getExceptionMessage(error: typeof WebAssembly.Exception): [string, string];
  HEAPU8: Uint8Array;
};

export default function initialize(): Promise<MainModule & Extended>;
