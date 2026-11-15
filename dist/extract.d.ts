/**
 * Where the archive's bytes come from. The archive is read in slices on demand, never copied
 * whole into wasm memory.
 *
 * Browser (dedicated worker):
 *   const reader = new FileReaderSync();
 *   const source = { size: file.size, read: (offset, length) =>
 *     new Uint8Array(reader.readAsArrayBuffer(file.slice(offset, offset + length))) };
 */
export interface ArchiveSource {
	/** Total size of the archive in bytes. */
	readonly size: number;
	/**
	 * Returns up to `length` bytes starting at `offset`. Must not throw: return null if the data
	 * cannot be read, and the current operation fails with an error instead.
	 */
	read(offset: number, length: number): Uint8Array | null;
}

export type ArchiveEntry = {
	path: string;
	isFile: boolean;
	/** Uncompressed size in bytes, or -1 when the archive does not record it up front. */
	size: number;
};

export type ExtractError = { error: string };

export interface ExtractModule {
	/** Returns a handle, or 0 if the archive cannot be opened (see last_open_error). */
	open_archive(source: ArchiveSource): number;
	last_open_error(): string;
	/** Advances to the next entry: the entry, an error, or null at the end of the archive. */
	next_entry(handle: number): ArchiveEntry | ExtractError | null;
	/** Reads the whole current entry into a JS-owned Uint8Array. */
	read_entry(handle: number): Uint8Array | ExtractError;
	/** Skips the current entry's data (a seek for zip and non-solid RAR). */
	skip_entry(handle: number): boolean;
	close_archive(handle: number): void;
	/** e.g. "libarchive 3.8.11 zlib/1.3.2 bz2lib/1.0.6" */
	libarchive_version(): string;
	/** Current wasm heap size, for memory diagnostics. */
	memory_bytes(): number;
}

export default function init(options?: unknown): Promise<ExtractModule>;
