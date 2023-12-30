import { MainModule } from "./extract";

type Extended = {
  FS: {
    writeFile(path: string, data: File): number;
  };
};

export default function initialize(): Promise<MainModule & Extended>;
