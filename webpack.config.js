const path = require('path');

module.exports = {
  entry: './dist/lib/av_verifier.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};
