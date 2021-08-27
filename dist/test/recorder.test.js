"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const test_helpers_1 = require("./test_helpers");
const fs = require('fs');
const axios = require('axios');
// Skipping by default, as it messes with nock when running mocha in watch mode.
describe.skip("record stuff", () => {
    async function getStuff() {
        const backend = axios.create({
            baseURL: "https://hub.dummyapis.com/",
            withCredentials: false,
            timeout: 1000,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return backend.get("singlelist?text=Test&noofRecords=10").then((response) => { console.log(`Got ${response.status}`); return Promise.resolve(response.data); }, (error) => { return Promise.reject(error); });
    }
    afterEach(function () {
        fs.unlink(__dirname + '/replies/get_singlelist_text-test_noofrecords-10.json', (error) => {
            if (error) {
                console.error(`Could not delete the file after test. Error: ${error}`);
            }
        });
    });
    it('records contents to a readable file', async function () {
        return await test_helpers_1.recordResponses(async function () {
            await getStuff();
        }).then(function () {
            const expectedFilePath = __dirname + '/replies/get_singlelist_text-test_noofrecords-10.json';
            fs.access(expectedFilePath, fs.constants.R_OK, (error) => {
                if (error) {
                    chai_1.expect.fail(`File '${expectedFilePath}' not readable, got error: ${error}`);
                }
            });
            fs.readFile(expectedFilePath, 'utf8', (error, data) => {
                if (error) {
                    chai_1.expect.fail(`Could not read file. Error: ${error}`);
                }
                else {
                    const content = JSON.parse(data);
                    chai_1.expect(content).to.eql(new Array(10).fill({ value: 'Test' }));
                }
            });
        });
    });
});
//# sourceMappingURL=recorder.test.js.map