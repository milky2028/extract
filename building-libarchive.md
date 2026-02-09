## Building libarchive

We need to statically link to zlib in order to build libarchive properly.

```sh
z emsdk
git checkout 4.0.15
./emsdk install latest && ./emsdk activate latest
z GitHub
git clone https://github.com/libarchive/libarchive.git
git checkout v3.7.2 # versions higher than this will break with compressed zip archives
./build/autogen.sh
emconfigure ./configure --enable-static --disable-shared --prefix=/Users/tgross/Documents/GitHub/libarchive/dist
emmake make
emmake make install
```
