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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidOptionError = exports.InvalidContestError = exports.InvalidTrackingCodeError = exports.VoterSessionTimeoutError = exports.InvalidTokenError = exports.TimeoutError = exports.CorruptSelectionError = exports.CorruptCvrError = exports.UnsupportedServerReplyError = exports.VoterRecordNotFoundError = exports.EmailDoesNotMatchVoterRecordError = exports.BulletinBoardError = exports.InvalidStateError = exports.InvalidConfigError = exports.NetworkError = exports.AccessCodeExpired = exports.AccessCodeInvalid = exports.AvClientError = void 0;
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
var CorruptSelectionError = /** @class */ (function (_super) {
    __extends(CorruptSelectionError, _super);
    function CorruptSelectionError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "CorruptSelectionError";
        Object.setPrototypeOf(_this, CorruptSelectionError.prototype);
        return _this;
    }
    return CorruptSelectionError;
}(AvClientError));
exports.CorruptSelectionError = CorruptSelectionError;
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
var InvalidTrackingCodeError = /** @class */ (function (_super) {
    __extends(InvalidTrackingCodeError, _super);
    function InvalidTrackingCodeError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "InvalidTrackingCodeError";
        Object.setPrototypeOf(_this, InvalidTrackingCodeError.prototype);
        return _this;
    }
    return InvalidTrackingCodeError;
}(AvClientError));
exports.InvalidTrackingCodeError = InvalidTrackingCodeError;
var InvalidContestError = /** @class */ (function (_super) {
    __extends(InvalidContestError, _super);
    function InvalidContestError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "InvalidContestError";
        Object.setPrototypeOf(_this, InvalidContestError.prototype);
        return _this;
    }
    return InvalidContestError;
}(AvClientError));
exports.InvalidContestError = InvalidContestError;
var InvalidOptionError = /** @class */ (function (_super) {
    __extends(InvalidOptionError, _super);
    function InvalidOptionError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "InvalidOptionError";
        Object.setPrototypeOf(_this, InvalidOptionError.prototype);
        return _this;
    }
    return InvalidOptionError;
}(AvClientError));
exports.InvalidOptionError = InvalidOptionError;
//# sourceMappingURL=errors.js.map