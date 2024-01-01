#include <archive.h>
#include <archive_entry.h>
#include <ctype.h>
#include <emscripten/bind.h>
#include <stdio.h>
#include <string>
#include <vector>

auto get_file_name_from_path(std::string path) {
  const auto position = path.rfind("/");
  return path.substr(position + 1, path.size());
}

auto to_lower_case(std::string str) {
  std::string new_string = "";
  for (const auto& character : str) {
    new_string.push_back(std::tolower(character));
  }
  return new_string;
}

auto get_buffer(intptr_t buffer_ptr, intptr_t buffer_size) {
  const auto ptr = reinterpret_cast<uint8_t*>(buffer_ptr);
  return emscripten::val(emscripten::typed_memory_view<uint8_t>(buffer_size, ptr));
}

auto output_error(archive* active_archive, int return_code) {
  if (return_code < ARCHIVE_OK) {
    printf("%s\n", archive_error_string(active_archive));
  }
}

auto get_archive(intptr_t archive_file_ptr, intptr_t archive_file_size) {
  auto return_code = ARCHIVE_OK;
  const auto read_archive = archive_read_new();

  archive_read_support_filter_all(read_archive);
  // archive_read_support_format_all(read_archive);
  archive_read_support_format_rar5(read_archive);
  archive_read_support_format_rar(read_archive);
  archive_read_support_format_zip(read_archive);

  const auto ptr = reinterpret_cast<uint8_t*>(archive_file_ptr);
  return_code = archive_read_open_memory(read_archive, ptr, archive_file_size);
  output_error(read_archive, return_code);

  return read_archive;
}

struct buffer_object {
  void* buffer;
  intptr_t ptr;
  size_t size;
  std::function<void()> free;
};

auto read_entry(archive* read_archive, archive_entry* entry) {
  const size_t size = archive_entry_size(entry);
  void* read_buffer = malloc(size);

  archive_read_data(read_archive, read_buffer, size);
  const auto ptr = reinterpret_cast<intptr_t>(read_buffer);
  return (struct buffer_object){.ptr = ptr, .size = size, .free = [&] { free(read_buffer); }};
}

auto extract_book(intptr_t archive_file_ptr, intptr_t archive_file_size, intptr_t on_read_callback_ptr) {
  auto return_code = ARCHIVE_OK;
  const auto read_archive = get_archive(archive_file_ptr, archive_file_size);

  for (;;) {
    archive_entry* entry = nullptr;
    return_code = archive_read_next_header(read_archive, &entry);
    const auto on_read = reinterpret_cast<void (*)(const char*, intptr_t, intptr_t)>(on_read_callback_ptr);

    if (return_code == ARCHIVE_EOF) {
      on_read("last-read", 0, 0);
      break;
    }

    output_error(read_archive, return_code);
    std::string original_path = to_lower_case(archive_entry_pathname(entry));
    std::string entry_path = get_file_name_from_path(original_path);
    if (!original_path.starts_with("__macosx") && (entry_path.ends_with(".jpg") || entry_path.ends_with(".png"))) {
      const auto file = read_entry(read_archive, entry);
      on_read(entry_path.c_str(), file.ptr, file.size);
      file.free();
    }
  }

  return_code = archive_read_free(read_archive);
  output_error(read_archive, return_code);
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract_book", &extract_book, emscripten::allow_raw_pointers());
  emscripten::function("get_buffer", &get_buffer, emscripten::allow_raw_pointers());
}