#/bin/bash

git clone git@github.com:bitwiseshiftleft/sjcl.git /tmp/sjcl &&
(
  cd /tmp/sjcl; git checkout 1.0.8 && \
  ./configure --without-all --with-codecHex --with-codecBytes --with-ecc --with-convenience --compress=none && \
  rm sjcl.js && \
  make
) && \
cp /tmp/sjcl/sjcl.js ./lib/av_client/

rm -rf /tmp/sjcl
