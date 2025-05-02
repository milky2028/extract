#include <archive.h>
#include <archive_entry.h>

#include <emscripten.h>
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

EMSCRIPTEN_DECLARE_VAL_TYPE(VoidFunction);
EMSCRIPTEN_DECLARE_VAL_TYPE(OnFailure);
EMSCRIPTEN_DECLARE_VAL_TYPE(OnEntry);

template <class F>
void run_async(F&& f) {
  using function_type = typename std::remove_reference<F>::type;
  auto p = new function_type(std::forward<F>(f));
  emscripten_async_run_in_main_runtime_thread(EM_FUNC_SIG_VI, static_cast<void (*)(void*)>([](void* f_) {
                                                emscripten_async_call(
                                                    [](void* f_) {
                                                      auto f = static_cast<function_type*>(f_);
                                                      (*f)();
                                                      delete f;
                                                    },
                                                    f_, 0);
                                              }),
                                              p);
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
void extract(std::string archive_source_path,
             bool extract_data,
             VoidFunction on_completion,
             OnFailure on_failure,
             OnEntry on_entry) {
  std::thread([archive_source_path, extract_data, on_completion, on_failure, on_entry] {
    auto return_code = ARCHIVE_OK;
    const auto arch = archive_read_new();

    archive_read_support_filter_all(arch);
    // archive_read_support_format_all(arch);
    archive_read_support_format_rar5(arch);
    archive_read_support_format_rar(arch);
    archive_read_support_format_zip(arch);

    return_code = archive_read_open_filename(arch, archive_source_path.c_str(), WEB_BLOCK_SIZE);
    if (return_code < ARCHIVE_OK) {
      run_async([on_failure, &arch] { on_failure(std::string(archive_error_string(arch))); });
      return;
    }

    archive_entry* entry;
    for (;;) {
      return_code = archive_read_next_header(arch, &entry);
      if (return_code < ARCHIVE_OK) {
        archive_read_free(arch);
        run_async([on_failure, &arch] { on_failure(std::string(archive_error_string(arch))); });
        return;
      }

      if (return_code == ARCHIVE_EOF) {
        archive_read_free(arch);
        run_async(on_completion);
        return;
      }

      auto entry_path = archive_entry_pathname(entry);
      if (is_file(entry) && !to_lower_case(entry_path).starts_with("__macosx") && is_image(entry_path)) {
        auto entry_name = get_entry_name(entry_path);
        if (extract_data) {
          auto entry_size = archive_entry_size(entry);
          auto entry_data_buffer = static_cast<uint8_t*>(malloc(entry_size));
          archive_read_data(arch, entry_data_buffer, entry_size);

          run_async([on_entry, entry_name, entry_size, &entry_data_buffer] {
            on_entry(entry_name, emscripten::typed_memory_view<uint8_t>(entry_size, entry_data_buffer));
          });
        } else {
          run_async([on_entry, entry_name] { on_entry(entry_name); });
        }
      }
    }
  }).detach();
}

void mount_filesystem(VoidFunction on_complete) {
  std::thread([on_complete] {
    auto opfs = wasmfs_create_opfs_backend();
    wasmfs_create_directory("/opfs", 0777, opfs);

    run_async(on_complete);
  }).detach();
}

EMSCRIPTEN_BINDINGS(module) {
  emscripten::register_type<VoidFunction>("VoidFunction");
  emscripten::register_type<OnFailure>("(errorMessage: string) => void");
  emscripten::register_type<OnEntry>("(name: string, buffer?: Uint8Array) => void");

  emscripten::function("extract", &extract);
  emscripten::function("mount_filesystem", &mount_filesystem);
}
