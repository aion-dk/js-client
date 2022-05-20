const sjcl = require('./sjcl')

const Curve = sjcl.ecc.curves['k256'] // secp256k1


class DiscreteLogarithmProof {

  /**
   * @constructor
   * @param {sjcl.ecc.point} commitment_point The commitment of the proof.
   * @param {sjcl.bn} challenge_bn The challenge of the proof.
   * @param {sjcl.bn} response_bn The response of the proof.
   */
  constructor(commitment_point, challenge_bn, response_bn){
    this.commitment_point = commitment_point
    this.challenge_bn = challenge_bn
    this.response_bn = response_bn
  }

  /**
   * @param {sjcl.ecc.point} generator The generator of the public key (point).
   * @param {sjcl.ecc.point} public_key The public key (point) against which the proof is verified.
   * @return {boolean} Validation
   */
  verify(generator, public_key) {
    if (!this.verifyWithoutChallenge(generator, public_key)) return false

    let hash_bits = sjcl.bitArray.concat(
        sjcl.bitArray.concat(
            pointToBits(generator, true),
            pointToBits(this.commitment_point, true)
        ),
        pointToBits(public_key, true)
    )
    let calculated_challenge_bn = hashToBn(hash_bits).mod(Curve.r)

    return this.challenge_bn.equals(calculated_challenge_bn)
  }

  /**
   * @param {sjcl.ecc.point} generator The generator of the public key (point).
   * @param {sjcl.ecc.point} public_key The public key (point) against which the proof is verified.
   * @return {boolean} Validation
   */
  verifyWithoutChallenge(generator, public_key) {
    let left_hand_side_point = generator.mult(this.response_bn)
    let right_hand_side_point = addPoints(this.commitment_point, public_key.mult(this.challenge_bn))

    return pointEquals(left_hand_side_point, right_hand_side_point)
  }

  /**
   * @return {String} Proof encoded as a string including all values in hex format
   */
  toString() {
    let commitment_hex = sjcl.codec.hex.fromBits(pointToBits(this.commitment_point, true))
    let challenge_hex = sjcl.codec.hex.fromBits(this.challenge_bn.toBits())
    let response_hex = sjcl.codec.hex.fromBits(this.response_bn.toBits())

    return commitment_hex + "," + challenge_hex + "," + response_hex
  }

