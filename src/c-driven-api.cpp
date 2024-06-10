#include <archive.h>
#include <archive_entry.h>

#include <emscripten.h>
#include <emscripten/bind.h>
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

void dispatch_main_thread_event(std::string parent_event, std::string event_type, std::string event_data) {
  // clang-format off
    MAIN_THREAD_EM_ASM({
      const event = new CustomEvent(UTF8ToString($0), { detail: { type: UTF8ToString($1), data: UTF8ToString($2) } });
      dispatchEvent(event);
    }, parent_event.c_str(), event_type.c_str(), event_data.c_str());
  // clang-format on
}

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

const int WEB_BLOCK_SIZE = 65536;
void extract(std::string job_id,
             std::string archive_source_path,
             std::string archive_destination_path,
             bool extract_data) {
  std::thread([=] {
    auto return_code = ARCHIVE_OK;
    const auto arch = archive_read_new();

    archive_read_support_filter_all(arch);
    // archive_read_support_format_all(arch);
    archive_read_support_format_rar5(arch);
    archive_read_support_format_rar(arch);
    archive_read_support_format_zip(arch);

    return_code = archive_read_open_filename(arch, archive_source_path.c_str(), WEB_BLOCK_SIZE);
    if (return_code < ARCHIVE_OK) {
      dispatch_main_thread_event(job_id, "failure", archive_error_string(arch));
      return;
    }

    archive_entry* entry;
    for (;;) {
      return_code = archive_read_next_header(arch, &entry);
      if (return_code < ARCHIVE_OK) {
        archive_read_free(arch);
        dispatch_main_thread_event(job_id, "failure", archive_error_string(arch));
        return;
      }

      if (return_code == ARCHIVE_EOF) {
        archive_read_free(arch);
        dispatch_main_thread_event(job_id, "completion", "");
        return;
      }

      auto entry_path = archive_entry_pathname(entry);
      if (is_file(entry) && !to_lower_case(entry_path).starts_with("__macosx") && is_image(entry_path)) {
        auto entry_name = get_entry_name(entry_path);
        if (extract_data) {
          auto entry_size = archive_entry_size(entry);
          void* entry_data_buffer = malloc(entry_size);

          archive_read_data(arch, entry_data_buffer, entry_size);
          auto item_path = archive_destination_path + get_entry_name(entry_path);

          auto handle = fopen(item_path.c_str(), "wb+");
          fwrite(entry_data_buffer, entry_size, 1, handle);

          fclose(handle);
          free(entry_data_buffer);
        }

        dispatch_main_thread_event(job_id, "entry", entry_name);
      }
    }
  }).detach();
}

void mount_filesystem(std::string job_id) {
  std::thread([=] {
    auto opfs = wasmfs_create_opfs_backend();
    wasmfs_create_directory("/opfs", 0777, opfs);
    dispatch_main_thread_event(job_id, "completion", "");
  }).detach();
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract", &extract);
  emscripten::function("mount_filesystem", &mount_filesystem);
}
