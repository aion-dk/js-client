import { BigNumber, SjclECCPublicKey, SjclECCSecretKey, SjclKeyPair } from "../sjcl";
import { Commitment } from "./commitment";
import { Curve } from "../curve";
export declare function isValid(commitment: Commitment, messages: Array<BigNumber> | BigNumber, context: string | undefined, curve: Curve): boolean;
export declare function commit(messages: Array<BigNumber> | BigNumber, context: string | undefined, curve: Curve, randomness?: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey>): Commitment;
