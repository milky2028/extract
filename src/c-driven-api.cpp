#include <archive.h>
#include <archive_entry.h>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/wasmfs.h>
#include <stdio.h>
#include <unistd.h>
#include <filesystem>
#include <format>
#include <fstream>
#include <iostream>
#include <string>
#include <thread>

// const uintptr_t END_OF_FILE = -2;
// const uintptr_t ENTRY_ERROR = -1;

// for (;;) {
//   const entryPtr = get_next_entry(archivePtr);
//   if (entryPtr == = END_OF_FILE || entryPtr == = ENTRY_ERROR) {
//     close_archive(archivePtr);
//     return;
//   }

//   const path = get_entry_name(entryPtr).toLowerCase();
//   const isFile = entry_is_file(entryPtr);

//   if (isFile && !path.startsWith('__macosx') && isImage(path)) {
//     const fileName = path.split('/').pop() ? ? '';
//     if (extractData) {
//       const size = get_entry_size(entryPtr);
//       const entry_data = read_entry_data(archivePtr, entryPtr);
//       const buffer = get_buffer(entry_data, size);
//       const file = new File([buffer], fileName, {
//         type:
//           'image/jpg'
//       });
//       free_buffer(entry_data);

//       yield{fileName, file};
//     } else {
//       yield{fileName};
//     }
//   }
// }

// auto get_buffer(uintptr_t buffer_ptr, size_t buffer_size) {
//   return emscripten::val(emscripten::typed_memory_view<uint8_t>(buffer_size, int_to_ptr<uint8_t*>(buffer_ptr)));
// }

// auto free_buffer(uintptr_t buffer_ptr) {
//   free(int_to_ptr<void*>(buffer_ptr));
// }

std::optional<archive*> open_archive(std::string path) {
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
    return nullptr;
  }

  return arch;
}

void close_archive(archive* arch) {
  archive_read_free(arch);
}

std::optional<archive_entry*> get_next_entry(archive* arch) {
  auto return_code = ARCHIVE_OK;

  archive_entry* entry;
  return_code = archive_read_next_header(arch, &entry);
  if (return_code == ARCHIVE_OK) {
    return entry;
  }

  if (return_code == ARCHIVE_EOF) {
    return nullptr;
  }

  printf("Error: %s", archive_error_string(arch));
  return nullptr;
}

std::string get_entry_name(archive_entry* entry) {
  return std::string(archive_entry_pathname(entry));
}

size_t get_entry_size(archive_entry* entry) {
  return archive_entry_size(entry);
}

bool is_file(archive_entry* entry) {
  return archive_entry_filetype(entry) == 32768;
}

std::string to_lower_case(std::string str) {
  std::stringstream stream;
  for (const auto ch : str) {
    stream << tolower(ch);
  }

  return stream.str();
}

bool is_image(std::string path) {
  return path.ends_with('.jpg') || path.ends_with('.png');
}

void* read_entry_data(archive* arch, archive_entry* entry) {
  size_t size = archive_entry_size(entry);
  void* read_buffer = malloc(size);

  archive_read_data(arch, read_buffer, size);
  return read_buffer;
}

void extract_to_disk(std::string job_id, std::string path) {
  std::thread([=] {
    auto opfs = wasmfs_create_opfs_backend();
    wasmfs_create_directory("/opfs", 0777, opfs);

    auto arch = open_archive(path);
    if (!arch) {
      return;
    }

    for (;;) {
      auto entry_optional = get_next_entry(arch.value());
      if (!entry_optional.has_value()) {
        break;
      }

      auto entry = entry_optional.value();
      auto entry_path = to_lower_case(get_entry_name(entry));

      printf("%s\n", entry_path.c_str());
      printf("%d\n", is_file(entry));
      printf("%lu\n", get_entry_size(entry));

      break;
    }

    // clang-format off
    MAIN_THREAD_EM_ASM({
      const event = new CustomEvent(UTF8ToString($0));
      dispatchEvent(event);
    }, job_id.c_str());
    // clang-format on
  });
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract_to_disk", &extract_to_disk);
}
