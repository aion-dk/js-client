class AVClient {
  constructor(storage) {
    this.storage = storage;
  }

  authenticateWithCodes(codes) {
    if (codes.length == 2 && codes[0] == 'aAjEuD64Fo2143' && codes[1] == '8beoTmFH13DCV3') {
      return Promise.resolve('Success');
    } else {
      return Promise.reject('Failure');
    }
  }
}

module.exports = AVClient
