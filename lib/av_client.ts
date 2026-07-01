import { JWTPayload, SignJWT, importJWK } from 'jose';
import { Buffer } from 'buffer';
import { p256 } from '@noble/curves/nist.js';
import { BulletinBoard } from './av_client/connectors/bulletin_board';
import VoterAuthorizationCoordinator from './av_client/connectors/voter_authorization_coordinator';
import { OTPProvider } from "./av_client/connectors/otp_provider";
import { constructContestEnvelopes } from './av_client/construct_contest_envelopes';
import { validateServerEnvelopes } from './av_client/new_crypto/validate_server_envelopes';
import { KeyPair, VerifierItem, CommitmentOpening, SpoilRequestItem, LatestConfig, BallotSelection, ContestEnvelope, BallotConfig, BallotStatus, ContestConfig, ProofOfElectionCodes, IAVClient, ContestMap, BallotBoxReceipt, VoterSessionItem, BoardCommitmentItem, BallotCryptogramItem } from './av_client/types';
import { randomKeyPair } from './av_client/new_crypto/generate_key_pair';
import { generateReceipt } from './av_client/generate_receipt';
import { JwtPayload, jwtDecode } from "jwt-decode";

interface AuthTokenPayload extends JwtPayload {
  identifier: string;
  public_key: string;
  weight?: number;
  voter_group_key: string;
  voting_round_reference: string;
}

import {
  fetchLatestConfig,
  validateLatestConfig
} from './av_client/election_config';

import {
  TimeoutError,
  InvalidConfigError,
  InvalidStateError,
  InvalidTokenError,
} from './av_client/errors';

import { signPayload, validatePayload, validateReceipt } from './av_client/new_crypto/signing';

import submitVoterCommitment from './av_client/actions/submit_voter_commitment';
import { CAST_REQUEST_ITEM, MAX_POLL_ATTEMPTS, POLLING_INTERVAL_MS, SPOIL_REQUEST_ITEM, VERIFIER_ITEM, VOTER_ENCRYPTION_COMMITMENT_OPENING_ITEM, VOTER_SESSION_ITEM, SESSION_EXTENSION_ITEM} from './av_client/constants';
import { hexToShortCode, shortCodeToHex } from './av_client/short_codes';
import { encryptCommitmentOpening } from './av_client/new_crypto/commitment_opening_encryption';
import { submitBallotCryptograms } from './av_client/actions/submit_ballot_cryptograms';
import {AxiosResponse} from "axios";
import { proofOfElectionCodes } from "./av_client/new_crypto/proof_of_election_codes";
import {validateCommitment} from "./av_client/new_crypto/commitments";
import {AVCrypto} from "@assemblyvoting/av-crypto";

/**
 * # Assembly Voting Client API
 *
 * The API is responsible for handling all the cryptographic operations and all network communication with:
 * * the Digital Ballot Box
 * * the Voter Authorization Coordinator service
 * * the OTP provider(s)
 *
 * Two authorization modes are supported, depending on the election configuration:
 * * **`proof-of-identity`**: the voter receives a one-time password by email (OTP flow).
 * * **`proof-of-election-codes`**: the voter derives a cryptographic proof from printed election codes.
 *
 * ## Expected sequence of methods — proof-of-identity flow
 *
 * |Method                                                          | Description |
 * ---------------------------------------------------------------- | ---
 * |{@link AVClient.initialize | initialize }                       | Initializes the library by fetching election configuration |
 * |{@link AVClient.requestAccessCode | requestAccessCode }         | Requests a one-time password sent to the voter's email |
 * |{@link AVClient.validateAccessCode | validateAccessCode }       | Validates the OTP code and obtains the identity token |
 * |{@link AVClient.registerVoter | registerVoter }                 | Registers the voter on the bulletin board |
 * |{@link AVClient.constructBallot | constructBallot }             | Encrypts the ballot selections and submits cryptograms |
 * |{@link AVClient.spoilBallot | spoilBallot }                     | Optional. Initiates ballot encryption testing (challenge flow). |
 * |{@link AVClient.castBallot | castBallot }                       | Finalizes the voting process |
 *
 * ## Expected sequence of methods — proof-of-election-codes flow
 *
 * |Method                                                                            | Description |
 * ---------------------------------------------------------------------------------- | ---
 * |{@link AVClient.initialize | initialize }                                         | Initializes the library by fetching election configuration |
 * |{@link AVClient.generateProofOfElectionCodes | generateProofOfElectionCodes }     | Derives a cryptographic proof from the voter's election codes |
 * |{@link AVClient.createVoterRegistration | createVoterRegistration }               | Registers the voter on the bulletin board |
 * |{@link AVClient.constructBallot | constructBallot }                               | Encrypts the ballot selections and submits cryptograms |
 * |{@link AVClient.spoilBallot | spoilBallot }                                       | Optional. Initiates ballot encryption testing (challenge flow). |
 * |{@link AVClient.castBallot | castBallot }                                         | Finalizes the voting process |
 *
 * ## Example walkthrough test
 *
 * ```typescript
 * [[include:readme_example.test.ts]]
 * ```
 */

export class AVClient implements IAVClient {
  private authorizationSessionId: string;
  private email: string;
  private votingRoundReference: string;
  private identityConfirmationToken: string;
  private readonly dbbPublicKey: string | undefined;
  private registrationChannel: string | undefined;

  private readonly bulletinBoard: BulletinBoard;
  private latestConfig?: LatestConfig;
  private crypto: AVCrypto;
  private keyPair: KeyPair;

  private clientEnvelopes: ContestEnvelope[];
  private serverEnvelopes: ContestMap<string[][]>;
  private voterSession: VoterSessionItem;
  private boardCommitment: BoardCommitmentItem;
  private verifierItem: VerifierItem;
  private ballotCryptogramItem: BallotCryptogramItem;
  private voterCommitmentOpening: CommitmentOpening;
  private spoilRequest: SpoilRequestItem;
  private proofOfElectionCodes: ProofOfElectionCodes;

