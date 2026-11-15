// Run: node --test test/   (uses dist/extract.node.js with an fs.readSync-backed source)
// Optional: EXTRACT_SAMPLES="/a.cbz:/b.cbr" also checks real archives (headers + every image decodes as JPEG/PNG/WebP).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { closeSync, fstatSync, mkdtempSync, mkdirSync, openSync, readSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { default: init } = await import('../dist/extract.node.js');
const wasm = await init();

const sha1 = (data) => createHash('sha1').update(data).digest('hex');

/** The source interface the library reads through: { size, read(offset, length) }. */
function fileSource(path) {
	const fd = openSync(path, 'r');
	const source = {
		size: fstatSync(fd).size,
		bytesRead: 0,
		read(offset, length) {
			const buffer = Buffer.allocUnsafe(length);
			const read = readSync(fd, buffer, 0, length, offset);
			source.bytesRead += read;
			return new Uint8Array(buffer.buffer, buffer.byteOffset, read);
		},
		close: () => closeSync(fd)
	};
	return source;
}

/** Opens an archive or fails the test with libarchive's message. */
function open(source) {
	const { handle, error } = wasm.open_archive(source);
	assert.equal(error, undefined, error);
	assert.equal(typeof handle, 'number');
	return handle;
}

/** Iterates entries until the end of the archive, failing the test on an error. */
function* entries(handle) {
	for (;;) {
		const { entry, error } = wasm.next_entry(handle);
		assert.equal(error, undefined, error);
		if (!entry) return;
		yield entry;
	}
}

function readAll(path) {
	const source = fileSource(path);
	const handle = open(source);
	const files = new Map();
	try {
		for (const entry of entries(handle)) {
			if (!entry.isFile) continue;
			const { data, error } = wasm.read_entry(handle);
			assert.equal(error, undefined, error);
			assert.ok(data instanceof Uint8Array);
			files.set(entry.path, data);
		}
	} finally {
		wasm.close_archive(handle);
		source.close();
	}
	return files;
}

function makeFixture() {
	const dir = mkdtempSync(join(tmpdir(), 'extract-test-'));
	const src = join(dir, 'src');
	const files = {
		'Chapter 1/01.jpg': Buffer.concat([Buffer.alloc(300_000, 1), Buffer.from(createHash('sha512').update('a').digest())]),
		'Chapter 2/01.jpg': Buffer.concat([Buffer.alloc(300_000, 2), Buffer.from(createHash('sha512').update('b').digest())]),
		'cover.png': Buffer.from('tiny file that compresses well '.repeat(40))
	};
	for (const [name, data] of Object.entries(files)) {
		mkdirSync(join(src, name, '..'), { recursive: true });
		writeFileSync(join(src, name), data);
	}
	const names = Object.keys(files);
	execFileSync('zip', ['-q', '-0', join(dir, 'stored.zip'), ...names], { cwd: src });
	execFileSync('zip', ['-q', '-9', join(dir, 'deflate.zip'), ...names], { cwd: src });
	execFileSync('zip', ['-q', '-9', '-Z', 'bzip2', join(dir, 'bzip2.zip'), ...names], { cwd: src });
	writeFileSync(join(dir, 'garbage.cbz'), Buffer.alloc(4096, 7));

	// 40 MB of incompressible pages: listing it should only touch headers.
	const big = join(dir, 'big-src');
	mkdirSync(big);
	const bigNames = [];
	for (let i = 0; i < 20; i++) {
		const name = `${String(i).padStart(3, '0')}.jpg`;
		writeFileSync(join(big, name), createHash('sha512').update(String(i)).digest().toString('hex').repeat(16_000).slice(0, 2_000_000));
		bigNames.push(name);
	}
	execFileSync('zip', ['-q', '-0', join(dir, 'big.zip'), ...bigNames], { cwd: big });
	return { dir, files };
}

const { dir, files } = makeFixture();

for (const kind of ['stored', 'deflate', 'bzip2']) {
	test(`${kind} zip entries round-trip byte for byte, including same-named files in different folders`, () => {
		const extracted = readAll(join(dir, `${kind}.zip`));
		assert.deepEqual([...extracted.keys()].sort(), Object.keys(files).sort());
		for (const [name, data] of Object.entries(files)) {
			assert.equal(sha1(extracted.get(name)), sha1(data), name);
		}
	});
}

