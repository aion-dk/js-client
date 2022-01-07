type KeyValuePair = [ string, unknown ];
type Primitive = Array<unknown> | string | number | symbol | boolean | null;

export default class Uniformer {

  public formString(obj: unknown | Primitive ): string {
    const sortedEntries = this.walk(obj);
    return JSON.stringify(sortedEntries);
  }

  private toSortedKeyValuePairs(obj: unknown) {
    const toKeyValueTuple = ([k, v]): KeyValuePair => [k, this.walk(v)];
    const sortByKey = (a: KeyValuePair, b: KeyValuePair) => ("" + a[0]).localeCompare(b[0]);

    const properties = Object.entries(obj as Record<string, unknown>);

    return properties
      .map(toKeyValueTuple)
      .sort(sortByKey);
  }

  private getSymbolName(symbol: string) {
    const matches = symbol.match(/Symbol\((.*?)\)/);

    if(matches === null)
      throw new Error('Unable to extract symbol name.')

    return matches[1];
  }

  private walk(obj: unknown | Primitive ): KeyValuePair[] | Primitive {
    switch(typeof obj) {
      case "string":
      case "number":
      case "boolean": return obj;
      case "symbol": return this.getSymbolName(obj.toString());
      case "object":
        if(obj === null)
          return null;

        if(obj instanceof Array)
          return obj.map(e => this.walk(e));

        if(obj instanceof Date)
          return obj.toISOString();

        return this.toSortedKeyValuePairs(obj);
      default:
        throw new Error(`Unknown parameter type '${typeof obj}.`);
    }
  }
}