  /**
   * Creates a new AVClient instance pointed at a specific Digital Ballot Box.
   *
   * @param bulletinBoardURL Base URL of the Digital Ballot Box for this election.
   * @param dbbPublicKey Optional DBB public key to pin at construction time. If omitted, the key
   *   is read from the genesis config once {@link AVClient.initialize | initialize} is called.
   */
  constructor(bulletinBoardURL: string, dbbPublicKey?: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
    this.dbbPublicKey = dbbPublicKey;
  }

  /**
   * Loads the election configuration and generates a fresh EC key pair for the voter.
   *
   * If `latestConfig` is provided it is validated and used directly; otherwise the config is
   * fetched from the DBB (`GET /configuration/latest_config`). After loading the config,
   * `AVCrypto` is initialised with the elliptic curve from `genesisConfig.eaCurveName` and a
   * fresh EC key pair is generated. Must be the first method called on a new `AVClient`.
   *
   * @param latestConfig Optional election configuration to inject. If provided it is validated
   *   before use; if omitted the config is fetched from the DBB.
   * @param keyPair Optional key pair to inject instead of generating a fresh one. For testing only.
   * @returns Returns undefined on success or throws an error.
   * @throws {@link InvalidConfigError | InvalidConfigError} if the injected `latestConfig` fails validation.
   * @throws An error if the DBB is unreachable and no config was injected (raw Axios error — not wrapped in `NetworkError`).
   */
  public async initialize(
    latestConfig?: LatestConfig,
    keyPair?: KeyPair,
  ): Promise<void> {
    if (latestConfig) {
      validateLatestConfig(latestConfig);
      this.latestConfig = latestConfig;
    } else {
      this.latestConfig = await fetchLatestConfig(this.bulletinBoard);
    }

    this.crypto = new AVCrypto(
      this.latestConfig.items.genesisConfig.content.eaCurveName,
    );

    if (keyPair) {
      this.keyPair = keyPair;
      // TODO: validate keyPair
    } else {
      this.keyPair = randomKeyPair(this.crypto);
    }
  }

  /**
   * Starts the OTP (one-time password) authorization flow by requesting an access code sent to
   * the voter's email address.
   *
   * Calls the Voter Authorizer coordinator to create a session and trigger an OTP email. Stores
   * the returned `sessionId` as `authorizationSessionId` and the email address internally.
   *
   * Only used when `authorizationMode === 'proof-of-identity'`. For the election-codes flow,
   * use {@link AVClient.generateProofOfElectionCodes | generateProofOfElectionCodes} instead.
   *
   * Should be followed by {@link AVClient.validateAccessCode | validateAccessCode}.
   *
   * @param opaqueVoterId Voter ID that preserves voter anonymity.
   * @param email The voter's email address where the OTP will be sent.
   * @param ballotReference Optional ballot reference identifying which ballot the voter intends to vote on.
   * @returns Returns undefined on success or throws an error.
   * @throws {@link VoterRecordNotFoundError | VoterRecordNotFoundError} if no voter record matches the given ID.
   * @throws {@link EmailDoesNotMatchVoterRecordError | EmailDoesNotMatchVoterRecordError} if the email address does not match the voter's record.
   * @throws {@link BallotReferenceNotOnVoterRecord | BallotReferenceNotOnVoterRecord} if the provided `ballotReference` is not on the voter's record.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async requestAccessCode(
    opaqueVoterId: string,
    email: string,
    ballotReference?: string,
  ): Promise<void> {
    const coordinatorURL =
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .url;
    const voterAuthorizerContextUuid =
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .contextUuid;
    const coordinator = new VoterAuthorizationCoordinator(
      coordinatorURL,
      voterAuthorizerContextUuid,
    );

    return coordinator
      .createSession(opaqueVoterId, email, ballotReference)
      .then(({ data: { sessionId } }) => {
        // In the US voters are allowed to chose their ballot
        return sessionId as string;
      })
      .then(async (sessionId) => {
        this.authorizationSessionId = sessionId;
        this.email = email;
      });
  }

  /**
   * Should be called after {@link AVClient.requestAccessCode | requestAccessCode}.
   *
   * Validates the one-time password (OTP) the voter received by email. On success,
   * stores the identity confirmation token internally so that
   * {@link AVClient.registerVoter | registerVoter} can authorize the voter with the DBB.
   *
   * Should be followed by {@link AVClient.registerVoter | registerVoter}.
   *
   * @param code The one-time password string received by the voter via email.
   * @returns Returns undefined if authorization succeeded or throws an error.
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.requestAccessCode | requestAccessCode}.
   * @throws {@link AccessCodeExpired | AccessCodeExpired} if the OTP code has expired.
   * @throws {@link AccessCodeInvalid | AccessCodeInvalid} if the OTP code is invalid.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  async validateAccessCode(code: string): Promise<void> {
    if (!this.email)
      throw new InvalidStateError(
        "Cannot validate access code. Access code was not requested.",
      );

    const otpProviderUrl =
      this.getLatestConfig().items.voterAuthorizerConfig.content
        .identityProvider.url;
    const otpProviderElectionContextUuid =
      this.getLatestConfig().items.voterAuthorizerConfig.content
        .identityProvider.contextUuid;
    const provider = new OTPProvider(
      otpProviderUrl,
      otpProviderElectionContextUuid,
    );

    this.identityConfirmationToken = await provider.requestOTPAuthorization(
      code,
      this.email,
    );
  }

  /**
   * Derives a cryptographic proof from the voter's printed election codes.
   *
   * Required when the election uses `authorizationMode === 'proof-of-election-codes'` as an
   * alternative to the OTP email flow. The derived proof is stored internally and consumed by
   * {@link AVClient.createVoterRegistration | createVoterRegistration}.
   *
   * Must be called after {@link AVClient.initialize | initialize} and before
   * {@link AVClient.createVoterRegistration | createVoterRegistration}.
   *
   * @param electionCodes Array of election code strings provided to the voter (e.g. on a printed card).
   */
  generateProofOfElectionCodes(electionCodes: Array<string>) {
    this.proofOfElectionCodes = proofOfElectionCodes(
      this.crypto,
      electionCodes,
    );
  }

