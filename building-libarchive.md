## Building libarchive

We need to statically link to zlib in order to build libarchive properly.

git clone https://github.com/libarchive/libarchive.git
git checkout v3.7.9
./build/autogen.sh
emconfigure ./configure --enable-static --disable-shared --prefix=/Users/tgross/Documents/GitHub/libarchive/dist
emmake make
emmake make install
