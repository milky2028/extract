// Runs before `npm pack` / `npm publish`: dist/ is not committed, so make sure a complete build is
// present and that it was built with zlib and bzip2 (0.19.x shipped without zlib, which silently
// broke every deflate-compressed zip).
import { existsSync } from 'node:fs';

const required = ['extract.js', 'extract.wasm', 'extract.d.ts', 'extract.node.js', 'extract.node.wasm'];
const missing = required.filter((file) => !existsSync(new URL(`../dist/${file}`, import.meta.url)));
if (missing.length > 0) {
	console.error(`dist/ is incomplete (missing ${missing.join(', ')}). Build it first: see README "Building".`);
	process.exit(1);
}

const { default: init } = await import('../dist/extract.node.js');
const version = (await init()).libarchive_version();
for (const library of ['zlib/', 'bz2lib/']) {
	if (!version.includes(library)) {
		console.error(`dist/ was built without ${library.slice(0, -1)} (${version}). Rebuild libarchive with scripts/build-libarchive.sh.`);
		process.exit(1);
	}
}

console.log(`dist/ OK: ${version}`);
