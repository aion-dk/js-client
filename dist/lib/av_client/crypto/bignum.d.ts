export declare class Bignum {
    private bn;
    constructor(data: any);
    isEven: () => boolean;
    equals: (other: Bignum) => boolean;
    mod: (operand: Bignum) => Bignum;
    add: (operand: Bignum) => Bignum;
    toBits: () => any;
    toBn: () => any;
}
