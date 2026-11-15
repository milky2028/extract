// Streaming archive reader built on libarchive.
//
// The archive is opened by *path*, so it is never copied into wasm memory:
//  - in a browser worker the JS side mounts the user's File with WORKERFS, which reads
//    slices on demand through FileReaderSync;
//  - under Node (tests) NODERAWFS exposes the real filesystem.
// Peak wasm memory is one read block plus the entry currently being extracted, regardless of
// archive size, which is what makes archives over 2 GB (and over 4 GB) work.

#include <archive.h>
#include <archive_entry.h>
#include <emscripten/bind.h>
#include <emscripten/heap.h>
#include <emscripten/val.h>

#include <cstdint>
#include <string>
#include <vector>

using emscripten::val;

namespace {

// Larger blocks mean fewer FileReaderSync round trips; smaller blocks mean less wasted reading
// when the zip reader seeks between entries. 256 KiB measured well for both.
constexpr size_t READ_BLOCK_SIZE = 256 * 1024;

struct Reader {
  archive* arch = nullptr;
  std::string error;
  int64_t current_size = -1;
};

std::string last_open_error;

Reader* to_reader(uintptr_t handle) {
  return reinterpret_cast<Reader*>(handle);
}

std::string error_of(archive* arch, const char* fallback) {
  const char* message = archive_error_string(arch);
  return message ? message : fallback;
}

val error_result(Reader* reader, std::string message) {
  reader->error = std::move(message);
  val result = val::object();
  result.set("error", reader->error);
  return result;
}

}  // namespace

// Returns an opaque handle, or 0 on failure (see last_open_error()).
uintptr_t open_archive(std::string path) {
  archive* arch = archive_read_new();
  archive_read_support_filter_all(arch);
  archive_read_support_format_zip(arch);
  archive_read_support_format_rar(arch);
  archive_read_support_format_rar5(arch);

  if (archive_read_open_filename(arch, path.c_str(), READ_BLOCK_SIZE) != ARCHIVE_OK) {
    last_open_error = error_of(arch, "could not open archive");
    archive_read_free(arch);
    return 0;
  }

  auto* reader = new Reader{arch, "", -1};
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
    return error_result(reader, error_of(reader->arch, "could not read entry header"));
  }

  reader->current_size = archive_entry_size_is_set(entry) ? archive_entry_size(entry) : -1;

  const char* utf8_path = archive_entry_pathname_utf8(entry);
  const char* raw_path = archive_entry_pathname(entry);

  val result = val::object();
  result.set("path", std::string(utf8_path ? utf8_path : (raw_path ? raw_path : "")));
  result.set("isFile", archive_entry_filetype(entry) == AE_IFREG);
  result.set("size", archive_entry_size_is_set(entry) ? static_cast<double>(archive_entry_size(entry)) : -1.0);
  return result;
}

// Reads the whole current entry into a new JS Uint8Array (owned by JS, so nothing to free).
// Returns { error } on failure.
val read_entry(uintptr_t handle) {
  Reader* reader = to_reader(handle);
  std::vector<uint8_t> data;
  if (reader->current_size > 0) {
    data.reserve(static_cast<size_t>(reader->current_size));
  }

  // Heap, not stack: Emscripten's default stack is only 64 KiB.
  std::vector<uint8_t> block(64 * 1024);

  for (;;) {
    const la_ssize_t read = archive_read_data(reader->arch, block.data(), block.size());
    if (read == 0) {
      break;
    }

    if (read < 0) {
      return error_result(reader, error_of(reader->arch, "could not read entry data"));
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
