#include <archive.h>
#include <archive_entry.h>
#include <dirent.h>
#include <emscripten/bind.h>
#include <emscripten/wasmfs.h>
#include <stdio.h>
#include <filesystem>
#include <string>
#include <thread>

bool extract_book(size_t file_ptr, size_t file_size) {
  auto return_code = ARCHIVE_OK;
  // auto wasm_backend = wasmfs_create_opfs_backend();
  // if (wasm_backend == nullptr) {
  //   printf("Failed to initialize wasm filesystem\n");
  //   return false;
  // }

  auto working_archive = archive_read_new();

  archive_read_support_filter_all(working_archive);
  // archive_read_support_format_all(working_archive);

  archive_read_support_format_rar5(working_archive);
  archive_read_support_format_rar(working_archive);
  archive_read_support_format_zip(working_archive);
  archive_read_support_format_zip_seekable(working_archive);
  archive_read_support_format_zip_streamable(working_archive);

  // auto path = std::filesystem::path(file_path);
  // auto exists = std::filesystem::exists(path);
  // printf("it exists? %d\n", exists);
  // printf("file system items:\n");
  // for (const auto& item : std::filesystem::recursive_directory_iterator(path)) {
  //   printf("%s\n", item.path().c_str());
  // }

  // return_code = archive_read_open_filename(working_archive, file_path.c_str(), 10240);
  auto ptr = std::shared_ptr<uint8_t>(reinterpret_cast<uint8_t*>(file_ptr));

  return_code = archive_read_open_memory(working_archive, ptr.get(), file_size);
  if (return_code != ARCHIVE_OK) {
    printf("archive open from memory failed");
    return false;
  }

  archive_read_free(working_archive);
  printf("freeing archive\n");

  // return_code = remove(file_path.c_str());
  printf("cleaning up temp file\n");
  if (return_code != 0) {
    printf("removing temp file failed\n");
    return false;
  }

  printf("exiting successful\n");
  return true;
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract_book", &extract_book, emscripten::allow_raw_pointers());
}