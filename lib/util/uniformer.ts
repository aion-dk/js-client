type KeyValuePair = [ string, unknown ];
type Primitive = Array<unknown> | string | number | symbol | boolean | null;

export class Uniformer {

  public formString(obj: unknown | Primitive ): string {
    const sortedEntries = this.walk(obj);
    return JSON.stringify(sortedEntries);
  }

  private toSortedKeyValuePairs(obj: unknown) {
    const toKeyValueTuple = ([k, v]): KeyValuePair => [k, this.walk(v)];
    const sortByKey = (a: KeyValuePair, b: KeyValuePair) => compareUtf8Strings(a[0], b[0])

    const properties = Object.entries(obj as Record<string, unknown>);

    return properties
      .map(toKeyValueTuple)
      .sort(sortByKey);
  }

  private getSymbolName(symbol: string) {
    return symbol.slice("Symbol(".length, -1);    // Extracts 'foo' from 'Symbol(foo)'
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
        throw new Error(`Unknown parameter type '${typeof obj}'.`);
    }
  }
}

/**
 * Compares two strings against eachother considering the utf8 bytes produced
 * @param a string 1
 * @param b string 2
 * @returns -1, 0 or 1 depending on order
 */
function compareUtf8Strings(a: string, b: string){
  return compare(
    utf8StringToHex(a),
    utf8StringToHex(b)
  )
}

function compare(a, b){
  if( a > b ) return 1
  if( a < b ) return -1
  return 0
}

/**
 * Encodes a string from utf8 bytes to hex
 * @param string string to encode from utf8 bytes to hex
 * @returns hex representation of string
 */
function utf8StringToHex(string: string){
  const array = new TextEncoder().encode(string)
  return array.reduce((out, i) =>  out + ('0' + i.toString(16)).slice(-2), "")
}
