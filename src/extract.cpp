// Streaming archive reader built on libarchive.
//
// The archive is never copied into wasm memory and there is no filesystem layer: libarchive pulls
// bytes through read/seek/skip callbacks from a JS "source" object:
//
//   { size: number, read(offset: number, length: number): Uint8Array | null }
//
// In a browser worker `read` slices the user's File with FileReaderSync; in Node it uses
// fs.readSync. Peak wasm memory is one read block plus the entry being extracted, whatever the
// archive size, which is what makes archives over 2 GB (and over 4 GB) work.
//
// The seek callback matters: with it libarchive uses its seekable zip reader, which reads the
// central directory once and jumps between entries, so listing a multi-GB zip reads a few MB.

#include <archive.h>
#include <archive_entry.h>
#include <emscripten/bind.h>
#include <emscripten/heap.h>
#include <emscripten/val.h>

#include <algorithm>
#include <cerrno>
#include <cstdint>
#include <cstdio>
#include <string>
#include <vector>

using emscripten::val;

namespace {

// Larger blocks mean fewer JS round trips; smaller blocks mean less wasted reading when the zip
// reader jumps between entries. 256 KiB measured well for both.
constexpr size_t READ_BLOCK_SIZE = 256 * 1024;

struct Reader {
  archive* arch = nullptr;
  val source = val::undefined();
  int64_t size = 0;
  int64_t position = 0;
  std::vector<uint8_t> block = std::vector<uint8_t>(READ_BLOCK_SIZE);
  int64_t current_entry_size = -1;
};

std::string last_open_error;

Reader* to_reader(uintptr_t handle) {
  return reinterpret_cast<Reader*>(handle);
}

std::string error_of(archive* arch, const char* fallback) {
  const char* message = archive_error_string(arch);
  return message ? message : fallback;
}

val error_result(archive* arch, const char* fallback) {
  val result = val::object();
  result.set("error", error_of(arch, fallback));
  return result;
}

la_ssize_t read_callback(archive* arch, void* client_data, const void** buffer) {
  auto* reader = static_cast<Reader*>(client_data);
  *buffer = reader->block.data();

  const int64_t remaining = reader->size - reader->position;
  if (remaining <= 0) {
    return 0;
  }

  const auto wanted = static_cast<size_t>(std::min<int64_t>(remaining, reader->block.size()));
  // Positions are passed as doubles: exact up to 2^53 bytes (8 PiB).
  val chunk = reader->source.call<val>("read", static_cast<double>(reader->position), static_cast<double>(wanted));
  if (chunk.isNull() || chunk.isUndefined()) {
    archive_set_error(arch, EIO, "could not read the archive file");
    return ARCHIVE_FATAL;
  }

  const size_t got = std::min(chunk["length"].as<size_t>(), wanted);
  if (got == 0) {
    archive_set_error(arch, EIO, "the archive file ended early");
    return ARCHIVE_FATAL;
  }

  // One copy, straight from the JS buffer into wasm memory.
  val(emscripten::typed_memory_view(got, reader->block.data()))
      .call<void>("set", got == chunk["length"].as<size_t>() ? chunk : chunk.call<val>("subarray", 0, got));
  reader->position += static_cast<int64_t>(got);
  return static_cast<la_ssize_t>(got);
}

la_int64_t seek_callback(archive*, void* client_data, la_int64_t offset, int whence) {
  auto* reader = static_cast<Reader*>(client_data);
  int64_t target = offset;
  if (whence == SEEK_CUR) {
    target += reader->position;
  } else if (whence == SEEK_END) {
    target += reader->size;
  }

  if (target < 0) {
    return ARCHIVE_FATAL;
  }

  reader->position = target;
  return target;
}

la_int64_t skip_callback(archive*, void* client_data, la_int64_t request) {
  auto* reader = static_cast<Reader*>(client_data);
  const int64_t skipped = std::max<int64_t>(0, std::min<int64_t>(request, reader->size - reader->position));
  reader->position += skipped;
  return skipped;
}

}  // namespace

