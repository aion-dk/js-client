type KeyValueTuple = [ string, any ];

export default class Uniformer {
  public formString(obj: {}) {
    return JSON.stringify(this.walk(obj));
  }

  private walk(obj: {}): {} {
    switch(typeof obj) {
      case "string": return obj;
      case "number": return obj;
    }

    const toKeyValueTuple = ([k, v]): KeyValueTuple => [k, this.walk(v)];
    const sortByKey = (a: KeyValueTuple, b: KeyValueTuple) => ('' + a[0]).localeCompare(b[0]);

    const sortedEntries = Object.entries(obj)
      .map(toKeyValueTuple)
      .sort(sortByKey);

      // TODO: Might have to use OrderedMap to guarantee the order of properties
      return Object.fromEntries(sortedEntries);
  }
}
