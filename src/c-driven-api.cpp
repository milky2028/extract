#include <archive.h>
#include <archive_entry.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/wasmfs.h>
#endif

#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
#include <filesystem>
#include <format>
#include <fstream>
#include <iostream>
#include <string>
#include <thread>

std::string get_page_name(std::string path) {
  auto path_splitter = "/";
  path.rfind(path);
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

void* read_entry_data(archive* arch, archive_entry* entry) {
  size_t size = archive_entry_size(entry);
  void* read_buffer = malloc(size);

  archive_read_data(arch, read_buffer, size);
  return read_buffer;
}

bool backend_created = false;

void extract_to_disk(std::string job_id, std::string path) {
  std::thread([&] {
#ifdef __EMSCRIPTEN__
    if (!backend_created) {
      auto opfs = wasmfs_create_opfs_backend();
      wasmfs_create_directory("/opfs", 0777, opfs);
      backend_created = true;
    }
#endif

    auto return_code = ARCHIVE_OK;
    const auto arch = archive_read_new();

    archive_read_support_filter_all(arch);
    // archive_read_support_format_all(arch);
    archive_read_support_format_rar5(arch);
    archive_read_support_format_rar(arch);
    archive_read_support_format_zip(arch);

    return_code = archive_read_open_filename(arch, path.c_str(), 65536);
    if (return_code < ARCHIVE_OK) {
      printf("Error: %s", archive_error_string(arch));
      return false;
    }

    void* entry_data_buffer;
    archive_entry* entry;
    for (;;) {
      return_code = archive_read_next_header(arch, &entry);
      if (return_code < ARCHIVE_OK) {
        printf("Error: %s", archive_error_string(arch));
        archive_read_free(arch);
        return false;
      }

      if (return_code == ARCHIVE_EOF) {
        archive_read_free(arch);
        return true;
      }

      auto entry_path = to_lower_case(archive_entry_pathname(entry));
      if (is_file(entry) && !entry_path.starts_with("__macosx") && is_image(entry_path)) {
        auto entry_size = archive_entry_size(entry);
        entry_data_buffer = malloc(entry_size);

        archive_read_data(arch, entry_data_buffer, entry_size);

        auto item_path = std::filesystem::current_path() += std::filesystem::path("/output/") += entry_path;

        // auto handle = open(item_path.c_str(), O_RDWR | O_CREAT, 0);
        // write(handle, entry_data_buffer, entry_size);
      }
    }

    free(entry_data_buffer);
    free(entry);

#ifdef __EMSCRIPTEN__
    // clang-format off
    MAIN_THREAD_EM_ASM({
      const event = new CustomEvent(UTF8ToString($0));
      dispatchEvent(event);
    }, job_id.c_str());
// clang-format on
#endif

    return true;
  }).join();
}

#ifdef __EMSCRIPTEN__
EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract_to_disk", &extract_to_disk);
}
#endif

int main() {
  printf("Starting extractor...\n");
  auto path = "/Users/tgross/Desktop/Batman- The Killing Joke (1988).cbz";
  extract_to_disk("some-job", path);
}