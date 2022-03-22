var AssemblyVoting;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 588:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const sjcl = __webpack_require__(469)

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


/***/ }),

/***/ 85:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BulletinBoard = void 0;
var axios_1 = __webpack_require__(669);
var errors_1 = __webpack_require__(749);
var BulletinBoard = /** @class */ (function () {
    function BulletinBoard(baseURL, timeout) {
        if (timeout === void 0) { timeout = 10000; }
        this.createBackendClient(baseURL, timeout);
    }
    BulletinBoard.prototype.setVoterSessionUuid = function (voterSessionUuid) {
        this.voterSessionUuid = voterSessionUuid;
    };
    BulletinBoard.prototype.getElectionConfig = function () {
        return this.backend.get('election_config');
    };
    BulletinBoard.prototype.createVoterRegistration = function (authToken, parentAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.backend.post('registrations', {
                            authToken: authToken,
                            parentAddress: parentAddress
                        }).catch(function (error) {
                            var response = error.response;
                            if (error.request && !response) {
                                throw new errors_1.NetworkError('Network error. Could not connect to Bulletin Board.');
                            }
                            if ([403, 500].includes(response.status) && response.data) {
                                if (!response.data.error || !response.data.error.code || !response.data.error.description) {
                                    throw new errors_1.UnsupportedServerReplyError("Unsupported Bulletin Board server error message: ".concat(JSON.stringify(error.response.data)));
                                }
                                var errorMessage = response.data.error.description;
                                throw new errors_1.BulletinBoardError(errorMessage);
                            }
                            throw error;
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    BulletinBoard.prototype.submitVotes = function (signedBallotCryptogramsItem) {
        return this.backend.post('votes', signedBallotCryptogramsItem, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.getVotingTrack = function (trackingCode) {
        return this.backend.get("verification/vote_track?id=".concat(trackingCode));
    };
    BulletinBoard.prototype.getCommitmentOpenings = function (verifierItemAddress) {
        return this.backend.get("verification/commitment_openings?id=".concat(verifierItemAddress));
    };
    BulletinBoard.prototype.getSpoilRequestItem = function (ballotCryptogramAddress) {
        return this.backend.get("verification/spoil_status?id=".concat(ballotCryptogramAddress));
    };
    BulletinBoard.prototype.getVerifierItem = function (spoilRequestAddress) {
        return this.backend.get("verification/verifier?id=".concat(spoilRequestAddress));
    };
    BulletinBoard.prototype.submitVerifierItem = function (signedVerifierItem) {
        return this.backend.post('verification/verifier', signedVerifierItem);
    };
    BulletinBoard.prototype.submitCommitmentOpenings = function (content) {
        return this.backend.post('verification/commitment_openings', content, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.submitCommitment = function (signedCommit) {
        return this.backend.post('commitments', signedCommit, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.submitCastRequest = function (content) {
        return this.backend.post('cast', content, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.submitSpoilRequest = function (content) {
        return this.backend.post('spoil', content, {
            headers: {
                'X-Voter-Session': this.voterSessionUuid
            }
        });
    };
    BulletinBoard.prototype.createBackendClient = function (baseURL, timeout) {
        this.backend = axios_1.default.create({
            baseURL: baseURL,
            withCredentials: false,
            timeout: timeout,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
    };
    return BulletinBoard;
}());
exports.BulletinBoard = BulletinBoard;
//# sourceMappingURL=bulletin_board.js.map

/***/ }),

/***/ 68:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.POLLING_INTERVAL_MS = exports.MAX_POLL_ATTEMPTS = exports.VOTER_ENCRYPTION_COMMITMENT_OPENING_ITEM = exports.VERIFICATION_START_ITEM = exports.VERIFIER_ITEM = exports.SPOIL_REQUEST_ITEM = exports.CAST_REQUEST_ITEM = exports.BOARD_COMMITMENT_ITEM = exports.VOTER_COMMITMENT_ITEM = exports.VOTER_SESSION_ITEM = exports.BALLOT_CRYPTOGRAMS_ITEM = void 0;
exports.BALLOT_CRYPTOGRAMS_ITEM = "BallotCryptogramsItem";
exports.VOTER_SESSION_ITEM = "VoterSessionItem";
exports.VOTER_COMMITMENT_ITEM = "VoterEncryptionCommitmentItem";
exports.BOARD_COMMITMENT_ITEM = "BoardEncryptionCommitmentItem";
exports.CAST_REQUEST_ITEM = "CastRequestItem";
exports.SPOIL_REQUEST_ITEM = "SpoilRequestItem";
exports.VERIFIER_ITEM = "VerifierItem";
exports.VERIFICATION_START_ITEM = "VerificationStartItem";
exports.VOTER_ENCRYPTION_COMMITMENT_OPENING_ITEM = "VoterEncryptionCommitmentOpeningItem";
exports.MAX_POLL_ATTEMPTS = 60;
exports.POLLING_INTERVAL_MS = 500;
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ 866:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var sjcl = __webpack_require__(469);
// As this is working with untyped SJCL classes,
// we need the _any_ type in this wrapper.
/*eslint-disable @typescript-eslint/no-explicit-any*/
var Bignum = /** @class */ (function () {
    function Bignum(data) {
        var _this = this;
        this.isEven = function () { return _this.bn.limbs[0] % 2 === 0; };
        this.equals = function (other) { return !!_this.bn.equals(other.bn); };
        this.mod = function (operand) { return new Bignum(_this.bn.mod(operand.bn)); };
        this.add = function (operand) { return new Bignum(_this.bn.add(operand.bn)); };
        this.toBits = function () { return _this.bn.toBits(); };
        this.toBn = function () { return _this.bn; };
        this.bn = new sjcl.bn(data);
    }
    return Bignum;
}());
exports["default"] = Bignum;
//# sourceMappingURL=bignum.js.map

/***/ }),

/***/ 46:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decryptVote = void 0;
var util_1 = __webpack_require__(594);
var vote_converter_1 = __webpack_require__(273);
var crypto = __webpack_require__(588);
var point_1 = __webpack_require__(223);
var decryptVote = function (markingType, cryptograms, randomizers, encryptionKey) {
    var points = cryptograms.map(function (cryptogram, index) {
        var randomizer = randomizers[index];
        return decryptVotePoint(cryptogram, randomizer, encryptionKey);
    });
    // TODO: Will fail, until TODO below is fixed
    return (0, vote_converter_1.pointToVote)(points[0]).vote;
};
exports.decryptVote = decryptVote;
function decryptVotePoint(cryptogram, randomizer, encryptionKey) {
    var elGamalCryptogram = crypto.ElGamalPointCryptogram.fromString(cryptogram);
    var publicKey = (0, util_1.pointFromHex)(encryptionKey).toEccPoint();
    var randomizerBn = (0, util_1.bignumFromHex)(randomizer).toBn();
    // invert cryptogram so you can decrypt using the randomness
    var newCryptogram = new crypto.ElGamalPointCryptogram(publicKey, elGamalCryptogram.ciphertext_point);
    var decryptedPoint = new point_1.default(newCryptogram.decrypt(randomizerBn));
    return (0, util_1.pointToHex)(decryptedPoint);
}
//# sourceMappingURL=decrypt_vote.js.map

/***/ }),

/***/ 315:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isValidPedersenCommitment = exports.generatePedersenCommitment = void 0;
var bignum_1 = __webpack_require__(866);
var point_1 = __webpack_require__(223);
var util_1 = __webpack_require__(594);
var PedersenCommitment = /** @class */ (function () {
    function PedersenCommitment() {
    }
    PedersenCommitment.computeGenerator = function (contestUuid, index) {
        var baseGeneratorPrefix = function () { return (0, util_1.pointToHex)(new point_1.default(util_1.Curve.G)); };
        var secp256k1_curve_prime = new bignum_1.default(util_1.Curve.field.modulus);
        var target = [baseGeneratorPrefix(), contestUuid, index].join(',');
        var x = (0, util_1.hashToBignum)(target).mod(secp256k1_curve_prime);
        var point = null;
        while (point === null) {
            point = (0, util_1.pointFromX)(x);
            if (point)
                return point;
            // No point was found for x. Attempt x+1
            x = x.add(new bignum_1.default(1)).mod(secp256k1_curve_prime);
        }
        throw new Error("Unreachable code reached");
    };
    PedersenCommitment.verify = function (commitment, messages, randomizer) {
        return commitment.equals(this.generate(messages, randomizer));
    };
    PedersenCommitment.generate = function (messages, commitmentRandomizer) {
        var initialPoint = new point_1.default(util_1.Curve.G).mult(commitmentRandomizer);
        var terms = Object.entries(messages).flatMap(function (_a) {
            var contestUuid = _a[0], messages = _a[1];
            var terms = messages.map(function (message, index) {
                var generator = PedersenCommitment.computeGenerator(contestUuid, index);
                return generator.mult(message);
            });
            return terms;
        });
        return terms.reduce(function (acc, term) { return (0, util_1.addPoints)(acc, term); }, initialPoint);
    };
    return PedersenCommitment;
}());
var stringMapToBignumMap = function (stringMap) {
    var entries = Object.entries(stringMap).map(function (_a) {
        var contestUuid = _a[0], messages = _a[1];
        if (messages.some(function (m) { return !(0, util_1.isValidHexString)(m); }))
            throw new Error("Input is not a valid hex string");
        return [
            contestUuid,
            messages.map(function (m) { return (0, util_1.bignumFromHex)(m); })
        ];
    });
    return Object.fromEntries(entries);
};
/**
 * @description Generates an encryption commitment
 * @param messages An array of hex strings
 * @param options Optional options object. Allows caller to specify randomizer
 * @returns Commitment point and randomizer, both as hex.
 */
var generatePedersenCommitment = function (randomizers, options) {
    var randomizer = options && options.randomizer ?
        new bignum_1.default(options.randomizer) : (0, util_1.generateRandomBignum)();
    var messages = stringMapToBignumMap(randomizers);
    var commitment = PedersenCommitment.generate(messages, randomizer);
    return {
        commitment: (0, util_1.pointToHex)(commitment),
        randomizer: (0, util_1.bignumToHex)(randomizer),
    };
};
exports.generatePedersenCommitment = generatePedersenCommitment;
/**
 * @description Checks if a commitment is valid, given a set of messages and a randomizer
 * @returns true if commitment passes validity check. Otherwise false.
 */
var isValidPedersenCommitment = function (commitment, randomizers, randomizer) {
    if ([commitment, randomizer].some(function (m) { return !(0, util_1.isValidHexString)(m); }))
        throw new Error("Input is not a valid hex string");
    var messages = stringMapToBignumMap(randomizers);
    var pointCommitment = (0, util_1.pointFromHex)(commitment);
    var bnRandomizer = (0, util_1.bignumFromHex)(randomizer);
    return PedersenCommitment.verify(pointCommitment, messages, bnRandomizer);
};
exports.isValidPedersenCommitment = isValidPedersenCommitment;
//# sourceMappingURL=pedersen_commitment.js.map

/***/ }),

/***/ 223:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var crypto = __webpack_require__(588);
// As this is working with untyped SJCL classes,
// we need the _any_ type in this wrapper.
/*eslint-disable @typescript-eslint/no-explicit-any*/
var Point = /** @class */ (function () {
    function Point(point) {
        var _this = this;
        this.equals = function (other) { return !!crypto.pointEquals(_this.eccPoint, other.eccPoint); };
        this.mult = function (k) { return new Point(_this.eccPoint.mult(k.toBn())); };
        this.toBits = function (compressed) { return crypto.pointToBits(_this.eccPoint, compressed); };
        this.toEccPoint = function () { return _this.eccPoint; };
        this.eccPoint = point;
    }
    return Point;
}());
exports["default"] = Point;
//# sourceMappingURL=point.js.map

/***/ }),

/***/ 594:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isValidHexString = exports.addPoints = exports.pointFromX = exports.generateRandomBignum = exports.hashToBignum = exports.bignumToHex = exports.bignumFromHex = exports.pointToHex = exports.pointFromHex = exports.pointFromBits = exports.Curve = void 0;
var crypto = __webpack_require__(588);
var sjcl = __webpack_require__(469);
var bignum_1 = __webpack_require__(866);
var point_1 = __webpack_require__(223);
exports.Curve = crypto.Curve;
// Converter functions
// --------------------------
var pointFromBits = function (bits) { return crypto.pointFromBits(bits); };
exports.pointFromBits = pointFromBits;
var pointFromHex = function (hex) { return new point_1.default((0, exports.pointFromBits)(sjcl.codec.hex.toBits(hex))); };
exports.pointFromHex = pointFromHex;
var pointToHex = function (point) { return sjcl.codec.hex.fromBits(point.toBits(true)); };
exports.pointToHex = pointToHex;
var bignumFromHex = function (hex) { return new bignum_1.default(sjcl.bn.fromBits(sjcl.codec.hex.toBits(hex))); };
exports.bignumFromHex = bignumFromHex;
var bignumToHex = function (bignum) { return sjcl.codec.hex.fromBits(bignum.toBits()); };
exports.bignumToHex = bignumToHex;
var hashToBignum = function (hash) { return new bignum_1.default(crypto.hashToBn(hash)); };
exports.hashToBignum = hashToBignum;
// Other
// --------------------------
var generateRandomBignum = function () { return new bignum_1.default(crypto.randomBN()); };
exports.generateRandomBignum = generateRandomBignum;
/**
 *
 * @param x x-value from with to derive y-value on the elliptic curve
 * @returns A valid point, if one exists for x. Otherwise null
 */
var pointFromX = function (x) {
    var flag = !x.isEven() ? 2 : 3;
    var flagBignum = new sjcl.bn(flag);
    var encodedPoint = sjcl.bitArray.concat(flagBignum.toBits(), x.toBits());
    try {
        return new point_1.default((0, exports.pointFromBits)(encodedPoint));
    }
    catch (err) {
        if (err instanceof sjcl.exception.corrupt) {
            return null; // No point found on the curve
        }
        throw err;
    }
};
exports.pointFromX = pointFromX;
var addPoints = function (a, b) {
    return new point_1.default(crypto.addPoints(a.toEccPoint(), b.toEccPoint()));
};
exports.addPoints = addPoints;
var isValidHexString = function (test) {
    if (test.length % 2 !== 0)
        return false; // Hex string must be even length
    return test.match(/^[0-9A-Fa-f]+$/) !== null;
};
exports.isValidHexString = isValidHexString;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 273:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pointToVote = exports.voteToPoint = void 0;
var sjcl = __webpack_require__(469);
var crypto = __webpack_require__(588);
// encoding vote methods
var VOTE_ENCODING_TYPE = Object.freeze({
    "INVALID": -1,
    "BLANK": 0,
    // 0x01 - 0x0f text encoding types
    "TEXT_UTF8": 1,
    // 0x11 - 0x1f list of integers encoding types
    "LIST_1B": 17,
    "LIST_2B": 18,
    // 0x21 - 0x2f ranked list of integers encoding types
    "RANKED_1B": 33,
    "RANKED_2B": 34 // 0x22 - each integer encoded as 2 bytes
    // 0xf0 - 0xff must not be used to ensure that x coordinate of point P is less than the prime of the curve
});
var getEncodingTypeFromMarkingType = function (markingType) {
    var minMarks = markingType.minMarks, maxMarks = markingType.maxMarks;
    if (markingType.style === "regular" &&
        minMarks === 1 &&
        maxMarks === 1) {
        return VOTE_ENCODING_TYPE.TEXT_UTF8;
    }
    throw new Error("Marking type not supported");
};
/**
 * @param {encodingType} integer representing the encoding type (available encoding type at VOTE_ENCODING_TYPE)
 * @param {vote} the vote to be encoded as a point, either a string or and array of ids.
 * @return {sjcl.ecc.point} The point representing the vote
 */
var voteToPoint = function (markingType, vote) {
    // turn vote into bignum (used as x coordinate of the point) by:
    // [encoding type bits] + [padding bits] + [vote bits] + [0x00 bits] (last byte is the
    // adjusting byte)
    // prepend the flag bits and try to decode point
    // if not on the curve, increment the x bignum and retry
    var encodingType = getEncodingTypeFromMarkingType(markingType);
    if (encodingType == VOTE_ENCODING_TYPE.BLANK) {
        return new sjcl.ecc.point(crypto.Curve);
    }
    var voteBN;
    switch (encodingType) {
        case VOTE_ENCODING_TYPE.TEXT_UTF8: {
            // the vote is a text
            if (typeof vote !== 'string') {
                throw new sjcl.exception.invalid("vote is not a string");
            }
            if (vote == '') {
                throw new sjcl.exception.invalid("vote cannot be empty");
            }
            var voteBits = sjcl.codec.utf8String.toBits(vote);
            if (sjcl.bitArray.bitLength(voteBits) > 30 * 8) {
                throw new sjcl.exception.invalid("vote text is too long");
            }
            voteBN = sjcl.bn.fromBits(voteBits);
            break;
        }
        default:
            throw new sjcl.exception.invalid("vote encoding not supported");
    }
    // Set the 33rd byte to 02 or 03
    var flag = Math.floor(Math.random() * 2) + 2; // 2 or 3
    var flagBN = new sjcl.bn(flag);
    flagBN = flagBN.mul(new sjcl.bn(256).power(32));
    // Set the 32nd byte according to the vote encoding type
    var encodingBN = new sjcl.bn(encodingType).mul(new sjcl.bn(256).power(31));
    // Set the right most byte to 00 as the adjusting byte
    voteBN = voteBN.mul(256);
    // Construct the point encoding
    var pointBN = voteBN.add(encodingBN).add(flagBN);
    var point;
    var found = false;
    var tries = 0;
    while (!found && tries < 256) {
        tries++;
        try {
            point = crypto.pointFromBits(pointBN.toBits());
            found = true;
        }
        catch (err) {
            // increment
            pointBN.addM(1);
        }
    }
    if (!found) {
        throw new sjcl.exception.invalid("mapping vote to point failed");
    }
    return point;
};
exports.voteToPoint = voteToPoint;
/**
 * @param {pointString} The point representing the vote, encoded as a string
 * @return {encodingType; vote} An object containing the encoding type (from VOTE_ENCODING_TYPE) and the vote (a string
 * or an array of ids)
 */
var pointToVote = function (pointString) {
    var point = crypto.pointFromBits(sjcl.codec.hex.toBits(pointString));
    if (point.isIdentity) {
        return {
            encodingType: VOTE_ENCODING_TYPE.BLANK,
            vote: null
        };
    }
    var vote;
    var xBits = point.x.toBits();
    var encodingType = sjcl.bitArray.extract(xBits, 0, 8);
    var voteBits = sjcl.bitArray.bitSlice(xBits, 8 * 1, 8 * 31);
    var voteBN = sjcl.bn.fromBits(voteBits).trim();
    switch (encodingType) {
        case VOTE_ENCODING_TYPE.TEXT_UTF8:
            // vote is encoded as text
            // in case voteBN is zero (0), sjcl encoding outputs '0x000000'
            // therefore, the case need to be handled differently
            if (voteBN.equals(0)) {
                vote = '';
            }
            else {
                vote = sjcl.codec.utf8String.fromBits(voteBN.toBits());
            }
            break;
        default:
            throw new sjcl.exception.corrupt("point does not have a valid vote encoding");
    }
    return {
        encodingType: encodingType,
        vote: vote
    };
};
exports.pointToVote = pointToVote;
//# sourceMappingURL=vote_converter.js.map

/***/ }),

/***/ 221:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.codesToCvr = exports.cvrToCodes = void 0;
var flatten_options_1 = __webpack_require__(225);
function cvrToCodes(contestConfigs, cvr) {
    var cvrCodes = {};
    Object.keys(cvr).forEach(function (contestId) {
        var flatOptions = (0, flatten_options_1.flattenOptions)(contestConfigs[contestId].options);
        var referenceToCode = Object.fromEntries(flatOptions.map(function (option) { return [option.reference, option.code]; }));
        var code = referenceToCode[cvr[contestId]];
        cvrCodes[contestId] = code;
    });
    return cvrCodes;
}
exports.cvrToCodes = cvrToCodes;
function codesToCvr(contestConfigs, cvrCodes) {
    var cvr = {};
    Object.keys(cvrCodes).forEach(function (contestId) {
        var flatOptions = (0, flatten_options_1.flattenOptions)(contestConfigs[contestId].options);
        var codeToReference = Object.fromEntries(flatOptions.map(function (option) { return [option.code, option.reference]; }));
        var reference = codeToReference[cvrCodes[contestId]];
        cvr[contestId] = reference;
    });
    return cvr;
}
exports.codesToCvr = codesToCvr;
//# sourceMappingURL=cvr_conversion.js.map

/***/ }),

