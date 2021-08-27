"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const av_client_1 = require("../lib/av_client");
const chai_1 = require("chai");
const nock = require("nock");
describe('AVClient#getNumberOfOTPs', function () {
    let client;
    beforeEach(function () {
        client = new av_client_1.AVClient('http://localhost:3000/test/app');
    });
    afterEach(function () {
        nock.cleanAll();
    });
    context('valid config fetched', function () {
        beforeEach(function () {
            nock('http://localhost:3000/').get('/test/app/config')
                .replyWithFile(200, __dirname + '/replies/config.valid.json');
        });
        it('returns number of OTPs', async function () {
            chai_1.expect(await client.getNumberOfOTPs()).to.equal(1);
        });
    });
    context('config cannot be fetched', function () {
        beforeEach(function () {
            nock('http://localhost:3000/').get('/test/app/config')
                .reply(404);
        });
        it('returns an error', async function () {
            return await client.getNumberOfOTPs().then(() => chai_1.expect.fail('Expected promise to be rejected'), (error) => chai_1.expect(error.message).to.equal('Request failed with status code 404'));
        });
    });
});
//# sourceMappingURL=get_number_of_otps.test.js.map