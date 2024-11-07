import {BigNumber, SjclEllipticalPoint} from "../../sjcl";
import {Curve} from "../../curve";
import {SingleUseNonce} from "./single_use_nonce";
import {CommitmentShare} from "./commitment_share";
import {
  addPoints, addScalars,
  concatForHashing,
  hashIntoScalar,
  multiplyAndSumScalarsAndPoints,
  pointEquals,
  scalarToHex
} from "../../utils";
import {computeLambda} from "../../threshold/scheme";
import * as sjcl from "sjcl-with-all";
import {deriveChallenge} from "../scheme";
import {Signature} from "../signature";

export function partialSign(
  message: string,
  privateShare: BigNumber,
  id: BigNumber,
  nonce: SingleUseNonce,
  commitments: Array<CommitmentShare>,
  curve: Curve
): BigNumber {
  const commitmentsContext = renderCommitmentContext(commitments)
  const rho = computeBindingValue(id, message, commitmentsContext, curve)
  const otherIds = otherIdsThan(id, commitments);
  const lambda = computeLambda(id, otherIds, curve);
  const r = computeGroupCommitment(commitments, message, curve)
  const c = deriveChallenge(message, r, curve)

  return computeSignature(nonce, privateShare, c, rho, lambda, curve)
}

export function isValid(message: string, partialSignature: BigNumber, publicShare: SjclEllipticalPoint, id: BigNumber, commitments: Array<CommitmentShare>, curve: Curve): boolean {
  const commitmentsContext = renderCommitmentContext(commitments)
  const rho = computeBindingValue(id, message, commitmentsContext, curve)
  const otherIds = otherIdsThan(id, commitments);
  const lambda = computeLambda(id, otherIds, curve);
  const r = computeGroupCommitment(commitments, message, curve)
  const c = deriveChallenge(message, r, curve)
  const commitmentShare = commitments.find(c => c.i.equals(id))
  if (commitmentShare === undefined) {
    throw new Error("id must be included in the list of commitments")
  }

  const lhs = computeLHS(partialSignature, curve)
  const rhs = computeRHS(commitmentShare, c, lambda, rho, publicShare, curve)

  return pointEquals(lhs, rhs);
}

export function aggregateSignatures(c: BigNumber, z: Array<BigNumber>, curve: Curve): Signature {
  return new Signature(c, addScalars(z, curve), curve)
}

export function computeGroupCommitment(commitments: Array<CommitmentShare>, message: string, curve: Curve): SjclEllipticalPoint {
  const scalars = new Array<BigNumber>;
  const points = new Array<SjclEllipticalPoint>;

  const commitmentsContext = renderCommitmentContext(commitments)
  commitments.forEach(commitment => {
    const rho = computeBindingValue(commitment.i, message, commitmentsContext, curve)

    scalars.push(new sjcl.bn(1), rho)
    points.push(commitment.d, commitment.e)
  })

  return multiplyAndSumScalarsAndPoints(scalars, points);
}

function computeLHS(z: BigNumber, curve: Curve): SjclEllipticalPoint {
  return curve.G().mult(z)
}

function computeRHS(commitment: CommitmentShare, c: BigNumber, lambda: BigNumber, rho: BigNumber, y: SjclEllipticalPoint, curve: Curve): SjclEllipticalPoint {
  return addPoints([
    commitment.d,
    commitment.e.mult(rho),
    y.mult(c.mulmod(lambda, curve.order())).negate()
  ])
}

function computeBindingValue(i: BigNumber, message: string, commitmentsContext: string, curve: Curve): BigNumber {
  const string = concatForHashing([scalarToHex(i, curve), message, commitmentsContext])
  return hashIntoScalar(string, curve)
}

function renderCommitmentContext(commitments: Array<CommitmentShare>): string {
  return concatForHashing(commitments.map(commitment => commitment.toString()))
}

function otherIdsThan(id: BigNumber, commitments: Array<CommitmentShare>): Array<BigNumber> {
  return commitments
    .map(commitment => commitment.i)
    .filter(otherId => !id.equals(otherId))
}

function computeSignature(nonce: SingleUseNonce, privateShare: BigNumber, c: BigNumber, rho: BigNumber, lambda: BigNumber, curve: Curve): BigNumber {
  // sjcl mod() always returns a positive number.
  // There is no need add the curve order if it's negative.
  return nonce.d.add(nonce.e.mul(rho)).sub(c.mul(privateShare).mul(lambda)).mod(curve.order())
}
