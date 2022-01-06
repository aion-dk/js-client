type KeyValueTuple = [ string, any ];

export default class Uniformer {
  public formString(obj: {}): string {
    const sortedEntries = this.walk(obj);
    return JSON.stringify(sortedEntries);
  }

  private walk(obj: {}): KeyValueTuple[] | string | number {
    switch(typeof obj) {
      case "string": return obj;
      case "number": return obj;
      case "symbol": return obj.toString().match(/Symbol\((.*?)\)/)![1];
    }

    const toKeyValueTuple = ([k, v]): KeyValueTuple => [k, this.walk(v)];
    const sortByKey = (a: KeyValueTuple, b: KeyValueTuple) => ("" + a[0]).localeCompare(b[0]);
    const nonStringKey = ([k, _]): boolean => typeof k !== "string";

    const properties = Object.entries(obj);

    if(properties.some(nonStringKey)) {
      throw new ArgumentError("Non-string key not allowed");
    }

    return properties
      .map(toKeyValueTuple)
      .sort(sortByKey);
  }
}
