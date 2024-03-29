# AV Client Library Changelog
## 1.1.8
- Added weight to the voter session expectation. DBB has also been expanded to provide weights for the session.

## 1.1.6
- Replace proof-of-private-key with proof-of-election-codes

## 1.1.5
- Move authorizationMode under voterAuthorizer and rename values:
  - proof-of-identity and proof-of-private-key
- Allow registering as a voter by proof of identity or proof of private key 
- Allow submitting blank if dbb config allows.

## 1.1.4
- Have voter registration fetch and sign latest config item rather than latest VA config item.

## 1.1.3
- Increase poll time

## 1.1.2
- Added nist parser

## 1.1.1
- Updated the BallotBoxReceipt

## 1.1.0
- Breaking changes to contest config marking type
- Complex votes encoding added

## 1.0.5
- Packing payloads to DBB
- Customizable URL in Verifier-POC

## 1.0.4
- Encrypted commitment openings
- Added tests
## 1.0.3
- Introduced Base58 short codes
- Usage of env variables for various services

## 1.0.2
* Export verifier as part of av-client
* Use of contest references

## 1.0.1
* Remove jsonwebtoken package
* Verifier UX improvements

## 1.0.0
* Support new DBB structure

## 0.1.14
* Auth token replaces registration token and session token.

## 0.1.13
* Expose getElectionConfig() as a public method.
Can be used for debugging, testing and enumerating ballots.

## 0.1.11
* Add initial NIST 1500-103 converter

## 0.1.10
* Export type IAVClient

## 0.1.9
* Added IAVClient interface for easier mocking by consumers.


## 0.1.8
* Fix problem with 3rd party libs not being contained in package.

## 0.1.3

### New
* Documentation updates
* Exporting error types for improved error handling in consuming code
* Upgrading 3rd party libraries, including security patching
* Improved error handling
* Transpilation target downgraded from ES2020 to ES2018

### Changed

* Type `Receipt` renamed to `BallotBoxReceipt`. Content is unchanged.
* Method `generateTestCode()` marked as deprecated. This will be replaced when the new Benaloh challenge is in place.


## 0.1.2

### New
We are introducing two new methods on the client library.

#### New method: initialize()
Motivation:
This is allows fetching the  initial election configuration, but without relying on an asynchronous constructor.

#### New method: registerVoter()
Motivation:
This makes it more clear to the consumer when exactly the actual voter registration is done.

#### Consequences

Adding the two new methods means the call sequence should now follow this pattern:

```
1. initialize
2. requestAccessCode
3. validateAccessCode
4. registerVoter
5. constructBallotCryptograms
6. spoilBallotCryptograms (optional)
7. submitBallotCryptograms
8. purgeData
```

### Changed
We have identified two design issues that has led us to change the signature of two existing methods.

#### Changed method: requestAccessCode
```
# Before
requestAccessCode(opaqueVoterId: string): Promise<void>

# After
requestAccessCode(opaqueVoterId: string, email: string): Promise<void>
```

Motivation:
1. Avoid providing an interface to spam voters based on a potentially guessable opaque voter IDs.
2. By making the consumer state the email where the OTP code is expected to arrive, we can provide an error instead of leaving a voter in a wait-forever state.


#### Changed method: validateAccessCode
```
# Before
validateAccessCode(code: string | string[], email: string): Promise<void>

# After
validateAccessCode(code: string): Promise<void>
```

Motivation:
1. We are only supporting a single OTP provider at the moment, thus we don't need an array of codes.
2. We no longer need the email parameter, as the client library now gets this when requestAccessCode is called.
