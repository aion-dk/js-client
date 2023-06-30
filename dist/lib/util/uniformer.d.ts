declare type Primitive = Array<unknown> | string | number | symbol | boolean | null;
export declare class Uniformer {
    formString(obj: unknown | Primitive): string;
    private toSortedKeyValuePairs;
    private getSymbolName;
    private walk;
}
export {};
