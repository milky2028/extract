#include <archive.h>
#include <archive_entry.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <emscripten.h>

void output_error(struct archive* active_archive, int return_code) {
  if (return_code < ARCHIVE_OK) {
    printf("Archive Error: %s\n", archive_error_string(active_archive));
  }
}

EMSCRIPTEN_KEEPALIVE
void free_buffer(void* buffer_ptr) {
  free(buffer_ptr);
}

EMSCRIPTEN_KEEPALIVE
struct archive* open_archive(void* archive_file_ptr, size_t archive_file_size) {
  int return_code = ARCHIVE_OK;
  struct archive* read_archive = archive_read_new();

  archive_read_support_filter_all(read_archive);
  // archive_read_support_format_all(arch);
  archive_read_support_format_rar5(read_archive);
  archive_read_support_format_rar(read_archive);
  archive_read_support_format_zip(read_archive);

  return_code = archive_read_open_memory(read_archive, archive_file_ptr, archive_file_size);
  output_error(read_archive, return_code);

  return read_archive;
}

EMSCRIPTEN_KEEPALIVE
void close_archive(struct archive* archive_ptr) {
  int return_code = ARCHIVE_OK;

  return_code = archive_read_free(archive_ptr);
  output_error(archive_ptr, return_code);
}
EMSCRIPTEN_KEEPALIVE
const int END_OF_FILE = -2;

EMSCRIPTEN_KEEPALIVE
const int ENTRY_ERROR = -1;

EMSCRIPTEN_KEEPALIVE
intptr_t get_next_entry(struct archive* archive_ptr) {
  int return_code = ARCHIVE_OK;

  struct archive_entry* entry;
  return_code = archive_read_next_header(archive_ptr, &entry);
  if (return_code == ARCHIVE_OK) {
    return (intptr_t)entry;
  }

  if (return_code == ARCHIVE_EOF) {
    return END_OF_FILE;
  }

  output_error(archive_ptr, return_code);
  return ENTRY_ERROR;
}

EMSCRIPTEN_KEEPALIVE
void skip_extraction(struct archive* archive_ptr) {
  archive_read_data_skip(archive_ptr);
}

EMSCRIPTEN_KEEPALIVE
const char* get_entry_name(struct archive_entry* entry_ptr) {
  return archive_entry_pathname(entry_ptr);
}

EMSCRIPTEN_KEEPALIVE
size_t get_entry_size(struct archive_entry* entry_ptr) {
  return archive_entry_size(entry_ptr);
}

EMSCRIPTEN_KEEPALIVE
bool entry_is_file(struct archive_entry* entry_ptr) {
  return archive_entry_filetype(entry_ptr) == 32768;
}

EMSCRIPTEN_KEEPALIVE
void* read_entry_data(struct archive* archive_ptr, struct archive_entry* entry_ptr) {
  const size_t size = archive_entry_size(entry_ptr);
  void* read_buffer = malloc(size);

  archive_read_data(archive_ptr, read_buffer, size);
  return read_buffer;
}