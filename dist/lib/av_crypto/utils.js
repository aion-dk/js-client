"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeyPair = exports.concatForHashing = exports.hexToScalar = exports.scalarToHex = exports.hexToPoint = exports.pointToHex = exports.hashIntoPoint = exports.hashIntoScalar = exports.infinityPoint = exports.pointEquals = exports.multiplyAndSumScalarsAndPoints = exports.addPoints = void 0;
var sjcl = require("sjcl-with-all");
function addPoints(points) {
    if (points.length == 0) {
        throw new Error("array must not be empty");
    }
    var sum = points[0].toJac();
    for (var i = 1; i < points.length; i++) {
        sum = sum.add(points[i]);
    }
    return sum.toAffine();
}
exports.addPoints = addPoints;
function multiplyAndSumScalarsAndPoints(scalars, points) {
    if (scalars.length != points.length) {
        throw new Error("scalars and points must have the same size");
    }
    var result = points[0].toJac().mult(scalars[0], points[0]);
    for (var i = 1; i < points.length; i++) {
        var term = points[i].mult(scalars[i]);
        result = result.add(term);
    }
    return result.toAffine();
}
exports.multiplyAndSumScalarsAndPoints = multiplyAndSumScalarsAndPoints;
function pointEquals(point1, point2) {
    if (point1.isIdentity) {
        return point2.isIdentity;
    }
    if (point2.isIdentity) {
        return false;
    }
    return point1.x.equals(point2.x) && point1.y.equals(point2.y);
}
exports.pointEquals = pointEquals;
function infinityPoint(curve) {
    return new sjcl.ecc.point(curve.curve());
}
exports.infinityPoint = infinityPoint;
function hashIntoScalar(string, curve) {
    var sha = curve.sha();
    for (var i = 0; i < 10000; i++) {
        var digest = sha.hash(concatForHashing([string, i]));
        var scalar = sjcl.bn.fromBits(digest);
        if (!scalar.greaterEquals(curve.order())) {
            return scalar;
        }
    }
    throw new Error("unable to hash " + string + " into a scalar");
}
exports.hashIntoScalar = hashIntoScalar;
function hashIntoPoint(string, curve) {
    var sha = curve.sha();
    for (var i = 0; i < 10000; i++) {
        var xHex = sjcl.codec.hex.fromBits(sha.hash(concatForHashing([string, i])));
        if (curve.curve() === sjcl.ecc.curves['c521']) {
            xHex = "0000" + xHex;
        }
        try {
            return hexToPoint("02" + xHex, curve);
        }
        catch (_a) {
            continue;
        }
    }
    throw new Error("unable to hash " + string + " into a point on the curve");
}
exports.hashIntoPoint = hashIntoPoint;
function pointToHex(point) {
    var bits;
    if (point.isIdentity) {
        bits = sjcl.codec.bytes.toBits([0]);
    }
    else {
        var flag = 2 | point.y.getLimb(0) & 1;
        var flag_bits = sjcl.codec.bytes.toBits([flag]);
        var data_bits = point.x.toBits();
        bits = sjcl.bitArray.concat(flag_bits, data_bits);
    }
    return sjcl.codec.hex.fromBits(bits);
}
exports.pointToHex = pointToHex;
function hexToPoint(string, curve) {
    if (!string.match(curve.pointHexPattern())) {
        throw new Error("input must match " + curve.pointHexPattern().source);
    }
    var bits = sjcl.codec.hex.toBits(string);
    var flag = sjcl.bitArray.extract(bits, 0, 8);
    var p;
    if (flag == 0) {
        p = new sjcl.ecc.point(curve.curve());
    }
    else {
        var x = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(bits, 8));
        var y = recoverY(x, flag, curve);
        p = new sjcl.ecc.point(curve.curve(), x, y);
        if (!p.isValid()) {
            throw new Error("not on the curve!");
        }
    }
    return p;
}
exports.hexToPoint = hexToPoint;
function scalarToHex(scalar, curve) {
    return sjcl.codec.hex.fromBits(scalar.toBits()).padStart(curve.scalarHexSize(), '0');
}
exports.scalarToHex = scalarToHex;
function hexToScalar(string, curve) {
    if (!string.match(curve.scalarHexPattern())) {
        throw new Error("input must match " + curve.scalarHexPattern().source);
    }
    var scalar = sjcl.bn.fromBits(sjcl.codec.hex.toBits(string));
    if (scalar.greaterEquals(curve.order())) {
        throw new Error("scalar must be lower than the curve order");
    }
    return scalar;
}
exports.hexToScalar = hexToScalar;
function concatForHashing(parts) {
    return parts.map(function (part) { return part.toString(); }).join("-");
}
exports.concatForHashing = concatForHashing;
function generateKeyPair(curve, privateKey) {
    if (privateKey !== undefined && privateKey.greaterEquals(curve.order())) {
        throw new Error("privateKey must be lower than the curve order");
    }
    return sjcl.ecc.elGamal.generateKeys(curve.curve(), undefined, privateKey);
}
exports.generateKeyPair = generateKeyPair;
function recoverY(x, flag, curve) {
    var ySquared = curve.b()
        .add(x.mulmod(curve.a().add(x.square().mod(curve.prime())).mod(curve.prime()), curve.prime()))
        .mod(curve.prime());
    var p = curve.prime().add(1);
    p.halveM();
    p.halveM();
    var y = ySquared.powermod(p, curve.prime());
    if ((2 | y.getLimb(0) & 1) !== flag) {
        y = curve.prime().sub(y).normalize();
    }
    return y;
}
//# sourceMappingURL=utils.js.map