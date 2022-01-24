import Bignum from "./bignum";
import Point from "./point";
import {
  addPoints,
  bignumFromHex,
  bignumToHex,
  Curve,
  generateRandomBignum,
  hashToBignum,
  pointFromHex,
  pointFromX,
  pointToHex,
  isValidHexString
} from "./util";

class PedersenCommitment {
  static computeGenerator(index: number): Point {
    const baseGeneratorPrefix = () => pointToHex(new Point(Curve.G));
    const secp256k1_curve_prime = new Bignum(Curve.field.modulus);

    const target = [baseGeneratorPrefix(), index].join(',');
    let x = hashToBignum(target).mod(secp256k1_curve_prime);

    let point: Point | null = null;

    while(point === null) {
      point = pointFromX(x);

      if(point)
        return point;

      x = x.add(new Bignum(1)).mod(secp256k1_curve_prime);
    }

    throw new Error("Unreachable code reached");
  }

  static verify(commitment: Point, messages, randomizer: Bignum) {
    return commitment.equals(this.generate(messages, randomizer))
  }

  static generate(messages: Bignum[], randomizer: Bignum): Point {
    const initialPoint = new Point(Curve.G).mult(randomizer);

    const commitment = messages.reduce((acc, message, index) => {
      const generator = PedersenCommitment.computeGenerator(index);
      const term = generator.mult(message);

      return addPoints(acc, term);
    }, initialPoint);

    return commitment;
  }
}

/**
 * @description Generates an encryption commitment
 * @param messages An array of hex strings
 * @param options Optional options object. Allows caller to specify randomizer
 * @returns Commitment point and randomizer, both as hex.
 */
const generatePedersenCommitment = (messages: string[], options?: { randomizer: string }) => {
  if(messages.some(m => !isValidHexString(m)))
    throw new Error("Input is not a valid hex string");

  const bnMessages: Bignum[] = messages.map(m => bignumFromHex(m));

  const randomizer = options && options.randomizer ?
    new Bignum(options.randomizer) : generateRandomBignum();

  const commitment = PedersenCommitment.generate(bnMessages, randomizer);

  return {
    commitment: pointToHex(commitment),
    randomizer: bignumToHex(randomizer),
  }
};

/**
 * @description Checks if a commitment is valid, given a set of messages and a randomizer
 * @returns true if commitment passes validity check. Otherwise false.
 */
const isValidPedersenCommitment = (commitment: string, messages: string[], randomizer: string) => {
  if([...messages, commitment, randomizer].some(m => !isValidHexString(m)))
    throw new Error("Input is not a valid hex string");

  const pointCommitment = pointFromHex(commitment);
  const bnMessages = messages.map(m => bignumFromHex(m));
  const bnRandomizer = bignumFromHex(randomizer);

  return PedersenCommitment.verify(pointCommitment, bnMessages, bnRandomizer);
}

export {
  generatePedersenCommitment,
  isValidPedersenCommitment,
};
