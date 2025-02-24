import {BigNumber, SjclEllipticalPoint} from "./sjcl";
import {addPoints, multiplyAndSumScalarsAndPoints, pointEquals} from "./utils";
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

export function computePartialSecretShare(
  id: BigNumber,
  privateKey: BigNumber,
  coefficients: Array<BigNumber>,
  curve: Curve
): BigNumber {
  let partialShare = privateKey;
  for (let i = 0; i < coefficients.length; i++) {
    // degree = i + 1 because i is a 0 based index
    const exponent = id.powermod(i + 1, curve.order());
    partialShare = partialShare.add(coefficients[i].mulmod(exponent, curve.order()));
  }

  return partialShare.mod(curve.order());
}

export function isValidPartialSecretShare(
  partialShare: BigNumber,
  id: BigNumber,
  publicKey: SjclEllipticalPoint,
  coefficients: Array<SjclEllipticalPoint>,
  curve: Curve
): boolean {
  const terms = coefficients.map((coefficient, i) => {
    // degree = i + 1 because i is a 0 based index
    const scalar = id.powermod(i + 1, curve.order());
    return coefficient.mult(scalar);
  })
  terms.unshift(publicKey);
  const partialPublicShare = addPoints(terms);

  return pointEquals(partialPublicShare, curve.G().mult(partialShare));
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
