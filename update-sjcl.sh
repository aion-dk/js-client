#/bin/bash

VERSION=1.0.8

git clone git@github.com:bitwiseshiftleft/sjcl.git /tmp/sjcl &&
(
  cd /tmp/sjcl; git checkout $VERSION && \
  ./configure --without-all --with-codecHex --with-codecBytes --with-ecc --with-convenience --compress=none && \
  rm sjcl.js && \
  make
) && \
cp /tmp/sjcl/sjcl.js ./lib/av_client/

rm -rf /tmp/sjcl