/***/ 584:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decrypt = void 0;
var decrypt_vote_1 = __webpack_require__(46);
var cvr_conversion_1 = __webpack_require__(221);
var aion_crypto_1 = __webpack_require__(588);
var decrypt = function (contestConfigs, markingType, encryptionKey, cryptograms, boardCommitmentOpening, voterCommitmentOpening) {
    var cvrCodes = {};
    Object.keys(cryptograms).forEach(function (contestId) {
        var contestCryptograms = cryptograms[contestId];
        var boardRandomizers = boardCommitmentOpening.randomizers[contestId];
        var voterRandomizers = voterCommitmentOpening.randomizers[contestId];
        var randomizers = contestCryptograms.map(function (_, index) {
            return (0, aion_crypto_1.addBigNums)(voterRandomizers[index], boardRandomizers[index]);
        });
        cvrCodes[contestId] = (0, decrypt_vote_1.decryptVote)(markingType, contestCryptograms, randomizers, encryptionKey);
    });
    return (0, cvr_conversion_1.codesToCvr)(contestConfigs, cvrCodes);
};
exports.decrypt = decrypt;
//# sourceMappingURL=decrypt_vote.js.map

/***/ }),

/***/ 771:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateElectionConfig = exports.fetchElectionConfig = void 0;
var errors_1 = __webpack_require__(749);
function fetchElectionConfig(bulletinBoard) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bulletinBoard.getElectionConfig()
                    .then(function (response) {
                    var configData = response.data.electionConfig;
                    // const privKey = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
                    var pubKey = '03e9858b6e48eb93d8f27aa76b60806298c4c7dd94077ad6c3ff97c44937888647';
                    configData.affidavit = {
                        curve: 'k256',
                        encryptionKey: pubKey
                    };
                    return configData;
                })
                    .catch(function (error) {
                    console.error();
                    throw error;
                })];
        });
    });
}
exports.fetchElectionConfig = fetchElectionConfig;
function validateElectionConfig(config) {
    var errors = [];
    if (!containsOTPProviderURL(config)) {
        errors.push("Configuration is missing OTP Provider URL");
    }
    if (!containsOTPProviderContextId(config)) {
        errors.push("Configuration is missing OTP Provider election context uuid");
    }
    if (!containsOTPProviderPublicKey(config)) {
        errors.push("Configuration is missing OTP Provider public key");
    }
    if (!containsVoterAuthorizerURL(config)) {
        errors.push("Configuration is missing Voter Authorizer URL");
    }
    if (!containsVoterAuthorizerContextId(config)) {
        errors.push("Configuration is missing Voter Authorizer election context uuid");
    }
    if (!containsVoterAuthorizerPublicKey(config)) {
        errors.push("Configuration is missing Voter Authorizer public key");
    }
    if (errors.length > 0)
        throw new errors_1.InvalidConfigError("Received invalid election configuration. Errors: ".concat(errors.join(",\n")));
}
exports.validateElectionConfig = validateElectionConfig;
function containsOTPProviderURL(config) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.services) === null || _a === void 0 ? void 0 : _a.otpProvider) === null || _b === void 0 ? void 0 : _b.url) === null || _c === void 0 ? void 0 : _c.length) > 0;
}
function containsOTPProviderContextId(config) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.services) === null || _a === void 0 ? void 0 : _a.otpProvider) === null || _b === void 0 ? void 0 : _b.electionContextUuid) === null || _c === void 0 ? void 0 : _c.length) > 0;
}
function containsOTPProviderPublicKey(config) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.services) === null || _a === void 0 ? void 0 : _a.otpProvider) === null || _b === void 0 ? void 0 : _b.publicKey) === null || _c === void 0 ? void 0 : _c.length) > 0;
}
function containsVoterAuthorizerURL(config) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.services) === null || _a === void 0 ? void 0 : _a.voterAuthorizer) === null || _b === void 0 ? void 0 : _b.url) === null || _c === void 0 ? void 0 : _c.length) > 0;
}
function containsVoterAuthorizerContextId(config) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.services) === null || _a === void 0 ? void 0 : _a.voterAuthorizer) === null || _b === void 0 ? void 0 : _b.electionContextUuid) === null || _c === void 0 ? void 0 : _c.length) > 0;
}
function containsVoterAuthorizerPublicKey(config) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.services) === null || _a === void 0 ? void 0 : _a.voterAuthorizer) === null || _b === void 0 ? void 0 : _b.publicKey) === null || _c === void 0 ? void 0 : _c.length) > 0;
}
//# sourceMappingURL=election_config.js.map

/***/ }),

/***/ 749:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VoterSessionTimeoutError = exports.InvalidTokenError = exports.TimeoutError = exports.CorruptCvrError = exports.UnsupportedServerReplyError = exports.VoterRecordNotFoundError = exports.EmailDoesNotMatchVoterRecordError = exports.BulletinBoardError = exports.InvalidStateError = exports.InvalidConfigError = exports.NetworkError = exports.AccessCodeExpired = exports.AccessCodeInvalid = exports.AvClientError = void 0;
var AvClientError = /** @class */ (function (_super) {
    __extends(AvClientError, _super);
    function AvClientError(message, code, statusCode) {
        if (code === void 0) { code = 0; }
        if (statusCode === void 0) { statusCode = 0; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.code = code;
        // this is mandatory due:
        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(_this, AvClientError.prototype);
        return _this;
    }
    return AvClientError;
}(Error));
exports.AvClientError = AvClientError;
var AccessCodeInvalid = /** @class */ (function (_super) {
    __extends(AccessCodeInvalid, _super);
    function AccessCodeInvalid(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "AccessCodeInvalid";
        Object.setPrototypeOf(_this, AccessCodeInvalid.prototype);
        return _this;
    }
    return AccessCodeInvalid;
}(AvClientError));
exports.AccessCodeInvalid = AccessCodeInvalid;
var AccessCodeExpired = /** @class */ (function (_super) {
    __extends(AccessCodeExpired, _super);
    function AccessCodeExpired(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "AccessCodeExpired";
        Object.setPrototypeOf(_this, AccessCodeExpired.prototype);
        return _this;
    }
    return AccessCodeExpired;
}(AvClientError));
exports.AccessCodeExpired = AccessCodeExpired;
var NetworkError = /** @class */ (function (_super) {
    __extends(NetworkError, _super);
    function NetworkError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "NetworkError";
        Object.setPrototypeOf(_this, NetworkError.prototype);
        return _this;
    }
    return NetworkError;
}(AvClientError));
exports.NetworkError = NetworkError;
var InvalidConfigError = /** @class */ (function (_super) {
    __extends(InvalidConfigError, _super);
    function InvalidConfigError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "InvalidConfigError";
        Object.setPrototypeOf(_this, InvalidConfigError.prototype);
        return _this;
    }
    return InvalidConfigError;
}(AvClientError));
exports.InvalidConfigError = InvalidConfigError;
var InvalidStateError = /** @class */ (function (_super) {
    __extends(InvalidStateError, _super);
    function InvalidStateError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "InvalidStateError";
        Object.setPrototypeOf(_this, InvalidStateError.prototype);
        return _this;
    }
    return InvalidStateError;
}(AvClientError));
exports.InvalidStateError = InvalidStateError;
var BulletinBoardError = /** @class */ (function (_super) {
    __extends(BulletinBoardError, _super);
    function BulletinBoardError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "BulletinBoardError";
        Object.setPrototypeOf(_this, BulletinBoardError.prototype);
        return _this;
    }
    return BulletinBoardError;
}(AvClientError));
exports.BulletinBoardError = BulletinBoardError;
var EmailDoesNotMatchVoterRecordError = /** @class */ (function (_super) {
    __extends(EmailDoesNotMatchVoterRecordError, _super);
    function EmailDoesNotMatchVoterRecordError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "EmailDoesNotMatchVoterRecordError";
        Object.setPrototypeOf(_this, EmailDoesNotMatchVoterRecordError.prototype);
        return _this;
    }
    return EmailDoesNotMatchVoterRecordError;
}(AvClientError));
exports.EmailDoesNotMatchVoterRecordError = EmailDoesNotMatchVoterRecordError;
var VoterRecordNotFoundError = /** @class */ (function (_super) {
    __extends(VoterRecordNotFoundError, _super);
    function VoterRecordNotFoundError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "VoterRecordNotFoundError";
        Object.setPrototypeOf(_this, VoterRecordNotFoundError.prototype);
        return _this;
    }
    return VoterRecordNotFoundError;
}(AvClientError));
exports.VoterRecordNotFoundError = VoterRecordNotFoundError;
var UnsupportedServerReplyError = /** @class */ (function (_super) {
    __extends(UnsupportedServerReplyError, _super);
    function UnsupportedServerReplyError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "UnsupportedServerReplyError";
        Object.setPrototypeOf(_this, UnsupportedServerReplyError.prototype);
        return _this;
    }
    return UnsupportedServerReplyError;
}(AvClientError));
exports.UnsupportedServerReplyError = UnsupportedServerReplyError;
var CorruptCvrError = /** @class */ (function (_super) {
    __extends(CorruptCvrError, _super);
    function CorruptCvrError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "CorruptCvrError";
        Object.setPrototypeOf(_this, CorruptCvrError.prototype);
        return _this;
    }
    return CorruptCvrError;
}(AvClientError));
exports.CorruptCvrError = CorruptCvrError;
var TimeoutError = /** @class */ (function (_super) {
    __extends(TimeoutError, _super);
    function TimeoutError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "TimeoutError";
        Object.setPrototypeOf(_this, TimeoutError.prototype);
        return _this;
    }
    return TimeoutError;
}(AvClientError));
exports.TimeoutError = TimeoutError;
var InvalidTokenError = /** @class */ (function (_super) {
    __extends(InvalidTokenError, _super);
    function InvalidTokenError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "InvalidTokenError";
        Object.setPrototypeOf(_this, InvalidTokenError.prototype);
        return _this;
    }
    return InvalidTokenError;
}(AvClientError));
exports.InvalidTokenError = InvalidTokenError;
var VoterSessionTimeoutError = /** @class */ (function (_super) {
    __extends(VoterSessionTimeoutError, _super);
    function VoterSessionTimeoutError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "VoterSessionTimeoutError";
        Object.setPrototypeOf(_this, VoterSessionTimeoutError.prototype);
        return _this;
    }
    return VoterSessionTimeoutError;
}(AvClientError));
exports.VoterSessionTimeoutError = VoterSessionTimeoutError;
//# sourceMappingURL=errors.js.map

/***/ }),

/***/ 225:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.flattenOptions = void 0;
function flattenOption(option) {
    var clone = __assign({}, option);
    delete clone.children;
    var children = option.children || [];
    return [clone].concat(flattenOptions(children));
}
function flattenOptions(options) {
    var reducer = function (list, option) { return list.concat(flattenOption(option)); };
    return options.reduce(reducer, []);
}
exports.flattenOptions = flattenOptions;
//# sourceMappingURL=flatten_options.js.map

/***/ }),

/***/ 731:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.randomKeyPair = void 0;
var aion_crypto_1 = __webpack_require__(588);
function randomKeyPair() {
    var keyPair = (0, aion_crypto_1.generateKeyPair)();
    return {
        privateKey: keyPair.private_key,
        publicKey: keyPair.public_key
    };
}
exports.randomKeyPair = randomKeyPair;
//# sourceMappingURL=generate_key_pair.js.map

/***/ }),

/***/ 162:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateReceipt = exports.sealEnvelopes = exports.validatePayload = exports.signPayload = exports.fingerprint = exports.encryptAES = void 0;
var Crypto = __webpack_require__(588);
var sjcl = __webpack_require__(469);
var uniformer_1 = __webpack_require__(59);
function encryptAES(payload, encryptionConfig) {
    var pubKey = new sjcl.ecc.elGamal.publicKey(sjcl.ecc.curves[encryptionConfig.curve], Crypto.pointFromBits(sjcl.codec.hex.toBits(encryptionConfig.encryptionKey)));
    return sjcl.encrypt(pubKey, payload);
}
exports.encryptAES = encryptAES;
function fingerprint(encryptedAffidavid) {
    return Crypto.hashString(encryptedAffidavid);
}
exports.fingerprint = fingerprint;
var signPayload = function (obj, privateKey) {
    var uniformer = new uniformer_1.default();
    var uniformPayload = uniformer.formString(obj);
    var signature = Crypto.generateSchnorrSignature(uniformPayload, privateKey);
    return __assign(__assign({}, obj), { signature: signature });
};
exports.signPayload = signPayload;
var validatePayload = function (item, expectations, signaturePublicKey) {
    if (expectations.content !== undefined) {
        verifyContent(item.content, expectations.content);
    }
    if (expectations.type != item.type) {
        throw new Error("BoardItem did not match expected type '".concat(expectations.type, "'"));
    }
    if (expectations.parentAddress != item.parentAddress) {
        throw new Error("BoardItem did not match expected parent address ".concat(expectations.parentAddress));
    }
    verifyAddress(item);
    if (signaturePublicKey !== undefined) {
        verifySignature(item, signaturePublicKey);
    }
};
exports.validatePayload = validatePayload;
var sealEnvelopes = function (encryptedVotes) {
    var sealEnvelope = function (envelope) {
        var randomness = envelope.randomness;
        var proofs = randomness.map(function (randomizer) { return Crypto.generateDiscreteLogarithmProof(randomizer); });
        return proofs;
    };
    return Object.fromEntries(Object.keys(encryptedVotes).map(function (k) { return [k, sealEnvelope(encryptedVotes[k])]; }));
};
exports.sealEnvelopes = sealEnvelopes;
var verifySignature = function (item, signaturePublicKey) {
    var uniformer = new uniformer_1.default();
    var signedPayload = uniformer.formString({
        content: item.content,
        type: item.type,
        parentAddress: item.parentAddress
    });
    if (!Crypto.verifySchnorrSignature(item.signature, signedPayload, signaturePublicKey)) {
        throw new Error('Board signature verification failed');
    }
};
var verifyContent = function (actual, expectations) {
    var uniformer = new uniformer_1.default();
    var expectedContent = uniformer.formString(expectations);
    var actualContent = uniformer.formString(actual);
    if (expectedContent != actualContent) {
        throw new Error('Item payload failed sanity check. Received item did not match expected');
    }
};
var verifyAddress = function (item) {
    var uniformer = new uniformer_1.default();
    var addressHashSource = uniformer.formString({
        type: item.type,
        content: item.content,
        parentAddress: item.parentAddress,
        previousAddress: item.previousAddress,
        registeredAt: item.registeredAt
    });
    var expectedItemAddress = Crypto.hashString(addressHashSource);
    if (item.address != expectedItemAddress) {
        throw new Error("BoardItem address does not match expected address '".concat(expectedItemAddress, "'"));
    }
};
var validateReceipt = function (items, receipt, publicKey) {
    var uniformer = new uniformer_1.default();
    var content = {
        signature: items[0].signature,
        address: items[items.length - 1].address
    };
    var message = uniformer.formString(content);
    if (!Crypto.verifySchnorrSignature(receipt, message, publicKey)) {
        throw new Error('Board receipt verification failed');
    }
};
exports.validateReceipt = validateReceipt;
//# sourceMappingURL=sign.js.map

/***/ }),