  /**
   * Directly sets the identity confirmation token without going through the standard OTP flow.
   *
   * Use this when the consuming application obtains an identity token through an external
   * authentication mechanism and needs to inject it before calling
   * {@link AVClient.registerVoter | registerVoter}. This is an alternative to calling
   * {@link AVClient.requestAccessCode | requestAccessCode} →
   * {@link AVClient.validateAccessCode | validateAccessCode}.
   *
   * @param token The identity confirmation token string obtained from the external identity provider.
   */
  setIdentityToken(token: string) {
    this.identityConfirmationToken = token;
  }

  /**
   * Sets the registration channel before calling {@link AVClient.createVoterRegistration | createVoterRegistration}.
   *
   * When the election configuration includes `segmentsConfig.content.channels`, the consuming
   * application should call this method with a channel private key (typically stored in
   * `localStorage` by a channel-provisioning flow) before registering the voter. Internally,
   * the key is used to sign a JWT (`{ sub: "channel" }`) that is sent alongside the voter
   * registration request, allowing the DBB to associate the vote with a specific channel.
   *
   * Passing `undefined` clears any previously set channel, which means no channel JWT is
   * included in the registration request.
   *
   * Must be called after {@link AVClient.initialize | initialize} and before
   * {@link AVClient.createVoterRegistration | createVoterRegistration}.
   *
   * @param channelPrivateKey Hex-encoded P-256 private key for the channel, or `undefined` to clear.
   */
  async setRegistrationChannel(
    channelPrivateKey: string | undefined,
  ): Promise<void> {
    if (channelPrivateKey === undefined) {
      this.registrationChannel = undefined;
      return;
    }

    // Sign a JWT
    this.registrationChannel = await this.generateJwt(
      { sub: "channel" },
      channelPrivateKey,
    );
  }

  private async generateJwt(payload: JWTPayload, privateKeyHex: string) {
    // Derive uncompressed public key from private scalar using @noble/curves
    const privateKeyBytes = Buffer.from(privateKeyHex, "hex");
    const publicKey = p256.getPublicKey(privateKeyBytes, false);

    const toBase64Url = (buf: Uint8Array) =>
      Buffer.from(buf)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    // Build JWK from raw components
    const jwk = {
      kty: "EC",
      crv: "P-256",
      d: toBase64Url(privateKeyBytes),
      x: toBase64Url(publicKey.slice(1, 33)), // skip 0x04 prefix
      y: toBase64Url(publicKey.slice(33, 65)),
    };

    const key = await importJWK(jwk, "ES256");
    const now = Math.floor(Date.now() / 1000);

    return new SignJWT(payload)
      .setProtectedHeader({ alg: "ES256" })
      .setIssuedAt(now)
      .setExpirationTime("2h")
      .sign(key);
  }

