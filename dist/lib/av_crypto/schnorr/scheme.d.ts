import { BigNumber, SjclECCPublicKey, SjclECCSecretKey, SjclEllipticalPoint, SjclKeyPair } from "../sjcl";
import { Signature } from "./signature";
import { Curve } from "../curve";
export declare function isValid(signature: Signature, message: string, publicKey: SjclEllipticalPoint, curve: Curve): boolean;
export declare function sign(message: string, privateKey: BigNumber, curve: Curve, randomness?: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey>): Signature;
