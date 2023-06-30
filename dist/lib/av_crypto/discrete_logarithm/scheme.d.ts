import { BigNumber, SjclECCPublicKey, SjclECCSecretKey, SjclEllipticalPoint, SjclKeyPair } from "../sjcl";
import { Proof } from "./proof";
import { Curve } from "../curve";
export declare function isValid(proof: Proof, context: string | undefined, generators: Array<SjclEllipticalPoint>, points: Array<SjclEllipticalPoint>, publicKey: SjclEllipticalPoint, curve: Curve): boolean;
export declare function prove(knowledge: BigNumber, context: string | undefined, curve: Curve, generators?: Array<SjclEllipticalPoint>, randomness?: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey>, points?: Array<SjclEllipticalPoint>): Proof;