  /**
   * Retrieves voter information from the Voter Authorizer coordinator.
   *
   * Requires that the voter has already been identified — either via the OTP flow
   * ({@link AVClient.validateAccessCode | validateAccessCode}) or via election codes
   * ({@link AVClient.generateProofOfElectionCodes | generateProofOfElectionCodes}).
   *
   * The returned `AxiosResponse.data` contains voter metadata as returned by the Voter Authorizer.
   * Commonly accessed fields include:
   * - `ballotReference` — identifies which ballot config applies to this voter.
   * - `demo` — whether this voter is a demo voter (used to filter voting rounds).
   *
   * Typical usage: call this method after identification and use `data.ballotReference` to look up
   * the voter's ballot config from `getLatestConfig().items.ballotConfigs`, then determine which
   * voting rounds are active and applicable before calling
   * {@link AVClient.createVoterRegistration | createVoterRegistration}.
   *
   * @returns The raw `AxiosResponse` from the Voter Authorizer. Relevant shape:
   * ```javascript
   * { data: { ballotReference: string, demo: boolean, ...voterMetadata } }
   * ```
   * @throws {@link InvalidStateError | InvalidStateError} if neither an identity token nor an election code proof is available.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async getCoordinatorVoterInfo(): Promise<AxiosResponse> {
    const coordinatorURL =
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .url;
    const voterAuthorizerContextUuid =
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .contextUuid;
    const coordinator = new VoterAuthorizationCoordinator(
      coordinatorURL,
      voterAuthorizerContextUuid,
    );

    let identity;

    if (this.proofOfElectionCodes) {
      identity = { publicKey: this.proofOfElectionCodes.mainKeyPair.publicKey };
    } else if (this.identityConfirmationToken) {
      identity = { identitiyConfirmationToken: this.identityConfirmationToken };
    } else {
      throw new InvalidStateError(
        "No way of identifying voter. Please generate a public key or supply an identityToken",
      );
    }

    return await coordinator.getVoterInfo(identity);
  }

  /**
   * Registers the voter on the Digital Ballot Box, branching on the election's `authorizationMode`.
   *
   * - **`proof-of-identity`**: uses the identity confirmation token obtained via
   *   {@link AVClient.validateAccessCode | validateAccessCode} (or
   *   {@link AVClient.setIdentityToken | setIdentityToken}) to request a JWT from the Voter
   *   Authorizer, then posts a voter session to the DBB.
   * - **`proof-of-election-codes`**: uses the proof generated by
   *   {@link AVClient.generateProofOfElectionCodes | generateProofOfElectionCodes} to request a
   *   JWT from the Voter Authorizer, then posts a voter session to the DBB.
   *
   * **Note:** if an identity confirmation token is present (set via
   * {@link AVClient.setIdentityToken | setIdentityToken}), the identity path is used regardless
   * of `authorizationMode`. This allows SSO-integrated consumers to inject a token even in
   * elections configured as `proof-of-election-codes`.
   *
   * The DBB response is validated against the DBB public key. On success, the voter session is
   * stored internally and used in all subsequent calls.
   *
   * Prefer {@link AVClient.registerVoter | registerVoter} for the standard single-round case.
   * Use this method when you need to specify a non-default `votingRoundReference`.
   *
   * @param votingRoundReference Identifies which voting round to register for. Defaults to `"voting-round-1"`.
   * @returns Returns undefined on success or throws an error.
   * @throws {@link InvalidStateError | InvalidStateError} if the required token or proof is missing.
   * @throws {@link InvalidTokenError | InvalidTokenError} if the JWT from the Voter Authorizer cannot be decoded.
   * @throws {@link InvalidConfigError | InvalidConfigError} if the election has an unknown `authorizationMode`.
   * @throws {@link BulletinBoardError | BulletinBoardError} if the DBB rejects the registration.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async createVoterRegistration(
    votingRoundReference = "voting-round-1",
  ): Promise<void> {
    const coordinatorURL =
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .url;
    const voterAuthorizerContextUuid =
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .contextUuid;
    const coordinator = new VoterAuthorizationCoordinator(
      coordinatorURL,
      voterAuthorizerContextUuid,
    );
    const latestConfigAddress =
      this.getLatestConfig().items.latestConfigItem.address;
    const authorizationMode =
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .authorizationMode;
    this.votingRoundReference = votingRoundReference;

    let authorizationResponse: AxiosResponse;

    // This should be refactored when the DBB allows several authorization modes
    if (
      authorizationMode === "proof-of-identity" ||
      this.identityConfirmationToken
    ) {
      if (!this.identityConfirmationToken)
        throw new InvalidStateError(
          "Cannot register voter without identity confirmation. User has not validated access code.",
        );

      authorizationResponse = await this.authorizeIdentity(coordinator);
    } else if (authorizationMode === "proof-of-election-codes") {
      if (this.proofOfElectionCodes == null)
        throw new InvalidStateError(
          "Cannot register voter without proof of election codes. User has not generated an election codes proof.",
        );

      authorizationResponse = await coordinator.authorizeProofOfElectionCodes(
        this.keyPair.publicKey,
        this.proofOfElectionCodes,
        this.votingRoundReference,
      );
    } else {
      throw new InvalidConfigError(
        `Unknown authorization mode of voter authorizer: '${authorizationMode}'`,
      );
    }

    const { authToken, authorizationUuid } = authorizationResponse.data;
    this.authorizationSessionId = this.authorizationSessionId
      ? this.authorizationSessionId
      : authorizationUuid;

    const decoded = jwtDecode<AuthTokenPayload>(authToken); // TODO: Verify against dbb pubkey: this.getLatestConfig().services.voterAuthorizer.public_key);

    if (decoded === null)
      throw new InvalidTokenError("Auth token could not be decoded");

    const voterSessionItemExpectation = {
      type: VOTER_SESSION_ITEM,
      parentAddress: latestConfigAddress,
      content: {
        authToken: authToken,
        identifier: decoded.identifier,
        publicKey: decoded.public_key,
        weight: decoded.weight || 1,
        voterGroup: decoded.voter_group_key,
        votingRoundReference: decoded.voting_round_reference,
      },
    };

    const voterSessionItemResponse =
      await this.bulletinBoard.createVoterRegistration(
        authToken,
        latestConfigAddress,
        this.registrationChannel,
      );
    const voterSessionItem = voterSessionItemResponse.data.voterSession;
    const receipt = voterSessionItemResponse.data.receipt;

    validatePayload(
      this.crypto,
      voterSessionItem,
      voterSessionItemExpectation,
      this.getDbbPublicKey(),
    );
    validateReceipt(
      this.crypto,
      [voterSessionItem],
      receipt,
      this.getDbbPublicKey(),
    );

    this.voterSession = voterSessionItem;
    this.bulletinBoard.setVoterSessionUuid(voterSessionItem.content.identifier);
  }

  /**
   * Registers the voter on the Digital Ballot Box for voting round 1.
   *
   * Convenience wrapper around {@link AVClient.createVoterRegistration | createVoterRegistration}
   * using the default `votingRoundReference = "voting-round-1"`. This is the method defined in
   * the `IAVClient` interface and is sufficient for most single-round elections.
   *
   * Must be preceded by voter identification:
   * - OTP flow: {@link AVClient.validateAccessCode | validateAccessCode}
   * - Election codes flow: {@link AVClient.generateProofOfElectionCodes | generateProofOfElectionCodes}
   *
   * @returns Returns undefined on success or throws an error.
   * @throws {@link InvalidStateError | InvalidStateError} if the required token or proof is missing.
   * @throws {@link InvalidTokenError | InvalidTokenError} if the JWT from the Voter Authorizer cannot be decoded.
   * @throws {@link BulletinBoardError | BulletinBoardError} if the DBB rejects the registration.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async registerVoter(): Promise<void> {
    return this.createVoterRegistration();
  }

  /**
   * Expires all active voter sessions for the given voting round on the Digital Ballot Box.
   *
   * Only supported when `authorizationMode === 'proof-of-election-codes'`. Uses the stored
   * election code proof (set by {@link AVClient.generateProofOfElectionCodes | generateProofOfElectionCodes})
   * to obtain an expiration JWT from the Voter Authorizer (action `"expire"`), then posts to
   * `POST /voting/expirations` on the DBB.
   *
   * Primarily used by IVR telephony consumers to end a voting session programmatically.
   *
   * @param votingRoundReference Identifies which voting round's sessions to expire.
   * @returns The raw `AxiosResponse` from the DBB expiration endpoint.
   * @throws {@link InvalidStateError | InvalidStateError} if called when `authorizationMode === 'proof-of-identity'` (not supported).
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.generateProofOfElectionCodes | generateProofOfElectionCodes}.
   * @throws {@link InvalidTokenError | InvalidTokenError} if the expiration JWT from the Voter Authorizer cannot be decoded.
   * @throws {@link InvalidConfigError | InvalidConfigError} if the election has an unknown `authorizationMode`.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async expireVoterSessions(
    votingRoundReference: string,
  ): Promise<AxiosResponse> {
    const {
      url: vaUrl,
      contextUuid: vaUuid,
      authorizationMode,
    } = this.getLatestConfig().items.voterAuthorizerConfig.content
      .voterAuthorizer;
    const latestConfigAddress =
      this.getLatestConfig().items.latestConfigItem.address;
    const coordinator = new VoterAuthorizationCoordinator(vaUrl, vaUuid);

    let authorizationResponse: AxiosResponse;

    switch (authorizationMode) {
      case "proof-of-election-codes":
        authorizationResponse = await coordinator.authorizeProofOfElectionCodes(
          this.keyPair.publicKey,
          this.proofOfElectionCodes,
          votingRoundReference,
          "expire",
        );
        break;
      case "proof-of-identity":
        throw new InvalidStateError(
          "voter_authorizer.expire_voter.proof_of_identity_not_supported",
        );
      default:
        throw new InvalidConfigError(
          `Unknown authorization mode of voter authorizer: '${authorizationMode}'`,
        );
    }

    const { authToken } = authorizationResponse.data;
    const decodedAuthToken = jwtDecode<AuthTokenPayload>(authToken);

    if (decodedAuthToken === null)
      throw new InvalidTokenError("Auth token could not be decoded");

    return await this.bulletinBoard.expireVoterSessions(
      authToken,
      latestConfigAddress,
    );
  }

  /**
   * Extends the active voter session on the Digital Ballot Box.
   *
   * Signs a `SessionExtensionItem` containing `{ extendedBy }` with the voter's private key and
   * posts it to `POST /voting/extensions`. Requires that voter registration has completed (so that
   * `voterSession` is set). No-ops silently if the voter session has an empty `address`.
   *
   * Used by consuming applications to refresh the session timeout when the voter is still active
   * (e.g. after a "Extend session" prompt in the UI, or while the voter is on the phone in an
   * IVR flow). The number of seconds to extend by is typically read from
   * `electionStatus.sessionCountdown.extendSeconds`.
   *
   * @param extendedBy Number of **seconds** to extend the session by.
   * @returns Returns undefined on success or throws an error.
   * @throws TypeError if called before voter registration (`this.voterSession` is undefined — the guard on line 628 dereferences it directly).
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async extendVoterSessions(extendedBy: number): Promise<void> {
    if (!this.voterSession.address) return;
    const parentAddress = this.voterSession.address;

    const sessionExtensionItem = {
      parentAddress: parentAddress,
      type: SESSION_EXTENSION_ITEM,
      content: {
        extendedBy: extendedBy,
      },
    };
    const signedPayload = signPayload(
      this.crypto,
      sessionExtensionItem,
      this.privateKey(),
    );
    await this.bulletinBoard.extendVoterSessions(signedPayload);
  }
  /**
   * Encrypts the voter's ballot selections and submits them to the Digital Ballot Box.
   *
   * Must be called after {@link AVClient.registerVoter | registerVoter} (or
   * {@link AVClient.createVoterRegistration | createVoterRegistration}).
   *
   * Internally performs the following steps:
   * 1. Validates `ballotSelection` against the voter's contest configs and marking rules.
   * 2. Encodes selections to byte arrays.
   * 3. Encrypts each contest pile with the threshold key and voter randomizers; generates a
   *    Pedersen commitment of the voter randomizers.
   * 4. `POST /voting/commitments` — submits the voter commitment to the DBB. Receives the
   *    board commitment (server's Pedersen commitment) and server envelopes.
   * 5. Finalises cryptograms by combining voter and server envelopes.
   * 6. `POST /voting/votes` — submits ballot cryptograms and ZK proofs to the DBB.
   * 7. Derives a 7-character Base58 tracking code from the verification start item.
   *
   * Should be followed by either {@link AVClient.spoilBallot | spoilBallot}
   * or {@link AVClient.castBallot | castBallot}.
   *
   * Example:
   * ```javascript
   * const client = new AVClient(url);
   * const trackingCode = await client.constructBallot(ballotSelection);
   * ```
   *
   * Example of handling errors:
   * ```javascript
   * try {
   *   await client.constructBallot(ballotSelection);
   * } catch(error) {
   *   if(error instanceof AvClientError) {
   *     switch(error.name) {
   *       case 'InvalidStateError':
   *         console.log("State is not valid for this call");
   *         break;
   *       case 'NetworkError':
   *         console.log("It's a network error");
   *         break;
   *       default:
   *         console.log('Something else was wrong');
   *      }
   *   }
   * }
   * ```
   *
   * @param ballotSelection BallotSelection containing the voter's selections for each contest.
   * @returns The 7-character Base58 ballot tracking code (e.g. `'A3K9mNP'`).
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.registerVoter | registerVoter}.
   * @throws {@link CorruptCvrError | CorruptCvrError} if the ballot selection is structurally invalid.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async constructBallot(
    ballotSelection: BallotSelection,
  ): Promise<string> {
    if (!this.voterSession) {
      throw new InvalidStateError(
        "Cannot construct cryptograms. Voter identity unknown",
      );
    }

    const state = {
      voterSession: this.voterSession,
      latestConfig: this.getLatestConfig(),
      votingRoundReference: this.votingRoundReference,
    };

    const transparent =
      state.latestConfig.items.votingRoundConfigs[this.votingRoundReference]
        .content.handRaise || false;

    const { pedersenCommitment, envelopeRandomizers, contestEnvelopes } =
      constructContestEnvelopes(
        this.crypto,
        state,
        ballotSelection,
        transparent,
      );

    this.clientEnvelopes = contestEnvelopes;

    this.voterCommitmentOpening = {
      commitmentRandomness: pedersenCommitment.randomizer,
      randomizers: envelopeRandomizers,
    };

    const contestPilesMap = contestEnvelopes.map((ce) => [
      ce.reference,
      ce.piles.length,
    ]);

    const { boardCommitment, serverEnvelopes } = await submitVoterCommitment(
      this.crypto,
      this.bulletinBoard,
      this.voterSession.address,
      pedersenCommitment.commitment,
      this.privateKey(),
      Object.fromEntries(contestPilesMap),
      this.getDbbPublicKey(),
    );
    this.boardCommitment = boardCommitment;
    this.serverEnvelopes = serverEnvelopes;

    const [ballotCryptogramItem, verificationStartItem] =
      await submitBallotCryptograms(
        this.crypto,
        this.bulletinBoard,
        this.clientEnvelopes,
        this.serverEnvelopes,
        boardCommitment.address,
        this.privateKey(),
        this.getDbbPublicKey(),
      );

    this.ballotCryptogramItem = ballotCryptogramItem;

    const trackingCode = hexToShortCode(verificationStartItem.shortAddress);

    return trackingCode;
  }

  /**
   * Finalises the voting process by casting the previously constructed ballot.
   *
   * Must be called after {@link AVClient.constructBallot | constructBallot}. Signs a
   * `CastRequestItem` with the voter's private key and posts it to `POST /voting/cast` on the
   * DBB. The DBB response payload and receipt are validated against the DBB public key.
   *
   * If `sendTrackingCodeByEmail` is enabled in the election configuration, an attempt is made to
   * send the receipt to the voter by email via the Voter Authorizer. Email delivery failures are
   * logged but not propagated as errors.
   *
   * @param locale BCP 47 locale tag for the receipt email (e.g. `"en"`, `"es"`, `"fr"`). Defaults to `"en"`.
   * @returns The `BallotBoxReceipt` confirming the ballot was recorded. Shape:
   * ```javascript
   * {
   *   previousBoardHash: string,
   *   boardHash: string,
   *   registeredAt: string,       // ISO 8601
   *   serverSignature: string,    // EC signature from the DBB
   *   voteSubmissionId: number
   * }
   * ```
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.constructBallot | constructBallot}.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async castBallot(locale = "en"): Promise<BallotBoxReceipt> {
    if (!this.voterSession) {
      throw new InvalidStateError(
        "Cannot create cast request cryptograms. Ballot cryptograms not present",
      );
    }

    const castRequestItem = {
      parentAddress: this.ballotCryptogramItem.address,
      type: CAST_REQUEST_ITEM,
      content: {},
    };
    const signedPayload = signPayload(
      this.crypto,
      castRequestItem,
      this.privateKey(),
    );

    const response = await this.bulletinBoard.submitCastRequest(signedPayload);
    const { castRequest, receipt } = response.data;

    validatePayload(this.crypto, castRequest, castRequestItem);
    validateReceipt(
      this.crypto,
      [castRequest],
      receipt,
      this.getDbbPublicKey(),
    );

    const clientReceipt = generateReceipt(receipt, castRequest);

    if (
      this.getLatestConfig().items.electionConfig.content
        .sendTrackingCodeByEmail
    ) {
      const coordinatorURL =
        this.getLatestConfig().items.voterAuthorizerConfig.content
          .voterAuthorizer.url;
      const voterAuthorizerContextUuid =
        this.getLatestConfig().items.voterAuthorizerConfig.content
          .voterAuthorizer.contextUuid;
      const coordinator = new VoterAuthorizationCoordinator(
        coordinatorURL,
        voterAuthorizerContextUuid,
      );
      try {
        coordinator.sendReceipt(
          clientReceipt,
          this.authorizationSessionId,
          this.getLatestConfig().items.electionConfig.content.dbasUrl,
          locale,
        );
      } catch (e) {
        console.error(e);
      }
    }

    return clientReceipt;
  }

  /**
   * Initiates the ballot challenge (spoil) flow to test the ballot encryption.
   *
   * Must be called after {@link AVClient.constructBallot | constructBallot}, as an alternative to
   * {@link AVClient.castBallot | castBallot}. Signs a `SpoilRequestItem` and posts it to
   * `POST /voting/spoil`. Retrieves the server commitment opening and validates it against the
   * previously stored board commitment and server envelopes.
   *
   * The returned address is passed to
   * {@link AVVerifier.submitVerifierKey | AVVerifier.submitVerifierKey} on the second (verifier)
   * device to link the two devices.
   *
   * Should be followed by {@link AVClient.waitForVerifierRegistration | waitForVerifierRegistration}.
   *
   * @returns The `spoilRequest.address` string — the DBB chain address of the spoil request item.
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.constructBallot | constructBallot}.
   * @throws An error if the server commitment opening is invalid.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async spoilBallot(): Promise<string> {
    if (!this.voterSession) {
      throw new InvalidStateError(
        "Cannot create cast request cryptograms. Ballot cryptograms not present",
      );
    }

    const spoilRequestItem = {
      parentAddress: this.ballotCryptogramItem.address,
      type: SPOIL_REQUEST_ITEM,
      content: {},
    };

    const signedPayload = signPayload(
      this.crypto,
      spoilRequestItem,
      this.privateKey(),
    );

    const response = await this.bulletinBoard.submitSpoilRequest(signedPayload);

    const { spoilRequest, receipt, boardCommitmentOpening } = response.data;

    this.spoilRequest = spoilRequest;
    
    validatePayload(this.crypto, spoilRequest, spoilRequestItem);
    validateReceipt(
      this.crypto,
      [spoilRequest],
      receipt,
      this.getDbbPublicKey(),
    );
    validateCommitment(
      this.crypto,
      boardCommitmentOpening,
      this.boardCommitment.content.commitment,
      "Board commitment is not valid",
    );
    validateServerEnvelopes(
      this.crypto,
      this.serverEnvelopes,
      boardCommitmentOpening.randomizers,
      this.getLatestConfig().items.thresholdConfig.content.encryptionKey
    );

    return spoilRequest.address;
  }

  /**
   * Sends the voter's commitment opening (ballot randomizers) to the verifier device via the DBB.
   *
   * Must be called after {@link AVClient.constructBallot | constructBallot} (which generates the
   * commitment opening) and after
   * {@link AVClient.waitForVerifierRegistration | waitForVerifierRegistration} (which provides the
   * verifier's public key). Encrypts the voter's `CommitmentOpening` (ballot randomizers and
   * commitment randomness) under the verifier's public key and fires a
   * `POST /verification/commitment_openings` request to the DBB.
   *
   * **Note:** The HTTP request is fire-and-forget — it is not awaited. The method returns
   * immediately regardless of network success.
   *
   * @returns Returns undefined immediately (HTTP request is not awaited).
   * @throws {@link InvalidStateError | InvalidStateError} if called before voter registration (`this.voterSession` not set).
   * @throws TypeError if called before {@link AVClient.waitForVerifierRegistration | waitForVerifierRegistration} — `this.verifierItem` and `this.voterCommitmentOpening` are not explicitly guarded and will be undefined.
   */
  public async challengeBallot(): Promise<void> {
    if (!this.voterSession) {
      throw new InvalidStateError("Cannot challenge ballot, no user session");
    }

    const voterCommitmentOpeningItem = {
      parentAddress: this.verifierItem.address,
      type: VOTER_ENCRYPTION_COMMITMENT_OPENING_ITEM,
      content: {
        package: encryptCommitmentOpening(
          this.crypto,
          this.verifierItem.content.publicKey,
          this.voterCommitmentOpening,
        ),
      },
    };

    const signedVoterCommitmentOpeningItem = signPayload(
      this.crypto,
      voterCommitmentOpeningItem,
      this.privateKey(),
    );

    this.bulletinBoard.submitCommitmentOpenings(
      signedVoterCommitmentOpeningItem,
    );
  }