/***/ 469:
/***/ ((module, exports, __webpack_require__) => {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/** @fileOverview Javascript cryptography implementation.
 *
 * Crush to remove comments, shorten variable names and
 * generally reduce transmission size.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */


/*jslint indent: 2, bitwise: false, nomen: false, plusplus: false, white: false, regexp: false */
/*global document, window, escape, unescape, module, require, Uint32Array */

/**
 * The Stanford Javascript Crypto Library, top-level namespace.
 * @namespace
 */
var sjcl = {
  /**
   * Symmetric ciphers.
   * @namespace
   */
  cipher: {},

  /**
   * Hash functions.  Right now only SHA256 is implemented.
   * @namespace
   */
  hash: {},

  /**
   * Key exchange functions.  Right now only SRP is implemented.
   * @namespace
   */
  keyexchange: {},
  
  /**
   * Cipher modes of operation.
   * @namespace
   */
  mode: {},

  /**
   * Miscellaneous.  HMAC and PBKDF2.
   * @namespace
   */
  misc: {},
  
  /**
   * Bit array encoders and decoders.
   * @namespace
   *
   * @description
   * The members of this namespace are functions which translate between
   * SJCL's bitArrays and other objects (usually strings).  Because it
   * isn't always clear which direction is encoding and which is decoding,
   * the method names are "fromBits" and "toBits".
   */
  codec: {},
  
  /**
   * Exceptions.
   * @namespace
   */
  exception: {
    /**
     * Ciphertext is corrupt.
     * @constructor
     */
    corrupt: function(message) {
      this.toString = function() { return "CORRUPT: "+this.message; };
      this.message = message;
    },
    
    /**
     * Invalid parameter.
     * @constructor
     */
    invalid: function(message) {
      this.toString = function() { return "INVALID: "+this.message; };
      this.message = message;
    },
    
    /**
     * Bug or missing feature in SJCL.
     * @constructor
     */
    bug: function(message) {
      this.toString = function() { return "BUG: "+this.message; };
      this.message = message;
    },

    /**
     * Something isn't ready.
     * @constructor
     */
    notReady: function(message) {
      this.toString = function() { return "NOT READY: "+this.message; };
      this.message = message;
    }
  }
};
/** @fileOverview Low-level AES implementation.
 *
 * This file contains a low-level implementation of AES, optimized for
 * size and for efficiency on several browsers.  It is based on
 * OpenSSL's aes_core.c, a public-domain implementation by Vincent
 * Rijmen, Antoon Bosselaers and Paulo Barreto.
 *
 * An older version of this implementation is available in the public
 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
 * Stanford University 2008-2010 and BSD-licensed for liability
 * reasons.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Schedule out an AES key for both encryption and decryption.  This
 * is a low-level class.  Use a cipher mode to do bulk encryption.
 *
 * @constructor
 * @param {Array} key The key as an array of 4, 6 or 8 words.
 */
sjcl.cipher.aes = function (key) {
  if (!this._tables[0][0][0]) {
    this._precompute();
  }
  
  var i, j, tmp,
    encKey, decKey,
    sbox = this._tables[0][4], decTable = this._tables[1],
    keyLen = key.length, rcon = 1;
  
  if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
    throw new sjcl.exception.invalid("invalid aes key size");
  }
  
  this._key = [encKey = key.slice(0), decKey = []];
  
  // schedule encryption keys
  for (i = keyLen; i < 4 * keyLen + 28; i++) {
    tmp = encKey[i-1];
    
    // apply sbox
    if (i%keyLen === 0 || (keyLen === 8 && i%keyLen === 4)) {
      tmp = sbox[tmp>>>24]<<24 ^ sbox[tmp>>16&255]<<16 ^ sbox[tmp>>8&255]<<8 ^ sbox[tmp&255];
      
      // shift rows and add rcon
      if (i%keyLen === 0) {
        tmp = tmp<<8 ^ tmp>>>24 ^ rcon<<24;
        rcon = rcon<<1 ^ (rcon>>7)*283;
      }
    }
    
    encKey[i] = encKey[i-keyLen] ^ tmp;
  }
  
  // schedule decryption keys
  for (j = 0; i; j++, i--) {
    tmp = encKey[j&3 ? i : i - 4];
    if (i<=4 || j<4) {
      decKey[j] = tmp;
    } else {
      decKey[j] = decTable[0][sbox[tmp>>>24      ]] ^
                  decTable[1][sbox[tmp>>16  & 255]] ^
                  decTable[2][sbox[tmp>>8   & 255]] ^
                  decTable[3][sbox[tmp      & 255]];
    }
  }
};

sjcl.cipher.aes.prototype = {
  // public
  /* Something like this might appear here eventually
  name: "AES",
  blockSize: 4,
  keySizes: [4,6,8],
  */
  
  /**
   * Encrypt an array of 4 big-endian words.
   * @param {Array} data The plaintext.
   * @return {Array} The ciphertext.
   */
  encrypt:function (data) { return this._crypt(data,0); },
  
  /**
   * Decrypt an array of 4 big-endian words.
   * @param {Array} data The ciphertext.
   * @return {Array} The plaintext.
   */
  decrypt:function (data) { return this._crypt(data,1); },
  
  /**
   * The expanded S-box and inverse S-box tables.  These will be computed
   * on the client so that we don't have to send them down the wire.
   *
   * There are two tables, _tables[0] is for encryption and
   * _tables[1] is for decryption.
   *
   * The first 4 sub-tables are the expanded S-box with MixColumns.  The
   * last (_tables[01][4]) is the S-box itself.
   *
   * @private
   */
  _tables: [[[],[],[],[],[]],[[],[],[],[],[]]],

  /**
   * Expand the S-box tables.
   *
   * @private
   */
  _precompute: function () {
   var encTable = this._tables[0], decTable = this._tables[1],
       sbox = encTable[4], sboxInv = decTable[4],
       i, x, xInv, d=[], th=[], x2, x4, x8, s, tEnc, tDec;

    // Compute double and third tables
   for (i = 0; i < 256; i++) {
     th[( d[i] = i<<1 ^ (i>>7)*283 )^i]=i;
   }
   
   for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
     // Compute sbox
     s = xInv ^ xInv<<1 ^ xInv<<2 ^ xInv<<3 ^ xInv<<4;
     s = s>>8 ^ s&255 ^ 99;
     sbox[x] = s;
     sboxInv[s] = x;
     
     // Compute MixColumns
     x8 = d[x4 = d[x2 = d[x]]];
     tDec = x8*0x1010101 ^ x4*0x10001 ^ x2*0x101 ^ x*0x1010100;
     tEnc = d[s]*0x101 ^ s*0x1010100;
     
     for (i = 0; i < 4; i++) {
       encTable[i][x] = tEnc = tEnc<<24 ^ tEnc>>>8;
       decTable[i][s] = tDec = tDec<<24 ^ tDec>>>8;
     }
   }
   
   // Compactify.  Considerable speedup on Firefox.
   for (i = 0; i < 5; i++) {
     encTable[i] = encTable[i].slice(0);
     decTable[i] = decTable[i].slice(0);
   }
  },
  
  /**
   * Encryption and decryption core.
   * @param {Array} input Four words to be encrypted or decrypted.
   * @param dir The direction, 0 for encrypt and 1 for decrypt.
   * @return {Array} The four encrypted or decrypted words.
   * @private
   */
  _crypt:function (input, dir) {
    if (input.length !== 4) {
      throw new sjcl.exception.invalid("invalid aes block size");
    }
    
    var key = this._key[dir],
        // state variables a,b,c,d are loaded with pre-whitened data
        a = input[0]           ^ key[0],
        b = input[dir ? 3 : 1] ^ key[1],
        c = input[2]           ^ key[2],
        d = input[dir ? 1 : 3] ^ key[3],
        a2, b2, c2,
        
        nInnerRounds = key.length/4 - 2,
        i,
        kIndex = 4,
        out = [0,0,0,0],
        table = this._tables[dir],
        
        // load up the tables
        t0    = table[0],
        t1    = table[1],
        t2    = table[2],
        t3    = table[3],
        sbox  = table[4];
 
    // Inner rounds.  Cribbed from OpenSSL.
    for (i = 0; i < nInnerRounds; i++) {
      a2 = t0[a>>>24] ^ t1[b>>16 & 255] ^ t2[c>>8 & 255] ^ t3[d & 255] ^ key[kIndex];
      b2 = t0[b>>>24] ^ t1[c>>16 & 255] ^ t2[d>>8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
      c2 = t0[c>>>24] ^ t1[d>>16 & 255] ^ t2[a>>8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
      d  = t0[d>>>24] ^ t1[a>>16 & 255] ^ t2[b>>8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
      kIndex += 4;
      a=a2; b=b2; c=c2;
    }
        
    // Last round.
    for (i = 0; i < 4; i++) {
      out[dir ? 3&-i : i] =
        sbox[a>>>24      ]<<24 ^ 
        sbox[b>>16  & 255]<<16 ^
        sbox[c>>8   & 255]<<8  ^
        sbox[d      & 255]     ^
        key[kIndex++];
      a2=a; a=b; b=c; c=d; d=a2;
    }
    
    return out;
  }
};

/** @fileOverview Arrays of bits, encoded as arrays of Numbers.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Arrays of bits, encoded as arrays of Numbers.
 * @namespace
 * @description
 * <p>
 * These objects are the currency accepted by SJCL's crypto functions.
 * </p>
 *
 * <p>
 * Most of our crypto primitives operate on arrays of 4-byte words internally,
 * but many of them can take arguments that are not a multiple of 4 bytes.
 * This library encodes arrays of bits (whose size need not be a multiple of 8
 * bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
 * array of words, 32 bits at a time.  Since the words are double-precision
 * floating point numbers, they fit some extra data.  We use this (in a private,
 * possibly-changing manner) to encode the number of bits actually  present
 * in the last word of the array.
 * </p>
 *
 * <p>
 * Because bitwise ops clear this out-of-band data, these arrays can be passed
 * to ciphers like AES which want arrays of words.
 * </p>
 */
sjcl.bitArray = {
  /**
   * Array slices in units of bits.
   * @param {bitArray} a The array to slice.
   * @param {Number} bstart The offset to the start of the slice, in bits.
   * @param {Number} bend The offset to the end of the slice, in bits.  If this is undefined,
   * slice until the end of the array.
   * @return {bitArray} The requested slice.
   */
  bitSlice: function (a, bstart, bend) {
    a = sjcl.bitArray._shiftRight(a.slice(bstart/32), 32 - (bstart & 31)).slice(1);
    return (bend === undefined) ? a : sjcl.bitArray.clamp(a, bend-bstart);
  },

  /**
   * Extract a number packed into a bit array.
   * @param {bitArray} a The array to slice.
   * @param {Number} bstart The offset to the start of the slice, in bits.
   * @param {Number} blength The length of the number to extract.
   * @return {Number} The requested slice.
   */
  extract: function(a, bstart, blength) {
    // FIXME: this Math.floor is not necessary at all, but for some reason
    // seems to suppress a bug in the Chromium JIT.
    var x, sh = Math.floor((-bstart-blength) & 31);
    if ((bstart + blength - 1 ^ bstart) & -32) {
      // it crosses a boundary
      x = (a[bstart/32|0] << (32 - sh)) ^ (a[bstart/32+1|0] >>> sh);
    } else {
      // within a single word
      x = a[bstart/32|0] >>> sh;
    }
    return x & ((1<<blength) - 1);
  },

  /**
   * Concatenate two bit arrays.
   * @param {bitArray} a1 The first array.
   * @param {bitArray} a2 The second array.
   * @return {bitArray} The concatenation of a1 and a2.
   */
  concat: function (a1, a2) {
    if (a1.length === 0 || a2.length === 0) {
      return a1.concat(a2);
    }
    
    var last = a1[a1.length-1], shift = sjcl.bitArray.getPartial(last);
    if (shift === 32) {
      return a1.concat(a2);
    } else {
      return sjcl.bitArray._shiftRight(a2, shift, last|0, a1.slice(0,a1.length-1));
    }
  },

  /**
   * Find the length of an array of bits.
   * @param {bitArray} a The array.
   * @return {Number} The length of a, in bits.
   */
  bitLength: function (a) {
    var l = a.length, x;
    if (l === 0) { return 0; }
    x = a[l - 1];
    return (l-1) * 32 + sjcl.bitArray.getPartial(x);
  },

  /**
   * Truncate an array.
   * @param {bitArray} a The array.
   * @param {Number} len The length to truncate to, in bits.
   * @return {bitArray} A new array, truncated to len bits.
   */
  clamp: function (a, len) {
    if (a.length * 32 < len) { return a; }
    a = a.slice(0, Math.ceil(len / 32));
    var l = a.length;
    len = len & 31;
    if (l > 0 && len) {
      a[l-1] = sjcl.bitArray.partial(len, a[l-1] & 0x80000000 >> (len-1), 1);
    }
    return a;
  },

  /**
   * Make a partial word for a bit array.
   * @param {Number} len The number of bits in the word.
   * @param {Number} x The bits.
   * @param {Number} [_end=0] Pass 1 if x has already been shifted to the high side.
   * @return {Number} The partial word.
   */
  partial: function (len, x, _end) {
    if (len === 32) { return x; }
    return (_end ? x|0 : x << (32-len)) + len * 0x10000000000;
  },

  /**
   * Get the number of bits used by a partial word.
   * @param {Number} x The partial word.
   * @return {Number} The number of bits used by the partial word.
   */
  getPartial: function (x) {
    return Math.round(x/0x10000000000) || 32;
  },

  /**
   * Compare two arrays for equality in a predictable amount of time.
   * @param {bitArray} a The first array.
   * @param {bitArray} b The second array.
   * @return {boolean} true if a == b; false otherwise.
   */
  equal: function (a, b) {
    if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
      return false;
    }
    var x = 0, i;
    for (i=0; i<a.length; i++) {
      x |= a[i]^b[i];
    }
    return (x === 0);
  },

  /** Shift an array right.
   * @param {bitArray} a The array to shift.
   * @param {Number} shift The number of bits to shift.
   * @param {Number} [carry=0] A byte to carry in
   * @param {bitArray} [out=[]] An array to prepend to the output.
   * @private
   */
  _shiftRight: function (a, shift, carry, out) {
    var i, last2=0, shift2;
    if (out === undefined) { out = []; }
    
    for (; shift >= 32; shift -= 32) {
      out.push(carry);
      carry = 0;
    }
    if (shift === 0) {
      return out.concat(a);
    }
    
    for (i=0; i<a.length; i++) {
      out.push(carry | a[i]>>>shift);
      carry = a[i] << (32-shift);
    }
    last2 = a.length ? a[a.length-1] : 0;
    shift2 = sjcl.bitArray.getPartial(last2);
    out.push(sjcl.bitArray.partial(shift+shift2 & 31, (shift + shift2 > 32) ? carry : out.pop(),1));
    return out;
  },
  
  /** xor a block of 4 words together.
   * @private
   */
  _xor4: function(x,y) {
    return [x[0]^y[0],x[1]^y[1],x[2]^y[2],x[3]^y[3]];
  },

  /** byteswap a word array inplace.
   * (does not handle partial words)
   * @param {sjcl.bitArray} a word array
   * @return {sjcl.bitArray} byteswapped array
   */
  byteswapM: function(a) {
    var i, v, m = 0xff00;
    for (i = 0; i < a.length; ++i) {
      v = a[i];
      a[i] = (v >>> 24) | ((v >>> 8) & m) | ((v & m) << 8) | (v << 24);
    }
    return a;
  }
};
/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * UTF-8 strings
 * @namespace
 */
sjcl.codec.utf8String = {
  /** Convert from a bitArray to a UTF-8 string. */
  fromBits: function (arr) {
    var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i=0; i<bl/8; i++) {
      if ((i&3) === 0) {
        tmp = arr[i/4];
      }
      out += String.fromCharCode(tmp >>> 8 >>> 8 >>> 8);
      tmp <<= 8;
    }
    return decodeURIComponent(escape(out));
  },

  /** Convert from a UTF-8 string to a bitArray. */
  toBits: function (str) {
    str = unescape(encodeURIComponent(str));
    var out = [], i, tmp=0;
    for (i=0; i<str.length; i++) {
      tmp = tmp << 8 | str.charCodeAt(i);
      if ((i&3) === 3) {
        out.push(tmp);
        tmp = 0;
      }
    }
    if (i&3) {
      out.push(sjcl.bitArray.partial(8*(i&3), tmp));
    }
    return out;
  }
};
/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Hexadecimal
 * @namespace
 */
sjcl.codec.hex = {
  /** Convert from a bitArray to a hex string. */
  fromBits: function (arr) {
    var out = "", i;
    for (i=0; i<arr.length; i++) {
      out += ((arr[i]|0)+0xF00000000000).toString(16).substr(4);
    }
    return out.substr(0, sjcl.bitArray.bitLength(arr)/4);//.replace(/(.{8})/g, "$1 ");
  },
  /** Convert from a hex string to a bitArray. */
  toBits: function (str) {
    var i, out=[], len;
    str = str.replace(/\s|0x/g, "");
    len = str.length;
    str = str + "00000000";
    for (i=0; i<str.length; i+=8) {
      out.push(parseInt(str.substr(i,8),16)^0);
    }
    return sjcl.bitArray.clamp(out, len*4);
  }
};

/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Base64 encoding/decoding 
 * @namespace
 */
sjcl.codec.base64 = {
  /** The base64 alphabet.
   * @private
   */
  _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  
  /** Convert from a bitArray to a base64 string. */
  fromBits: function (arr, _noEquals, _url) {
    var out = "", i, bits=0, c = sjcl.codec.base64._chars, ta=0, bl = sjcl.bitArray.bitLength(arr);
    if (_url) {
      c = c.substr(0,62) + '-_';
    }
    for (i=0; out.length * 6 < bl; ) {
      out += c.charAt((ta ^ arr[i]>>>bits) >>> 26);
      if (bits < 6) {
        ta = arr[i] << (6-bits);
        bits += 26;
        i++;
      } else {
        ta <<= 6;
        bits -= 6;
      }
    }
    while ((out.length & 3) && !_noEquals) { out += "="; }
    return out;
  },
  
  /** Convert from a base64 string to a bitArray */
  toBits: function(str, _url) {
    str = str.replace(/\s|=/g,'');
    var out = [], i, bits=0, c = sjcl.codec.base64._chars, ta=0, x;
    if (_url) {
      c = c.substr(0,62) + '-_';
    }
    for (i=0; i<str.length; i++) {
      x = c.indexOf(str.charAt(i));
      if (x < 0) {
        throw new sjcl.exception.invalid("this isn't base64!");
      }
      if (bits > 26) {
        bits -= 26;
        out.push(ta ^ x>>>bits);
        ta  = x << (32-bits);
      } else {
        bits += 6;
        ta ^= x << (32-bits);
      }
    }
    if (bits&56) {
      out.push(sjcl.bitArray.partial(bits&56, ta, 1));
    }
    return out;
  }
};

sjcl.codec.base64url = {
  fromBits: function (arr) { return sjcl.codec.base64.fromBits(arr,1,1); },
  toBits: function (str) { return sjcl.codec.base64.toBits(str,1); }
};
/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Arrays of bytes
 * @namespace
 */
sjcl.codec.bytes = {
  /** Convert from a bitArray to an array of bytes. */
  fromBits: function (arr) {
    var out = [], bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i=0; i<bl/8; i++) {
      if ((i&3) === 0) {
        tmp = arr[i/4];
      }
      out.push(tmp >>> 24);
      tmp <<= 8;
    }
    return out;
  },
  /** Convert from an array of bytes to a bitArray. */
  toBits: function (bytes) {
    var out = [], i, tmp=0;
    for (i=0; i<bytes.length; i++) {
      tmp = tmp << 8 | bytes[i];
      if ((i&3) === 3) {
        out.push(tmp);
        tmp = 0;
      }
    }
    if (i&3) {
      out.push(sjcl.bitArray.partial(8*(i&3), tmp));
    }
    return out;
  }
};
/** @fileOverview Javascript SHA-256 implementation.
 *
 * An older version of this implementation is available in the public
 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
 * Stanford University 2008-2010 and BSD-licensed for liability
 * reasons.
 *
 * Special thanks to Aldo Cortesi for pointing out several bugs in
 * this code.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Context for a SHA-256 operation in progress.
 * @constructor
 */
sjcl.hash.sha256 = function (hash) {
  if (!this._key[0]) { this._precompute(); }
  if (hash) {
    this._h = hash._h.slice(0);
    this._buffer = hash._buffer.slice(0);
    this._length = hash._length;
  } else {
    this.reset();
  }
};

/**
 * Hash a string or an array of words.
 * @static
 * @param {bitArray|String} data the data to hash.
 * @return {bitArray} The hash value, an array of 16 big-endian words.
 */
sjcl.hash.sha256.hash = function (data) {
  return (new sjcl.hash.sha256()).update(data).finalize();
};

