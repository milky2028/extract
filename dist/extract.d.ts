export interface MainModule {
  open_archive(_0: number, _1: number): number;
  close_archive(_0: number): void;
  get_next_entry(_0: number): number;
  read_entry_data(_0: number, _1: number): number;
  skip_extraction(_0: number): void;
  get_buffer(_0: number, _1: number): any;
}