  /**
   * Returns the full election configuration loaded during {@link AVClient.initialize | initialize}.
   *
   * @returns The `LatestConfig` object containing genesis config, election config, contest configs,
   *   ballot configs, voting round configs, and threshold key.
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.initialize | initialize}.
   */
  public getLatestConfig(): LatestConfig {
    if (!this.latestConfig) {
      throw new InvalidStateError(
        "No configuration loaded. Did you call initialize()?",
      );
    }

    return this.latestConfig;
  }

  /**
   * Returns the voter session item received from the DBB after registration.
   *
   * The voter session item contains the voter's identifier, public key, weight, voter group, and
   * voting round reference as stored on the DBB chain.
   *
   * @returns The `VoterSessionItem` from the DBB.
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.registerVoter | registerVoter}.
   */
  public getVoterSession(): VoterSessionItem {
    if (!this.voterSession) {
      throw new InvalidStateError("No voter session loaded");
    }

    return this.voterSession;
  }

  /**
   * Returns the Voter Authorizer session ID for the current authorization session.
   *
   * Set during {@link AVClient.requestAccessCode | requestAccessCode} (OTP flow) or during
   * {@link AVClient.createVoterRegistration | createVoterRegistration} (election codes flow).
   *
   * Common uses by consumers:
   * - Signing the UUID with {@link AVClient.generateSignature | generateSignature} to authenticate
   *   requests to external services (e.g. a conference/candidate-info API).
   * - Passing to the Voter Authorizer to send the vote receipt by email.
   *
   * @returns The authorization session ID string.
   */
  public getSessionUuid(): string {
    return this.authorizationSessionId;
  }

