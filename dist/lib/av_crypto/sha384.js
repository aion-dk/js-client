"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHA384 = void 0;
var sjcl = require("sjcl-with-all");
var sha512_1 = require("@noble/hashes/sha512");
var SHA384 = /** @class */ (function () {
    function SHA384() {
        this.sha = sha512_1.sha384.create();
    }
    SHA384.prototype.finalize = function () {
        var digest = this.sha.digest();
        return sjcl.codec.bytes.toBits(digest);
    };
    SHA384.prototype.reset = function () {
        this.sha = sha512_1.sha384.create();
        return this;
    };
    SHA384.prototype.update = function (data) {
        if (typeof data === "string") {
            this.sha.update(data);
        }
        else {
            var byteArray = new Uint8Array(sjcl.codec.bytes.fromBits(data));
            this.sha.update(byteArray);
        }
        return this;
    };
    SHA384.hash = function (data) {
        return new SHA384().update(data).finalize();
    };
    return SHA384;
}());
exports.SHA384 = SHA384;
//# sourceMappingURL=sha384.js.map