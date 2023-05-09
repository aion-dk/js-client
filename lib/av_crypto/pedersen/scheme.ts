import {
  BigNumber, SjclECCPublicKey, SjclECCSecretKey,
  SjclEllipticalPoint,
  SjclKeyPair
} from "../sjcl";
import * as sjcl from "sjcl-with-all";
import {
  concatForHashing,
  generateKeyPair,
  hashIntoPoint,
  multiplyAndSumScalarsAndPoints,
  pointEquals,
  pointToHex
} from "../utils";
import {Commitment} from "./commitment";
import {Curve} from "../curve";

export function isValid(
  commitment: Commitment,
  messages: Array<BigNumber> | BigNumber,
  context = "",
  curve: Curve
): boolean {
  if (!commitment.isOpenable()) {
    throw new Error("commitment must be openable")
  }

  const recomputedCommitment = commit(
    messages,
    context,
    curve,
    generateKeyPair(curve, commitment.r)
  )

  return pointEquals(commitment.c, recomputedCommitment.c)
}

export function commit(
  messages: Array<BigNumber> | BigNumber,
  context = "",
  curve: Curve,
  randomness: SjclKeyPair<SjclECCPublicKey, SjclECCSecretKey> = sjcl.ecc.elGamal.generateKeys(curve.curve())
): Commitment {
  if (!Array.isArray(messages)) {
    messages = [messages]
  }
  messages = messages as Array<BigNumber>

  const points = messages.map((_, i) => baseGenerator(i, context, curve))
  points.unshift(curve.G());

  const scalars = messages.slice()
  scalars.unshift(randomness.sec.S);

  const c = multiplyAndSumScalarsAndPoints(scalars, points)

  return new Commitment(c, randomness.sec.S)
}

function baseGenerator(i: number, context: string, curve: Curve): SjclEllipticalPoint {
  const string = concatForHashing([
    context,
    pointToHex(curve.G()),
    i
  ]);

  return hashIntoPoint(string, curve)
}