  /**
   * Returns the ballot configuration for the voter's voter group.
   *
   * The ballot config defines which contests appear on the voter's ballot (i.e. the set of contest
   * references for this voter group). Use {@link AVClient.getVoterContestConfigs | getVoterContestConfigs}
   * to get the full contest configs filtered to the active voting round.
   *
   * @returns The `BallotConfig` for the voter's group.
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.registerVoter | registerVoter}.
   */
  public getVoterBallotConfig(): BallotConfig {
    const voterSession = this.getVoterSession();
    const {
      items: { ballotConfigs },
    } = this.getLatestConfig();
    return ballotConfigs[voterSession.content.voterGroup];
  }

  /**
   * Returns the contest configurations accessible to this voter in the current voting round.
   *
   * Computes the intersection of contests on the voter's ballot (from their voter group) and
   * contests active in the current voting round. Each `ContestConfig` includes the contest title,
   * marking rules (min/max selections, weights), available options, and encoding parameters.
   *
   * @returns Array of `ContestConfig` objects for the contests this voter can vote on.
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.registerVoter | registerVoter}.
   */
  public getVoterContestConfigs(): ContestConfig[] {
    const voterSession = this.getVoterSession();
    const {
      items: { ballotConfigs, votingRoundConfigs, contestConfigs },
    } = this.getLatestConfig();

    const myBallotConfig = ballotConfigs[voterSession.content.voterGroup];
    const myVotingRoundConfig =
      votingRoundConfigs[voterSession.content.votingRoundReference];
    const contestsICanVoteOn = myBallotConfig.content.contestReferences.filter(
      (value) => myVotingRoundConfig.content.contestReferences.includes(value),
    );
    return contestsICanVoteOn.map((contestReference) => {
      return contestConfigs[contestReference];
    });
  }

