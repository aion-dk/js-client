import { BigNumber, SjclEllipticalPoint } from "../sjcl";
import { Curve } from "../curve";
import { Ciphertext } from "./ciphertext";
export declare function encrypt(message: string, encryptionKey: SjclEllipticalPoint, curve: Curve): Ciphertext;
export declare function decrypt(ciphertext: Ciphertext, decryptionKey: BigNumber, curve: Curve): string;
