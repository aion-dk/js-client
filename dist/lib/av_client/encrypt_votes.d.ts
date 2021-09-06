export default class EncryptVotes {
    encrypt(contestSelections: any, emptyCryptograms: any, contestEncodingTypes: any, encryptionKey: PublicKey): ContestIndexed<EncryptionResponse>;
    generateTestCode(): BigNum;
    fingerprint(cryptograms: ContestIndexed<Cryptogram>): any;
}
declare type PublicKey = string;
declare type Cryptogram = string;
declare type Proof = string;
declare type BigNum = string;
interface ContestIndexed<Type> {
    [index: string]: Type;
}
declare type EncryptionResponse = {
    cryptogram: Cryptogram;
    randomness: BigNum;
    proof: Proof;
};
export {};