  /**
   * Returns the DBB public key used to verify DBB-signed payloads and receipts.
   *
   * Returns the key pinned at construction time (if provided), otherwise falls back to the key
   * from the genesis config loaded during {@link AVClient.initialize | initialize}.
   *
   * @returns The hex-encoded DBB public key string.
   * @throws {@link InvalidStateError | InvalidStateError} if no DBB public key is available (neither pinned nor loaded).
   */
  public getDbbPublicKey(): string {
    const dbbPublicKeyFromConfig =
      this.getLatestConfig().items.genesisConfig.content.publicKey;

    if (this.dbbPublicKey) {
      return this.dbbPublicKey;
    } else if (dbbPublicKeyFromConfig) {
      return dbbPublicKeyFromConfig;
    } else {
      throw new InvalidStateError("No DBB public key available");
    }
  }

  private privateKey(): string {
    return this.keyPair.privateKey;
  }

  /**
   * Signs an arbitrary string payload with the voter's EC private key.
   *
   * Useful when the consuming application needs to produce a signature on behalf of the voter
   * (e.g. for authenticating requests to external services). Requires
   * {@link AVClient.initialize | initialize} to have been called so the key pair is available.
   *
   * @param payload The string to sign.
   * @returns The EC signature as a hex string.
   */
  public generateSignature(payload: string): string {
    return this.crypto.sign(payload, this.privateKey());
  }


  /**
   * Registers a voter by proof of identity
   * Used when the authorization mode of the Voter Authorizer is 'proof-of-identity'
   * @returns AxiosResponse or throws an error
   */
  private async authorizeIdentity(coordinator): Promise<AxiosResponse> {
    return await coordinator.requestPublicKeyAuthorization(
      this.authorizationSessionId,
      this.identityConfirmationToken,
      this.keyPair.publicKey,
      this.votingRoundReference,
    );
  }

