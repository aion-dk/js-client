"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const av_client_1 = require("../lib/av_client");
const chai_1 = require("chai");
const errors_1 = require("../lib/av_client/errors");
describe('AVClient#getAuthorizationMethod', function () {
    let client;
    let sandbox;
    beforeEach(async function () {
        client = new av_client_1.AVClient('http://localhost:3000/test/app');
        let electionConfig = require('./replies/config.valid.json');
        await client.initialize(electionConfig);
    });
    context('bulletin board returns a config, mode is election codes', function () {
        it('returns the appropriate method name', function () {
            client.getElectionConfig().authorizationMode = 'election codes';
            const result = client.getAuthorizationMethod();
            chai_1.expect(result.methodName).to.equal('authenticateWithCodes');
            chai_1.expect(result.method).to.equal(client.authenticateWithCodes);
        });
    });
    context('bulletin board returns a config, mode is OTPs', function () {
        it('returns the appropriate method name', function () {
            client.getElectionConfig().authorizationMode = 'otps';
            const result = client.getAuthorizationMethod();
            chai_1.expect(result.methodName).to.equal('requestAccessCode');
            chai_1.expect(result.method).to.equal(client.requestAccessCode);
        });
    });
    context('election config is not available', function () {
        it('returns an error', function () {
            client = new av_client_1.AVClient('http://localhost:3000/test/app');
            chai_1.expect(() => client.getAuthorizationMethod()).to.throw(errors_1.InvalidStateError, 'No configuration loaded. Did you call initialize()?');
        });
    });
    context('election config value for authorization mode is not available', function () {
        it('returns an error', async function () {
            let electionConfig = require('./replies/config.valid.json');
            delete electionConfig['authorizationMode'];
            await client.initialize(electionConfig);
            chai_1.expect(() => client.getAuthorizationMethod()).to.throw(errors_1.InvalidConfigError, 'Authorization method not found in election config');
        });
    });
});
//# sourceMappingURL=get_authorization_method.test.js.map