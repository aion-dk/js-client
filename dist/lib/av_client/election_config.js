"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchElectionConfig = void 0;
async function fetchElectionConfig(bulletinBoard) {
    return bulletinBoard.getElectionConfig()
        .then((response) => {
        let configData = response.data;
        configData.voterAuthorizationCoordinatorURL = 'http://localhost:1234';
        configData.OTPProviderURL = 'http://localhost:1111';
        return configData;
    }, (error) => { return Promise.reject(error); });
}
exports.fetchElectionConfig = fetchElectionConfig;
//# sourceMappingURL=election_config.js.map