sjcl.hash.sha256.prototype = {
  /**
   * The hash's block size, in bits.
   * @constant
   */
  blockSize: 512,
   
  /**
   * Reset the hash state.
   * @return this
   */
  reset:function () {
    this._h = this._init.slice(0);
    this._buffer = [];
    this._length = 0;
    return this;
  },
  
  /**
   * Input several words to the hash.
   * @param {bitArray|String} data the data to hash.
   * @return this
   */
  update: function (data) {
    if (typeof data === "string") {
      data = sjcl.codec.utf8String.toBits(data);
    }
    var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data),
        ol = this._length,
        nl = this._length = ol + sjcl.bitArray.bitLength(data);
    if (nl > 9007199254740991){
      throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");
    }

    if (typeof Uint32Array !== 'undefined') {
	var c = new Uint32Array(b);
    	var j = 0;
    	for (i = 512+ol - ((512+ol) & 511); i <= nl; i+= 512) {
      	    this._block(c.subarray(16 * j, 16 * (j+1)));
      	    j += 1;
    	}
    	b.splice(0, 16 * j);
    } else {
	for (i = 512+ol - ((512+ol) & 511); i <= nl; i+= 512) {
      	    this._block(b.splice(0,16));
      	}
    }
    return this;
  },
  
  /**
   * Complete hashing and output the hash value.
   * @return {bitArray} The hash value, an array of 8 big-endian words.
   */
  finalize:function () {
    var i, b = this._buffer, h = this._h;

    // Round out and push the buffer
    b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1,1)]);
    
    // Round out the buffer to a multiple of 16 words, less the 2 length words.
    for (i = b.length + 2; i & 15; i++) {
      b.push(0);
    }
    
    // append the length
    b.push(Math.floor(this._length / 0x100000000));
    b.push(this._length | 0);

    while (b.length) {
      this._block(b.splice(0,16));
    }

    this.reset();
    return h;
  },

  /**
   * The SHA-256 initialization vector, to be precomputed.
   * @private
   */
  _init:[],
  /*
  _init:[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],
  */
  
  /**
   * The SHA-256 hash key, to be precomputed.
   * @private
   */
  _key:[],
  /*
  _key:
    [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
     0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
     0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
     0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
     0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
     0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
     0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
     0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2],
  */


  /**
   * Function to precompute _init and _key.
   * @private
   */
  _precompute: function () {
    var i = 0, prime = 2, factor, isPrime;

    function frac(x) { return (x-Math.floor(x)) * 0x100000000 | 0; }

    for (; i<64; prime++) {
      isPrime = true;
      for (factor=2; factor*factor <= prime; factor++) {
        if (prime % factor === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) {
        if (i<8) {
          this._init[i] = frac(Math.pow(prime, 1/2));
        }
        this._key[i] = frac(Math.pow(prime, 1/3));
        i++;
      }
    }
  },
  
  /**
   * Perform one cycle of SHA-256.
   * @param {Uint32Array|bitArray} w one block of words.
   * @private
   */
  _block:function (w) {  
    var i, tmp, a, b,
      h = this._h,
      k = this._key,
      h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3],
      h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];

    /* Rationale for placement of |0 :
     * If a value can overflow is original 32 bits by a factor of more than a few
     * million (2^23 ish), there is a possibility that it might overflow the
     * 53-bit mantissa and lose precision.
     *
     * To avoid this, we clamp back to 32 bits by |'ing with 0 on any value that
     * propagates around the loop, and on the hash state h[].  I don't believe
     * that the clamps on h4 and on h0 are strictly necessary, but it's close
     * (for h4 anyway), and better safe than sorry.
     *
     * The clamps on h[] are necessary for the output to be correct even in the
     * common case and for short inputs.
     */
    for (i=0; i<64; i++) {
      // load up the input word for this round
      if (i<16) {
        tmp = w[i];
      } else {
        a   = w[(i+1 ) & 15];
        b   = w[(i+14) & 15];
        tmp = w[i&15] = ((a>>>7  ^ a>>>18 ^ a>>>3  ^ a<<25 ^ a<<14) + 
                         (b>>>17 ^ b>>>19 ^ b>>>10 ^ b<<15 ^ b<<13) +
                         w[i&15] + w[(i+9) & 15]) | 0;
      }
      
      tmp = (tmp + h7 + (h4>>>6 ^ h4>>>11 ^ h4>>>25 ^ h4<<26 ^ h4<<21 ^ h4<<7) +  (h6 ^ h4&(h5^h6)) + k[i]); // | 0;
      
      // shift register
      h7 = h6; h6 = h5; h5 = h4;
      h4 = h3 + tmp | 0;
      h3 = h2; h2 = h1; h1 = h0;

      h0 = (tmp +  ((h1&h2) ^ (h3&(h1^h2))) + (h1>>>2 ^ h1>>>13 ^ h1>>>22 ^ h1<<30 ^ h1<<19 ^ h1<<10)) | 0;
    }

    h[0] = h[0]+h0 | 0;
    h[1] = h[1]+h1 | 0;
    h[2] = h[2]+h2 | 0;
    h[3] = h[3]+h3 | 0;
    h[4] = h[4]+h4 | 0;
    h[5] = h[5]+h5 | 0;
    h[6] = h[6]+h6 | 0;
    h[7] = h[7]+h7 | 0;
  }
};


/** @fileOverview CCM mode implementation.
 *
 * Special thanks to Roy Nicholson for pointing out a bug in our
 * implementation.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * CTR mode with CBC MAC.
 * @namespace
 */
sjcl.mode.ccm = {
  /** The name of the mode.
   * @constant
   */
  name: "ccm",
  
  _progressListeners: [],

  listenProgress: function (cb) {
    sjcl.mode.ccm._progressListeners.push(cb);
  },

  unListenProgress: function (cb) {
    var index = sjcl.mode.ccm._progressListeners.indexOf(cb);
    if (index > -1) {
      sjcl.mode.ccm._progressListeners.splice(index, 1);
    }
  },

  _callProgressListener: function (val) {
    var p = sjcl.mode.ccm._progressListeners.slice(), i;

    for (i = 0; i < p.length; i += 1) {
      p[i](val);
    }
  },

  /** Encrypt in CCM mode.
   * @static
   * @param {Object} prf The pseudorandom function.  It must have a block size of 16 bytes.
   * @param {bitArray} plaintext The plaintext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} [adata=[]] The authenticated data.
   * @param {Number} [tlen=64] the desired tag length, in bits.
   * @return {bitArray} The encrypted data, an array of bytes.
   */
  encrypt: function(prf, plaintext, iv, adata, tlen) {
    var L, out = plaintext.slice(0), tag, w=sjcl.bitArray, ivl = w.bitLength(iv) / 8, ol = w.bitLength(out) / 8;
    tlen = tlen || 64;
    adata = adata || [];
    
    if (ivl < 7) {
      throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
    }
    
    // compute the length of the length
    for (L=2; L<4 && ol >>> 8*L; L++) {}
    if (L < 15 - ivl) { L = 15-ivl; }
    iv = w.clamp(iv,8*(15-L));
    
    // compute the tag
    tag = sjcl.mode.ccm._computeTag(prf, plaintext, iv, adata, tlen, L);
    
    // encrypt
    out = sjcl.mode.ccm._ctrMode(prf, out, iv, tag, tlen, L);
    
    return w.concat(out.data, out.tag);
  },
  
  /** Decrypt in CCM mode.
   * @static
   * @param {Object} prf The pseudorandom function.  It must have a block size of 16 bytes.
   * @param {bitArray} ciphertext The ciphertext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} [adata=[]] adata The authenticated data.
   * @param {Number} [tlen=64] tlen the desired tag length, in bits.
   * @return {bitArray} The decrypted data.
   */
  decrypt: function(prf, ciphertext, iv, adata, tlen) {
    tlen = tlen || 64;
    adata = adata || [];
    var L,
        w=sjcl.bitArray,
        ivl = w.bitLength(iv) / 8,
        ol = w.bitLength(ciphertext), 
        out = w.clamp(ciphertext, ol - tlen),
        tag = w.bitSlice(ciphertext, ol - tlen), tag2;
    

    ol = (ol - tlen) / 8;
        
    if (ivl < 7) {
      throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
    }
    
    // compute the length of the length
    for (L=2; L<4 && ol >>> 8*L; L++) {}
    if (L < 15 - ivl) { L = 15-ivl; }
    iv = w.clamp(iv,8*(15-L));
    
    // decrypt
    out = sjcl.mode.ccm._ctrMode(prf, out, iv, tag, tlen, L);
    
    // check the tag
    tag2 = sjcl.mode.ccm._computeTag(prf, out.data, iv, adata, tlen, L);
    if (!w.equal(out.tag, tag2)) {
      throw new sjcl.exception.corrupt("ccm: tag doesn't match");
    }
    
    return out.data;
  },

  _macAdditionalData: function (prf, adata, iv, tlen, ol, L) {
    var mac, tmp, i, macData = [], w=sjcl.bitArray, xor = w._xor4;

    // mac the flags
    mac = [w.partial(8, (adata.length ? 1<<6 : 0) | (tlen-2) << 2 | L-1)];

    // mac the iv and length
    mac = w.concat(mac, iv);
    mac[3] |= ol;
    mac = prf.encrypt(mac);
  
    if (adata.length) {
      // mac the associated data.  start with its length...
      tmp = w.bitLength(adata)/8;
      if (tmp <= 0xFEFF) {
        macData = [w.partial(16, tmp)];
      } else if (tmp <= 0xFFFFFFFF) {
        macData = w.concat([w.partial(16,0xFFFE)], [tmp]);
      } // else ...
    
      // mac the data itself
      macData = w.concat(macData, adata);
      for (i=0; i<macData.length; i += 4) {
        mac = prf.encrypt(xor(mac, macData.slice(i,i+4).concat([0,0,0])));
      }
    }

    return mac;
  },

  /* Compute the (unencrypted) authentication tag, according to the CCM specification
   * @param {Object} prf The pseudorandom function.
   * @param {bitArray} plaintext The plaintext data.
   * @param {bitArray} iv The initialization value.
   * @param {bitArray} adata The authenticated data.
   * @param {Number} tlen the desired tag length, in bits.
   * @return {bitArray} The tag, but not yet encrypted.
   * @private
   */
  _computeTag: function(prf, plaintext, iv, adata, tlen, L) {
    // compute B[0]
    var mac, i, w=sjcl.bitArray, xor = w._xor4;

    tlen /= 8;
  
    // check tag length and message length
    if (tlen % 2 || tlen < 4 || tlen > 16) {
      throw new sjcl.exception.invalid("ccm: invalid tag length");
    }
  
    if (adata.length > 0xFFFFFFFF || plaintext.length > 0xFFFFFFFF) {
      // I don't want to deal with extracting high words from doubles.
      throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");
    }

    mac = sjcl.mode.ccm._macAdditionalData(prf, adata, iv, tlen, w.bitLength(plaintext)/8, L);

    // mac the plaintext
    for (i=0; i<plaintext.length; i+=4) {
      mac = prf.encrypt(xor(mac, plaintext.slice(i,i+4).concat([0,0,0])));
    }

    return w.clamp(mac, tlen * 8);
  },

  /** CCM CTR mode.
   * Encrypt or decrypt data and tag with the prf in CCM-style CTR mode.
   * May mutate its arguments.
   * @param {Object} prf The PRF.
   * @param {bitArray} data The data to be encrypted or decrypted.
   * @param {bitArray} iv The initialization vector.
   * @param {bitArray} tag The authentication tag.
   * @param {Number} tlen The length of th etag, in bits.
   * @param {Number} L The CCM L value.
   * @return {Object} An object with data and tag, the en/decryption of data and tag values.
   * @private
   */
  _ctrMode: function(prf, data, iv, tag, tlen, L) {
    var enc, i, w=sjcl.bitArray, xor = w._xor4, ctr, l = data.length, bl=w.bitLength(data), n = l/50, p = n;

    // start the ctr
    ctr = w.concat([w.partial(8,L-1)],iv).concat([0,0,0]).slice(0,4);
    
    // en/decrypt the tag
    tag = w.bitSlice(xor(tag,prf.encrypt(ctr)), 0, tlen);
  
    // en/decrypt the data
    if (!l) { return {tag:tag, data:[]}; }
    
    for (i=0; i<l; i+=4) {
      if (i > n) {
        sjcl.mode.ccm._callProgressListener(i/l);
        n += p;
      }
      ctr[3]++;
      enc = prf.encrypt(ctr);
      data[i]   ^= enc[0];
      data[i+1] ^= enc[1];
      data[i+2] ^= enc[2];
      data[i+3] ^= enc[3];
    }
    return { tag:tag, data:w.clamp(data,bl) };
  }
};
/** @fileOverview HMAC implementation.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** HMAC with the specified hash function.
 * @constructor
 * @param {bitArray} key the key for HMAC.
 * @param {Object} [Hash=sjcl.hash.sha256] The hash function to use.
 */
sjcl.misc.hmac = function (key, Hash) {
  this._hash = Hash = Hash || sjcl.hash.sha256;
  var exKey = [[],[]], i,
      bs = Hash.prototype.blockSize / 32;
  this._baseHash = [new Hash(), new Hash()];

  if (key.length > bs) {
    key = Hash.hash(key);
  }
  
  for (i=0; i<bs; i++) {
    exKey[0][i] = key[i]^0x36363636;
    exKey[1][i] = key[i]^0x5C5C5C5C;
  }
  
  this._baseHash[0].update(exKey[0]);
  this._baseHash[1].update(exKey[1]);
  this._resultHash = new Hash(this._baseHash[0]);
};

/** HMAC with the specified hash function.  Also called encrypt since it's a prf.
 * @param {bitArray|String} data The data to mac.
 */
sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function (data) {
  if (!this._updated) {
    this.update(data);
    return this.digest(data);
  } else {
    throw new sjcl.exception.invalid("encrypt on already updated hmac called!");
  }
};

sjcl.misc.hmac.prototype.reset = function () {
  this._resultHash = new this._hash(this._baseHash[0]);
  this._updated = false;
};

sjcl.misc.hmac.prototype.update = function (data) {
  this._updated = true;
  this._resultHash.update(data);
};

sjcl.misc.hmac.prototype.digest = function () {
  var w = this._resultHash.finalize(), result = new (this._hash)(this._baseHash[1]).update(w).finalize();

  this.reset();

  return result;
};
/** @fileOverview Password-based key-derivation function, version 2.0.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/** Password-Based Key-Derivation Function, version 2.0.
 *
 * Generate keys from passwords using PBKDF2-HMAC-SHA256.
 *
 * This is the method specified by RSA's PKCS #5 standard.
 *
 * @param {bitArray|String} password  The password.
 * @param {bitArray|String} salt The salt.  Should have lots of entropy.
 * @param {Number} [count=1000] The number of iterations.  Higher numbers make the function slower but more secure.
 * @param {Number} [length] The length of the derived key.  Defaults to the
                            output size of the hash function.
 * @param {Object} [Prff=sjcl.misc.hmac] The pseudorandom function family.
 * @return {bitArray} the derived key.
 */
sjcl.misc.pbkdf2 = function (password, salt, count, length, Prff) {
  count = count || 10000;
  
  if (length < 0 || count < 0) {
    throw new sjcl.exception.invalid("invalid params to pbkdf2");
  }
  
  if (typeof password === "string") {
    password = sjcl.codec.utf8String.toBits(password);
  }
  
  if (typeof salt === "string") {
    salt = sjcl.codec.utf8String.toBits(salt);
  }
  
  Prff = Prff || sjcl.misc.hmac;
  
  var prf = new Prff(password),
      u, ui, i, j, k, out = [], b = sjcl.bitArray;

  for (k = 1; 32 * out.length < (length || 1); k++) {
    u = ui = prf.encrypt(b.concat(salt,[k]));
    
    for (i=1; i<count; i++) {
      ui = prf.encrypt(ui);
      for (j=0; j<ui.length; j++) {
        u[j] ^= ui[j];
      }
    }
    
    out = out.concat(u);
  }

  if (length) { out = b.clamp(out, length); }

  return out;
};
/** @fileOverview Random number generator.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 * @author Michael Brooks
 * @author Steve Thomas
 */

/** 
 * @class Random number generator
 * @description
 * <b>Use sjcl.random as a singleton for this class!</b>
 * <p>
 * This random number generator is a derivative of Ferguson and Schneier's
 * generator Fortuna.  It collects entropy from various events into several
 * pools, implemented by streaming SHA-256 instances.  It differs from
 * ordinary Fortuna in a few ways, though.
 * </p>
 *
 * <p>
 * Most importantly, it has an entropy estimator.  This is present because
 * there is a strong conflict here between making the generator available
 * as soon as possible, and making sure that it doesn't "run on empty".
 * In Fortuna, there is a saved state file, and the system is likely to have
 * time to warm up.
 * </p>
 *
 * <p>
 * Second, because users are unlikely to stay on the page for very long,
 * and to speed startup time, the number of pools increases logarithmically:
 * a new pool is created when the previous one is actually used for a reseed.
 * This gives the same asymptotic guarantees as Fortuna, but gives more
 * entropy to early reseeds.
 * </p>
 *
 * <p>
 * The entire mechanism here feels pretty klunky.  Furthermore, there are
 * several improvements that should be made, including support for
 * dedicated cryptographic functions that may be present in some browsers;
 * state files in local storage; cookies containing randomness; etc.  So
 * look for improvements in future versions.
 * </p>
 * @constructor
 */
sjcl.prng = function(defaultParanoia) {
  
  /* private */
  this._pools                   = [new sjcl.hash.sha256()];
  this._poolEntropy             = [0];
  this._reseedCount             = 0;
  this._robins                  = {};
  this._eventId                 = 0;
  
  this._collectorIds            = {};
  this._collectorIdNext         = 0;
  
  this._strength                = 0;
  this._poolStrength            = 0;
  this._nextReseed              = 0;
  this._key                     = [0,0,0,0,0,0,0,0];
  this._counter                 = [0,0,0,0];
  this._cipher                  = undefined;
  this._defaultParanoia         = defaultParanoia;
  
  /* event listener stuff */
  this._collectorsStarted       = false;
  this._callbacks               = {progress: {}, seeded: {}};
  this._callbackI               = 0;
  
  /* constants */
  this._NOT_READY               = 0;
  this._READY                   = 1;
  this._REQUIRES_RESEED         = 2;

  this._MAX_WORDS_PER_BURST     = 65536;
  this._PARANOIA_LEVELS         = [0,48,64,96,128,192,256,384,512,768,1024];
  this._MILLISECONDS_PER_RESEED = 30000;
  this._BITS_PER_RESEED         = 80;
};
 
