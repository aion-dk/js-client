import {
  addPoints,
  Bignum,
  bignumFromHex,
  bignumToHex,
  Curve,
  generateRandomBignum,
  hashToBignum,
  Point,
  pointFromHex,
  pointFromX,
  pointToHex,
} from "./util";

class PedersenCommitment {
  static computeGenerator(index) {
    const baseGeneratorPrefix = () => pointToHex(new Point(Curve.G));
    const secp256k1_curve_prime = new Bignum(Curve.field.modulus);

    const target = [baseGeneratorPrefix(), index].join(',');
    let x = hashToBignum(target).mod(secp256k1_curve_prime);

    /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
    while(true) {
      try {
        return pointFromX(x);
      }
      catch(err) {
        // Skip to next iteration
      }

      x = x.add(new Bignum(1)).mod(secp256k1_curve_prime);
    }
  }

  static verify(commitment: Point, messages, randomizer: Bignum) {
    return commitment.equals(this.generate(messages, randomizer))
  }

  static generate(messages: Bignum[], randomizer: Bignum): Point {
    let commitment = new Point(Curve.G).mult(randomizer);

    messages.forEach((message, index) => {
      const generator = PedersenCommitment.computeGenerator(index);
      const term = generator.mult(message);

      commitment = addPoints(commitment, term);
    });

    return commitment;
  }
}

/**
 * @description Generates an encryption commitment
 * @returns Commitment point and randomizer, both as hex.
 */
const generatePedersenCommitment = (messages: string[], options?: { randomizer: string }) => {
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
  const pointCommitment = pointFromHex(commitment);
  const bnMessages = messages.map(m => bignumFromHex(m));
  const bnRandomizer = bignumFromHex(randomizer);

  return PedersenCommitment.verify(pointCommitment, bnMessages, bnRandomizer);
}

export {
  PedersenCommitment,
  generatePedersenCommitment,
  isValidPedersenCommitment,
}
