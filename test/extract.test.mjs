// Run: node --test test/   (uses dist/extract.node.js, which reads the real filesystem)
// Optional: EXTRACT_SAMPLES="/a.cbz:/b.cbr" also checks real archives (headers + every image decodes as JPEG/PNG/WebP).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { default: init } = await import('../dist/extract.node.js');
const wasm = await init();

const sha1 = (data) => createHash('sha1').update(data).digest('hex');

function readAll(path) {
	const handle = wasm.open_archive(path);
	assert.notEqual(handle, 0, `open failed: ${wasm.last_open_error()}`);
	const entries = new Map();
	try {
		for (;;) {
			const entry = wasm.next_entry(handle);
			if (entry === null) break;
			assert.equal(entry.error, undefined, entry.error);
			if (!entry.isFile) continue;
			const data = wasm.read_entry(handle);
			assert.ok(data instanceof Uint8Array, data?.error);
			entries.set(entry.path, data);
		}
	} finally {
		wasm.close_archive(handle);
	}
	return entries;
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
	return { dir, files };
}

const { dir, files } = makeFixture();

for (const kind of ['stored', 'deflate', 'bzip2']) {
	test(`${kind} zip entries round-trip byte for byte, including same-named files in different folders`, () => {
		const entries = readAll(join(dir, `${kind}.zip`));
		assert.deepEqual([...entries.keys()].sort(), Object.keys(files).sort());
		for (const [name, data] of Object.entries(files)) {
			assert.equal(sha1(entries.get(name)), sha1(data), name);
		}
	});
}

test('a file that is not an archive fails to open with a message instead of crashing', () => {
	const handle = wasm.open_archive(join(dir, 'garbage.cbz'));
	if (handle === 0) {
		assert.match(wasm.last_open_error(), /.+/);
		return;
	}
	const entry = wasm.next_entry(handle);
	wasm.close_archive(handle);
	assert.ok(entry === null || typeof entry.error === 'string');
});

test('a missing file fails to open', () => {
	assert.equal(wasm.open_archive(join(dir, 'nope.cbz')), 0);
	assert.match(wasm.last_open_error(), /.+/);
});

const isImage = (d) =>
	(d[0] === 0xff && d[1] === 0xd8 && d[d.length - 2] === 0xff && d[d.length - 1] === 0xd9) ||
	(d[0] === 0x89 && d[1] === 0x50 && d[2] === 0x4e && d[3] === 0x47) ||
	(d[0] === 0x52 && d[1] === 0x49 && d[8] === 0x57 && d[9] === 0x45);

for (const sample of (process.env.EXTRACT_SAMPLES ?? '').split(':').filter(Boolean)) {
	test(`real archive: ${sample}`, { timeout: 30 * 60_000 }, () => {
		const handle = wasm.open_archive(sample);
		assert.notEqual(handle, 0, wasm.last_open_error());
		let images = 0;
		let largest = 0;
		const started = performance.now();
		let firstImageMs;
		try {
			for (;;) {
				const entry = wasm.next_entry(handle);
				if (entry === null) break;
				assert.equal(entry.error, undefined, entry.error);
				if (!entry.isFile || !/\.(jpe?g|png|webp)$/i.test(entry.path) || entry.path.includes('/._')) {
					wasm.skip_entry(handle);
					continue;
				}
				const data = wasm.read_entry(handle);
				assert.ok(data instanceof Uint8Array, data?.error);
				assert.ok(isImage(data), `${entry.path} is not a valid image`);
				firstImageMs ??= performance.now() - started;
				largest = Math.max(largest, data.length);
				images++;
			}
		} finally {
			wasm.close_archive(handle);
		}
		const heapMB = wasm.memory_bytes() / 2 ** 20;
		console.log(`  ${images} images, first after ${firstImageMs?.toFixed(0)} ms, total ${((performance.now() - started) / 1000).toFixed(1)} s, largest page ${(largest / 2 ** 20).toFixed(1)} MB${heapMB ? `, wasm heap ${heapMB.toFixed(0)} MB` : ''}`);
		assert.ok(images > 0);
	});
}
