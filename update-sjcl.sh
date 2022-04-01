#/bin/bash

VERSION=1.0.8

git clone git@github.com:bitwiseshiftleft/sjcl.git /tmp/sjcl &&
(
  cd /tmp/sjcl; git checkout $VERSION && \

  # We configure the build to include all our required components
  ./configure --without-all --with-codecHex --with-codecBytes --with-ecc --with-gcm --with-convenience --compress=none && \
  
  # Since hkdf is not included in the build script, we have to hax it into the config.mk
  sed -i '' 's|core/pbkdf2.js|core/pbkdf2.js core/hkdf.js|g' config.mk && \
  
  # Remove the previous build file and make a new build
  rm sjcl.js && make

) && \

# Copy the file into the project
cp /tmp/sjcl/sjcl.js ./lib/av_client/

# Cleanup
rm -rf /tmp/sjcl
