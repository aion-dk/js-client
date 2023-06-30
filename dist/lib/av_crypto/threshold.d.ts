import { BigNumber, SjclEllipticalPoint } from "./sjcl";
import { Curve } from "./curve";
export declare function computePublicShare(id: BigNumber, publicKeys: Array<SjclEllipticalPoint>, coefficients: Array<Array<SjclEllipticalPoint>>, curve: Curve): SjclEllipticalPoint;
export declare function computeLambda(id: BigNumber, otherIDs: Array<BigNumber>, curve: Curve): BigNumber;
