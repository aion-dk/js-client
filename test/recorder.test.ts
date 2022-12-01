import { expect } from 'chai';
import { recordResponses } from './test_helpers';
import * as fs from 'fs';
import axios from 'axios';

// Skipping by default, as it messes with nock when running mocha in watch mode.
// Enable this if mock recording breaks somehow.
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
    return backend.get("singlelist?text=Test&noofRecords=10").then(
      (response) => { console.log(`Got ${response.status}`); return response.data }
    );
  }

  afterEach(function() {
    fs.unlink(__dirname + '/replies/get_singlelist_text-test_noofrecords-10.json', (error) => {
      if (error) {
        console.error(`Could not delete the file after test. Error: ${error}`);
      }
    });
  });

  it('records contents to a readable file', async function() {
    return await recordResponses(async function() {
      await getStuff();
    }).then(function() {
      const expectedFilePath = __dirname + '/replies/get_singlelist_text-test_noofrecords-10.json';
      fs.access(expectedFilePath, fs.constants.R_OK, (error) => {
        if (error) {
          expect.fail(`File '${expectedFilePath}' not readable, got error: ${error}`);
        }
      });
      fs.readFile(expectedFilePath, 'utf8', (error, data) => {
        if (error) {
          expect.fail(`Could not read file. Error: ${error}`)
        } else {
          const content = JSON.parse(data);
          expect(content).to.eql(new Array(10).fill({value: 'Test'}))
        }
      })
    });
  });
});
