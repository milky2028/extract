#include <archive.h>
#include <archive_entry.h>

#include <emscripten.h>
#include <emscripten/val.h>
#include <emscripten/bind.h>
#include <emscripten/threading.h>
#include <emscripten/threading_legacy.h>
#include <emscripten/wasmfs.h>

#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
#include <format>
#include <fstream>
#include <iostream>
#include <string>
#include <thread>
#include <filesystem>

EMSCRIPTEN_DECLARE_VAL_TYPE(VoidFunction);
EMSCRIPTEN_DECLARE_VAL_TYPE(OnFailure);
EMSCRIPTEN_DECLARE_VAL_TYPE(OnEntry);

std::string get_entry_name(std::string path) {
  auto path_splitter = "/";
  auto splitter_position = path.rfind(path_splitter);
  if (splitter_position == std::string::npos) {
    return path;
  }

  return path.substr(splitter_position + 1, path.length());
}

bool is_file(archive_entry* entry) {
  return archive_entry_filetype(entry) == 32768;
}

std::string to_lower_case(std::string str) {
  std::stringstream stream;
  for (const auto ch : str) {
    stream << static_cast<char>(tolower(ch));
  }

  return stream.str();
}

bool is_image(std::string path) {
  return path.ends_with(".jpg") || path.ends_with(".png");
}

struct extract_params {
  std::string archive_source_path;
  bool extract_data;
  VoidFunction on_completion = static_cast<VoidFunction>(emscripten::val::global("Function").new_());
  OnFailure on_failure = static_cast<OnFailure>(emscripten::val::global("Function").new_());
  OnEntry on_entry = static_cast<OnEntry>(emscripten::val::global("Function").new_());
};

const int WEB_BLOCK_SIZE = 65536;
void extract(extract_params params) {
    printf("archive path: %s\n", params.archive_source_path.c_str());
    printf("archive exists? %d", std::filesystem::exists(params.archive_source_path));

    auto return_code = ARCHIVE_OK;
    const auto arch = archive_read_new();

    archive_read_support_filter_all(arch);
    // archive_read_support_format_all(arch);
    archive_read_support_format_rar5(arch);
    archive_read_support_format_rar(arch);
    archive_read_support_format_zip(arch);

    return_code = archive_read_open_filename(arch, params.archive_source_path.c_str(), WEB_BLOCK_SIZE);
    if (return_code < ARCHIVE_OK) {
      params.on_failure(std::string(archive_error_string(arch)));
      return;
    }

    archive_entry* entry;
    for (;;) {
      return_code = archive_read_next_header(arch, &entry);
      if (return_code < ARCHIVE_OK) {
        archive_read_free(arch);
        params.on_failure(std::string(archive_error_string(arch)));
        return;
      }

      if (return_code == ARCHIVE_EOF) {
        archive_read_free(arch);
        params.on_completion();
        return;
      }

      auto entry_path = archive_entry_pathname(entry);
      if (is_file(entry) && !to_lower_case(entry_path).starts_with("__macosx") && is_image(entry_path)) {
        auto entry_name = get_entry_name(entry_path);
        if (params.extract_data) {
          auto entry_size = archive_entry_size(entry);
          auto entry_data_buffer = static_cast<uint8_t*>(malloc(entry_size));
          archive_read_data(arch, entry_data_buffer, entry_size);

          params.on_entry(entry_name, emscripten::typed_memory_view<uint8_t>(entry_size, entry_data_buffer));
        } else {
          params.on_entry(entry_name, emscripten::val::null());
        }
      }
    }
}

bool mount_filesystem() {
  auto opfs = wasmfs_create_opfs_backend();
  return wasmfs_create_directory("opfs", 0777, opfs) == 0 ? true : false;
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::register_type<VoidFunction>("VoidFunction");
  emscripten::register_type<OnFailure>("(errorMessage: string) => void");
  emscripten::register_type<OnEntry>("(name: string, buffer?: Uint8Array) => void");

  emscripten::value_object<extract_params>("ExtractParams")
      .field("archive_source_path", &extract_params::archive_source_path)
      .field("extract_data", &extract_params::extract_data)
      .field("on_completion", &extract_params::on_completion)
      .field("on_failure", &extract_params::on_failure)
      .field("on_entry", &extract_params::on_entry);

  emscripten::function("extract", &extract);
  emscripten::function("mount_filesystem", &mount_filesystem);
}