sjcl.prng.prototype = {
  /** Generate several random words, and return them in an array.
   * A word consists of 32 bits (4 bytes)
   * @param {Number} nwords The number of words to generate.
   */
  randomWords: function (nwords, paranoia) {
    var out = [], i, readiness = this.isReady(paranoia), g;
  
    if (readiness === this._NOT_READY) {
      throw new sjcl.exception.notReady("generator isn't seeded");
    } else if (readiness & this._REQUIRES_RESEED) {
      this._reseedFromPools(!(readiness & this._READY));
    }
  
    for (i=0; i<nwords; i+= 4) {
      if ((i+1) % this._MAX_WORDS_PER_BURST === 0) {
        this._gate();
      }
   
      g = this._gen4words();
      out.push(g[0],g[1],g[2],g[3]);
    }
    this._gate();
  
    return out.slice(0,nwords);
  },
  
  setDefaultParanoia: function (paranoia, allowZeroParanoia) {
    if (paranoia === 0 && allowZeroParanoia !== "Setting paranoia=0 will ruin your security; use it only for testing") {
      throw new sjcl.exception.invalid("Setting paranoia=0 will ruin your security; use it only for testing");
    }

    this._defaultParanoia = paranoia;
  },
  
  /**
   * Add entropy to the pools.
   * @param data The entropic value.  Should be a 32-bit integer, array of 32-bit integers, or string
   * @param {Number} estimatedEntropy The estimated entropy of data, in bits
   * @param {String} source The source of the entropy, eg "mouse"
   */
  addEntropy: function (data, estimatedEntropy, source) {
    source = source || "user";
  
    var id,
      i, tmp,
      t = (new Date()).valueOf(),
      robin = this._robins[source],
      oldReady = this.isReady(), err = 0, objName;
      
    id = this._collectorIds[source];
    if (id === undefined) { id = this._collectorIds[source] = this._collectorIdNext ++; }
      
    if (robin === undefined) { robin = this._robins[source] = 0; }
    this._robins[source] = ( this._robins[source] + 1 ) % this._pools.length;
  
    switch(typeof(data)) {
      
    case "number":
      if (estimatedEntropy === undefined) {
        estimatedEntropy = 1;
      }
      this._pools[robin].update([id,this._eventId++,1,estimatedEntropy,t,1,data|0]);
      break;
      
    case "object":
      objName = Object.prototype.toString.call(data);
      if (objName === "[object Uint32Array]") {
        tmp = [];
        for (i = 0; i < data.length; i++) {
          tmp.push(data[i]);
        }
        data = tmp;
      } else {
        if (objName !== "[object Array]") {
          err = 1;
        }
        for (i=0; i<data.length && !err; i++) {
          if (typeof(data[i]) !== "number") {
            err = 1;
          }
        }
      }
      if (!err) {
        if (estimatedEntropy === undefined) {
          /* horrible entropy estimator */
          estimatedEntropy = 0;
          for (i=0; i<data.length; i++) {
            tmp= data[i];
            while (tmp>0) {
              estimatedEntropy++;
              tmp = tmp >>> 1;
            }
          }
        }
        this._pools[robin].update([id,this._eventId++,2,estimatedEntropy,t,data.length].concat(data));
      }
      break;
      
    case "string":
      if (estimatedEntropy === undefined) {
       /* English text has just over 1 bit per character of entropy.
        * But this might be HTML or something, and have far less
        * entropy than English...  Oh well, let's just say one bit.
        */
       estimatedEntropy = data.length;
      }
      this._pools[robin].update([id,this._eventId++,3,estimatedEntropy,t,data.length]);
      this._pools[robin].update(data);
      break;
      
    default:
      err=1;
    }
    if (err) {
      throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
    }
  
    /* record the new strength */
    this._poolEntropy[robin] += estimatedEntropy;
    this._poolStrength += estimatedEntropy;
  
    /* fire off events */
    if (oldReady === this._NOT_READY) {
      if (this.isReady() !== this._NOT_READY) {
        this._fireEvent("seeded", Math.max(this._strength, this._poolStrength));
      }
      this._fireEvent("progress", this.getProgress());
    }
  },
  
  /** Is the generator ready? */
  isReady: function (paranoia) {
    var entropyRequired = this._PARANOIA_LEVELS[ (paranoia !== undefined) ? paranoia : this._defaultParanoia ];
  
    if (this._strength && this._strength >= entropyRequired) {
      return (this._poolEntropy[0] > this._BITS_PER_RESEED && (new Date()).valueOf() > this._nextReseed) ?
        this._REQUIRES_RESEED | this._READY :
        this._READY;
    } else {
      return (this._poolStrength >= entropyRequired) ?
        this._REQUIRES_RESEED | this._NOT_READY :
        this._NOT_READY;
    }
  },
  
  /** Get the generator's progress toward readiness, as a fraction */
  getProgress: function (paranoia) {
    var entropyRequired = this._PARANOIA_LEVELS[ paranoia ? paranoia : this._defaultParanoia ];
  
    if (this._strength >= entropyRequired) {
      return 1.0;
    } else {
      return (this._poolStrength > entropyRequired) ?
        1.0 :
        this._poolStrength / entropyRequired;
    }
  },
  
  /** start the built-in entropy collectors */
  startCollectors: function () {
    if (this._collectorsStarted) { return; }
  
    this._eventListener = {
      loadTimeCollector: this._bind(this._loadTimeCollector),
      mouseCollector: this._bind(this._mouseCollector),
      keyboardCollector: this._bind(this._keyboardCollector),
      accelerometerCollector: this._bind(this._accelerometerCollector),
      touchCollector: this._bind(this._touchCollector)
    };

    if (window.addEventListener) {
      window.addEventListener("load", this._eventListener.loadTimeCollector, false);
      window.addEventListener("mousemove", this._eventListener.mouseCollector, false);
      window.addEventListener("keypress", this._eventListener.keyboardCollector, false);
      window.addEventListener("devicemotion", this._eventListener.accelerometerCollector, false);
      window.addEventListener("touchmove", this._eventListener.touchCollector, false);
    } else if (document.attachEvent) {
      document.attachEvent("onload", this._eventListener.loadTimeCollector);
      document.attachEvent("onmousemove", this._eventListener.mouseCollector);
      document.attachEvent("keypress", this._eventListener.keyboardCollector);
    } else {
      throw new sjcl.exception.bug("can't attach event");
    }
  
    this._collectorsStarted = true;
  },
  
  /** stop the built-in entropy collectors */
  stopCollectors: function () {
    if (!this._collectorsStarted) { return; }
  
    if (window.removeEventListener) {
      window.removeEventListener("load", this._eventListener.loadTimeCollector, false);
      window.removeEventListener("mousemove", this._eventListener.mouseCollector, false);
      window.removeEventListener("keypress", this._eventListener.keyboardCollector, false);
      window.removeEventListener("devicemotion", this._eventListener.accelerometerCollector, false);
      window.removeEventListener("touchmove", this._eventListener.touchCollector, false);
    } else if (document.detachEvent) {
      document.detachEvent("onload", this._eventListener.loadTimeCollector);
      document.detachEvent("onmousemove", this._eventListener.mouseCollector);
      document.detachEvent("keypress", this._eventListener.keyboardCollector);
    }

    this._collectorsStarted = false;
  },
  
  /* use a cookie to store entropy.
  useCookie: function (all_cookies) {
      throw new sjcl.exception.bug("random: useCookie is unimplemented");
  },*/
  
  /** add an event listener for progress or seeded-ness. */
  addEventListener: function (name, callback) {
    this._callbacks[name][this._callbackI++] = callback;
  },
  
  /** remove an event listener for progress or seeded-ness */
  removeEventListener: function (name, cb) {
    var i, j, cbs=this._callbacks[name], jsTemp=[];

    /* I'm not sure if this is necessary; in C++, iterating over a
     * collection and modifying it at the same time is a no-no.
     */

    for (j in cbs) {
      if (cbs.hasOwnProperty(j) && cbs[j] === cb) {
        jsTemp.push(j);
      }
    }

    for (i=0; i<jsTemp.length; i++) {
      j = jsTemp[i];
      delete cbs[j];
    }
  },
  
  _bind: function (func) {
    var that = this;
    return function () {
      func.apply(that, arguments);
    };
  },

  /** Generate 4 random words, no reseed, no gate.
   * @private
   */
  _gen4words: function () {
    for (var i=0; i<4; i++) {
      this._counter[i] = this._counter[i]+1 | 0;
      if (this._counter[i]) { break; }
    }
    return this._cipher.encrypt(this._counter);
  },
  
  /* Rekey the AES instance with itself after a request, or every _MAX_WORDS_PER_BURST words.
   * @private
   */
  _gate: function () {
    this._key = this._gen4words().concat(this._gen4words());
    this._cipher = new sjcl.cipher.aes(this._key);
  },
  
  /** Reseed the generator with the given words
   * @private
   */
  _reseed: function (seedWords) {
    this._key = sjcl.hash.sha256.hash(this._key.concat(seedWords));
    this._cipher = new sjcl.cipher.aes(this._key);
    for (var i=0; i<4; i++) {
      this._counter[i] = this._counter[i]+1 | 0;
      if (this._counter[i]) { break; }
    }
  },
  
  /** reseed the data from the entropy pools
   * @param full If set, use all the entropy pools in the reseed.
   */
  _reseedFromPools: function (full) {
    var reseedData = [], strength = 0, i;
  
    this._nextReseed = reseedData[0] =
      (new Date()).valueOf() + this._MILLISECONDS_PER_RESEED;
    
    for (i=0; i<16; i++) {
      /* On some browsers, this is cryptographically random.  So we might
       * as well toss it in the pot and stir...
       */
      reseedData.push(Math.random()*0x100000000|0);
    }
    
    for (i=0; i<this._pools.length; i++) {
     reseedData = reseedData.concat(this._pools[i].finalize());
     strength += this._poolEntropy[i];
     this._poolEntropy[i] = 0;
   
     if (!full && (this._reseedCount & (1<<i))) { break; }
    }
  
    /* if we used the last pool, push a new one onto the stack */
    if (this._reseedCount >= 1 << this._pools.length) {
     this._pools.push(new sjcl.hash.sha256());
     this._poolEntropy.push(0);
    }
  
    /* how strong was this reseed? */
    this._poolStrength -= strength;
    if (strength > this._strength) {
      this._strength = strength;
    }
  
    this._reseedCount ++;
    this._reseed(reseedData);
  },
  
  _keyboardCollector: function () {
    this._addCurrentTimeToEntropy(1);
  },
  
  _mouseCollector: function (ev) {
    var x, y;

    try {
      x = ev.x || ev.clientX || ev.offsetX || 0;
      y = ev.y || ev.clientY || ev.offsetY || 0;
    } catch (err) {
      // Event originated from a secure element. No mouse position available.
      x = 0;
      y = 0;
    }

    if (x != 0 && y!= 0) {
      this.addEntropy([x,y], 2, "mouse");
    }

    this._addCurrentTimeToEntropy(0);
  },

  _touchCollector: function(ev) {
    var touch = ev.touches[0] || ev.changedTouches[0];
    var x = touch.pageX || touch.clientX,
        y = touch.pageY || touch.clientY;

    this.addEntropy([x,y],1,"touch");

    this._addCurrentTimeToEntropy(0);
  },
  
  _loadTimeCollector: function () {
    this._addCurrentTimeToEntropy(2);
  },

  _addCurrentTimeToEntropy: function (estimatedEntropy) {
    if (typeof window !== 'undefined' && window.performance && typeof window.performance.now === "function") {
      //how much entropy do we want to add here?
      this.addEntropy(window.performance.now(), estimatedEntropy, "loadtime");
    } else {
      this.addEntropy((new Date()).valueOf(), estimatedEntropy, "loadtime");
    }
  },
  _accelerometerCollector: function (ev) {
    var ac = ev.accelerationIncludingGravity.x||ev.accelerationIncludingGravity.y||ev.accelerationIncludingGravity.z;
    if(window.orientation){
      var or = window.orientation;
      if (typeof or === "number") {
        this.addEntropy(or, 1, "accelerometer");
      }
    }
    if (ac) {
      this.addEntropy(ac, 2, "accelerometer");
    }
    this._addCurrentTimeToEntropy(0);
  },

  _fireEvent: function (name, arg) {
    var j, cbs=sjcl.random._callbacks[name], cbsTemp=[];
    /* TODO: there is a race condition between removing collectors and firing them */

    /* I'm not sure if this is necessary; in C++, iterating over a
     * collection and modifying it at the same time is a no-no.
     */

    for (j in cbs) {
      if (cbs.hasOwnProperty(j)) {
        cbsTemp.push(cbs[j]);
      }
    }

    for (j=0; j<cbsTemp.length; j++) {
      cbsTemp[j](arg);
    }
  }
};

/** an instance for the prng.
* @see sjcl.prng
*/
sjcl.random = new sjcl.prng(6);