// Opens an archive from a JS source ({ size, read(offset, length) }).
// Returns an opaque handle, or 0 on failure (see last_open_error()).
// `read` must not throw: return null if the data cannot be read.
uintptr_t open_archive(val source) {
  auto* reader = new Reader();
  reader->source = source;
  reader->size = static_cast<int64_t>(source["size"].as<double>());
  reader->arch = archive_read_new();

  archive* arch = reader->arch;
  archive_read_support_filter_all(arch);
  archive_read_support_format_zip(arch);
  archive_read_support_format_rar(arch);
  archive_read_support_format_rar5(arch);

  archive_read_set_callback_data(arch, reader);
  archive_read_set_read_callback(arch, read_callback);
  archive_read_set_seek_callback(arch, seek_callback);
  archive_read_set_skip_callback(arch, skip_callback);

  if (archive_read_open1(arch) != ARCHIVE_OK) {
    last_open_error = error_of(arch, "could not open archive");
    archive_read_free(arch);
    delete reader;
    return 0;
  }

  return reinterpret_cast<uintptr_t>(reader);
}

std::string last_open_error_message() {
  return last_open_error;
}

void close_archive(uintptr_t handle) {
  Reader* reader = to_reader(handle);
  if (reader == nullptr) {
    return;
  }

  archive_read_free(reader->arch);
  delete reader;
}

// Advances to the next entry.
// Returns null at the end, { error } on failure, otherwise { path, isFile, size }.
// size is -1 when the archive does not record it up front.
val next_entry(uintptr_t handle) {
  Reader* reader = to_reader(handle);
  archive_entry* entry = nullptr;

  const int status = archive_read_next_header(reader->arch, &entry);
  if (status == ARCHIVE_EOF) {
    return val::null();
  }

  if (status < ARCHIVE_WARN) {
    return error_result(reader->arch, "could not read entry header");
  }

  reader->current_entry_size = archive_entry_size_is_set(entry) ? archive_entry_size(entry) : -1;

  const char* utf8_path = archive_entry_pathname_utf8(entry);
  const char* raw_path = archive_entry_pathname(entry);

  val result = val::object();
  result.set("path", std::string(utf8_path ? utf8_path : (raw_path ? raw_path : "")));
  result.set("isFile", archive_entry_filetype(entry) == AE_IFREG);
  result.set("size", static_cast<double>(reader->current_entry_size));
  return result;
}

// Reads the whole current entry into a new JS Uint8Array (owned by JS, so nothing to free).
// Returns { error } on failure.
val read_entry(uintptr_t handle) {
  Reader* reader = to_reader(handle);
  std::vector<uint8_t> data;
  if (reader->current_entry_size > 0) {
    data.reserve(static_cast<size_t>(reader->current_entry_size));
  }

  // Heap, not stack: Emscripten's default stack is only 64 KiB.
  std::vector<uint8_t> block(64 * 1024);

  for (;;) {
    const la_ssize_t read = archive_read_data(reader->arch, block.data(), block.size());
    if (read == 0) {
      break;
    }

    if (read < 0) {
      return error_result(reader->arch, "could not read entry data");
    }

    data.insert(data.end(), block.begin(), block.begin() + read);
  }

  return val::global("Uint8Array").new_(emscripten::typed_memory_view(data.size(), data.data()));
}

// Skips the current entry's data without extracting it.
bool skip_entry(uintptr_t handle) {
  Reader* reader = to_reader(handle);
  return archive_read_data_skip(reader->arch) == ARCHIVE_OK;
}

// Current size of the wasm heap, for memory diagnostics.
double memory_bytes() {
  return static_cast<double>(emscripten_get_heap_size());
}

std::string libarchive_version() {
  return archive_version_details();
}

EMSCRIPTEN_BINDINGS(extract) {
  emscripten::function("open_archive", &open_archive);
  emscripten::function("last_open_error", &last_open_error_message);
  emscripten::function("close_archive", &close_archive);
  emscripten::function("next_entry", &next_entry);
  emscripten::function("read_entry", &read_entry);
  emscripten::function("skip_entry", &skip_entry);
  emscripten::function("libarchive_version", &libarchive_version);
  emscripten::function("memory_bytes", &memory_bytes);
}
