import { MainModule } from "./extract";

type Extended = {
  HEAPU8: Uint8Array;
};

export default function initialize(): Promise<MainModule & Extended>;