  static fromString(string) {
    let strings = string.split(",")

    switch (strings.length) {
      case 3:
        let commitment_point = pointFromBits(sjcl.codec.hex.toBits(strings[0]))
        let challenge_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[1]))
        let response_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[2]))

        if (!challenge_bn.equals(challenge_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for challenge")
        if (!response_bn.equals(response_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for response")

        return new DiscreteLogarithmProof(commitment_point, challenge_bn, response_bn)
      default:
        throw new sjcl.exception.corrupt("invalid number of arguments in encoding, DiscreteLogarithmProof")
    }
  }

  /**
   * @param {sjcl.ecc.point} generator The generator of the public key (point).
   * @param {sjcl.bn} private_key The private key of the proof (the knowledge).
   * @return {DiscreteLogarithmProof} A discrete logarithm zk proof of the knowledge.
   */
  static generate(generator, private_key) {
    let commitment_bn = sjcl.bn.random(Curve.r)
    let commitment_point = generator.mult(commitment_bn)
    let public_key = generator.mult(private_key)

    let hash_bits = sjcl.bitArray.concat(sjcl.bitArray.concat(pointToBits(generator, true), pointToBits(commitment_point, true)), pointToBits(public_key, true))
    let challenge_bn = hashToBn(hash_bits).mod(Curve.r)

    let response_bn = commitment_bn.add(private_key.mul(challenge_bn)).mod(Curve.r)

    return new DiscreteLogarithmProof(commitment_point, challenge_bn, response_bn)
  }

}


class DiscreteLogarithmEqualityProof {

  /**
   * @constructor
   * @param {sjcl.ecc.point} commitment_point_1 The first commitment of the proof.
   * @param {sjcl.ecc.point} commitment_point_2 The second commitment of the proof.
   * @param {sjcl.bn} challenge_bn The challenge of the proof.
   * @param {sjcl.bn} response_bn The response of the proof.
   */
  constructor(commitment_point_1, commitment_point_2, challenge_bn, response_bn){
    this.commitment_point_1 = commitment_point_1
    this.commitment_point_2 = commitment_point_2
    this.challenge_bn = challenge_bn
    this.response_bn = response_bn
  }

  /**
   * @param {sjcl.ecc.point} generator_1 The generator of the first public key (point).
   * @param {sjcl.ecc.point} generator_2 The generator of the second public key (point).
   * @param {sjcl.ecc.point} public_key_1 The first public key (point) against which the proof is verified.
   * @param {sjcl.ecc.point} public_key_2 The second public key (point) against which the proof is verified.
   * @return {boolean} Validation
   */
  verify(generator_1, generator_2, public_key_1, public_key_2) {
    if (!this.verifyWithoutChallenge(generator_1, generator_2, public_key_1, public_key_2)) return false

    let hash_bits = sjcl.bitArray.concat(sjcl.bitArray.concat(sjcl.bitArray.concat(sjcl.bitArray.concat(sjcl.bitArray.concat(pointToBits(generator_1, true), pointToBits(generator_2, true)), pointToBits(this.commitment_point_1, true)), pointToBits(this.commitment_point_2, true)), pointToBits(public_key_1, true)), pointToBits(public_key_2, true))
    let calculated_challenge_bn = hashToBn(hash_bits).mod(Curve.r)

    return this.challenge_bn.equals(calculated_challenge_bn)
  }

  /**
   * @param {sjcl.ecc.point} generator_1 The generator of the first public key (point).
   * @param {sjcl.ecc.point} generator_2 The generator of the second public key (point).
   * @param {sjcl.ecc.point} public_key_1 The first public key (point) against which the proof is verified.
   * @param {sjcl.ecc.point} public_key_2 The second public key (point) against which the proof is verified.
   * @return {boolean} Validation
   */
  verifyWithoutChallenge(generator_1, generator_2, public_key_1, public_key_2) {
    let left_hand_side_point_1 = generator_1.mult(this.response_bn)
    let right_hand_side_point_1 = addPoints(this.commitment_point_1, public_key_1.mult(this.challenge_bn))

    let left_hand_side_point_2 = generator_2.mult(this.response_bn)
    let right_hand_side_point_2 = addPoints(this.commitment_point_2, public_key_2.mult(this.challenge_bn))

    return pointEquals(left_hand_side_point_1, right_hand_side_point_1) && pointEquals(left_hand_side_point_2, right_hand_side_point_2)
  }

  /**
   * @return {String} Proof encoded as a string including all values in hex format
   */
  toString() {
    let commitment_1_hex = sjcl.codec.hex.fromBits(pointToBits(this.commitment_point_1, true))
    let commitment_2_hex = sjcl.codec.hex.fromBits(pointToBits(this.commitment_point_2, true))
    let challenge_hex = sjcl.codec.hex.fromBits(this.challenge_bn.toBits())
    let response_hex = sjcl.codec.hex.fromBits(this.response_bn.toBits())

    return commitment_1_hex + "," + commitment_2_hex + "," + challenge_hex + "," + response_hex
  }

  static fromString(string) {
    let strings = string.split(",")

    switch (strings.length) {
      case 4:
        let commitment_point_1 = pointFromBits(sjcl.codec.hex.toBits(strings[0]))
        let commitment_point_2 = pointFromBits(sjcl.codec.hex.toBits(strings[1]))
        let challenge_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[2]))
        let response_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[3]))

        if (!challenge_bn.equals(challenge_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for challenge")
        if (!response_bn.equals(response_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for response")

        return new DiscreteLogarithmEqualityProof(commitment_point_1, commitment_point_2, challenge_bn, response_bn)
      default:
        throw new sjcl.exception.corrupt("invalid number of arguments in encoding, DiscreteLogarithmEqualityProof")
    }
  }

  /**
   * @param {sjcl.ecc.point} generator_1 The generator of the first public key (point).
   * @param {sjcl.ecc.point} generator_2 The generator of the second public key (point).
   * @param {sjcl.bn} private_key The private key of the proof (the knowledge).
   * @return {DiscreteLogarithmEqualityProof} A discrete logarithm equality zk proof for this private key
   */
  static generate(generator_1, generator_2, private_key) {
    let commitment_bn = sjcl.bn.random(Curve.r)
    let commitment_point_1 = generator_1.mult(commitment_bn)
    let commitment_point_2 = generator_2.mult(commitment_bn)

    let hash_bits = sjcl.bitArray.concat(sjcl.bitArray.concat(sjcl.bitArray.concat(sjcl.bitArray.concat(sjcl.bitArray.concat(pointToBits(generator_1, true), pointToBits(generator_2, true)), pointToBits(commitment_point_1, true)), pointToBits(commitment_point_2, true)), pointToBits(generator_1.mult(private_key), true)), pointToBits(generator_2.mult(private_key), true))
    let challenge_bn = hashToBn(hash_bits).mod(Curve.r)

    let response_bn = commitment_bn.add(private_key.mul(challenge_bn)).mod(Curve.r)

    return new DiscreteLogarithmEqualityProof(commitment_point_1, commitment_point_2, challenge_bn, response_bn)
  }


}


class DiscreteLogarithmMultipleProof {

  /**
   * @constructor
   * @param {sjcl.ecc.point} commitment_point The commitment of the proof.
   * @param {sjcl.bn} challenge_bn The challenge of the proof.
   * @param {sjcl.bn} response_bn The response of the proof.
   */
  constructor(commitment_point, challenge_bn, response_bn) {
    this.commitment_point = commitment_point
    this.challenge_bn = challenge_bn
    this.response_bn = response_bn
  }

  /**
   * @param {sjcl.ecc.point[]} generators The array of generators of the public keys (points).
   * @param {sjcl.ecc.point[]} public_keys The array of public keys (points) against which the proof is verified.
   * @return {boolean} Validation
   */
  verify(generators, public_keys) {
    if (!this.verifyWithoutChallenge(generators, public_keys)) return false

    let hash_bits = []
    generators.forEach(function (generator) {
      hash_bits = sjcl.bitArray.concat(hash_bits, pointToBits(generator, true))
    })
    hash_bits = sjcl.bitArray.concat(hash_bits, pointToBits(this.commitment_point, true))
    public_keys.forEach(function (public_key) {
      hash_bits = sjcl.bitArray.concat(hash_bits, pointToBits(public_key, true))
    })
    let calculated_challenge_bn = hashToBn(hash_bits).mod(Curve.r)

    return this.challenge_bn.equals(calculated_challenge_bn)
  }

  /**
   * @param {sjcl.ecc.point[]} generators The array of generators of the public keys (points).
   * @param {sjcl.ecc.point[]} public_keys The array of public keys (points) against which the proof is verified.
   * @return {boolean} Validation
   */
  verifyWithoutChallenge(generators, public_keys) {
    if (generators.length !== public_keys.length) return false
    let n = generators.length - 1

    let hash_bits = []
    public_keys.forEach(function (public_key) {
      hash_bits = sjcl.bitArray.concat(hash_bits, pointToBits(public_key, true))
    })
    let hash = sjcl.hash.sha256.hash(hash_bits)

    let z = []
    for (let i = 1; i <= n; i++) {
      hash_bits = sjcl.bitArray.concat(sjcl.codec.utf8String.toBits(i.toString()), hash)
      z[i - 1] = hashToBn(hash_bits).mod(Curve.r)
    }

    let left_hand_side_point = generators[0]
    for (let i = 0; i < n; i++) {
      left_hand_side_point = addPoints(left_hand_side_point, generators[i + 1].mult(z[i]))
    }
    left_hand_side_point = left_hand_side_point.mult(this.response_bn)

    let right_hand_side_point = public_keys[0]
    for (let i = 0; i < n; i++) {
      right_hand_side_point = addPoints(right_hand_side_point, public_keys[i + 1].mult(z[i]))
    }
    right_hand_side_point = addPoints(this.commitment_point, right_hand_side_point.mult(this.challenge_bn))

    return pointEquals(left_hand_side_point, right_hand_side_point)
  }

  /**
   * @return {String} Proof encoded as a string including all values in hex format
   */
  toString() {
    let commitment_hex = sjcl.codec.hex.fromBits(pointToBits(this.commitment_point, true))
    let challenge_hex = sjcl.codec.hex.fromBits(this.challenge_bn.toBits())
    let response_hex = sjcl.codec.hex.fromBits(this.response_bn.toBits())

    return commitment_hex + "," + challenge_hex + "," + response_hex
  }

  static fromString(string) {
    let strings = string.split(",")

    switch (strings.length) {
      case 3:
        let commitment_point = pointFromBits(sjcl.codec.hex.toBits(strings[0]))
        let challenge_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[1]))
        let response_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[2]))

        if (!challenge_bn.equals(challenge_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for challenge")
        if (!response_bn.equals(response_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for response")

        return new DiscreteLogarithmMultipleProof(commitment_point, challenge_bn, response_bn)
      default:
        throw new sjcl.exception.corrupt("invalid number of arguments in encoding, DiscreteLogarithmMultipleProof")
    }
  }

  /**
   * @param {sjcl.ecc.point[]} generators The array of generators of the public keys (points).
   * @param {sjcl.bn} private_key The private key of the proof (the knowledge).
   * @return {DiscreteLogarithmMultipleProof} A discrete logarithm multiple zk proof of the knowledge.
   */
  static generate(generators, private_key) {
    let n = generators.length - 1
    let public_keys = generators.map(function (generator) {
      return generator.mult(private_key)
    })
    let commitment_bn = sjcl.bn.random(Curve.r)

    let hash_bits = []
    public_keys.forEach(function (public_key) {
      hash_bits = sjcl.bitArray.concat(hash_bits, pointToBits(public_key, true))
    })
    let hash = sjcl.hash.sha256.hash(hash_bits)

    let z = []
    for (let i = 1; i <= n; i++) {
      hash_bits = sjcl.bitArray.concat(sjcl.codec.utf8String.toBits(i.toString()), hash)
      z[i - 1] = hashToBn(hash_bits).mod(Curve.r)
    }

    let commitment_point = generators[0]
    for (let i = 0; i < n; i++) {
      commitment_point = addPoints(commitment_point, generators[i + 1].mult(z[i]))
    }
    commitment_point = commitment_point.mult(commitment_bn)

    hash_bits = []
    generators.forEach(function (generator) {
      hash_bits = sjcl.bitArray.concat(hash_bits, pointToBits(generator, true))
    })
    hash_bits = sjcl.bitArray.concat(hash_bits, pointToBits(commitment_point, true))
    public_keys.forEach(function (public_key) {
      hash_bits = sjcl.bitArray.concat(hash_bits, pointToBits(public_key, true))
    })
    let challenge_bn = hashToBn(hash_bits).mod(Curve.r)

    let response_bn = commitment_bn.add(private_key.mul(challenge_bn)).mod(Curve.r)

    return new DiscreteLogarithmMultipleProof(commitment_point, challenge_bn, response_bn)
  }

}


class ElGamalScalarCryptogram {
  /**
   * @constructor
   * @param {sjcl.ecc.point} randomness_point The point representing the randomness used in this cryptogram.
   * @param {sjcl.bn} ciphertext_bn The number (ciphertext) encoding the message.
   */
  constructor(randomness_point, ciphertext_bn) {
    this.randomness_point = randomness_point
    this.ciphertext_bn = ciphertext_bn
  }

  /**
   * @param {sjcl.bn} private_key The decryption key, in form of big integer.
   * @return {sjcl.bn} The decrypted message, in form of big integer (scalar).
   */
  decrypt(private_key) {
    let secret_point = this.randomness_point.mult(private_key)
    let secret_bn = hashToBn(pointToBits(secret_point, true)).mod(Curve.r)
    let secret_bn_inverse = secret_bn.inverseMod(Curve.r)

    return this.ciphertext_bn.mul(secret_bn_inverse).mod(Curve.r)
  }

  /**
   * @return {String} Cryptogram encoded as a string including all values in hex format
   */
  toString() {
    let randomness_hex = sjcl.codec.hex.fromBits(pointToBits(this.randomness_point, true))
    let ciphertext_hex = sjcl.codec.hex.fromBits(this.ciphertext_bn.toBits())

    return randomness_hex + "," + ciphertext_hex
  }

  static fromString(string){
    let strings = string.split(",")

    switch (strings.length) {
      case 2:
        let randomness_point = pointFromBits(sjcl.codec.hex.toBits(strings[0]))
        let ciphertext_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[1]))

        if (!ciphertext_bn.equals(ciphertext_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for ciphertext")

        return new ElGamalScalarCryptogram(randomness_point, ciphertext_bn)
      default:
        throw new sjcl.exception.corrupt("invalid number of arguments in encoding, ElGamalScalarCryptogram")
    }
  }

  /**
   * @param {sjcl.bn} scalar The message (scalar) to be encrypted.
   * @param {sjcl.ecc.point} public_key The key to encrypt with.
   * @param {sjcl.bn} randomness_bn The random value (scalar) used in encryption.
   * @return {ElGamalScalarCryptogram} The cryptogram encoding the message
   */
  static encrypt(scalar, public_key, randomness_bn) {
    let randomness_point = Curve.G.mult(randomness_bn)
    let secret_point = public_key.mult(randomness_bn)

    let secret_bn = hashToBn(pointToBits(secret_point, true)).mod(Curve.r)

    let ciphertext_bn = scalar.mul(secret_bn).mod(Curve.r)

    return new ElGamalScalarCryptogram(randomness_point, ciphertext_bn)
  }

}


class ElGamalPointCryptogram {
  /**
   * @constructor
   * @param {sjcl.ecc.point} randomness_point The point representing the randomness used in this cryptogram.
   * @param {sjcl.ecc.point} ciphertext_point The point (cyphertext) encoding the message.
   */
  constructor(randomness_point, ciphertext_point) {
    this.randomness_point = randomness_point
    this.ciphertext_point = ciphertext_point
  }

  /**
   * @param {sjcl.bn} private_key The decryption key, in form of big integer.
   * @return {sjcl.ecc.point} The decrypted message, in form of point.
   */
  decrypt(private_key) {
    let secret_point = this.randomness_point.mult(private_key)

    return addPoints(this.ciphertext_point, secret_point.negate())
  }

  homomorphicallyAddCryptogram(other_cryptogram) {
    this.randomness_point = addPoints(this.randomness_point, other_cryptogram.randomness_point)
    this.ciphertext_point = addPoints(this.ciphertext_point, other_cryptogram.ciphertext_point)
  }

  /**
   * @return {String} Cryptogram encoded as a string including all values in hex format
   */
  toString() {
    let randomness_hex = sjcl.codec.hex.fromBits(pointToBits(this.randomness_point, true))
    let ciphertext_hex = sjcl.codec.hex.fromBits(pointToBits(this.ciphertext_point, true))

    return randomness_hex + "," + ciphertext_hex
  }

  static fromString(string) {
    let strings = string.split(",")

    switch (strings.length) {
      case 2:
        let randomness_point = pointFromBits(sjcl.codec.hex.toBits(strings[0]))
        let ciphertext_point = pointFromBits(sjcl.codec.hex.toBits(strings[1]))

        return new ElGamalPointCryptogram(randomness_point, ciphertext_point)
      default:
        throw new sjcl.exception.corrupt("invalid number of arguments in encoding ElGamalPointCryptogram")
    }
  }

  /**
   * @param {sjcl.ecc.point} point The message (point) to be encrypted.
   * @param {sjcl.ecc.point} public_key The key to encrypt with.
   * @param {sjcl.bn} randomness_bn The random value (scalar) used in encryption.
   * @return {ElGamalPointCryptogram} The cryptogram encoding the message
   */
  static encrypt(point, public_key, randomness_bn) {
    let randomness_point = Curve.G.mult(randomness_bn)

    let secret_point = public_key.mult(randomness_bn)

    let ciphertext_point = secret_point
    if (point) ciphertext_point = addPoints(ciphertext_point, point)

    return new ElGamalPointCryptogram(randomness_point, ciphertext_point)
  }
}


class SchnorrSignature {

  /**
   * @constructor
   * @param {sjcl.bn} payload_bn The payload of the signature, representing the hash of the commitment and the message as a big integer.
   * @param {sjcl.bn} signature_bn The signature as a big integer.
   */
  constructor(payload_bn, signature_bn) {
    this.payload_bn = payload_bn
    this.signature_bn = signature_bn
  }

  /**
   * @param {sjcl.ecc.point} public_key The public key.
   * @param {String} message The signed message.
   * @return {boolean} Validation
   */
  verify(public_key, message) {
    let commitment_point = addPoints(Curve.G.mult(this.signature_bn), public_key.mult(this.payload_bn))

    let hash_bits = sjcl.bitArray.concat(pointToBits(commitment_point, true), sjcl.codec.utf8String.toBits(message))
    let payload_calculated_bn = hashToBn(hash_bits).mod(Curve.r)

    return payload_calculated_bn.equals(this.payload_bn)
  }

  /**
   * @return {String} Signature encoded as a string including all values in hex format
   */
  toString() {
    let payload_hex = sjcl.codec.hex.fromBits(this.payload_bn.toBits())
    let signature_hex = sjcl.codec.hex.fromBits(this.signature_bn.toBits())

    return payload_hex + "," + signature_hex
  }

  static fromString(string) {
    let strings = string.split(",")

    switch (strings.length) {
      case 2:
        let payload_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[0]))
        let signature_bn = sjcl.bn.fromBits(sjcl.codec.hex.toBits(strings[1]))

        if (!payload_bn.equals(payload_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for payload")
        if (!signature_bn.equals(signature_bn.mod(Curve.r))) throw new sjcl.exception.corrupt("invalid value for signature")

        return new SchnorrSignature(payload_bn, signature_bn)
      default:
        throw new sjcl.exception.corrupt("invalid number of arguments in encoding, SchnorrSignature")
    }
  }

  /**
   * @param {String} message the message to be signed
   * @param {sjcl.bn} private_key The private key of the signer.
   * @return {SchnorrSignature} A Schnorr signature tuple.
   */
  static sign(message, private_key) {
    let commitment_bn = randomBN()
    let commitment_point = Curve.G.mult(commitment_bn)

    let hash_bits = sjcl.bitArray.concat(pointToBits(commitment_point, true), sjcl.codec.utf8String.toBits(message))
    let payload_bn = hashToBn(hash_bits).mod(Curve.r)

    let signature_bn = commitment_bn.sub(private_key.mul(payload_bn)).mod(Curve.r)

    return new SchnorrSignature(payload_bn, signature_bn)
  }

}


// new methods for the sjcl library
function pointEquals(point_1, point_2) {
  if (point_1.isIdentity)
    return point_2.isIdentity

  if (point_2.isIdentity)
    return false

  return point_1.x.equals(point_2.x) && point_1.y.equals(point_2.y)
}

/**
 * @param {Point} point to be encoded as bits.
 * @param {boolean} compressed Compressed or uncompressed form (33 or 65 bytes).
 * @return {bitArray} The encoded data in form of bits.
 */
function pointToBits(point, compressed) {
  if (point.isIdentity) {
    let flag_bits = sjcl.codec.bytes.toBits([0x00])
    return flag_bits
  } else if (compressed) {
    let flag = 0x02 | point.y.limbs[0] & 0x01
    let _flag_bits = sjcl.codec.bytes.toBits([flag === 2 ? 0x02 : 0x03])
    let data_bits = point.x.toBits()
    return sjcl.bitArray.concat(_flag_bits, data_bits)
  } else {
    let _flag_bits2 = sjcl.codec.bytes.toBits([0x04])
    let _data_bits = sjcl.bitArray.concat(point.x.toBits(), point.y.toBits())
    return sjcl.bitArray.concat(_flag_bits2, _data_bits)
  }
}


function addPoints(point_1, point_2) {
  return point_1.toJac().add(point_2).toAffine()
}


function pointFromBits(bits) {
  let type = sjcl.bitArray.extract(bits, 0, 8)
  let x = void 0,
      y = void 0,
      bn_bits = void 0

  switch (type) {
    case 0:
      return new sjcl.ecc.point(Curve)
    case 2:
      bn_bits = sjcl.bitArray.bitSlice(bits, 8, 8 + 8 * 32)
      x = sjcl.bn.fromBits(bn_bits)
      y = recoverYfromX(x, 0)
      break
    case 3:
      bn_bits = sjcl.bitArray.bitSlice(bits, 8, 8 + 8 * 32)
      x = sjcl.bn.fromBits(bn_bits)
      y = recoverYfromX(x, 1)
      break
    case 4:
      bn_bits = sjcl.bitArray.bitSlice(bits, 8, 8 + 8 * 32)
      x = sjcl.bn.fromBits(bn_bits)
      bn_bits = sjcl.bitArray.bitSlice(bits, 8 + 8 * 32, 8 + 8 * 32 + 8 * 32)
      y = sjcl.bn.fromBits(bn_bits)
      break
  }

  let p = new sjcl.ecc.point(Curve, new Curve.field(x), new Curve.field(y))

  if (!p.isValid()) {
    throw new sjcl.exception.corrupt("not on the curve!")
  }
  return p
}

// helper methods

function randomBN() {
  return sjcl.bn.random(Curve.r)
}

function randomPoint() {
  while (true) {
    let flag_byte = Math.random() >= 0.5 ? 0x02 : 0x03
    let flag_bits = sjcl.codec.bytes.toBits([flag_byte])

    let x_bn = sjcl.bn.random(Curve.field.modulus)

    let point_bits = sjcl.bitArray.concat(flag_bits, x_bn.toBits())

    try {
      let point = pointFromBits(point_bits)
      return point
    } catch (err) {}
  }
}

/**
 * @param {sjcl.bn} x The x coordonate as a bignum.
 * @param {Integer} odd
 * @return {sjcl.bn} The y coordinate, freshly calculated.
 */
function recoverYfromX(x, odd) {
  let prime = Curve.field.modulus
  let y2 = Curve.b.add(x.mulmod(Curve.a.add(x.square().mod(prime)).mod(prime), prime)).mod(prime)

  let p = prime.add(1)
  p.halveM()
  p.halveM()

  let y = y2.powermod(p, prime)

  if ((y.limbs[0] & 1) !== odd) {
    y = prime.sub(y).normalize()
  }

  // noinspection JSSuspiciousNameCombination
  return y
}

function hashToBn(bits) {
  let bn_bits = sjcl.hash.sha256.hash(bits)
  return sjcl.bn.fromBits(bn_bits)
}


//  voter use case methods
/**
 * Generates a pair of private public keys
 *
 * @return {(string, string)} An object with two fields, one for the private key and one for the public key
 */
function generateKeyPair( privateKeyString = null ) {
    let privateKey = privateKeyString
        ? sjcl.bn.fromBits(sjcl.codec.hex.toBits(privateKeyString))
        : randomBN()

    let publicKey = Curve.G.mult(privateKey)

    return {
        private_key: sjcl.codec.hex.fromBits(privateKey.toBits()),
        public_key: sjcl.codec.hex.fromBits(pointToBits(publicKey, true))
    }
}

/**
 * Generates a SchnorrSignature on a paticular message
 *
 * @param {string} message The message to be signed.
 * @param {string} privateKeyString The private key as a string
 * @return {string} The signature as a string
 */
function generateSchnorrSignature(message, privateKeyString) {
    let privateKey = sjcl.bn.fromBits(sjcl.codec.hex.toBits(privateKeyString))
    let signature = SchnorrSignature.sign(message, privateKey)

    return signature.toString()
}

/**
 * Verifies a SchnorrSignature on a paticular message
 *
 * @param {string} signature_string The signature as a string.
 * @param {string} message The message to be signed.
 * @param {string} public_key_string The signature verification key as a string
 * @return {boolean}
 */
function verifySchnorrSignature(signature_string, message, public_key_string) {
    let signature = SchnorrSignature.fromString(signature_string)
    let public_key = pointFromBits(sjcl.codec.hex.toBits(public_key_string))

    return signature.verify(public_key, message)
}

/**
 * Generates a random number
 * Used for generating a challenge
 *
 * @return {string} The number as a string
 */
function generateRandomNumber() {
    let challenge = randomBN()

    return sjcl.codec.hex.fromBits(challenge.toBits())
}

/**
 * Generates a random point
 * Used for generating test data
 *
 * @return {string} The point as a string
 */
function generateRandomPoint() {
  let point = randomPoint()

  return sjcl.codec.hex.fromBits(pointToBits(point, true))
}

/**
 * Verifies a proof of empty cryptogram
 *
 * @param {string} proof_string The proof as a string (including commitment, challenge and response)
 * @param {string} empty_cryptogram_string The empty cryptogram encoded as string.
 * @param {string} encryption_key_string The encryption key as a string
 * @return {boolean}
 */
function verifyEmptyCryptogramProof(proof_string, empty_cryptogram_string, encryption_key_string) {
    let dlm_proof = DiscreteLogarithmMultipleProof.fromString(proof_string)
    let empty_cryptogram = ElGamalPointCryptogram.fromString(empty_cryptogram_string)
    let encryption_key = pointFromBits(sjcl.codec.hex.toBits(encryption_key_string))

    let generators = [Curve.G, encryption_key]
    let points = [empty_cryptogram.randomness_point, empty_cryptogram.ciphertext_point]

    return dlm_proof.verifyWithoutChallenge(generators, points)
}

/**
 * Encrypts the vote on top of the empty cryptogram
 *
 * @param {encodingType} integer representing the encoding type (available encoding type at VOTE_ENCODING_TYPE)
 * @param {string or array} vote The vote that should be encrypted in form of a string (the name of the candidate) or an
 * array of integers (in case of a multiple election)
 * @param {string} empty_cryptogram_string The empty cryptogram encoded as string.
 * @param {string} encryption_key_string The encryption key as a string
 * @return {(string, string)} An object with two fields one for the vote cryptogram as string and the second one as the
 * randomness value used in the encryption as a string
 */
function encryptVote(encoding_type, vote, empty_cryptogram_string, encryption_key_string) {
  let vote_point = voteToPoint(encoding_type, vote)
  return encryptVotePoint(vote_point, empty_cryptogram_string, encryption_key_string)
}

/**
 * Encrypts the vote point on top of an empty cryptogram
 *
 * @param {sjcl.ecc.point} vote_point The vote that should be encrypted in form of a point on the curve
 * @param {string} empty_cryptogram_string The empty cryptogram encoded as string.
 * @param {string} encryption_key_string The encryption key as a string
 * @return {(string, string)} An object with two fields one for the vote cryptogram as string and the second one as the
 * randomness value used in the encryption as a string
 */
function encryptVotePoint(vote_point, empty_cryptogram_string, encryption_key_string) {
  let empty_cryptogram = ElGamalPointCryptogram.fromString(empty_cryptogram_string)

  let encryption_key = pointFromBits(sjcl.codec.hex.toBits(encryption_key_string))
  let randomness_bn = randomBN()
  let vote_cryptogram = ElGamalPointCryptogram.encrypt(vote_point, encryption_key, randomness_bn)
  vote_cryptogram.homomorphicallyAddCryptogram(empty_cryptogram)

  return {
    cryptogram: vote_cryptogram.toString(),
    randomness: sjcl.codec.hex.fromBits(randomness_bn.toBits())
  }
}

/**
 * Generates a discrete logarithm proof
 * Used for proving the correct encryption (proving the use of the empty cryptogram)
 *
 * @param {string} secret_string The private key of the proof as a string
 * @return {string} The proof as a string
 */
function generateDiscreteLogarithmProof(secret_string) {
  let secret = sjcl.bn.fromBits(sjcl.codec.hex.toBits(secret_string))

  let proof = DiscreteLogarithmProof.generate(Curve.G, secret)

  return proof.toString()
}

function orderObjectByKeys(object) {
  let ordered = {}
  Object.keys(object).sort().forEach(function(key) {
    ordered[key] = object[key]
  })

  return ordered
}

function hashString(string) {
  let bits = sjcl.codec.utf8String.toBits(string)
  let hash_bits = sjcl.hash.sha256.hash(bits)
  let hash_hex = sjcl.codec.hex.fromBits(hash_bits)

  return hash_hex
}

function addBigNums(bn1_hex, bn2_hex) {
  let bn1 = sjcl.bn.fromBits(sjcl.codec.hex.toBits(bn1_hex))
  let bn2 = sjcl.bn.fromBits(sjcl.codec.hex.toBits(bn2_hex))

  let sum = bn1.add(bn2).mod(Curve.r)
  let sum_hex = sjcl.codec.hex.fromBits(sum.toBits())

  return sum_hex
}

module.exports = {
  Curve,
  DiscreteLogarithmProof,
  DiscreteLogarithmEqualityProof,
  DiscreteLogarithmMultipleProof,
  ElGamalScalarCryptogram,
  ElGamalPointCryptogram,
  SchnorrSignature,
  pointEquals,
  pointToBits,
  addPoints,
  pointFromBits,
  randomBN,
  //'randomPoint': randomPoint,                             // Not used?
  //'recoverYfromX': recoverYfromX,                         // Not used?
  hashToBn,
  //'VOTE_ENCODING_TYPE': VOTE_ENCODING_TYPE,               // Not used?
  // 'voteToPoint': voteToPoint,                            // Not used?
  // 'pointToVote': pointToVote,                            // Not used?
  generateKeyPair,
  generateSchnorrSignature,
  verifySchnorrSignature,
  generateRandomNumber,
  //'generateRandomPoint': generateRandomPoint,             // Not used?
  verifyEmptyCryptogramProof,
  encryptVote,
  //'encryptVotePoint': encryptVotePoint,                   // Not used?
  generateDiscreteLogarithmProof,
  //'orderObjectByKeys': orderObjectByKeys,                 // Not used?
  hashString,
  addBigNums,
}
