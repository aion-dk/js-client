"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const av_client_1 = require("../lib/av_client");
const chai_1 = require("chai");
describe('AVClient#getAuthorizationMethod', function () {
    let client;
    let sandbox;
    beforeEach(function () {
        client = new av_client_1.AVClient('http://localhost:3000/test/app');
        client.electionConfig = require('./replies/config.valid.json');
    });
    context('bulletin board returns a config, mode is election codes', function () {
        it('returns the appropriate method name', function () {
            client.electionConfig.authorizationMode = 'election codes';
            const result = client.getAuthorizationMethod();
            chai_1.expect(result.methodName).to.equal('authenticateWithCodes');
            chai_1.expect(result.method).to.equal(client.authenticateWithCodes);
        });
    });
    context('bulletin board returns a config, mode is OTPs', function () {
        it('returns the appropriate method name', function () {
            client.electionConfig.authorizationMode = 'otps';
            const result = client.getAuthorizationMethod();
            chai_1.expect(result.methodName).to.equal('requestAccessCode');
            chai_1.expect(result.method).to.equal(client.requestAccessCode);
        });
    });
    context('election config is not available', function () {
        it('returns an error', function () {
            delete client['electionConfig'];
            chai_1.expect(() => client.getAuthorizationMethod()).to.throw(Error, 'Please fetch election config first');
        });
    });
    context('election config value for authorization mode is not available', function () {
        it('returns an error', function () {
            delete client.electionConfig['authorizationMode'];
            chai_1.expect(() => client.getAuthorizationMethod()).to.throw(Error, 'Authorization method not found in election config');
        });
    });
});
//# sourceMappingURL=get_authorization_method.test.js.map