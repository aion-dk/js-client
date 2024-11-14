import {BigNumber, SjclECCPublicKey, SjclECCSecretKey, SjclEllipticalPoint, SjclKeyPair} from "../sjcl";
import {generateKeyPair, multiplyAndSumScalarsAndPoints} from "../utils";
import {Curve} from "../curve";
import * as sjcl from "sjcl-with-all";
import {Polynomial} from "./polynomial";

export function generatePolynomial(degree: number, firstCoefficient: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey>, curve: Curve): Polynomial {
  const coefficients = Array(degree - 1).fill(generateKeyPair(curve));
  coefficients.unshift(firstCoefficient);

  return new Polynomial(coefficients, curve);
}

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
