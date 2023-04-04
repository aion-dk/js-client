import {ContestEnvelope, ContestMap} from "../types";
import {Bignum} from "./bignum";
import {Point} from "./point";
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
  static computeGenerator(contestReference: string, index: number): Point {
    const baseGeneratorPrefix = () => pointToHex(new Point(Curve.G));
    const secp256k1_curve_prime = new Bignum(Curve.field.modulus);

    const target = [baseGeneratorPrefix(), contestReference, index].join(',');
    let x = hashToBignum(target).mod(secp256k1_curve_prime);

    let point: Point | null = null;

    while(point === null) {
      point = pointFromX(x);

      if(point)
        return point;

      // No point was found for x. Attempt x+1
      x = x.add(new Bignum(1)).mod(secp256k1_curve_prime);
    }

    throw new Error("Unreachable code reached");
  }

  static verify(commitment: Point, messages: ContestMap<Bignum[]>, randomizer: Bignum) {
    return commitment.equals(this.generate(messages, randomizer))
  }

  static generate(messages: ContestMap<Bignum[]>, commitmentRandomizer: Bignum): Point {
    const initialPoint = new Point(Curve.G).mult(commitmentRandomizer);
    const terms = Object.entries(messages).flatMap(([contestReference, messages]) => {

      const terms = messages.map((message, index) => {
        const generator = PedersenCommitment.computeGenerator(contestReference, index);
        return generator.mult(message);
      });

      return terms;
    });

    return terms.reduce((acc: Point, term: Point) => addPoints(acc, term), initialPoint);
  }
}

const stringMapToBignumMap = (stringMap: ContestMap<string[]>): ContestMap<Bignum[]> => {
  const entries = Object.entries(stringMap).map(([contestReference, messages]) => {
    if(messages.some(m => !isValidHexString(m)))
      throw new Error("Input is not a valid hex string");

    return [
      contestReference,
      messages.map(m => bignumFromHex(m))
    ];
  });

  return Object.fromEntries(entries)
};

/**
 * @description Generates an encryption commitment
 * @param messages An array of hex strings
 * @param options Optional options object. Allows caller to specify randomizer
 * @returns Commitment point and randomizer, both as hex.
 */
const generatePedersenCommitment = (randomizers: ContestMap<string[][]>, options?: { randomizer: string }) => {
  const randomizer = options && options.randomizer ?
    new Bignum(options.randomizer) : generateRandomBignum();

  const messages = stringMapToBignumMap(flattenRandomizers(randomizers));

  const commitment = PedersenCommitment.generate(messages, randomizer)

  return {
    commitment: pointToHex(commitment),
    randomizer: bignumToHex(randomizer),
  }
};

/**
 * @description Checks if a commitment is valid, given a set of messages and a randomizer
 * @returns true if commitment passes validity check. Otherwise false.
 */
const isValidPedersenCommitment = (commitment: string, randomizers: ContestMap<string[][]>, randomizer: string) => {
  if([commitment, randomizer].some(m => !isValidHexString(m)))
    throw new Error("Input is not a valid hex string");

  const messages = stringMapToBignumMap(flattenRandomizers(randomizers));
  const pointCommitment = pointFromHex(commitment);
  const bnRandomizer = bignumFromHex(randomizer);

  return PedersenCommitment.verify(pointCommitment, messages, bnRandomizer);
}

function flattenRandomizers( randomizers: ContestMap<string[][]> ): ContestMap<string[]> {
  const flatten = (arrays: string[][]) => Object.values(arrays).reduce((collector, pileRandomizers): string[] => {
    return [...collector, ...pileRandomizers]
  }, []);

  const entries = Object.entries(randomizers).map(([reference, randomizers]) => [reference, flatten(randomizers)])
  return Object.fromEntries(entries)
}


export {
  generatePedersenCommitment,
  isValidPedersenCommitment,
};
