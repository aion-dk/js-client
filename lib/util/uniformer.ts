type KeyValueTuple = [ string, any ];
type Primitive = string | number | symbol | boolean | null;
export default class Uniformer {
  public formString(obj: {} | Primitive ): string {
    const sortedEntries = this.walk(obj);
    return JSON.stringify(sortedEntries);
  }

  private walk(obj: {} | Primitive ): KeyValueTuple[] | Primitive {
    switch(typeof obj) {
      case "string":
      case "number":
      case "boolean": return obj;
      case "symbol": return obj.toString().match(/Symbol\((.*?)\)/)![1];
      case "object":
        if(obj instanceof Date)
          return obj.toISOString();

        if(obj === null)
          return null;
    }

    const toKeyValueTuple = ([k, v]): KeyValueTuple => [k, this.walk(v)];
    const sortByKey = (a: KeyValueTuple, b: KeyValueTuple) => ("" + a[0]).localeCompare(b[0]);

    const properties = Object.entries(obj);

    return properties
      .map(toKeyValueTuple)
      .sort(sortByKey);
  }
}
