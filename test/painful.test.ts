import { AVClient } from '../lib/av_client';
import { expect } from 'chai';

describe.only('the pain of testing TypeScript', function() {
  let client;

  beforeEach(function() {
    client = new AVClient(null, 'http://localhost:3000/test/app');
  });

  context('type checking not kicking in', function() {
    // Shows the explicitly thrown 'Please provide first argument' error instead
    it('should not compile when we provide no arguments with await', async function() {
      await client.sum();
    });

    // Passes, should fail. We could blame the dev for "forgetting" to add await in this one, but still.
    it('should not compile when we provide no arguments without await', async function() {
      client.sum();
    });
  });

  context('testing for async code throwing errors', function() {
    // Doesn't really work
    it('should allow us testing for thrown errors in async function, style 1', async function() {
      expect(client.sum()).to.throw();
    });

    // Doesn't really work
    it('should allow us testing for thrown errors in async function, style 2', async function() {
      await expect(client.sum()).to.throw();
    });

    // Doesn't really work
    it('should allow us testing for thrown errors in async function, style 3', async function() {
      expect(async () => await client.sum()).to.throw();
    });

    // Doesn't really work
    it('should at least allow testing async exceptions with the crappy try/catch syntax', async function() {
      try {
        await client.sum()
      }
      catch(error) {
        // AssertionError: expected [Error: Please provide first argument] to deeply equal [Error: Please provide first argument]
        expect(error).to.eql(new Error('Please provide first argument'));
      }
    });

    // Actually works, with caveats.
    // This could be extracted into a testing method like here: https://medium.com/srmkzilla/typescript-error-handling-with-asynchronous-function-in-chai-7fc8e2824cf3
    it('requires the crappy try/catch syntax to test async exceptions in a really hard way', async function() {
      try {
        // This can leak other errors, which will be swallowed by the following catch/expect
        await client.sum();
      }
      catch(error) {
        expect(error.message).to.equal('Please provide first argument');
      }
    });
  });
});
