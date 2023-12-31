#include <archive.h>
#include <archive_entry.h>
#include <emscripten/bind.h>
#include <stdio.h>
#include <string>

bool extract_book(std::string file_name, size_t file_ptr, size_t file_size, size_t on_read_callback_ptr) {
  auto return_code = ARCHIVE_OK;
  const auto read_archive = archive_read_new();

  archive_read_support_filter_all(read_archive);
  // archive_read_support_format_all(read_archive);
  archive_read_support_format_rar5(read_archive);
  archive_read_support_format_rar(read_archive);
  archive_read_support_format_zip(read_archive);

  const auto ptr = std::shared_ptr<uint8_t>(reinterpret_cast<uint8_t*>(file_ptr));
  return_code = archive_read_open_memory(read_archive, ptr.get(), file_size);
  if (return_code != ARCHIVE_OK) {
    printf("%s", archive_error_string(read_archive));
    return false;
  }

  const auto on_read = reinterpret_cast<void (*)(const char* path, size_t ptr, size_t size)>(on_read_callback_ptr);
  archive_entry* entry = nullptr;

  for (;;) {
    return_code = archive_read_next_header(read_archive, &entry);
    if (return_code == ARCHIVE_EOF) {
      break;
    }

    if (return_code < ARCHIVE_OK) {
      printf("%s\n", archive_error_string(read_archive));
      return false;
    }

    std::string entry_path = archive_entry_pathname(entry);
    if (!entry_path.starts_with("__MACOSX")) {
      const void* read_buffer = nullptr;
      la_int64_t offset;
      size_t size = 0;

      for (;;) {
        return_code = archive_read_data_block(read_archive, &read_buffer, &size, &offset);
        if (return_code == ARCHIVE_EOF) {
          break;
        }

        if (return_code < ARCHIVE_OK) {
          printf("%s\n", archive_error_string(read_archive));
          break;
        }
      }

      const auto ptr = reinterpret_cast<size_t>(read_buffer);
      on_read(entry_path.c_str(), ptr, size);
    }
  }

  archive_read_free(read_archive);

  printf("freeing archive\n");
  printf("exiting successful\n");
  return true;
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract_book", &extract_book, emscripten::allow_raw_pointers());
}