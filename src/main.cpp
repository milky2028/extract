#include <archive.h>
#include <archive_entry.h>
#include <emscripten/bind.h>
#include <stdio.h>
#include <string>

emscripten::val get_buffer(size_t buffer_ptr, size_t buffer_size) {
  const auto ptr = reinterpret_cast<uint8_t*>(buffer_ptr);
  return emscripten::val(emscripten::typed_memory_view<uint8_t>(buffer_size, ptr));
}

auto output_error(archive* active_archive, int return_code) {
  if (return_code < ARCHIVE_OK) {
    printf("%s\n", archive_error_string(active_archive));
  }
}

auto extract_book(std::string file_name, size_t file_ptr, size_t file_size, size_t on_read_callback_ptr) {
  auto return_code = ARCHIVE_OK;
  const auto read_archive = archive_read_new();

  archive_read_support_filter_all(read_archive);
  // archive_read_support_format_all(read_archive);
  archive_read_support_format_rar5(read_archive);
  archive_read_support_format_rar(read_archive);
  archive_read_support_format_zip(read_archive);

  const auto ptr = std::shared_ptr<uint8_t>(reinterpret_cast<uint8_t*>(file_ptr));
  return_code = archive_read_open_memory(read_archive, ptr.get(), file_size);
  output_error(read_archive, return_code);

  const auto on_read = reinterpret_cast<void (*)(const char* path, size_t ptr, size_t size)>(on_read_callback_ptr);
  archive_entry* entry = nullptr;

  for (;;) {
    return_code = archive_read_next_header(read_archive, &entry);
    if (return_code == ARCHIVE_EOF) {
      break;
    }

    output_error(read_archive, return_code);

    std::string entry_path = archive_entry_pathname(entry);
    if (!entry_path.starts_with("__MACOSX")) {
      size_t size = archive_entry_size(entry);
      void* read_buffer = malloc(size);
      la_int64_t offset;

      archive_read_data(read_archive, read_buffer, size);

      const auto ptr = reinterpret_cast<size_t>(read_buffer);
      on_read(entry_path.c_str(), ptr, size);
      free(read_buffer);
    }
  }

  return_code = archive_read_free(read_archive);
  output_error(read_archive, return_code);
  return true;
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract_book", &extract_book, emscripten::allow_raw_pointers());
  emscripten::function("get_buffer", &get_buffer, emscripten::allow_raw_pointers());
}