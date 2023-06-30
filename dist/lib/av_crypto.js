"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVCrypto = exports.SUPPORTED_ELLIPTIC_CURVE_NAMES = void 0;
var curve_1 = require("./av_crypto/curve");
var encoder_1 = require("./av_crypto/encoder");
var utils_1 = require("./av_crypto/utils");
var elGamalScheme = require("./av_crypto/el_gamal/scheme");
var scheme_1 = require("./av_crypto/pedersen/scheme");
var commitment_1 = require("./av_crypto/pedersen/commitment");
var elGamalCryptogram = require("./av_crypto/el_gamal/cryptogram");
exports.SUPPORTED_ELLIPTIC_CURVE_NAMES = {
    'secp256k1': 'k256',
    'secp256r1': 'c256',
    'secp384r1': 'c384',
    'secp521r1': 'c521'
};
var AVCrypto = /** @class */ (function () {
    function AVCrypto(curveName) {
        if (!(curveName in exports.SUPPORTED_ELLIPTIC_CURVE_NAMES)) {
            throw new Error("input must be one of the followings: " + Object.keys(exports.SUPPORTED_ELLIPTIC_CURVE_NAMES).join(', '));
        }
        this.curve = new curve_1.Curve(exports.SUPPORTED_ELLIPTIC_CURVE_NAMES[curveName]);
    }
    /**
     * Encrypts a vote with the provided encryption key.
     *
     * @param vote The byte representation of the vote
     * @param encryptionKey The public encryption key
     * @returns Returns the cryptograms and their respective randomizers
     */
    AVCrypto.prototype.encryptVote = function (vote, encryptionKey) {
        var points = new encoder_1.Encoder(this.curve).bytesToPoints(Array.from(vote));
        var encryptionKeyPoint = (0, utils_1.hexToPoint)(encryptionKey, this.curve);
        var cryptograms = [];
        var randomizers = [];
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var point = points_1[_i];
            var randomness = (0, utils_1.generateKeyPair)(this.curve);
            var cryptogram = elGamalScheme.encrypt(point, encryptionKeyPoint, this.curve, randomness);
            cryptograms.push(cryptogram.toString());
            randomizers.push((0, utils_1.scalarToHex)(randomness.sec.S, this.curve));
        }
        return {
            cryptograms: cryptograms,
            randomizers: randomizers
        };
    };
    /**
     * Homomorphically combines two cryptograms.
     *
     * Used to combine the voter cryptogram with the empty cryptogram received form DBB.
     *
     * @param voterCryptogram The cryptogram of the voter
     * @param serverCryptogram The empty cryptogram from the DBB
     * @returns Returns the final cryptogram
     */
    AVCrypto.prototype.combineCryptograms = function (voterCryptogram, serverCryptogram) {
        var c1 = elGamalCryptogram.fromString(voterCryptogram, this.curve);
        var c2 = elGamalCryptogram.fromString(serverCryptogram, this.curve);
        var c3 = elGamalScheme.homomorphicallyAdd([c1, c2]);
        return c3.toString();
    };
    /**
     * Revert the encryption done by the randomizer.
     * Basically, it decrypts using the randomizer instead of the decryption key.
     *
     * This is used by the external verifier, when a ballot gets spoiled.
     *
     * @param cryptograms The cryptograms of the voter
     * @param randomizers The randomizers used in the encryption
     * @param encryptionKey The public encryption key used in the encryption
     * @returns Returns the decrypted bytes
     */
    AVCrypto.prototype.revertEncryption = function (cryptograms, randomizers, encryptionKey) {
        var _this = this;
        var pubKey = (0, utils_1.hexToPoint)(encryptionKey, this.curve);
        var points = cryptograms.map(function (cryptogram, i) {
            var c = elGamalCryptogram.fromString(cryptogram, _this.curve);
            var r = (0, utils_1.hexToScalar)(randomizers[i], _this.curve);
            var c2 = new elGamalCryptogram.Cryptogram(pubKey, c.c);
            return elGamalScheme.decrypt(c2, r);
        });
        var bytes = new encoder_1.Encoder(this.curve).pointsToBytes(points);
        return new Uint8Array(bytes);
    };
    /**
     * Commit to a number of private hexadecimal cryptogram randomizes. This is used when
     * generating voter encryption commitments as well as the board encryption commitments.
     *
     * @param privateEncryptionRandomizers The collection of cryptogram randomizers
     * @param context The context of the commitment
     * @returns Returns the commitment and its randomizer as hexadecimal strings
     */
    AVCrypto.prototype.commit = function (privateEncryptionRandomizers, context) {
        var _this = this;
        if (context === void 0) { context = ""; }
        var encryptionRandomizers = privateEncryptionRandomizers.map(function (s) {
            return (0, utils_1.hexToScalar)(s, _this.curve);
        });
        var commitment = (0, scheme_1.commit)(encryptionRandomizers, context, this.curve);
        return {
            commitment: (0, utils_1.pointToHex)(commitment.c),
            privateCommitmentRandomizer: (0, utils_1.scalarToHex)(commitment.r, this.curve)
        };
    };
    /**
     * Validate if a number of hexadecimal encryption randomizers, given the private
     * commitment randomizer, and the public commitment is a valid commitment.
     *
     * This is used when spoiling a vote.
     *
     * @param commitment The commitment
     * @param privateCommitmentRandomizer The randomizer of the commitment
     * @param encryptionRandomizers The hexadecimal encryption randomizers
     * @param context The context of the commitment
     * @returns Returns validation
     */
    AVCrypto.prototype.isValidCommitment = function (commitment, privateCommitmentRandomizer, encryptionRandomizers, context) {
        var _this = this;
        if (context === void 0) { context = ""; }
        var c = (0, utils_1.hexToPoint)(commitment, this.curve);
        var r = (0, utils_1.hexToScalar)(privateCommitmentRandomizer, this.curve);
        var pedersenCommitment = new commitment_1.Commitment(c, r);
        var messages = encryptionRandomizers.map(function (s) { return (0, utils_1.hexToScalar)(s, _this.curve); });
        return (0, scheme_1.isValid)(pedersenCommitment, messages, context, this.curve);
    };
    return AVCrypto;
}());
exports.AVCrypto = AVCrypto;
//# sourceMappingURL=av_crypto.js.map