(function(){
  // function for getting nodejs crypto module. catches and ignores errors.
  function getCryptoModule() {
    try {
      return __webpack_require__(201);
    }
    catch (e) {
      return null;
    }
  }

  try {
    var buf, crypt, ab;

    // get cryptographically strong entropy depending on runtime environment
    if ( true && module.exports && (crypt = getCryptoModule()) && crypt.randomBytes) {
      buf = crypt.randomBytes(1024/8);
      buf = new Uint32Array(new Uint8Array(buf).buffer);
      sjcl.random.addEntropy(buf, 1024, "crypto.randomBytes");

    } else if (typeof window !== 'undefined' && typeof Uint32Array !== 'undefined') {
      ab = new Uint32Array(32);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(ab);
      } else if (window.msCrypto && window.msCrypto.getRandomValues) {
        window.msCrypto.getRandomValues(ab);
      } else {
        return;
      }

      // get cryptographically strong entropy in Webkit
      sjcl.random.addEntropy(ab, 1024, "crypto.getRandomValues");

    } else {
      // no getRandomValues :-(
    }
  } catch (e) {
    if (typeof window !== 'undefined' && window.console) {
      console.log("There was an error collecting entropy from the browser:");
      console.log(e);
      //we do not want the library to fail due to randomness not being maintained.
    }
  }
}());
/** @fileOverview Convenience functions centered around JSON encapsulation.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

 /**
  * JSON encapsulation
  * @namespace
  */
 sjcl.json = {
  /** Default values for encryption */
  defaults: { v:1, iter:10000, ks:128, ts:64, mode:"ccm", adata:"", cipher:"aes" },

  /** Simple encryption function.
   * @param {String|bitArray} password The password or key.
   * @param {String} plaintext The data to encrypt.
   * @param {Object} [params] The parameters including tag, iv and salt.
   * @param {Object} [rp] A returned version with filled-in parameters.
   * @return {Object} The cipher raw data.
   * @throws {sjcl.exception.invalid} if a parameter is invalid.
   */
  _encrypt: function (password, plaintext, params, rp) {
    params = params || {};
    rp = rp || {};

    var j = sjcl.json, p = j._add({ iv: sjcl.random.randomWords(4,0) },
                                  j.defaults), tmp, prp, adata;
    j._add(p, params);
    adata = p.adata;
    if (typeof p.salt === "string") {
      p.salt = sjcl.codec.base64.toBits(p.salt);
    }
    if (typeof p.iv === "string") {
      p.iv = sjcl.codec.base64.toBits(p.iv);
    }

    if (!sjcl.mode[p.mode] ||
        !sjcl.cipher[p.cipher] ||
        (typeof password === "string" && p.iter <= 100) ||
        (p.ts !== 64 && p.ts !== 96 && p.ts !== 128) ||
        (p.ks !== 128 && p.ks !== 192 && p.ks !== 256) ||
        (p.iv.length < 2 || p.iv.length > 4)) {
      throw new sjcl.exception.invalid("json encrypt: invalid parameters");
    }

    if (typeof password === "string") {
      tmp = sjcl.misc.cachedPbkdf2(password, p);
      password = tmp.key.slice(0,p.ks/32);
      p.salt = tmp.salt;
    } else if (sjcl.ecc && password instanceof sjcl.ecc.elGamal.publicKey) {
      tmp = password.kem();
      p.kemtag = tmp.tag;
      password = tmp.key.slice(0,p.ks/32);
    }
    if (typeof plaintext === "string") {
      plaintext = sjcl.codec.utf8String.toBits(plaintext);
    }
    if (typeof adata === "string") {
      p.adata = adata = sjcl.codec.utf8String.toBits(adata);
    }
    prp = new sjcl.cipher[p.cipher](password);

    /* return the json data */
    j._add(rp, p);
    rp.key = password;

    /* do the encryption */
    if (p.mode === "ccm" && sjcl.arrayBuffer && sjcl.arrayBuffer.ccm && plaintext instanceof ArrayBuffer) {
      p.ct = sjcl.arrayBuffer.ccm.encrypt(prp, plaintext, p.iv, adata, p.ts);
    } else {
      p.ct = sjcl.mode[p.mode].encrypt(prp, plaintext, p.iv, adata, p.ts);
    }

    //return j.encode(j._subtract(p, j.defaults));
    return p;
  },

  /** Simple encryption function.
   * @param {String|bitArray} password The password or key.
   * @param {String} plaintext The data to encrypt.
   * @param {Object} [params] The parameters including tag, iv and salt.
   * @param {Object} [rp] A returned version with filled-in parameters.
   * @return {String} The ciphertext serialized data.
   * @throws {sjcl.exception.invalid} if a parameter is invalid.
   */
  encrypt: function (password, plaintext, params, rp) {
    var j = sjcl.json, p = j._encrypt.apply(j, arguments);
    return j.encode(p);
  },

  /** Simple decryption function.
   * @param {String|bitArray} password The password or key.
   * @param {Object} ciphertext The cipher raw data to decrypt.
   * @param {Object} [params] Additional non-default parameters.
   * @param {Object} [rp] A returned object with filled parameters.
   * @return {String} The plaintext.
   * @throws {sjcl.exception.invalid} if a parameter is invalid.
   * @throws {sjcl.exception.corrupt} if the ciphertext is corrupt.
   */
  _decrypt: function (password, ciphertext, params, rp) {
    params = params || {};
    rp = rp || {};

    var j = sjcl.json, p = j._add(j._add(j._add({},j.defaults),ciphertext), params, true), ct, tmp, prp, adata=p.adata;
    if (typeof p.salt === "string") {
      p.salt = sjcl.codec.base64.toBits(p.salt);
    }
    if (typeof p.iv === "string") {
      p.iv = sjcl.codec.base64.toBits(p.iv);
    }

    if (!sjcl.mode[p.mode] ||
        !sjcl.cipher[p.cipher] ||
        (typeof password === "string" && p.iter <= 100) ||
        (p.ts !== 64 && p.ts !== 96 && p.ts !== 128) ||
        (p.ks !== 128 && p.ks !== 192 && p.ks !== 256) ||
        (!p.iv) ||
        (p.iv.length < 2 || p.iv.length > 4)) {
      throw new sjcl.exception.invalid("json decrypt: invalid parameters");
    }

    if (typeof password === "string") {
      tmp = sjcl.misc.cachedPbkdf2(password, p);
      password = tmp.key.slice(0,p.ks/32);
      p.salt  = tmp.salt;
    } else if (sjcl.ecc && password instanceof sjcl.ecc.elGamal.secretKey) {
      password = password.unkem(sjcl.codec.base64.toBits(p.kemtag)).slice(0,p.ks/32);
    }
    if (typeof adata === "string") {
      adata = sjcl.codec.utf8String.toBits(adata);
    }
    prp = new sjcl.cipher[p.cipher](password);

    /* do the decryption */
    if (p.mode === "ccm" && sjcl.arrayBuffer && sjcl.arrayBuffer.ccm && p.ct instanceof ArrayBuffer) {
      ct = sjcl.arrayBuffer.ccm.decrypt(prp, p.ct, p.iv, p.tag, adata, p.ts);
    } else {
      ct = sjcl.mode[p.mode].decrypt(prp, p.ct, p.iv, adata, p.ts);
    }

    /* return the json data */
    j._add(rp, p);
    rp.key = password;

    if (params.raw === 1) {
      return ct;
    } else {
      return sjcl.codec.utf8String.fromBits(ct);
    }
  },

  /** Simple decryption function.
   * @param {String|bitArray} password The password or key.
   * @param {String} ciphertext The ciphertext to decrypt.
   * @param {Object} [params] Additional non-default parameters.
   * @param {Object} [rp] A returned object with filled parameters.
   * @return {String} The plaintext.
   * @throws {sjcl.exception.invalid} if a parameter is invalid.
   * @throws {sjcl.exception.corrupt} if the ciphertext is corrupt.
   */
  decrypt: function (password, ciphertext, params, rp) {
    var j = sjcl.json;
    return j._decrypt(password, j.decode(ciphertext), params, rp);
  },

  /** Encode a flat structure into a JSON string.
   * @param {Object} obj The structure to encode.
   * @return {String} A JSON string.
   * @throws {sjcl.exception.invalid} if obj has a non-alphanumeric property.
   * @throws {sjcl.exception.bug} if a parameter has an unsupported type.
   */
  encode: function (obj) {
    var i, out='{', comma='';
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (!i.match(/^[a-z0-9]+$/i)) {
          throw new sjcl.exception.invalid("json encode: invalid property name");
        }
        out += comma + '"' + i + '":';
        comma = ',';

        switch (typeof obj[i]) {
          case 'number':
          case 'boolean':
            out += obj[i];
            break;

          case 'string':
            out += '"' + escape(obj[i]) + '"';
            break;

          case 'object':
            out += '"' + sjcl.codec.base64.fromBits(obj[i],0) + '"';
            break;

          default:
            throw new sjcl.exception.bug("json encode: unsupported type");
        }
      }
    }
    return out+'}';
  },

  /** Decode a simple (flat) JSON string into a structure.  The ciphertext,
   * adata, salt and iv will be base64-decoded.
   * @param {String} str The string.
   * @return {Object} The decoded structure.
   * @throws {sjcl.exception.invalid} if str isn't (simple) JSON.
   */
  decode: function (str) {
    str = str.replace(/\s/g,'');
    if (!str.match(/^\{.*\}$/)) {
      throw new sjcl.exception.invalid("json decode: this isn't json!");
    }
    var a = str.replace(/^\{|\}$/g, '').split(/,/), out={}, i, m;
    for (i=0; i<a.length; i++) {
      if (!(m=a[i].match(/^\s*(?:(["']?)([a-z][a-z0-9]*)\1)\s*:\s*(?:(-?\d+)|"([a-z0-9+\/%*_.@=\-]*)"|(true|false))$/i))) {
        throw new sjcl.exception.invalid("json decode: this isn't json!");
      }
      if (m[3] != null) {
        out[m[2]] = parseInt(m[3],10);
      } else if (m[4] != null) {
        out[m[2]] = m[2].match(/^(ct|adata|salt|iv)$/) ? sjcl.codec.base64.toBits(m[4]) : unescape(m[4]);
      } else if (m[5] != null) {
        out[m[2]] = m[5] === 'true';
      }
    }
    return out;
  },

  /** Insert all elements of src into target, modifying and returning target.
   * @param {Object} target The object to be modified.
   * @param {Object} src The object to pull data from.
   * @param {boolean} [requireSame=false] If true, throw an exception if any field of target differs from corresponding field of src.
   * @return {Object} target.
   * @private
   */
  _add: function (target, src, requireSame) {
    if (target === undefined) { target = {}; }
    if (src === undefined) { return target; }
    var i;
    for (i in src) {
      if (src.hasOwnProperty(i)) {
        if (requireSame && target[i] !== undefined && target[i] !== src[i]) {
          throw new sjcl.exception.invalid("required parameter overridden");
        }
        target[i] = src[i];
      }
    }
    return target;
  },

  /** Remove all elements of minus from plus.  Does not modify plus.
   * @private
   */
  _subtract: function (plus, minus) {
    var out = {}, i;

    for (i in plus) {
      if (plus.hasOwnProperty(i) && plus[i] !== minus[i]) {
        out[i] = plus[i];
      }
    }

    return out;
  },

  /** Return only the specified elements of src.
   * @private
   */
  _filter: function (src, filter) {
    var out = {}, i;
    for (i=0; i<filter.length; i++) {
      if (src[filter[i]] !== undefined) {
        out[filter[i]] = src[filter[i]];
      }
    }
    return out;
  }
};

/** Simple encryption function; convenient shorthand for sjcl.json.encrypt.
 * @param {String|bitArray} password The password or key.
 * @param {String} plaintext The data to encrypt.
 * @param {Object} [params] The parameters including tag, iv and salt.
 * @param {Object} [rp] A returned version with filled-in parameters.
 * @return {String} The ciphertext.
 */
sjcl.encrypt = sjcl.json.encrypt;

/** Simple decryption function; convenient shorthand for sjcl.json.decrypt.
 * @param {String|bitArray} password The password or key.
 * @param {String} ciphertext The ciphertext to decrypt.
 * @param {Object} [params] Additional non-default parameters.
 * @param {Object} [rp] A returned object with filled parameters.
 * @return {String} The plaintext.
 */
sjcl.decrypt = sjcl.json.decrypt;

/** The cache for cachedPbkdf2.
 * @private
 */
sjcl.misc._pbkdf2Cache = {};

/** Cached PBKDF2 key derivation.
 * @param {String} password The password.
 * @param {Object} [obj] The derivation params (iteration count and optional salt).
 * @return {Object} The derived data in key, the salt in salt.
 */
sjcl.misc.cachedPbkdf2 = function (password, obj) {
  var cache = sjcl.misc._pbkdf2Cache, c, cp, str, salt, iter;

  obj = obj || {};
  iter = obj.iter || 1000;

  /* open the cache for this password and iteration count */
  cp = cache[password] = cache[password] || {};
  c = cp[iter] = cp[iter] || { firstSalt: (obj.salt && obj.salt.length) ?
                     obj.salt.slice(0) : sjcl.random.randomWords(2,0) };

  salt = (obj.salt === undefined) ? c.firstSalt : obj.salt;

  c[salt] = c[salt] || sjcl.misc.pbkdf2(password, salt, obj.iter);
  return { key: c[salt].slice(0), salt:salt.slice(0) };
};
// Thanks to Colin McRae and Jonathan Burns of ionic security
// for reporting and fixing two bugs in this file!

/**
 * Constructs a new bignum from another bignum, a number or a hex string.
 * @constructor
 */
sjcl.bn = function(it) {
  this.initWith(it);
};

sjcl.bn.prototype = {
  radix: 24,
  maxMul: 8,
  _class: sjcl.bn,

  copy: function() {
    return new this._class(this);
  },

  /**
   * Initializes this with it, either as a bn, a number, or a hex string.
   */
  initWith: function(it) {
    var i=0, k;
    switch(typeof it) {
    case "object":
      this.limbs = it.limbs.slice(0);
      break;

    case "number":
      this.limbs = [it];
      this.normalize();
      break;

    case "string":
      it = it.replace(/^0x/, '');
      this.limbs = [];
      // hack
      k = this.radix / 4;
      for (i=0; i < it.length; i+=k) {
        this.limbs.push(parseInt(it.substring(Math.max(it.length - i - k, 0), it.length - i),16));
      }
      break;

    default:
      this.limbs = [0];
    }
    return this;
  },

  /**
   * Returns true if "this" and "that" are equal.  Calls fullReduce().
   * Equality test is in constant time.
   */
  equals: function(that) {
    if (typeof that === "number") { that = new this._class(that); }
    var difference = 0, i;
    this.fullReduce();
    that.fullReduce();
    for (i = 0; i < this.limbs.length || i < that.limbs.length; i++) {
      difference |= this.getLimb(i) ^ that.getLimb(i);
    }
    return (difference === 0);
  },

  /**
   * Get the i'th limb of this, zero if i is too large.
   */
  getLimb: function(i) {
    return (i >= this.limbs.length) ? 0 : this.limbs[i];
  },

  /**
   * Constant time comparison function.
   * Returns 1 if this >= that, or zero otherwise.
   */
  greaterEquals: function(that) {
    if (typeof that === "number") { that = new this._class(that); }
    var less = 0, greater = 0, i, a, b;
    i = Math.max(this.limbs.length, that.limbs.length) - 1;
    for (; i>= 0; i--) {
      a = this.getLimb(i);
      b = that.getLimb(i);
      greater |= (b - a) & ~less;
      less |= (a - b) & ~greater;
    }
    return (greater | ~less) >>> 31;
  },

  /**
   * Convert to a hex string.
   */
  toString: function() {
    this.fullReduce();
    var out="", i, s, l = this.limbs;
    for (i=0; i < this.limbs.length; i++) {
      s = l[i].toString(16);
      while (i < this.limbs.length - 1 && s.length < 6) {
        s = "0" + s;
      }
      out = s + out;
    }
    return "0x"+out;
  },

  /** this += that.  Does not normalize. */
  addM: function(that) {
    if (typeof(that) !== "object") { that = new this._class(that); }
    var i, l=this.limbs, ll=that.limbs;
    for (i=l.length; i<ll.length; i++) {
      l[i] = 0;
    }
    for (i=0; i<ll.length; i++) {
      l[i] += ll[i];
    }
    return this;
  },

  /** this *= 2.  Requires normalized; ends up normalized. */
  doubleM: function() {
    var i, carry=0, tmp, r=this.radix, m=this.radixMask, l=this.limbs;
    for (i=0; i<l.length; i++) {
      tmp = l[i];
      tmp = tmp+tmp+carry;
      l[i] = tmp & m;
      carry = tmp >> r;
    }
    if (carry) {
      l.push(carry);
    }
    return this;
  },

  /** this /= 2, rounded down.  Requires normalized; ends up normalized. */
  halveM: function() {
    var i, carry=0, tmp, r=this.radix, l=this.limbs;
    for (i=l.length-1; i>=0; i--) {
      tmp = l[i];
      l[i] = (tmp+carry)>>1;
      carry = (tmp&1) << r;
    }
    if (!l[l.length-1]) {
      l.pop();
    }
    return this;
  },

  /** this -= that.  Does not normalize. */
  subM: function(that) {
    if (typeof(that) !== "object") { that = new this._class(that); }
    var i, l=this.limbs, ll=that.limbs;
    for (i=l.length; i<ll.length; i++) {
      l[i] = 0;
    }
    for (i=0; i<ll.length; i++) {
      l[i] -= ll[i];
    }
    return this;
  },

  mod: function(that) {
    var neg = !this.greaterEquals(new sjcl.bn(0));

    that = new sjcl.bn(that).normalize(); // copy before we begin
    var out = new sjcl.bn(this).normalize(), ci=0;

    if (neg) out = (new sjcl.bn(0)).subM(out).normalize();

    for (; out.greaterEquals(that); ci++) {
      that.doubleM();
    }

    if (neg) out = that.sub(out).normalize();

    for (; ci > 0; ci--) {
      that.halveM();
      if (out.greaterEquals(that)) {
        out.subM(that).normalize();
      }
    }
    return out.trim();
  },

  /** return inverse mod prime p.  p must be odd. Binary extended Euclidean algorithm mod p. */
  inverseMod: function(p) {
    var a = new sjcl.bn(1), b = new sjcl.bn(0), x = new sjcl.bn(this), y = new sjcl.bn(p), tmp, i, nz=1;

    if (!(p.limbs[0] & 1)) {
      throw (new sjcl.exception.invalid("inverseMod: p must be odd"));
    }

    // invariant: y is odd
    do {
      if (x.limbs[0] & 1) {
        if (!x.greaterEquals(y)) {
          // x < y; swap everything
          tmp = x; x = y; y = tmp;
          tmp = a; a = b; b = tmp;
        }
        x.subM(y);
        x.normalize();

        if (!a.greaterEquals(b)) {
          a.addM(p);
        }
        a.subM(b);
      }

      // cut everything in half
      x.halveM();
      if (a.limbs[0] & 1) {
        a.addM(p);
      }
      a.normalize();
      a.halveM();

      // check for termination: x ?= 0
      for (i=nz=0; i<x.limbs.length; i++) {
        nz |= x.limbs[i];
      }
    } while(nz);

    if (!y.equals(1)) {
      throw (new sjcl.exception.invalid("inverseMod: p and x must be relatively prime"));
    }

    return b;
  },

  /** this + that.  Does not normalize. */
  add: function(that) {
    return this.copy().addM(that);
  },

  /** this - that.  Does not normalize. */
  sub: function(that) {
    return this.copy().subM(that);
  },

  /** this * that.  Normalizes and reduces. */
  mul: function(that) {
    if (typeof(that) === "number") { that = new this._class(that); } else { that.normalize(); }
    this.normalize();
    var i, j, a = this.limbs, b = that.limbs, al = a.length, bl = b.length, out = new this._class(), c = out.limbs, ai, ii=this.maxMul;

    for (i=0; i < this.limbs.length + that.limbs.length + 1; i++) {
      c[i] = 0;
    }
    for (i=0; i<al; i++) {
      ai = a[i];
      for (j=0; j<bl; j++) {
        c[i+j] += ai * b[j];
      }

      if (!--ii) {
        ii = this.maxMul;
        out.cnormalize();
      }
    }
    return out.cnormalize().reduce();
  },

  /** this ^ 2.  Normalizes and reduces. */
  square: function() {
    return this.mul(this);
  },

  /** this ^ n.  Uses square-and-multiply.  Normalizes and reduces. */
  power: function(l) {
    l = new sjcl.bn(l).normalize().trim().limbs;
    var i, j, out = new this._class(1), pow = this;

    for (i=0; i<l.length; i++) {
      for (j=0; j<this.radix; j++) {
        if (l[i] & (1<<j)) { out = out.mul(pow); }
        if (i == (l.length - 1) && l[i]>>(j + 1) == 0) { break; }

        pow = pow.square();
      }
    }

    return out;
  },

  /** this * that mod N */
  mulmod: function(that, N) {
    return this.mod(N).mul(that.mod(N)).mod(N);
  },

  /** this ^ x mod N */
  powermod: function(x, N) {
    x = new sjcl.bn(x);
    N = new sjcl.bn(N);

    // Jump to montpowermod if possible.
    if ((N.limbs[0] & 1) == 1) {
      var montOut = this.montpowermod(x, N);

      if (montOut != false) { return montOut; } // else go to slow powermod
    }

    var i, j, l = x.normalize().trim().limbs, out = new this._class(1), pow = this;

    for (i=0; i<l.length; i++) {
      for (j=0; j<this.radix; j++) {
        if (l[i] & (1<<j)) { out = out.mulmod(pow, N); }
        if (i == (l.length - 1) && l[i]>>(j + 1) == 0) { break; }

        pow = pow.mulmod(pow, N);
      }
    }

    return out;
  },

  /** this ^ x mod N with Montomery reduction */
  montpowermod: function(x, N) {
    x = new sjcl.bn(x).normalize().trim();
    N = new sjcl.bn(N);

    var i, j,
      radix = this.radix,
      out = new this._class(1),
      pow = this.copy();

    // Generate R as a cap of N.
    var R, s, wind, bitsize = x.bitLength();

    R = new sjcl.bn({
      limbs: N.copy().normalize().trim().limbs.map(function() { return 0; })
    });

    for (s = this.radix; s > 0; s--) {
      if (((N.limbs[N.limbs.length - 1] >> s) & 1) == 1) {
        R.limbs[R.limbs.length - 1] = 1 << s;
        break;
      }
    }

    // Calculate window size as a function of the exponent's size.
    if (bitsize == 0) {
      return this;
    } else if (bitsize < 18)  {
      wind = 1;
    } else if (bitsize < 48)  {
      wind = 3;
    } else if (bitsize < 144) {
      wind = 4;
    } else if (bitsize < 768) {
      wind = 5;
    } else {
      wind = 6;
    }

    // Find R' and N' such that R * R' - N * N' = 1.
    var RR = R.copy(), NN = N.copy(), RP = new sjcl.bn(1), NP = new sjcl.bn(0), RT = R.copy();

    while (RT.greaterEquals(1)) {
      RT.halveM();

      if ((RP.limbs[0] & 1) == 0) {
        RP.halveM();
        NP.halveM();
      } else {
        RP.addM(NN);
        RP.halveM();

        NP.halveM();
        NP.addM(RR);
      }
    }

    RP = RP.normalize();
    NP = NP.normalize();

    RR.doubleM();
    var R2 = RR.mulmod(RR, N);

    // Check whether the invariant holds.
    // If it doesn't, we can't use Montgomery reduction on this modulus.
    if (!RR.mul(RP).sub(N.mul(NP)).equals(1)) {
      return false;
    }

    var montIn = function(c) { return montMul(c, R2); },
    montMul = function(a, b) {
      // Standard Montgomery reduction
      var k, ab, right, abBar, mask = (1 << (s + 1)) - 1;

      ab = a.mul(b);

      right = ab.mul(NP);
      right.limbs = right.limbs.slice(0, R.limbs.length);

      if (right.limbs.length == R.limbs.length) {
        right.limbs[R.limbs.length - 1] &= mask;
      }

      right = right.mul(N);

      abBar = ab.add(right).normalize().trim();
      abBar.limbs = abBar.limbs.slice(R.limbs.length - 1);

      // Division.  Equivelent to calling *.halveM() s times.
      for (k=0; k < abBar.limbs.length; k++) {
        if (k > 0) {
          abBar.limbs[k - 1] |= (abBar.limbs[k] & mask) << (radix - s - 1);
        }

        abBar.limbs[k] = abBar.limbs[k] >> (s + 1);
      }

      if (abBar.greaterEquals(N)) {
        abBar.subM(N);
      }

      return abBar;
    },
    montOut = function(c) { return montMul(c, 1); };

    pow = montIn(pow);
    out = montIn(out);

    // Sliding-Window Exponentiation (HAC 14.85)
    var h, precomp = {}, cap = (1 << (wind - 1)) - 1;

    precomp[1] = pow.copy();
    precomp[2] = montMul(pow, pow);

    for (h=1; h<=cap; h++) {
      precomp[(2 * h) + 1] = montMul(precomp[(2 * h) - 1], precomp[2]);
    }

    var getBit = function(exp, i) { // Gets ith bit of exp.
      var off = i % exp.radix;

      return (exp.limbs[Math.floor(i / exp.radix)] & (1 << off)) >> off;
    };

    for (i = x.bitLength() - 1; i >= 0; ) {
      if (getBit(x, i) == 0) {
        // If the next bit is zero:
        //   Square, move forward one bit.
        out = montMul(out, out);
        i = i - 1;
      } else {
        // If the next bit is one:
        //   Find the longest sequence of bits after this one, less than `wind`
        //   bits long, that ends with a 1.  Convert the sequence into an
        //   integer and look up the pre-computed value to add.
        var l = i - wind + 1;

        while (getBit(x, l) == 0) {
          l++;
        }

        var indx = 0;
        for (j = l; j <= i; j++) {
          indx += getBit(x, j) << (j - l);
          out = montMul(out, out);
        }

        out = montMul(out, precomp[indx]);

        i = l - 1;
      }
    }

    return montOut(out);
  },

  trim: function() {
    var l = this.limbs, p;
    do {
      p = l.pop();
    } while (l.length && p === 0);
    l.push(p);
    return this;
  },

  /** Reduce mod a modulus.  Stubbed for subclassing. */
  reduce: function() {
    return this;
  },

  /** Reduce and normalize. */
  fullReduce: function() {
    return this.normalize();
  },

  /** Propagate carries. */
  normalize: function() {
    var carry=0, i, pv = this.placeVal, ipv = this.ipv, l, m, limbs = this.limbs, ll = limbs.length, mask = this.radixMask;
    for (i=0; i < ll || (carry !== 0 && carry !== -1); i++) {
      l = (limbs[i]||0) + carry;
      m = limbs[i] = l & mask;
      carry = (l-m)*ipv;
    }
    if (carry === -1) {
      limbs[i-1] -= pv;
    }
    this.trim();
    return this;
  },

  /** Constant-time normalize. Does not allocate additional space. */
  cnormalize: function() {
    var carry=0, i, ipv = this.ipv, l, m, limbs = this.limbs, ll = limbs.length, mask = this.radixMask;
    for (i=0; i < ll-1; i++) {
      l = limbs[i] + carry;
      m = limbs[i] = l & mask;
      carry = (l-m)*ipv;
    }
    limbs[i] += carry;
    return this;
  },

  /** Serialize to a bit array */
  toBits: function(len) {
    this.fullReduce();
    len = len || this.exponent || this.bitLength();
    var i = Math.floor((len-1)/24), w=sjcl.bitArray, e = (len + 7 & -8) % this.radix || this.radix,
        out = [w.partial(e, this.getLimb(i))];
    for (i--; i >= 0; i--) {
      out = w.concat(out, [w.partial(Math.min(this.radix,len), this.getLimb(i))]);
      len -= this.radix;
    }
    return out;
  },

  /** Return the length in bits, rounded up to the nearest byte. */
  bitLength: function() {
    this.fullReduce();
    var out = this.radix * (this.limbs.length - 1),
        b = this.limbs[this.limbs.length - 1];
    for (; b; b >>>= 1) {
      out ++;
    }
    return out+7 & -8;
  }
};

/** @memberOf sjcl.bn
* @this { sjcl.bn }
*/
sjcl.bn.fromBits = function(bits) {
  var Class = this, out = new Class(), words=[], w=sjcl.bitArray, t = this.prototype,
      l = Math.min(this.bitLength || 0x100000000, w.bitLength(bits)), e = l % t.radix || t.radix;

  words[0] = w.extract(bits, 0, e);
  for (; e < l; e += t.radix) {
    words.unshift(w.extract(bits, e, t.radix));
  }

  out.limbs = words;
  return out;
};



sjcl.bn.prototype.ipv = 1 / (sjcl.bn.prototype.placeVal = Math.pow(2,sjcl.bn.prototype.radix));
sjcl.bn.prototype.radixMask = (1 << sjcl.bn.prototype.radix) - 1;

/**
 * Creates a new subclass of bn, based on reduction modulo a pseudo-Mersenne prime,
 * i.e. a prime of the form 2^e + sum(a * 2^b),where the sum is negative and sparse.
 */
sjcl.bn.pseudoMersennePrime = function(exponent, coeff) {
  /** @constructor
  * @private
  */
  function p(it) {
    this.initWith(it);
    /*if (this.limbs[this.modOffset]) {
      this.reduce();
    }*/
  }

  var ppr = p.prototype = new sjcl.bn(), i, tmp, mo;
  mo = ppr.modOffset = Math.ceil(tmp = exponent / ppr.radix);
  ppr.exponent = exponent;
  ppr.offset = [];
  ppr.factor = [];
  ppr.minOffset = mo;
  ppr.fullMask = 0;
  ppr.fullOffset = [];
  ppr.fullFactor = [];
  ppr.modulus = p.modulus = new sjcl.bn(Math.pow(2,exponent));

  ppr.fullMask = 0|-Math.pow(2, exponent % ppr.radix);

  for (i=0; i<coeff.length; i++) {
    ppr.offset[i] = Math.floor(coeff[i][0] / ppr.radix - tmp);
    ppr.fullOffset[i] = Math.floor(coeff[i][0] / ppr.radix ) - mo + 1;
    ppr.factor[i] = coeff[i][1] * Math.pow(1/2, exponent - coeff[i][0] + ppr.offset[i] * ppr.radix);
    ppr.fullFactor[i] = coeff[i][1] * Math.pow(1/2, exponent - coeff[i][0] + ppr.fullOffset[i] * ppr.radix);
    ppr.modulus.addM(new sjcl.bn(Math.pow(2,coeff[i][0])*coeff[i][1]));
    ppr.minOffset = Math.min(ppr.minOffset, -ppr.offset[i]); // conservative
  }
  ppr._class = p;
  ppr.modulus.cnormalize();

  /** Approximate reduction mod p.  May leave a number which is negative or slightly larger than p.
   * @memberof sjcl.bn
   * @this { sjcl.bn }
   */
  ppr.reduce = function() {
    var i, k, l, mo = this.modOffset, limbs = this.limbs, off = this.offset, ol = this.offset.length, fac = this.factor, ll;

    i = this.minOffset;
    while (limbs.length > mo) {
      l = limbs.pop();
      ll = limbs.length;
      for (k=0; k<ol; k++) {
        limbs[ll+off[k]] -= fac[k] * l;
      }

      i--;
      if (!i) {
        limbs.push(0);
        this.cnormalize();
        i = this.minOffset;
      }
    }
    this.cnormalize();

    return this;
  };

  /** @memberof sjcl.bn
  * @this { sjcl.bn }
  */
  ppr._strongReduce = (ppr.fullMask === -1) ? ppr.reduce : function() {
    var limbs = this.limbs, i = limbs.length - 1, k, l;
    this.reduce();
    if (i === this.modOffset - 1) {
      l = limbs[i] & this.fullMask;
      limbs[i] -= l;
      for (k=0; k<this.fullOffset.length; k++) {
        limbs[i+this.fullOffset[k]] -= this.fullFactor[k] * l;
      }
      this.normalize();
    }
  };

  /** mostly constant-time, very expensive full reduction.
   * @memberof sjcl.bn
   * @this { sjcl.bn }
   */
  ppr.fullReduce = function() {
    var greater, i;
    // massively above the modulus, may be negative

    this._strongReduce();
    // less than twice the modulus, may be negative

    this.addM(this.modulus);
    this.addM(this.modulus);
    this.normalize();
    // probably 2-3x the modulus

    this._strongReduce();
    // less than the power of 2.  still may be more than
    // the modulus

    // HACK: pad out to this length
    for (i=this.limbs.length; i<this.modOffset; i++) {
      this.limbs[i] = 0;
    }

    // constant-time subtract modulus
    greater = this.greaterEquals(this.modulus);
    for (i=0; i<this.limbs.length; i++) {
      this.limbs[i] -= this.modulus.limbs[i] * greater;
    }
    this.cnormalize();

    return this;
  };


  /** @memberof sjcl.bn
  * @this { sjcl.bn }
  */
  ppr.inverse = function() {
    return (this.power(this.modulus.sub(2)));
  };

  p.fromBits = sjcl.bn.fromBits;

  return p;
};

// a small Mersenne prime
var sbp = sjcl.bn.pseudoMersennePrime;
sjcl.bn.prime = {
  p127: sbp(127, [[0,-1]]),

  // Bernstein's prime for Curve25519
  p25519: sbp(255, [[0,-19]]),

  // Koblitz primes
  p192k: sbp(192, [[32,-1],[12,-1],[8,-1],[7,-1],[6,-1],[3,-1],[0,-1]]),
  p224k: sbp(224, [[32,-1],[12,-1],[11,-1],[9,-1],[7,-1],[4,-1],[1,-1],[0,-1]]),
  p256k: sbp(256, [[32,-1],[9,-1],[8,-1],[7,-1],[6,-1],[4,-1],[0,-1]]),

  // NIST primes
  p192: sbp(192, [[0,-1],[64,-1]]),
  p224: sbp(224, [[0,1],[96,-1]]),
  p256: sbp(256, [[0,-1],[96,1],[192,1],[224,-1]]),
  p384: sbp(384, [[0,-1],[32,1],[96,-1],[128,-1]]),
  p521: sbp(521, [[0,-1]])
};

sjcl.bn.random = function(modulus, paranoia) {
  if (typeof modulus !== "object") { modulus = new sjcl.bn(modulus); }
  var words, i, l = modulus.limbs.length, m = modulus.limbs[l-1]+1, out = new sjcl.bn();
  while (true) {
    // get a sequence whose first digits make sense
    do {
      words = sjcl.random.randomWords(l, paranoia);
      if (words[l-1] < 0) { words[l-1] += 0x100000000; }
    } while (Math.floor(words[l-1] / m) === Math.floor(0x100000000 / m));
    words[l-1] %= m;

    // mask off all the limbs
    for (i=0; i<l-1; i++) {
      words[i] &= modulus.radixMask;
    }

    // check the rest of the digitssj
    out.limbs = words;
    if (!out.greaterEquals(modulus)) {
      return out;
    }
  }
};
/**
 * base class for all ecc operations.
 * @namespace
 */
sjcl.ecc = {};

/**
 * Represents a point on a curve in affine coordinates.
 * @constructor
 * @param {sjcl.ecc.curve} curve The curve that this point lies on.
 * @param {bigInt} x The x coordinate.
 * @param {bigInt} y The y coordinate.
 */
sjcl.ecc.point = function(curve,x,y) {
  if (x === undefined) {
    this.isIdentity = true;
  } else {
    if (x instanceof sjcl.bn) {
      x = new curve.field(x);
    }
    if (y instanceof sjcl.bn) {
      y = new curve.field(y);
    }

    this.x = x;
    this.y = y;

    this.isIdentity = false;
  }
  this.curve = curve;
};



sjcl.ecc.point.prototype = {
  toJac: function() {
    return new sjcl.ecc.pointJac(this.curve, this.x, this.y, new this.curve.field(1));
  },

  mult: function(k) {
    return this.toJac().mult(k, this).toAffine();
  },

  /**
   * Multiply this point by k, added to affine2*k2, and return the answer in Jacobian coordinates.
   * @param {bigInt} k The coefficient to multiply this by.
   * @param {bigInt} k2 The coefficient to multiply affine2 this by.
   * @param {sjcl.ecc.point} affine The other point in affine coordinates.
   * @return {sjcl.ecc.pointJac} The result of the multiplication and addition, in Jacobian coordinates.
   */
  mult2: function(k, k2, affine2) {
    return this.toJac().mult2(k, this, k2, affine2).toAffine();
  },

  multiples: function() {
    var m, i, j;
    if (this._multiples === undefined) {
      j = this.toJac().doubl();
      m = this._multiples = [new sjcl.ecc.point(this.curve), this, j.toAffine()];
      for (i=3; i<16; i++) {
        j = j.add(this);
        m.push(j.toAffine());
      }
    }
    return this._multiples;
  },

  negate: function() {
    var newY = new this.curve.field(0).sub(this.y).normalize().reduce();
    return new sjcl.ecc.point(this.curve, this.x, newY);
  },

  isValid: function() {
    return this.y.square().equals(this.curve.b.add(this.x.mul(this.curve.a.add(this.x.square()))));
  },

  toBits: function() {
    return sjcl.bitArray.concat(this.x.toBits(), this.y.toBits());
  }
};

/**
 * Represents a point on a curve in Jacobian coordinates. Coordinates can be specified as bigInts or strings (which
 * will be converted to bigInts).
 *
 * @constructor
 * @param {bigInt/string} x The x coordinate.
 * @param {bigInt/string} y The y coordinate.
 * @param {bigInt/string} z The z coordinate.
 * @param {sjcl.ecc.curve} curve The curve that this point lies on.
 */
sjcl.ecc.pointJac = function(curve, x, y, z) {
  if (x === undefined) {
    this.isIdentity = true;
  } else {
    this.x = x;
    this.y = y;
    this.z = z;
    this.isIdentity = false;
  }
  this.curve = curve;
};

sjcl.ecc.pointJac.prototype = {
  /**
   * Adds S and T and returns the result in Jacobian coordinates. Note that S must be in Jacobian coordinates and T must be in affine coordinates.
   * @param {sjcl.ecc.pointJac} S One of the points to add, in Jacobian coordinates.
   * @param {sjcl.ecc.point} T The other point to add, in affine coordinates.
   * @return {sjcl.ecc.pointJac} The sum of the two points, in Jacobian coordinates.
   */
  add: function(T) {
    var S = this, sz2, c, d, c2, x1, x2, x, y1, y2, y, z;
    if (S.curve !== T.curve) {
      throw new sjcl.exception.invalid("sjcl.ecc.add(): Points must be on the same curve to add them!");
    }

    if (S.isIdentity) {
      return T.toJac();
    } else if (T.isIdentity) {
      return S;
    }

    sz2 = S.z.square();
    c = T.x.mul(sz2).subM(S.x);

    if (c.equals(0)) {
      if (S.y.equals(T.y.mul(sz2.mul(S.z)))) {
        // same point
        return S.doubl();
      } else {
        // inverses
        return new sjcl.ecc.pointJac(S.curve);
      }
    }

    d = T.y.mul(sz2.mul(S.z)).subM(S.y);
    c2 = c.square();

    x1 = d.square();
    x2 = c.square().mul(c).addM( S.x.add(S.x).mul(c2) );
    x  = x1.subM(x2);

    y1 = S.x.mul(c2).subM(x).mul(d);
    y2 = S.y.mul(c.square().mul(c));
    y  = y1.subM(y2);

    z  = S.z.mul(c);

    return new sjcl.ecc.pointJac(this.curve,x,y,z);
  },

  /**
   * doubles this point.
   * @return {sjcl.ecc.pointJac} The doubled point.
   */
  doubl: function() {
    if (this.isIdentity) { return this; }

    var
      y2 = this.y.square(),
      a  = y2.mul(this.x.mul(4)),
      b  = y2.square().mul(8),
      z2 = this.z.square(),
      c  = this.curve.a.toString() == (new sjcl.bn(-3)).toString() ?
                this.x.sub(z2).mul(3).mul(this.x.add(z2)) :
                this.x.square().mul(3).add(z2.square().mul(this.curve.a)),
      x  = c.square().subM(a).subM(a),
      y  = a.sub(x).mul(c).subM(b),
      z  = this.y.add(this.y).mul(this.z);
    return new sjcl.ecc.pointJac(this.curve, x, y, z);
  },

  /**
   * Returns a copy of this point converted to affine coordinates.
   * @return {sjcl.ecc.point} The converted point.
   */
  toAffine: function() {
    if (this.isIdentity || this.z.equals(0)) {
      return new sjcl.ecc.point(this.curve);
    }
    var zi = this.z.inverse(), zi2 = zi.square();
    return new sjcl.ecc.point(this.curve, this.x.mul(zi2).fullReduce(), this.y.mul(zi2.mul(zi)).fullReduce());
  },

  /**
   * Multiply this point by k and return the answer in Jacobian coordinates.
   * @param {bigInt} k The coefficient to multiply by.
   * @param {sjcl.ecc.point} affine This point in affine coordinates.
   * @return {sjcl.ecc.pointJac} The result of the multiplication, in Jacobian coordinates.
   */
  mult: function(k, affine) {
    if (typeof(k) === "number") {
      k = [k];
    } else if (k.limbs !== undefined) {
      k = k.normalize().limbs;
    }

    var i, j, out = new sjcl.ecc.point(this.curve).toJac(), multiples = affine.multiples();

    for (i=k.length-1; i>=0; i--) {
      for (j=sjcl.bn.prototype.radix-4; j>=0; j-=4) {
        out = out.doubl().doubl().doubl().doubl().add(multiples[k[i]>>j & 0xF]);
      }
    }

    return out;
  },

  /**
   * Multiply this point by k, added to affine2*k2, and return the answer in Jacobian coordinates.
   * @param {bigInt} k The coefficient to multiply this by.
   * @param {sjcl.ecc.point} affine This point in affine coordinates.
   * @param {bigInt} k2 The coefficient to multiply affine2 this by.
   * @param {sjcl.ecc.point} affine The other point in affine coordinates.
   * @return {sjcl.ecc.pointJac} The result of the multiplication and addition, in Jacobian coordinates.
   */
  mult2: function(k1, affine, k2, affine2) {
    if (typeof(k1) === "number") {
      k1 = [k1];
    } else if (k1.limbs !== undefined) {
      k1 = k1.normalize().limbs;
    }

    if (typeof(k2) === "number") {
      k2 = [k2];
    } else if (k2.limbs !== undefined) {
      k2 = k2.normalize().limbs;
    }

    var i, j, out = new sjcl.ecc.point(this.curve).toJac(), m1 = affine.multiples(),
        m2 = affine2.multiples(), l1, l2;

    for (i=Math.max(k1.length,k2.length)-1; i>=0; i--) {
      l1 = k1[i] | 0;
      l2 = k2[i] | 0;
      for (j=sjcl.bn.prototype.radix-4; j>=0; j-=4) {
        out = out.doubl().doubl().doubl().doubl().add(m1[l1>>j & 0xF]).add(m2[l2>>j & 0xF]);
      }
    }

    return out;
  },

  negate: function() {
    return this.toAffine().negate().toJac();
  },

  isValid: function() {
    var z2 = this.z.square(), z4 = z2.square(), z6 = z4.mul(z2);
    return this.y.square().equals(
             this.curve.b.mul(z6).add(this.x.mul(
               this.curve.a.mul(z4).add(this.x.square()))));
  }
};

/**
 * Construct an elliptic curve. Most users will not use this and instead start with one of the NIST curves defined below.
 *
 * @constructor
 * @param {bigInt} p The prime modulus.
 * @param {bigInt} r The prime order of the curve.
 * @param {bigInt} a The constant a in the equation of the curve y^2 = x^3 + ax + b (for NIST curves, a is always -3).
 * @param {bigInt} x The x coordinate of a base point of the curve.
 * @param {bigInt} y The y coordinate of a base point of the curve.
 */
sjcl.ecc.curve = function(Field, r, a, b, x, y) {
  this.field = Field;
  this.r = new sjcl.bn(r);
  this.a = new Field(a);
  this.b = new Field(b);
  this.G = new sjcl.ecc.point(this, new Field(x), new Field(y));
};

sjcl.ecc.curve.prototype.fromBits = function (bits) {
  var w = sjcl.bitArray, l = this.field.prototype.exponent + 7 & -8,
      p = new sjcl.ecc.point(this, this.field.fromBits(w.bitSlice(bits, 0, l)),
                             this.field.fromBits(w.bitSlice(bits, l, 2*l)));
  if (!p.isValid()) {
    throw new sjcl.exception.corrupt("not on the curve!");
  }
  return p;
};

sjcl.ecc.curves = {
  c192: new sjcl.ecc.curve(
    sjcl.bn.prime.p192,
    "0xffffffffffffffffffffffff99def836146bc9b1b4d22831",
    -3,
    "0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1",
    "0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012",
    "0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811"),

  c224: new sjcl.ecc.curve(
    sjcl.bn.prime.p224,
    "0xffffffffffffffffffffffffffff16a2e0b8f03e13dd29455c5c2a3d",
    -3,
    "0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4",
    "0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21",
    "0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34"),

  c256: new sjcl.ecc.curve(
    sjcl.bn.prime.p256,
    "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551",
    -3,
    "0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b",
    "0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296",
    "0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),

  c384: new sjcl.ecc.curve(
    sjcl.bn.prime.p384,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973",
    -3,
    "0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef",
    "0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7",
    "0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"),
    
  c521: new sjcl.ecc.curve(
    sjcl.bn.prime.p521,
    "0x1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409",
    -3,
    "0x051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00",
    "0xC6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66",
    "0x11839296A789A3BC0045C8A5FB42C7D1BD998F54449579B446817AFBD17273E662C97EE72995EF42640C550B9013FAD0761353C7086A272C24088BE94769FD16650"),

  k192: new sjcl.ecc.curve(
    sjcl.bn.prime.p192k,
    "0xfffffffffffffffffffffffe26f2fc170f69466a74defd8d",
    0,
    3,
    "0xdb4ff10ec057e9ae26b07d0280b7f4341da5d1b1eae06c7d",
    "0x9b2f2f6d9c5628a7844163d015be86344082aa88d95e2f9d"),

  k224: new sjcl.ecc.curve(
    sjcl.bn.prime.p224k,
    "0x010000000000000000000000000001dce8d2ec6184caf0a971769fb1f7",
    0,
    5,
    "0xa1455b334df099df30fc28a169a467e9e47075a90f7e650eb6b7a45c",
    "0x7e089fed7fba344282cafbd6f7e319f7c0b0bd59e2ca4bdb556d61a5"),

  k256: new sjcl.ecc.curve(
    sjcl.bn.prime.p256k,
    "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
    0,
    7,
    "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
    "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")

};

sjcl.ecc.curveName = function (curve) {
  var curcurve;
  for (curcurve in sjcl.ecc.curves) {
    if (sjcl.ecc.curves.hasOwnProperty(curcurve)) {
      if (sjcl.ecc.curves[curcurve] === curve) {
        return curcurve;
      }
    }
  }

  throw new sjcl.exception.invalid("no such curve");
};

sjcl.ecc.deserialize = function (key) {
  var types = ["elGamal", "ecdsa"];

  if (!key || !key.curve || !sjcl.ecc.curves[key.curve]) { throw new sjcl.exception.invalid("invalid serialization"); }
  if (types.indexOf(key.type) === -1) { throw new sjcl.exception.invalid("invalid type"); }

  var curve = sjcl.ecc.curves[key.curve];

  if (key.secretKey) {
    if (!key.exponent) { throw new sjcl.exception.invalid("invalid exponent"); }
    var exponent = new sjcl.bn(key.exponent);
    return new sjcl.ecc[key.type].secretKey(curve, exponent);
  } else {
    if (!key.point) { throw new sjcl.exception.invalid("invalid point"); }
    
    var point = curve.fromBits(sjcl.codec.hex.toBits(key.point));
    return new sjcl.ecc[key.type].publicKey(curve, point);
  }
};

/** our basicKey classes
*/
sjcl.ecc.basicKey = {
  /** ecc publicKey.
  * @constructor
  * @param {curve} curve the elliptic curve
  * @param {point} point the point on the curve
  */
  publicKey: function(curve, point) {
    this._curve = curve;
    this._curveBitLength = curve.r.bitLength();
    if (point instanceof Array) {
      this._point = curve.fromBits(point);
    } else {
      this._point = point;
    }

    this.serialize = function () {
      var curveName = sjcl.ecc.curveName(curve);
      return {
        type: this.getType(),
        secretKey: false,
        point: sjcl.codec.hex.fromBits(this._point.toBits()),
        curve: curveName
      };
    };

    /** get this keys point data
    * @return x and y as bitArrays
    */
    this.get = function() {
      var pointbits = this._point.toBits();
      var len = sjcl.bitArray.bitLength(pointbits);
      var x = sjcl.bitArray.bitSlice(pointbits, 0, len/2);
      var y = sjcl.bitArray.bitSlice(pointbits, len/2);
      return { x: x, y: y };
    };
  },

  /** ecc secretKey
  * @constructor
  * @param {curve} curve the elliptic curve
  * @param exponent
  */
  secretKey: function(curve, exponent) {
    this._curve = curve;
    this._curveBitLength = curve.r.bitLength();
    this._exponent = exponent;

    this.serialize = function () {
      var exponent = this.get();
      var curveName = sjcl.ecc.curveName(curve);
      return {
        type: this.getType(),
        secretKey: true,
        exponent: sjcl.codec.hex.fromBits(exponent),
        curve: curveName
      };
    };

    /** get this keys exponent data
    * @return {bitArray} exponent
    */
    this.get = function () {
      return this._exponent.toBits();
    };
  }
};

/** @private */
sjcl.ecc.basicKey.generateKeys = function(cn) {
  return function generateKeys(curve, paranoia, sec) {
    curve = curve || 256;

    if (typeof curve === "number") {
      curve = sjcl.ecc.curves['c'+curve];
      if (curve === undefined) {
        throw new sjcl.exception.invalid("no such curve");
      }
    }
    sec = sec || sjcl.bn.random(curve.r, paranoia);

    var pub = curve.G.mult(sec);
    return { pub: new sjcl.ecc[cn].publicKey(curve, pub),
             sec: new sjcl.ecc[cn].secretKey(curve, sec) };
  };
};

/** elGamal keys */
sjcl.ecc.elGamal = {
  /** generate keys
  * @function
  * @param curve
  * @param {int} paranoia Paranoia for generation (default 6)
  * @param {secretKey} sec secret Key to use. used to get the publicKey for ones secretKey
  */
  generateKeys: sjcl.ecc.basicKey.generateKeys("elGamal"),
  /** elGamal publicKey.
  * @constructor
  * @augments sjcl.ecc.basicKey.publicKey
  */
  publicKey: function (curve, point) {
    sjcl.ecc.basicKey.publicKey.apply(this, arguments);
  },
  /** elGamal secretKey
  * @constructor
  * @augments sjcl.ecc.basicKey.secretKey
  */
  secretKey: function (curve, exponent) {
    sjcl.ecc.basicKey.secretKey.apply(this, arguments);
  }
};

sjcl.ecc.elGamal.publicKey.prototype = {
  /** Kem function of elGamal Public Key
  * @param paranoia paranoia to use for randomization.
  * @return {object} key and tag. unkem(tag) with the corresponding secret key results in the key returned.
  */
  kem: function(paranoia) {
    var sec = sjcl.bn.random(this._curve.r, paranoia),
        tag = this._curve.G.mult(sec).toBits(),
        key = sjcl.hash.sha256.hash(this._point.mult(sec).toBits());
    return { key: key, tag: tag };
  },
  
  getType: function() {
    return "elGamal";
  }
};

sjcl.ecc.elGamal.secretKey.prototype = {
  /** UnKem function of elGamal Secret Key
  * @param {bitArray} tag The Tag to decrypt.
  * @return {bitArray} decrypted key.
  */
  unkem: function(tag) {
    return sjcl.hash.sha256.hash(this._curve.fromBits(tag).mult(this._exponent).toBits());
  },

  /** Diffie-Hellmann function
  * @param {elGamal.publicKey} pk The Public Key to do Diffie-Hellmann with
  * @return {bitArray} diffie-hellmann result for this key combination.
  */
  dh: function(pk) {
    return sjcl.hash.sha256.hash(pk._point.mult(this._exponent).toBits());
  },

  /** Diffie-Hellmann function, compatible with Java generateSecret
  * @param {elGamal.publicKey} pk The Public Key to do Diffie-Hellmann with
  * @return {bitArray} undigested X value, diffie-hellmann result for this key combination,
  * compatible with Java generateSecret().
  */
  dhJavaEc: function(pk) {
    return pk._point.mult(this._exponent).x.toBits();
  }, 

  getType: function() {
    return "elGamal";
  }
};

/** ecdsa keys */
sjcl.ecc.ecdsa = {
  /** generate keys
  * @function
  * @param curve
  * @param {int} paranoia Paranoia for generation (default 6)
  * @param {secretKey} sec secret Key to use. used to get the publicKey for ones secretKey
  */
  generateKeys: sjcl.ecc.basicKey.generateKeys("ecdsa")
};

/** ecdsa publicKey.
* @constructor
* @augments sjcl.ecc.basicKey.publicKey
*/
sjcl.ecc.ecdsa.publicKey = function (curve, point) {
  sjcl.ecc.basicKey.publicKey.apply(this, arguments);
};

/** specific functions for ecdsa publicKey. */
sjcl.ecc.ecdsa.publicKey.prototype = {
  /** Diffie-Hellmann function
  * @param {bitArray} hash hash to verify.
  * @param {bitArray} rs signature bitArray.
  * @param {boolean}  fakeLegacyVersion use old legacy version
  */
  verify: function(hash, rs, fakeLegacyVersion) {
    if (sjcl.bitArray.bitLength(hash) > this._curveBitLength) {
      hash = sjcl.bitArray.clamp(hash, this._curveBitLength);
    }
    var w = sjcl.bitArray,
        R = this._curve.r,
        l = this._curveBitLength,
        r = sjcl.bn.fromBits(w.bitSlice(rs,0,l)),
        ss = sjcl.bn.fromBits(w.bitSlice(rs,l,2*l)),
        s = fakeLegacyVersion ? ss : ss.inverseMod(R),
        hG = sjcl.bn.fromBits(hash).mul(s).mod(R),
        hA = r.mul(s).mod(R),
        r2 = this._curve.G.mult2(hG, hA, this._point).x;
    if (r.equals(0) || ss.equals(0) || r.greaterEquals(R) || ss.greaterEquals(R) || !r2.equals(r)) {
      if (fakeLegacyVersion === undefined) {
        return this.verify(hash, rs, true);
      } else {
        throw (new sjcl.exception.corrupt("signature didn't check out"));
      }
    }
    return true;
  },

  getType: function() {
    return "ecdsa";
  }
};

/** ecdsa secretKey
* @constructor
* @augments sjcl.ecc.basicKey.publicKey
*/
sjcl.ecc.ecdsa.secretKey = function (curve, exponent) {
  sjcl.ecc.basicKey.secretKey.apply(this, arguments);
};

/** specific functions for ecdsa secretKey. */
sjcl.ecc.ecdsa.secretKey.prototype = {
  /** Diffie-Hellmann function
  * @param {bitArray} hash hash to sign.
  * @param {int} paranoia paranoia for random number generation
  * @param {boolean} fakeLegacyVersion use old legacy version
  */
  sign: function(hash, paranoia, fakeLegacyVersion, fixedKForTesting) {
    if (sjcl.bitArray.bitLength(hash) > this._curveBitLength) {
      hash = sjcl.bitArray.clamp(hash, this._curveBitLength);
    }
    var R  = this._curve.r,
        l  = R.bitLength(),
        k  = fixedKForTesting || sjcl.bn.random(R.sub(1), paranoia).add(1),
        r  = this._curve.G.mult(k).x.mod(R),
        ss = sjcl.bn.fromBits(hash).add(r.mul(this._exponent)),
        s  = fakeLegacyVersion ? ss.inverseMod(R).mul(k).mod(R)
             : ss.mul(k.inverseMod(R)).mod(R);
    return sjcl.bitArray.concat(r.toBits(l), s.toBits(l));
  },

  getType: function() {
    return "ecdsa";
  }
};
if( true && module.exports){
  module.exports = sjcl;
}
if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
        return sjcl;
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}


/***/ }),

/***/ 56:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AVVerifier = void 0;
var bulletin_board_1 = __webpack_require__(85);
var constants_1 = __webpack_require__(68);
var generate_key_pair_1 = __webpack_require__(731);
var sign_1 = __webpack_require__(162);
var decrypt_vote_1 = __webpack_require__(584);
var pedersen_commitment_1 = __webpack_require__(315);
var election_config_1 = __webpack_require__(771);
var AVVerifier = /** @class */ (function () {
    /**
     * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
     */
    function AVVerifier(bulletinBoardURL, dbbPublicKey) {
        this.bulletinBoard = new bulletin_board_1.BulletinBoard(bulletinBoardURL);
        this.dbbPublicKey = dbbPublicKey;
    }
    AVVerifier.prototype.initialize = function (electionConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!electionConfig) return [3 /*break*/, 1];
                        (0, election_config_1.validateElectionConfig)(electionConfig);
                        this.electionConfig = electionConfig;
                        return [3 /*break*/, 3];
                    case 1:
                        _a = this;
                        return [4 /*yield*/, (0, election_config_1.fetchElectionConfig)(this.bulletinBoard)];
                    case 2:
                        _a.electionConfig = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AVVerifier.prototype.findBallot = function (trackingCode) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bulletinBoard.getVotingTrack(trackingCode).then(function (response) {
                            // TODO: Validate item payloads and receipt.... How can I validate the payload, when I dont know what to expect?
                            // and verificationTrackStartItem === ballot checking code
                            if (['voterCommitment', 'serverCommitment', 'ballotCryptograms', 'verificationTrackStart']
                                .every(function (p) { return Object.keys(response.data).includes(p); })) {
                                _this.cryptogramAddress = response.data.ballotCryptograms.address;
                                _this.voterCommitment = response.data.voterCommitment.content.commitment;
                                _this.boardCommitment = response.data.serverCommitment.content.commitment;
                                _this.ballotCryptograms = response.data.ballotCryptograms;
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.cryptogramAddress];
                }
            });
        });
    };
    AVVerifier.prototype.submitVerifierKey = function (spoilRequestAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var keyPair, verfierItem, signedVerifierItem, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        keyPair = (0, generate_key_pair_1.randomKeyPair)();
                        this.verifierPrivateKey = keyPair.privateKey;
                        verfierItem = {
                            type: constants_1.VERIFIER_ITEM,
                            parentAddress: spoilRequestAddress,
                            content: {
                                publicKey: keyPair.publicKey
                            }
                        };
                        signedVerifierItem = (0, sign_1.signPayload)(verfierItem, keyPair.privateKey);
                        // TODO: Validate payload and receipt
                        // check verifierItem.previousAddress === verificationTrackStartItem address
                        _a = this;
                        return [4 /*yield*/, this.bulletinBoard.submitVerifierItem(signedVerifierItem)];
                    case 1:
                        // TODO: Validate payload and receipt
                        // check verifierItem.previousAddress === verificationTrackStartItem address
                        _a.verifierItem = (_b.sent()).data.verifier;
                        return [2 /*return*/, this.verifierItem];
                }
            });
        });
    };
    AVVerifier.prototype.decryptBallot = function () {
        this.validateBoardCommitmentOpening(this.boardCommitmentOpening.content, this.boardCommitment);
        this.validateVoterCommitmentOpening(this.voterCommitmentOpening.content, this.voterCommitment);
        var defaultMarkingType = {
            style: "regular",
            codeSize: 1,
            minMarks: 1,
            maxMarks: 1
        };
        return (0, decrypt_vote_1.decrypt)(this.electionConfig.contestConfigs, defaultMarkingType, this.electionConfig.encryptionKey, this.ballotCryptograms.content.cryptograms, this.boardCommitmentOpening.content, this.voterCommitmentOpening.content);
    };
    AVVerifier.prototype.validateBoardCommitmentOpening = function (commitmentOpening, commitment) {
        if (!this.validateCommitmentOpening(commitmentOpening, commitment))
            throw new Error("The board lied!!!");
    };
    AVVerifier.prototype.validateVoterCommitmentOpening = function (commitmentOpening, commitment) {
        if (!this.validateCommitmentOpening(commitmentOpening, commitment))
            throw new Error("The voter lied!!!");
    };
    AVVerifier.prototype.validateCommitmentOpening = function (commitmentOpening, commitment) {
        return (0, pedersen_commitment_1.isValidPedersenCommitment)(commitment, commitmentOpening.randomizers, commitmentOpening.commitmentRandomness);
    };
    AVVerifier.prototype.pollForSpoilRequest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempts, executePoll;
            var _this = this;
            return __generator(this, function (_a) {
                attempts = 0;
                executePoll = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    var _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, this.bulletinBoard.getSpoilRequestItem(this.cryptogramAddress).catch(function (error) {
                                    console.error(error.response.data.error_message);
                                })];
                            case 1:
                                result = _e.sent();
                                attempts++;
                                if (((_b = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.item) === null || _b === void 0 ? void 0 : _b.type) === constants_1.SPOIL_REQUEST_ITEM) {
                                    return [2 /*return*/, resolve(result.data.item.address)];
                                }
                                else if (((_d = (_c = result === null || result === void 0 ? void 0 : result.data) === null || _c === void 0 ? void 0 : _c.item) === null || _d === void 0 ? void 0 : _d.type) === constants_1.CAST_REQUEST_ITEM) {
                                    return [2 /*return*/, reject(new Error('Ballot has been cast and cannot be spoiled'))];
                                }
                                else if (constants_1.MAX_POLL_ATTEMPTS && attempts === constants_1.MAX_POLL_ATTEMPTS) {
                                    return [2 /*return*/, reject(new Error('Exceeded max attempts'))];
                                }
                                else {
                                    setTimeout(executePoll, constants_1.POLLING_INTERVAL_MS, resolve, reject);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [2 /*return*/, new Promise(executePoll)];
            });
        });
    };
    AVVerifier.prototype.pollForCommitmentOpening = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempts, executePoll;
            var _this = this;
            return __generator(this, function (_a) {
                attempts = 0;
                executePoll = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, this.bulletinBoard.getCommitmentOpenings(this.verifierItem.address).catch(function (error) {
                                    console.error(error.response.data.error_message);
                                })];
                            case 1:
                                result = _c.sent();
                                attempts++;
                                if (((_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.voterCommitmentOpening) && ((_b = result === null || result === void 0 ? void 0 : result.data) === null || _b === void 0 ? void 0 : _b.boardCommitmentOpening)) {
                                    this.boardCommitmentOpening = result.data.boardCommitmentOpening;
                                    this.voterCommitmentOpening = result.data.voterCommitmentOpening;
                                    return [2 /*return*/, resolve(result.data)];
                                }
                                else if (constants_1.MAX_POLL_ATTEMPTS && attempts === constants_1.MAX_POLL_ATTEMPTS) {
                                    return [2 /*return*/, reject(new Error('Exceeded max attempts'))];
                                }
                                else {
                                    setTimeout(executePoll, constants_1.POLLING_INTERVAL_MS, resolve, reject);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [2 /*return*/, new Promise(executePoll)];
            });
        });
    };
    return AVVerifier;
}());
exports.AVVerifier = AVVerifier;
//# sourceMappingURL=av_verifier.js.map

