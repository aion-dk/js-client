import {BigNumber, SjclEllipticalPoint} from "./sjcl";
import {multiplyAndSumScalarsAndPoints} from "./utils";
import {Curve} from "./curve";
import * as sjcl from "sjcl-with-all";

export function computePublicShare(
  id: BigNumber,
  publicKeys: Array<SjclEllipticalPoint>,
  coefficients: Array<Array<SjclEllipticalPoint>>,
  curve: Curve
): SjclEllipticalPoint {

  const points = publicKeys.concat(coefficients.flat())
  const scalars = Array(publicKeys.length).fill(new sjcl.bn(1));
  for (const coefficient_array of coefficients) {
    for (let i = 1; i <= coefficient_array.length ; i++) {
      const degree = new sjcl.bn(i)
      scalars.push(id.powermod(degree, curve.order()))
    }
  }

  return multiplyAndSumScalarsAndPoints(scalars, points)
}

export function computeLambda(id: BigNumber, otherIDs: Array<BigNumber>, curve: Curve): BigNumber {
  const i = id
  let lambda = new sjcl.bn(1)

  for (const j of otherIDs) {
    lambda = lambda
      .mul(j)
      .mul(-1)
      .mul(i.sub(j).mod(curve.order()).inverseMod(curve.order()))
      .mod(curve.order())
  }

  return lambda
}
