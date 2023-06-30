import { BigNumber, SjclECCPublicKey, SjclECCSecretKey, SjclEllipticalPoint, SjclKeyPair } from "../sjcl";
import { Cryptogram } from "./cryptogram";
import { Curve } from "../curve";
export declare function encrypt(message: SjclEllipticalPoint, encryptionKey: SjclEllipticalPoint, curve: Curve, randomness?: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey>): Cryptogram;
export declare function decrypt(cryptogram: Cryptogram, decryptionKey: BigNumber): SjclEllipticalPoint;
export declare function homomorphicallyAdd(cryptograms: Array<Cryptogram>): Cryptogram;