/***/ }),

/***/ 59:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Uniformer = /** @class */ (function () {
    function Uniformer() {
    }
    Uniformer.prototype.formString = function (obj) {
        var sortedEntries = this.walk(obj);
        return JSON.stringify(sortedEntries);
    };
    Uniformer.prototype.toSortedKeyValuePairs = function (obj) {
        var _this = this;
        var toKeyValueTuple = function (_a) {
            var k = _a[0], v = _a[1];
            return [k, _this.walk(v)];
        };
        var sortByKey = function (a, b) { return ("" + a[0]).localeCompare(b[0]); };
        var properties = Object.entries(obj);
        return properties
            .map(toKeyValueTuple)
            .sort(sortByKey);
    };
    Uniformer.prototype.getSymbolName = function (symbol) {
        return symbol.slice("Symbol(".length, -1); // Extracts 'foo' from 'Symbol(foo)'
    };
    Uniformer.prototype.walk = function (obj) {
        var _this = this;
        switch (typeof obj) {
            case "string":
            case "number":
            case "boolean": return obj;
            case "symbol": return this.getSymbolName(obj.toString());
            case "object":
                if (obj === null)
                    return null;
                if (obj instanceof Array)
                    return obj.map(function (e) { return _this.walk(e); });
                if (obj instanceof Date)
                    return obj.toISOString();
                return this.toSortedKeyValuePairs(obj);
            default:
                throw new Error("Unknown parameter type '".concat(typeof obj, "'."));
        }
    };
    return Uniformer;
}());
exports["default"] = Uniformer;
//# sourceMappingURL=uniformer.js.map

