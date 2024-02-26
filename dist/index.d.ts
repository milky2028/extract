import { MainModule } from "./extract";

type Extended = {
  getExceptionMessage(error: Error): [string, string];
  HEAPU8: Uint8Array;
};

export default function initialize(): Promise<MainModule & Extended>;
