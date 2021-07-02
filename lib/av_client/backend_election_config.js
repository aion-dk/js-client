class BackendElectionConfig {
  constructor(connector) {
    this.connector = connector;
  }

  get() {
    return this.connector.getElectionConfig()
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

module.exports = BackendElectionConfig
