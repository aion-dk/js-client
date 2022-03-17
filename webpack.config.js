const path = require('path');

module.exports = {
  entry: './dist/lib/av_verifier.js',
  resolve: {
    fallback: {
      "crypto": false
    }
  },
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'AssemblyVoting'
  }
};
