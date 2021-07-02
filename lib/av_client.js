class AVClient {
  constructor(storage) {
    this.storage = storage;
  }

  authenticateWithCodes(code) {
    if (code == 'abc') {
      return Promise.resolve('Success');
    } else {
      return Promise.reject('Failure');
    }
  }
}

module.exports = AVClient
