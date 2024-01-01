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

template <typename F>
F create_function(intptr_t ptr) {
  return reinterpret_cast<F>(ptr);
}

std::vector<std::string>* create_vector_from_ptr(intptr_t ptr) {
  return reinterpret_cast<std::vector<std::string>*>(ptr);
}

template <typename K, typename V>
auto get_keys(std::map<K, V> map) {
  std::vector<K> keys = {};
  for (const auto& [key, _value] : map) {
    keys.push_back(key);
  }

  return keys;
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

auto for_each_entry(archive* read_archive, std::function<void(archive_entry*, std::string)> predicate) {
  auto return_code = ARCHIVE_OK;
  archive_entry* entry = nullptr;

  for (;;) {
    return_code = archive_read_next_header(read_archive, &entry);
    if (return_code == ARCHIVE_EOF) {
      break;
    }

    output_error(read_archive, return_code);
    const auto original_path = to_lower_case(archive_entry_pathname(entry));
    const auto entry_path = get_file_name_from_path(original_path);
    if (!original_path.starts_with("__macosx") && (entry_path.ends_with(".jpg") || entry_path.ends_with(".png"))) {
      predicate(entry, entry_path);
    }
  }
}

auto list_entry_paths(intptr_t archive_file_ptr, intptr_t archive_file_size) {
  auto return_code = ARCHIVE_OK;
  archive_entry* entry = nullptr;

  const auto read_archive = get_archive(archive_file_ptr, archive_file_size);
  std::vector<std::string> file_paths = {};
  for_each_entry(read_archive, [&](const auto entry, const auto entry_path) { file_paths.push_back(entry_path); });
  std::sort(file_paths.begin(), file_paths.end());

  return_code = archive_read_free(read_archive);
  output_error(read_archive, return_code);
  return file_paths;
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

auto extract_single_entry(intptr_t archive_file_ptr,
                          intptr_t archive_file_size,
                          std::string entry_name,
                          intptr_t on_found_callback_ptr) {
  auto return_code = ARCHIVE_OK;
  const auto read_archive = get_archive(archive_file_ptr, archive_file_size);

  auto called = false;
  const auto on_found =
      reinterpret_cast<void (*)(const char* path, intptr_t ptr, intptr_t size)>(on_found_callback_ptr);
  for_each_entry(read_archive, [&](const auto entry, const auto entry_path) {
    if (entry_path == entry_name) {
      const auto data = read_entry(read_archive, entry);
      on_found(entry_path.c_str(), data.ptr, data.size);
      called = true;
      data.free();
    }
  });

  if (!called) {
    on_found("not-found", 0, 0);
  }

  return_code = archive_read_free(read_archive);
  output_error(read_archive, return_code);
}

auto extract_all_entries(intptr_t archive_file_ptr, intptr_t archive_file_size, intptr_t on_read_callback_ptr) {
  auto return_code = ARCHIVE_OK;
  const auto read_archive = get_archive(archive_file_ptr, archive_file_size);

  const auto on_read = reinterpret_cast<void (*)(const char* path, intptr_t ptr, intptr_t size)>(on_read_callback_ptr);
  for_each_entry(read_archive, [&](const auto entry, const auto entry_path) {
    const auto data = read_entry(read_archive, entry);
    on_read(entry_path.c_str(), data.ptr, data.size);
    data.free();
  });

  return_code = archive_read_free(read_archive);
  output_error(read_archive, return_code);
  return true;
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::register_vector<std::string>("stringVector");

  emscripten::function("extract_all_entries", &extract_all_entries, emscripten::allow_raw_pointers());
  emscripten::function("extract_single_entry", &extract_single_entry, emscripten::allow_raw_pointers());
  emscripten::function("get_buffer", &get_buffer, emscripten::allow_raw_pointers());
  emscripten::function("list_entry_paths", &list_entry_paths);
}