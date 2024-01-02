#include <archive.h>
#include <archive_entry.h>
#include <ctype.h>
#include <emscripten/bind.h>
#include <stdio.h>
#include <string>
#include <vector>

auto output_error(archive* active_archive, int return_code) {
  if (return_code < ARCHIVE_OK) {
    printf("Archive Error: %s\n", archive_error_string(active_archive));
  }
}

template <typename T>
auto int_to_ptr(intptr_t ptr) {
  return reinterpret_cast<T>(ptr);
}

template <typename T>
auto ptr_to_int(T ptr) {
  return reinterpret_cast<intptr_t>(ptr);
}

auto get_buffer(intptr_t buffer_ptr, size_t buffer_size) {
  return emscripten::val(emscripten::typed_memory_view<uint8_t>(buffer_size, int_to_ptr<uint8_t*>(buffer_ptr)));
}

auto free_buffer(intptr_t buffer_ptr) {
  free(int_to_ptr<void*>(buffer_ptr));
}

auto open_archive(intptr_t archive_file_ptr, intptr_t archive_file_size) {
  auto return_code = ARCHIVE_OK;
  const auto arch = archive_read_new();

  archive_read_support_filter_all(arch);
  // archive_read_support_format_all(arch);
  archive_read_support_format_rar5(arch);
  archive_read_support_format_rar(arch);
  archive_read_support_format_zip(arch);

  return_code = archive_read_open_memory(arch, int_to_ptr<void*>(archive_file_ptr), archive_file_size);
  output_error(arch, return_code);

  return ptr_to_int(arch);
}

auto close_archive(intptr_t archive_ptr) {
  auto return_code = ARCHIVE_OK;
  const auto arch = int_to_ptr<archive*>(archive_ptr);

  return_code = archive_read_free(arch);
  output_error(arch, return_code);
}

const intptr_t END_OF_FILE = -2;
const intptr_t ENTRY_ERROR = -1;

auto get_next_entry(intptr_t archive_ptr) {
  auto return_code = ARCHIVE_OK;
  const auto arch = int_to_ptr<archive*>(archive_ptr);

  archive_entry* entry;
  return_code = archive_read_next_header(arch, &entry);
  if (return_code == ARCHIVE_OK) {
    return ptr_to_int(entry);
  }

  if (return_code == ARCHIVE_EOF) {
    return END_OF_FILE;
  }

  output_error(arch, return_code);
  return ENTRY_ERROR;
}

auto skip_extraction(intptr_t archive_ptr) {
  archive_read_data_skip(int_to_ptr<archive*>(archive_ptr));
}

auto get_entry_name(intptr_t entry_ptr) {
  return std::string(archive_entry_pathname(int_to_ptr<archive_entry*>(entry_ptr)));
}

size_t get_entry_size(intptr_t entry_ptr) {
  return archive_entry_size(int_to_ptr<archive_entry*>(entry_ptr));
}

auto entry_is_file(intptr_t entry_ptr) {
  return archive_entry_filetype(int_to_ptr<archive_entry*>(entry_ptr)) == 32768;
}

auto read_entry_data(intptr_t archive_ptr, intptr_t entry_ptr) {
  const auto entry = int_to_ptr<archive_entry*>(entry_ptr);
  const size_t size = archive_entry_size(entry);
  void* read_buffer = malloc(size);

  archive_read_data(int_to_ptr<archive*>(archive_ptr), read_buffer, size);
  return ptr_to_int(read_buffer);
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("get_buffer", &get_buffer, emscripten::allow_raw_pointers());
  emscripten::function("free_buffer", &free_buffer, emscripten::allow_raw_pointers());

  emscripten::constant("END_OF_FILE", END_OF_FILE);
  emscripten::constant("ENTRY_ERROR", ENTRY_ERROR);

  emscripten::function("open_archive", &open_archive, emscripten::allow_raw_pointers());
  emscripten::function("close_archive", &close_archive, emscripten::allow_raw_pointers());
  emscripten::function("skip_extraction", &skip_extraction, emscripten::allow_raw_pointers());

  emscripten::function("get_next_entry", &get_next_entry, emscripten::allow_raw_pointers());
  emscripten::function("get_entry_size", &get_entry_size, emscripten::allow_raw_pointers());
  emscripten::function("get_entry_name", &get_entry_name, emscripten::allow_raw_pointers());
  emscripten::function("read_entry_data", &read_entry_data, emscripten::allow_raw_pointers());
  emscripten::function("entry_is_file", &entry_is_file, emscripten::allow_raw_pointers());
}