/***/ }),

/***/ 669:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(609);

/***/ }),

/***/ 448:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var settle = __webpack_require__(26);
var cookies = __webpack_require__(372);
var buildURL = __webpack_require__(327);
var buildFullPath = __webpack_require__(97);
var parseHeaders = __webpack_require__(109);
var isURLSameOrigin = __webpack_require__(985);
var createError = __webpack_require__(61);
var defaults = __webpack_require__(655);
var Cancel = __webpack_require__(263);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ 609:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var bind = __webpack_require__(849);
var Axios = __webpack_require__(321);
var mergeConfig = __webpack_require__(185);
var defaults = __webpack_require__(655);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(263);
axios.CancelToken = __webpack_require__(972);
axios.isCancel = __webpack_require__(502);
axios.VERSION = (__webpack_require__(288).version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(713);

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(268);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ 263:
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ 972:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(263);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ 502:
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ 321:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var buildURL = __webpack_require__(327);
var InterceptorManager = __webpack_require__(782);
var dispatchRequest = __webpack_require__(572);
var mergeConfig = __webpack_require__(185);
var validator = __webpack_require__(875);

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  if (!config.url) {
    throw new Error('Provided config url is not valid');
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  if (!config.url) {
    throw new Error('Provided config url is not valid');
  }
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ 782:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ 97:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(793);
var combineURLs = __webpack_require__(303);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ 61:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(481);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ 572:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var transformData = __webpack_require__(527);
var isCancel = __webpack_require__(502);
var defaults = __webpack_require__(655);
var Cancel = __webpack_require__(263);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ 481:
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ 185:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ 26:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(61);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ 527:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var defaults = __webpack_require__(655);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ 655:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var normalizeHeaderName = __webpack_require__(16);
var enhanceError = __webpack_require__(481);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(448);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(448);
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ 288:
/***/ ((module) => {

module.exports = {
  "version": "0.25.0"
};

/***/ }),

/***/ 849:
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ 327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ 303:
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ 372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ 793:
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ 268:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ 985:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ 16:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ 109:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ 713:
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ 875:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(288).version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ 867:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(849);

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ 201:
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(56);
/******/ 	AssemblyVoting = __webpack_exports__;
/******/ 	
/******/ })()
;