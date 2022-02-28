const path = require('path');

module.exports = {
  entry: './dist/lib/av_verifier.js',
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'AssemblyVoting'
  },
  optimization: {
    minimize: false
  }
};
