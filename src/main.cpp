#include <archive.h>
#include <archive_entry.h>
#include <emscripten/bind.h>
#include <string>

bool extract_book(std::string file_name) {
  auto return_code = ARCHIVE_OK;
  auto working_archive = archive_read_new();

  archive_read_support_filter_all(working_archive);
  // archive_read_support_format_all(working_archive);

  archive_read_support_format_rar5(working_archive);
  archive_read_support_format_rar(working_archive);
  archive_read_support_format_zip(working_archive);
  archive_read_support_format_zip_seekable(working_archive);
  archive_read_support_format_zip_streamable(working_archive);

  std::string path = "/tmp/";
  path.append(file_name);
  archive_read_open_filename(working_archive, path.c_str(), 10240);

  // return_code = archive_read_open_memory(working_archive, file, sizeof(file));
  if (return_code != ARCHIVE_OK) {
    return false;
  }

  archive_read_free(working_archive);
  return true;
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract_book", &extract_book);
}