  /**
   * Polls the Digital Ballot Box until the verifier device registers its public key.
   *
   * Must be called after {@link AVClient.spoilBallot | spoilBallot}. Queries
   * `GET /verification/verifiers/{address}` every `1000ms` for up to 600 attempts (10 minutes). Resolves
   * once a `VerifierItem` is detected on the DBB chain for this spoil request, stores the verifier
   * item internally (used by {@link AVClient.challengeBallot | challengeBallot}), and returns the
   * 7-character Base58 pairing code derived from the verifier item's short address.
   *
   * Both the voter's app and the verifier device should display the pairing code so the voter can
   * confirm they are connected to the correct second device.
   *
   * Should be followed by {@link AVClient.challengeBallot | challengeBallot}.
   *
   * @returns The 7-character Base58 pairing code derived from the verifier item's DBB address.
   * @throws {@link InvalidStateError | InvalidStateError} if called before voter registration or before {@link AVClient.spoilBallot | spoilBallot}.
   * @throws {@link TimeoutError | TimeoutError} if the verifier does not register within 600 poll attempts.
   */
  public async waitForVerifierRegistration(): Promise<string> {
    if (!this.voterSession) {
      throw new InvalidStateError("Cannot challenge ballot, no user session");
    }

    let attempts = 0;

    const executePoll = async (resolve, reject) => {
      const result = await this.bulletinBoard
        .getVerifierItem(this.spoilRequest.address)
        .catch((error) => {
          console.error(error.response.data.error_message);
        });

      attempts++;
      if (result?.data?.verifier?.type === VERIFIER_ITEM) {
        this.verifierItem = result.data.verifier;
        const pairingCode = hexToShortCode(result.data.verifier.shortAddress);
        return resolve(pairingCode);
      } else if (MAX_POLL_ATTEMPTS && attempts === MAX_POLL_ATTEMPTS) {
        return reject(new TimeoutError("Exceeded max attempts"));
      } else {
        setTimeout(executePoll, POLLING_INTERVAL_MS, resolve, reject);
      }
    };

    return new Promise(executePoll);
  }

  /**
   * Retrieves the current status and audit log for a ballot identified by its tracking code.
   *
   * Decodes the Base58 tracking code to its hex short address and queries
   * `GET /ballot_status` on the DBB. This method does not require an active voter session and
   * can be called unauthenticated — useful for voters checking their ballot after the fact or
   * for external verification tools.
   *
   * @param trackingCode The 7-character Base58 tracking code returned by {@link AVClient.constructBallot | constructBallot}.
   * @returns A `BallotStatus` object:
   * ```javascript
   * {
   *   status: string,       // e.g. "cast", "spoiled", "pending"
   *   activities: Activity[] // audit log entries for this ballot
   * }
   * ```
   * @throws An error if the DBB request fails (raw Axios error — not wrapped in `NetworkError`).
   */
  public async checkBallotStatus(trackingCode: string): Promise<BallotStatus> {
    const shortAddres = shortCodeToHex(trackingCode);
    const { status, activities } = (
      await this.bulletinBoard.getBallotStatus(shortAddres)
    ).data;

    const ballotStatus = {
      activities: activities,
      status: status,
    };

    return ballotStatus;
  }

  /**
   * Disables the voter in the Voter Authorizer so they can no longer sign in or vote.
   *
   * Signs the current `authorizationSessionId` with the voter's private key and calls the VA
   * disable endpoint. Used in two contexts:
   * - **Decline to vote**: when the voter explicitly chooses not to vote via a UI action.
   * - **IVR management**: to programmatically end a voter's eligibility after a phone vote or
   *   an administrative decision.
   *
   * Requires that voter registration has been completed
   * ({@link AVClient.registerVoter | registerVoter} or
   * {@link AVClient.createVoterRegistration | createVoterRegistration}) so that both
   * `authorizationSessionId` and `voterSession.content.votingRoundReference` are available.
   *
   * @returns The raw `AxiosResponse` from the Voter Authorizer disable endpoint.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async disableVoter(): Promise<AxiosResponse> {
    const signature = this.generateSignature(this.authorizationSessionId);

    const coordinator = new VoterAuthorizationCoordinator(
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .url,
      this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer
        .contextUuid,
    );

    return await coordinator.disableVoter(
      this.authorizationSessionId,
      signature,
      this.voterSession.content.votingRoundReference,
    );
  }

  /**
   * Retrieves the voting round items for the voter's current voting round from the Voter Authorizer.
   *
   * Signs the `authorizationSessionId` with the voter's private key to authenticate the request.
   * The returned `AxiosResponse.data.items` is an array of voting round items (e.g. information
   * pages to display before the ballot). Consumers should handle the case where `data.items` is
   * missing or not an array, as the shape depends on the Voter Authorizer configuration.
   *
   * Requires that voter registration has been completed so that `authorizationSessionId` and the
   * voter session's `votingRoundReference` are available.
   *
   * @returns The raw `AxiosResponse` from the Voter Authorizer. Relevant shape:
   * ```javascript
   * { data: { items: RawVotingRoundItem[] } }
   * ```
   * @throws {@link InvalidStateError | InvalidStateError} if called before {@link AVClient.registerVoter | registerVoter}.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async getVotingRoundItems(): Promise<AxiosResponse> {
    const latestConfig = this.getLatestConfig();
    const voterSession = this.getVoterSession();

    const coordinator = new VoterAuthorizationCoordinator(
      latestConfig.items.voterAuthorizerConfig.content.voterAuthorizer.url,
      latestConfig.items.voterAuthorizerConfig.content.voterAuthorizer
        .contextUuid,
    );

    const signature = this.generateSignature(this.authorizationSessionId);

    return coordinator.getVotingRoundItems(
      this.authorizationSessionId,
      signature,
      voterSession.content.votingRoundReference,
    );
  }
}

export type {
  IAVClient,
  ContestMap,
  BallotSelection,
  BallotBoxReceipt,
  LatestConfig
}

export type { Affidavit, HashValue, Signature } from './av_client/types';
export { extractContestSelections } from './util/nist_cvr_extractor';
export { AVVerifier } from './av_verifier';
export { BulletinBoardError, EmailDoesNotMatchVoterRecordError, DBBError, BallotReferenceNotOnVoterRecord } from './av_client/errors';

export {
  AvClientError,
  AccessCodeExpired,
  AccessCodeInvalid,
  CorruptCvrError,
  TimeoutError,
  InvalidConfigError,
  InvalidStateError,
  InvalidTokenError,
  NetworkError,
  VoterRecordNotFoundError,
} from './av_client/errors';
