import { BitArray, SjclHash } from "./sjcl";
export declare class SHA384 implements SjclHash {
    private sha;
    constructor();
    finalize(): BitArray;
    reset(): SjclHash;
    update(data: BitArray | string): SjclHash;
    static hash(data: BitArray | string): BitArray;
}
