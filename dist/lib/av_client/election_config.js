"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ElectionConfig {
    constructor(bulletinBoard) {
        this.bulletinBoard = bulletinBoard;
    }
    async get() {
        return this.bulletinBoard.getElectionConfig()
            .then((response) => {
            let configData = response.data;
            configData.voterAuthorizationCoordinatorURL = 'http://localhost:1234';
            configData.OTPProviderCount = 1;
            configData.OTPProviderURLs = [
                'http://localhost:1111',
            ];
            return configData;
        }, (error) => { return Promise.reject(error); });
    }
}
exports.default = ElectionConfig;
//# sourceMappingURL=election_config.js.map