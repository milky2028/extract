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

// const uintptr_t END_OF_FILE = -2;
// const uintptr_t ENTRY_ERROR = -1;

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

// auto close_archive(uintptr_t archive_ptr) {
//   const auto arch = int_to_ptr<archive*>(archive_ptr);
//   archive_read_free(arch);
// }

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

// auto skip_extraction(uintptr_t archive_ptr) {
//   archive_read_data_skip(int_to_ptr<archive*>(archive_ptr));
// }

auto get_entry_name(archive_entry* entry) {
  return std::string(archive_entry_pathname(entry));
}

// size_t get_entry_size(uintptr_t entry_ptr) {
//   return archive_entry_size(int_to_ptr<archive_entry*>(entry_ptr));
// }

// auto entry_is_file(uintptr_t entry_ptr) {
//   return archive_entry_filetype(int_to_ptr<archive_entry*>(entry_ptr)) == 32768;
// }

// auto read_entry_data(uintptr_t archive_ptr, size_t entry_ptr) {
//   const auto entry = int_to_ptr<archive_entry*>(entry_ptr);
//   const size_t size = archive_entry_size(entry);
//   void* read_buffer = malloc(size);

//   archive_read_data(int_to_ptr<archive*>(archive_ptr), read_buffer, size);
//   return ptr_to_int(read_buffer);
// }

void extract_to_disk(std::string job_id, std::string path) {
  std::thread([=] {
    // This does not actually create a directory in OPFS.
    // What this does is create virtual directory in WASM and any operations to or from that directory in WASM are
    // associated with that particular backend. Using wasmfs_create_directory, you could create a directory
    // structure that looked like:
    // -- /opfs
    // -- /idbfs
    // -- /memfs
    // and associate each directory with a particular backend. Then any writes from WASM-land that write to /opfs
    // would write to OPFS, any writes to /memfs would write to memory, and any writes to /idbfs would write to
    // IndexedDB. This is pretty confusing cause any write to /opfs/somewhere from WASM would actually be written
    // to the root OPFS file system. If we wanted to write a file from JavaScript and have it be available to
    // /persistent/my-file.txt, we would actually write to /my-file.txt.
    auto opfs = wasmfs_create_opfs_backend();
    wasmfs_create_directory("opfs", 0777, opfs);

    auto arch = open_archive(path);
    if (arch.has_value()) {
      for (;;) {
        auto entry = get_next_entry(arch.value());
        if (entry.has_value()) {
          auto name = get_entry_name(entry.value());
          printf("%s\n", name.c_str());
        }

        break;
      }
    }

    // clang-format off
    MAIN_THREAD_EM_ASM(
        {
          const event = new CustomEvent(UTF8ToString($0));
          dispatchEvent(event);
        },
        job_id.c_str());
    // clang-format on
  });
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::function("extract_to_disk", &extract_to_disk);
}
