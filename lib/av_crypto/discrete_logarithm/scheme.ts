import {
  BigNumber, SjclECCPublicKey, SjclECCSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../sjcl";
import {
  addPoints,
  concatForHashing, generateKeyPair,
  hashIntoScalar,
  multiplyAndSumScalarsAndPoints,
  pointEquals,
  pointToHex
} from "../utils";
import {Proof} from "./proof";
import {Curve} from "../curve";

export function isValid(
  proof: Proof,
  context= "",
  generators: Array<SjclEllipticalPoint>,
  points: Array<SjclEllipticalPoint>,
  publicKey: SjclEllipticalPoint,
  curve: Curve
): boolean {
  if (points.length != generators.length) {
    throw new Error("generators and points must have the same size")
  }

  const pointsString = concatHexedPoints(points);

  // Recompute the challenge
  const c = computeChallenge(context, generators, pointsString, proof.k, curve)

  const zis = points.map((_, i) => computeZi(pointsString, i, curve))
  const lhs = computeLHS(generators, proof.r, zis, curve)
  const rhs = computeRHS(points, c, publicKey, proof.k, zis, curve)

  // Is the equation true
  return pointEquals(lhs, rhs);
}

export function prove(
  knowledge: BigNumber,
  context = "",
  curve: Curve,
  generators: Array<SjclEllipticalPoint> = [curve.G()],
  randomness: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey> = generateKeyPair(curve),
  points?: Array<SjclEllipticalPoint>
): Proof {
  points = points || generators.map( g => g.mult(knowledge))

  // Generate the commitment for the proof
  const pointsString = concatHexedPoints(points)
  const k = computeCommitment(generators, randomness, pointsString, curve);

  // Compute the challenge
  const c = computeChallenge(context, generators, pointsString, k, curve);

  // Compute response
  // NOTE: We add instead of subtracting to prevent negative numbers
  //       which we would have to remember to handle multiple places.
  //       Doing addition increases testability, stability, and
  //       maintainability of the code.
  const r = randomness.sec.S.add(c.mul(knowledge)).mod(curve.order())

  return new Proof(k, r, curve);
}

function concatHexedPoints(points: Array<SjclEllipticalPoint>): string {
  return concatForHashing(points.map( p => pointToHex(p)))
}

function computeCommitment(
  generators: Array<SjclEllipticalPoint>,
  randomness: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey>,
  points_string: string,
  curve: Curve
): SjclEllipticalPoint {
  const scalars = new Array<BigNumber>;
  scalars.push(randomness.sec.S)
  for (let i = 0; i < generators.length; i++) {
    const zi = computeZi(points_string, i, curve).mulmod(randomness.sec.S, curve.order())
    scalars.push(zi);
  }

  const points = generators.slice()
  points.unshift(curve.G());

  return multiplyAndSumScalarsAndPoints(scalars, points);
}

function computeZi(points_string: string, i: number, curve: Curve) {
  const zString = concatForHashing([points_string, i])
  return hashIntoScalar(zString, curve)
}

function computeChallenge(context: string, generators: Array<SjclEllipticalPoint>, pointsString: string, k: SjclEllipticalPoint, curve: Curve): BigNumber {
  const challengeString = concatForHashing([
    context,
    concatHexedPoints(generators),
    pointsString,
    pointToHex(k)
  ])
  return hashIntoScalar(challengeString, curve)
}

// Left hand side of the verification equation
// NOTE: This is based on the generators because we have changed how
//       we're computing the proof response (addition instead of
//       subtraction).
function computeLHS(
  generators: Array<SjclEllipticalPoint>,
  r: BigNumber,
  zis: Array<BigNumber>,
  curve: Curve
): SjclEllipticalPoint {
  const scalars = zis.map(zi => zi.mulmod(r, curve.order()))
  scalars.unshift(r);

  const points = generators.slice()
  points.unshift(curve.G());

  return multiplyAndSumScalarsAndPoints(scalars, points)
}

// Right hand side of the verification equation
// NOTE: This is based on the commitment of the proof and the points
//       because we have changed how we're computing the proof response
//       (addition instead of subtraction).
function computeRHS(
  points: Array<SjclEllipticalPoint>,
  c: BigNumber,
  publicKey: SjclEllipticalPoint,
  k: SjclEllipticalPoint,
  zis: Array<BigNumber>,
  curve: Curve
): SjclEllipticalPoint {
  const scalars = zis.map(zi => zi.mulmod(c, curve.order()))
  scalars.unshift(c);

  points = points.slice()
  points.unshift(publicKey);

  return addPoints([
    k,
    multiplyAndSumScalarsAndPoints(scalars, points)
  ])
}
