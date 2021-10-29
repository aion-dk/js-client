# AV Client Library Changelog

## 0.1.5
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