test('results are plain objects with exactly the documented fields', () => {
	const source = fileSource(join(dir, 'stored.zip'));
	const opened = wasm.open_archive(source);
	assert.equal(typeof opened.handle, 'number');
	assert.equal(opened.error, undefined);

	const { entry, error } = wasm.next_entry(opened.handle);
	assert.equal(error, undefined);
	assert.equal(typeof entry.path, 'string');
	assert.equal(typeof entry.isFile, 'boolean');
	assert.equal(typeof entry.size, 'number');

	const read = wasm.read_entry(opened.handle);
	assert.ok(read.data instanceof Uint8Array);
	assert.equal(read.error, undefined);

	wasm.close_archive(opened.handle);
	source.close();
});

test('a file that is not an archive fails with a message instead of crashing', () => {
	const source = fileSource(join(dir, 'garbage.cbz'));
	const { handle, error } = wasm.open_archive(source);
	if (handle === undefined) {
		assert.match(error, /.+/);
	} else {
		const next = wasm.next_entry(handle);
		wasm.close_archive(handle);
		assert.ok(next.entry === undefined);
	}
	source.close();
});

test('a source whose read() fails gives an error, not a crash', () => {
	const { handle, error } = wasm.open_archive({ size: 1_000_000, read: () => null });
	assert.equal(handle, undefined);
	assert.match(error, /could not read/);
});

test('a read failure mid-archive surfaces as an error', () => {
	const real = fileSource(join(dir, 'deflate.zip'));
	let calls = 0;
	const flaky = { size: real.size, read: (offset, length) => (++calls > 1 ? null : real.read(offset, length)) };
	const opened = wasm.open_archive(flaky);
	let error = opened.error;
	if (opened.handle !== undefined) {
		for (;;) {
			const next = wasm.next_entry(opened.handle);
			if (next.error) { error = next.error; break; }
			if (!next.entry) break;
			const read = wasm.read_entry(opened.handle);
			if (read.error) { error = read.error; break; }
		}
		wasm.close_archive(opened.handle);
	}
	real.close();
	assert.match(error ?? '', /could not read/);
});

test('listing a zip seeks between headers instead of reading the whole file', () => {
	const source = fileSource(join(dir, 'big.zip'));
	const handle = open(source);
	const count = [...entries(handle)].length;
	wasm.close_archive(handle);
	source.close();
	assert.equal(count, 20);
	assert.ok(source.bytesRead < source.size / 4, `read ${source.bytesRead} of ${source.size} bytes`);
});

const isImage = (d) =>
	(d[0] === 0xff && d[1] === 0xd8 && d[d.length - 2] === 0xff && d[d.length - 1] === 0xd9) ||
	(d[0] === 0x89 && d[1] === 0x50 && d[2] === 0x4e && d[3] === 0x47) ||
	(d[0] === 0x52 && d[1] === 0x49 && d[8] === 0x57 && d[9] === 0x45);

for (const sample of (process.env.EXTRACT_SAMPLES ?? '').split(':').filter(Boolean)) {
	test(`real archive: ${sample}`, { timeout: 30 * 60_000 }, () => {
		const source = fileSource(sample);
		const handle = open(source);
		let images = 0;
		let largest = 0;
		const started = performance.now();
		let firstImageMs;
		try {
			for (const entry of entries(handle)) {
				if (!entry.isFile || !/\.(jpe?g|png|webp)$/i.test(entry.path) || entry.path.includes('/._')) {
					wasm.skip_entry(handle);
					continue;
				}
				const { data, error } = wasm.read_entry(handle);
				assert.equal(error, undefined, error);
				assert.ok(isImage(data), `${entry.path} is not a valid image`);
				firstImageMs ??= performance.now() - started;
				largest = Math.max(largest, data.length);
				images++;
			}
		} finally {
			wasm.close_archive(handle);
			source.close();
		}
		const heapMB = wasm.memory_bytes() / 2 ** 20;
		console.log(`  ${images} images, first after ${firstImageMs?.toFixed(0)} ms, total ${((performance.now() - started) / 1000).toFixed(1)} s, largest page ${(largest / 2 ** 20).toFixed(1)} MB${heapMB ? `, wasm heap ${heapMB.toFixed(0)} MB` : ''}`);
		assert.ok(images > 0);
	});
}
