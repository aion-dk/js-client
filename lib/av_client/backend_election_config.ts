export default class BackendElectionConfig {
  connector: any;

  constructor(connector) {
    this.connector = connector;
  }

  get() {
    return this.connector.getElectionConfig()
      .then(
        (response) => { return Promise.resolve(response.data) },
        (error) => { return Promise.reject(error) }
      );
  }
}