import { BulletinBoard } from './av_client/connectors/bulletin_board';
import VoterAuthorizationCoordinator from './av_client/connectors/voter_authorization_coordinator';
import { OTPProvider, IdentityConfirmationToken } from "./av_client/connectors/otp_provider";
import { extractContestSelections } from './util/nist_cvr_extractor';
import { AVVerifier } from './av_verifier';
import { constructContestEnvelopes } from './av_client/construct_contest_envelopes';
import { KeyPair, Affidavit, VerifierItem, CommitmentOpening, SpoilRequestItem, LatestConfig, BallotSelection, ContestEnvelope, BallotConfig, BallotStatus, ContestConfig } from './av_client/types';
import { randomKeyPair } from './av_client/generate_key_pair';
import { generateReceipt } from './av_client/generate_receipt';
import { Buffer } from 'buffer'
import * as Crypto from "../lib/av_client/aion_crypto.js"
import { JwtPayload, jwtDecode } from "jwt-decode";

import {
  fetchLatestConfig,
  validateLatestConfig
} from './av_client/election_config';

import {
  IAVClient,
  ContestMap,
  BallotBoxReceipt,
  VoterSessionItem,
  BoardCommitmentItem,
  BallotCryptogramItem,
  HashValue,
  Signature,
} from './av_client/types';

import {
  AvClientError,
  AccessCodeExpired,
  AccessCodeInvalid,
  BulletinBoardError,
  CorruptCvrError,
  TimeoutError,
  EmailDoesNotMatchVoterRecordError,
  InvalidConfigError,
  InvalidStateError,
  NetworkError,
  InvalidTokenError,
  DBBError
} from './av_client/errors';

import * as sjclLib from './av_client/sjcl';
import { signPayload, validatePayload, validateReceipt } from './av_client/sign';

import submitVoterCommitment from './av_client/actions/submit_voter_commitment';
import { CAST_REQUEST_ITEM, MAX_POLL_ATTEMPTS, POLLING_INTERVAL_MS, SPOIL_REQUEST_ITEM, VERIFIER_ITEM, VOTER_ENCRYPTION_COMMITMENT_OPENING_ITEM, VOTER_SESSION_ITEM } from './av_client/constants';
import { hexToShortCode, shortCodeToHex } from './av_client/short_codes';
import { encryptCommitmentOpening, validateCommmitmentOpening } from './av_client/crypto/commitments';
import { submitBallotCryptograms } from './av_client/actions/submit_ballot_cryptograms';
import {AxiosResponse} from "axios";
import { ProofOfElectionCodes } from "./av_client/crypto/proof_of_election_codes";
import { dhEncrypt } from "./av_client/crypto/aes";

/** @internal */
export const sjcl = sjclLib;

/**
 * # Assembly Voting Client API
 *
 * The API is responsible for handling all the cryptographic operations and all network communication with:
 * * the Digital Ballot Box
 * * the Voter Authorization Coordinator service
 * * the OTP provider(s)
 *
 * ## Expected sequence of methods being executed
 *
 * |Method                                                                    | Description |
 * -------------------------------------------------------------------------- | ---
 * |{@link AVClient.initialize | initialize }                                 | Initializes the library by fetching election configuration |
 * |{@link AVClient.requestAccessCode | requestAccessCode }                   | Initiates the authorization process, in case voter has not authorized yet. Requests access code to be sent to voter email |
 * |{@link AVClient.validateAccessCode | validateAccessCode }                 | Gets voter authorized to vote. |
 * |{@link AVClient.registerVoter | registerVoter }                           | Registers the voter on the bulletin board |
 * |{@link AVClient.constructBallotCryptograms | constructBallotCryptograms } | Constructs voter ballot cryptograms. |
 * |{@link AVClient.spoilBallot | spoilBallot }                               | Optional. Initiates process of testing the ballot encryption. |
 * |{@link AVClient.castBallot | castBallot }                                 | Finalizes the voting process. |
 * |{@link AVClient.purgeData | purgeData }                                   | Optional. Explicitly purges internal data. |
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
  private identityConfirmationToken: IdentityConfirmationToken;
  private dbbPublicKey: string | undefined;

  private bulletinBoard: BulletinBoard;
  private latestConfig?: LatestConfig;
  private keyPair: KeyPair;

  private clientEnvelopes: ContestEnvelope[];
  private serverEnvelopes: ContestMap<string[][]>;
  private voterSession: VoterSessionItem;
  private boardCommitment: BoardCommitmentItem;
  private verifierItem: VerifierItem
  private ballotCryptogramItem: BallotCryptogramItem;
  private voterCommitmentOpening: CommitmentOpening;
  private spoilRequest: SpoilRequestItem
  private proofOfElectionCodes: ProofOfElectionCodes;

  /**
   * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
   */
  constructor(bulletinBoardURL: string, dbbPublicKey?: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
    this.dbbPublicKey = dbbPublicKey;
  }

  /**
   * Initializes the client with an election config.
   * If no config is provided, it fetches one from the backend.
   *
   * @param latestConfig Allows injection of an election configuration for testing purposes
   * @param keyPair Allows injection of a keypair to support automatic testing
   * @returns Returns undefined if succeeded or throws an error
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async initialize(latestConfig?: LatestConfig, keyPair?: KeyPair): Promise<void> {
    if (latestConfig) {
      validateLatestConfig(latestConfig);
      this.latestConfig = latestConfig;
    } else {
      this.latestConfig = await fetchLatestConfig(this.bulletinBoard);
    }

    if (keyPair) {
      this.keyPair = keyPair;
    } else {
      this.keyPair = randomKeyPair();
    }
  }

  /**
   * Should be called when a voter chooses digital vote submission (instead of mail-in).
   *
   * Will attempt to get backend services to send an access code (one time password, OTP) to voter's email address.
   *
   * Should be followed by {@link AVClient.validateAccessCode | validateAccessCode} to submit access code for validation.
   *
   * @param opaqueVoterId Voter ID that preserves voter anonymity.
   * @param email where the voter expects to receive otp code.
   * @param ballotReference The ballot which which voter voter intends to vote on
   * @returns Returns undefined or throws an error.
   * @throws VoterRecordNotFound if no voter was found
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async requestAccessCode(opaqueVoterId: string, email: string, ballotReference?: string): Promise<void> {
    const coordinatorURL = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.url;
    const voterAuthorizerContextUuid = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.contextUuid;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL, voterAuthorizerContextUuid);

    return coordinator.createSession(opaqueVoterId, email, ballotReference)
      .then(({ data: { sessionId } }) => {
        // In the US voters are allowed to chose their ballot
        return sessionId as string
      })
      .then(async sessionId => {
        this.authorizationSessionId = sessionId
        this.email = email
      });
  }

  /**
   * Should be called after {@link AVClient.requestAccessCode | requestAccessCode}.
   *
   * Takes an access code (OTP) that voter received, uses it to authorize to submit votes.
   *
   * Internally, generates a private/public key pair, then attempts to authorize the public
   * key with each OTP provider.
   *
   * Should be followed by {@link AVClient.constructBallotCryptograms | constructBallotCryptograms}.
   *
   * @param   code An access code string.
   * @param   email Voter email.
   * @returns Returns undefined if authorization succeeded or throws an error
   * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
   * @throws {@link AccessCodeExpired | AccessCodeExpired } if an OTP code has expired
   * @throws {@link AccessCodeInvalid | AccessCodeInvalid } if an OTP code is invalid
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  async validateAccessCode(code: string): Promise<void> {
    if(!this.email)
      throw new InvalidStateError('Cannot validate access code. Access code was not requested.');

    const otpProviderUrl = this.getLatestConfig().items.voterAuthorizerConfig.content.identityProvider.url;
    const otpProviderElectionContextUuid = this.getLatestConfig().items.voterAuthorizerConfig.content.identityProvider.contextUuid;
    const provider = new OTPProvider(otpProviderUrl, otpProviderElectionContextUuid)

    this.identityConfirmationToken = await provider.requestOTPAuthorization(code, this.email);
  }

  generateProofOfElectionCodes(electionCodes : Array<string>) {
    this.proofOfElectionCodes = new ProofOfElectionCodes(electionCodes);
  }

  setIdentityToken(token: string) {
    this.identityConfirmationToken = token
  }

  public async getCoordinatorVoterInfo(): Promise<AxiosResponse> {
    const coordinatorURL = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.url;
    const voterAuthorizerContextUuid = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.contextUuid;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL, voterAuthorizerContextUuid);

    let identity;

    if (this.proofOfElectionCodes) {
      identity = { publicKey: this.proofOfElectionCodes.mainKeyPair.publicKey }
    } else if (this.identityConfirmationToken)  {
      identity = { identitiyConfirmationToken: this.identityConfirmationToken };
    } else {
      throw new InvalidStateError("No way of identifying voter. Please generate a public key or supply an identityToken")
    }

    return await coordinator.getVoterInfo(identity)
  }

  /**
   * Registers a voter based on the authorization mode of the Voter Authorizer
   * Authorization is done by 'proof-of-identity' or 'proof-of-election-codes'
   */
  public async createVoterRegistration(votingRoundReference = "voting-round-1"): Promise<void> {
    const coordinatorURL = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.url;
    const voterAuthorizerContextUuid = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.contextUuid;
    const coordinator = new VoterAuthorizationCoordinator(coordinatorURL, voterAuthorizerContextUuid);
    const latestConfigAddress = this.getLatestConfig().items.latestConfigItem.address;
    const authorizationMode = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.authorizationMode;
    this.votingRoundReference = votingRoundReference

    let authorizationResponse: AxiosResponse

    // This should be refactored when the DBB allows several authorization modes
    if(authorizationMode === 'proof-of-identity' || this.identityConfirmationToken) {
      if(!this.identityConfirmationToken)
        throw new InvalidStateError('Cannot register voter without identity confirmation. User has not validated access code.')

      authorizationResponse = await this.authorizeIdentity(coordinator)
    } else if(authorizationMode === 'proof-of-election-codes') {
      if(this.proofOfElectionCodes == null)
        throw new InvalidStateError('Cannot register voter without proof of election codes. User has not generated an election codes proof.')

      authorizationResponse = await coordinator.authorizeProofOfElectionCodes(this.keyPair.publicKey, this.proofOfElectionCodes, this.votingRoundReference)
    } else {
      throw new InvalidConfigError(`Unknown authorization mode of voter authorizer: '${authorizationMode}'`)
    }

    const { authToken, authorizationUuid } = authorizationResponse.data;
    this.authorizationSessionId = this.authorizationSessionId ? this.authorizationSessionId : authorizationUuid

    const decoded = jwtDecode<JwtPayload>(authToken); // TODO: Verify against dbb pubkey: this.getLatestConfig().services.voterAuthorizer.public_key);

    if(decoded === null)
      throw new InvalidTokenError('Auth token could not be decoded');

    const voterSessionItemExpectation = {
      type: VOTER_SESSION_ITEM,
      parentAddress: latestConfigAddress,
      content: {
        authToken: authToken,
        identifier: decoded['identifier'],
        publicKey: decoded['public_key'],
        weight: decoded['weight'] || 1,
        voterGroup: decoded['voter_group_key'],
        votingRoundReference: decoded['voting_round_reference']
      }
    }

    const voterSessionItemResponse = await this.bulletinBoard.createVoterRegistration(authToken, latestConfigAddress);
    const voterSessionItem = voterSessionItemResponse.data.voterSession;
    const receipt = voterSessionItemResponse.data.receipt;

    validatePayload(voterSessionItem, voterSessionItemExpectation, this.getDbbPublicKey());
    validateReceipt([voterSessionItem], receipt, this.getDbbPublicKey());

    this.voterSession = voterSessionItem;
    this.bulletinBoard.setVoterSessionUuid(voterSessionItem.content.identifier);
  }

  /**
   * Registers a voter based on the authorization mode of the Voter Authorizer
   * @returns undefined or throws an error
   */
  public async registerVoter(): Promise<void> {
    return this.createVoterRegistration();
  }

  public async expireVoterSessions(votingRoundReference: string): Promise<AxiosResponse> {
    const {
      url: vaUrl,
      contextUuid: vaUuid,
      authorizationMode,
    } = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer;
    const latestConfigAddress = this.getLatestConfig().items.latestConfigItem.address;
    const coordinator = new VoterAuthorizationCoordinator(vaUrl, vaUuid);

    let authorizationResponse: AxiosResponse

    switch (authorizationMode) {
      case "proof-of-election-codes":
        authorizationResponse = await coordinator.authorizeProofOfElectionCodes(
          this.keyPair.publicKey,
          this.proofOfElectionCodes,
          votingRoundReference,
          "expire");
        break;
      case "proof-of-identity":
        throw new InvalidStateError("voter_authorizer.expire_voter.proof_of_identity_not_supported");
      default:
        throw new InvalidConfigError(`Unknown authorization mode of voter authorizer: '${authorizationMode}'`);
    }

    const { authToken } = authorizationResponse.data;
    const decodedAuthToken = jwtDecode<JwtPayload>(authToken);

    if(decodedAuthToken === null)
      throw new InvalidTokenError('Auth token could not be decoded');

    return await this.bulletinBoard.expireVoterSessions(authToken, latestConfigAddress);
  }

  /**
   * Should be called after {@link AVClient.validateAccessCode | validateAccessCode}.
   *
   * Encrypts a {@link BallotSelection | ballot-selection} (CVR) and generates vote cryptograms.
   *
   * Example:
   * ```javascript
   * const client = new AVClient(url);
   * const cvr = { '1': 'option1', '2': 'optiona' };
   * const trackingCode = await client.constructBallotCryptograms(cvr);
   * ```
   *
   * Example of handling errors:
   * ```
   * try {
   *   await client.constructBallotCryptograms({});
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
   * Where `'1'` and `'2'` are contest ids, and `'option1'` and `'optiona'` are
   * values internal to the AV election config.
   *
   * Should be followed by either {@link AVClient.spoilBallot | spoilBallot}
   * or {@link AVClient.castBallot | castBallot}.
   *
   * @param   ballotSelection BallotSelection containing the selections for each contest.
   * @returns Returns the ballot tracking code. Example:
   * ```javascript
   * '5e4d8fe41fa3819cc064e2ace0eda8a847fe322594a6fd5a9a51c699e63804b7'
   * ```
   * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
   * @throws {@link CorruptCvrError | CorruptCvrError } if the cast vote record is invalid
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async constructBallot(ballotSelection: BallotSelection): Promise<string> {
    if(!(this.voterSession)) {
      throw new InvalidStateError('Cannot construct cryptograms. Voter identity unknown')
    }

    const state = {
      voterSession: this.voterSession,
      latestConfig: this.getLatestConfig(),
      votingRoundReference: this.votingRoundReference
    };

    const transparent = state.latestConfig.items.votingRoundConfigs[this.votingRoundReference].content.handRaise || false;

    const {
      pedersenCommitment,
      envelopeRandomizers,
      contestEnvelopes,
    } = constructContestEnvelopes(state, ballotSelection, transparent);

    this.clientEnvelopes = contestEnvelopes;

    this.voterCommitmentOpening = {
      commitmentRandomness: pedersenCommitment.randomizer,
      randomizers: envelopeRandomizers
    }

    const contestPilesMap = contestEnvelopes.map(ce => [ce.reference, ce.piles.length])

    const {
      boardCommitment,
      serverEnvelopes
    } = await submitVoterCommitment(
      this.bulletinBoard,
      this.voterSession.address,
      pedersenCommitment.commitment,
      this.privateKey(),
      Object.fromEntries(contestPilesMap),
      this.getDbbPublicKey()
    );
    this.boardCommitment = boardCommitment;
    this.serverEnvelopes = serverEnvelopes;

    const [ ballotCryptogramItem, verificationStartItem ]  = await submitBallotCryptograms(
      this.bulletinBoard,
      this.clientEnvelopes,
      this.serverEnvelopes,
      boardCommitment.address,
      this.privateKey(),
      this.getDbbPublicKey()
    );

    this.ballotCryptogramItem = ballotCryptogramItem;

    const trackingCode = hexToShortCode(verificationStartItem.shortAddress)

    return trackingCode
  }

    /**
   * Should be the last call in the entire voting process.
   *
   * Requests that the previously constructed ballot is cast.
   *
   *
   * @param affidavit The {@link Affidavit | affidavit} document.
   * @param locale The locale which the email with the vote receipt should be sent in
   * @return Returns the vote receipt. Example of a receipt:
   * ```javascript
   * {
   *    previousBoardHash: 'd8d9742271592d1b212bbd4cbvobbe357aef8e00cdbdf312df95e9cf9a1a921465',
   *    boardHash: '5a9175c2b3617298d78be7d0244a68f34bc8b2a37061bb4d3fdf97edc1424098',
   *    registeredAt: '2020-03-01T10:00:00.000+01:00',
   *    serverSignature: 'dbcce518142b8740a5c911f727f3c02829211a8ddfccabeb89297877e4198bc1,46826ddfccaac9ca105e39c8a2d015098479624c411b4783ca1a3600daf4e8fa',
   *    voteSubmissionId: 6
      }
   * ```
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
    public async castBallot(affidavit?: Affidavit, locale = "en"): Promise<BallotBoxReceipt> {
      // Affidavit must be base64 encoded

      if(!(this.voterSession)) {
        throw new InvalidStateError('Cannot create cast request cryptograms. Ballot cryptograms not present')
      }

      const castRequestItem = {
          parentAddress: this.ballotCryptogramItem.address,
          type: CAST_REQUEST_ITEM,
          content: {}
      };

      let encryptedAffidavit;

      if (affidavit && this?.latestConfig?.items?.electionConfig?.content?.castRequestItemAttachmentEncryptionKey) {
        try {
          encryptedAffidavit = dhEncrypt(this.latestConfig.items.electionConfig.content.castRequestItemAttachmentEncryptionKey, affidavit).toString()

          castRequestItem.content['attachment'] = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(encryptedAffidavit))
        } catch (err) {
          console.error(err)
        }
      }

      const signedPayload = signPayload(castRequestItem, this.privateKey());
      if (encryptedAffidavit) {
        signedPayload['attachment'] = `data:text/plain;base64,${Buffer.from(encryptedAffidavit).toString('base64')}`
      }

      const response = (await this.bulletinBoard.submitCastRequest(signedPayload));
      const { castRequest, receipt } = response.data;

      validatePayload(castRequest, castRequestItem);
      validateReceipt([castRequest], receipt, this.getDbbPublicKey());

      const clientReceipt = generateReceipt(receipt, castRequest);

      if (this.getLatestConfig().items.electionConfig.content.sendTrackingCodeByEmail) {
        const coordinatorURL = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.url;
        const voterAuthorizerContextUuid = this.getLatestConfig().items.voterAuthorizerConfig.content.voterAuthorizer.contextUuid;
        const coordinator = new VoterAuthorizationCoordinator(coordinatorURL, voterAuthorizerContextUuid);
        try {
          coordinator.sendReceipt(clientReceipt, this.authorizationSessionId, this.getLatestConfig().items.electionConfig.content.dbasUrl, locale);
        } catch(e) {
          console.error(e)
        }
      }

      return clientReceipt
    }

  /**
   * Should be called when voter chooses to test the encryption of their ballot.
   * Gets commitment opening of the digital ballot box and validates it.
   *
   * @returns Returns undefined if the validation succeeds or throws an error
   * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
   * @throws ServerCommitmentError if the server commitment is invalid
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async spoilBallot(): Promise<string> {
    if(!(this.voterSession)) {
      throw new InvalidStateError('Cannot create cast request cryptograms. Ballot cryptograms not present')
    }

    const spoilRequestItem = {
        parentAddress: this.ballotCryptogramItem.address,
        type: SPOIL_REQUEST_ITEM,
        content: {}
    }

    const signedPayload = signPayload(spoilRequestItem, this.privateKey());

    const response = (await this.bulletinBoard.submitSpoilRequest(signedPayload))

    const { spoilRequest, receipt, boardCommitmentOpening } = response.data;

    this.spoilRequest = spoilRequest

    validatePayload(spoilRequest, spoilRequestItem);
    validateReceipt([spoilRequest], receipt, this.getDbbPublicKey());
    validateCommmitmentOpening(boardCommitmentOpening, this.boardCommitment.content.commitment, 'Board commitment is not valid')

    return spoilRequest.address
  }


  /**
   * Should be called when the voter has 'paired' the verifier and the voting app.
   * Computes and encrypts the clientEncryptionCommitment and posts it to the DBB
   *
   * @returns Returns void if the computation was succesful
   * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async challengeBallot(): Promise<void> {
    if(!(this.voterSession)) {
      throw new InvalidStateError('Cannot challenge ballot, no user session')
    }

    const voterCommitmentOpeningItem = {
      parentAddress: this.verifierItem.address,
      type: VOTER_ENCRYPTION_COMMITMENT_OPENING_ITEM,
      content: {
        package: encryptCommitmentOpening(this.verifierItem.content.publicKey, this.voterCommitmentOpening)
      }
    }

    const signedVoterCommitmentOpeningItem = signPayload(voterCommitmentOpeningItem, this.privateKey())

    this.bulletinBoard.submitCommitmentOpenings(signedVoterCommitmentOpeningItem)
  }

  /**
   * Purges internal data.
   */
  public purgeData(): void {
    // TODO: implement me
    return
  }

  public getLatestConfig(): LatestConfig {
    if(!this.latestConfig){
      throw new InvalidStateError('No configuration loaded. Did you call initialize()?')
    }

    return this.latestConfig
  }

  public getVoterSession(): VoterSessionItem {
    if(!this.voterSession){
      throw new InvalidStateError('No voter session loaded')
    }

    return this.voterSession
  }

  public getSessionUuid(): string {
    return this.authorizationSessionId
  }

  public getVoterBallotConfig(): BallotConfig {
    const voterSession = this.getVoterSession()
    const { items: { ballotConfigs } } = this.getLatestConfig()
    return ballotConfigs[voterSession.content.voterGroup]
  }

  public getVoterContestConfigs(): ContestConfig[] {
    const voterSession = this.getVoterSession()
    const { items: { ballotConfigs, votingRoundConfigs, contestConfigs }} = this.getLatestConfig()

    const myBallotConfig = ballotConfigs[voterSession.content.voterGroup]
    const myVotingRoundConfig = votingRoundConfigs[voterSession.content.votingRoundReference]
    const contestsICanVoteOn = myBallotConfig.content.contestReferences.filter(value => myVotingRoundConfig.content.contestReferences.includes(value));
    return contestsICanVoteOn.map(contestReference => {
      return contestConfigs[contestReference]
    })
  }

  public getDbbPublicKey(): string {
    const dbbPublicKeyFromConfig = this.getLatestConfig().items.genesisConfig.content.publicKey;

    if(this.dbbPublicKey) {
      return this.dbbPublicKey;
    } else if (dbbPublicKeyFromConfig) {
      return dbbPublicKeyFromConfig;
    } else {
      throw new InvalidStateError('No DBB public key available')
    }
  }

  private privateKey(): BigNum {
    return this.keyPair.privateKey
  }

  public generateSignature(payload: string): string {
    return Crypto.generateSchnorrSignature(payload, this.privateKey())
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
        this.votingRoundReference
    );
  }

  /**
   * Should be called after spoilBallot.
   * Gets the verifier public key from the DBB
   *
   * @returns Returns the pairing code based on the address of the verifier item in the DBB
   * @throws {@link InvalidStateError | InvalidStateError } if called before required data is available
   * @throws {@link TimeoutError | TimeoutError} if the verifier doesn't register itself to the DBB in time
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async waitForVerifierRegistration(): Promise<string> {
    if(!(this.voterSession)) {
      throw new InvalidStateError('Cannot challenge ballot, no user session')
    }

    let attempts = 0;

    const executePoll = async (resolve, reject) => {
      const result = await this.bulletinBoard.getVerifierItem(this.spoilRequest.address).catch(error => {
        console.error(error.response.data.error_message)
      });

      attempts++;
      if (result?.data?.verifier?.type === VERIFIER_ITEM) {
        this.verifierItem = result.data.verifier
        const pairingCode = hexToShortCode(result.data.verifier.shortAddress)
        return resolve(pairingCode);
      } else if (MAX_POLL_ATTEMPTS && attempts === MAX_POLL_ATTEMPTS) {
        return reject(new TimeoutError('Exceeded max attempts'));
      } else  {
        setTimeout(executePoll, POLLING_INTERVAL_MS, resolve, reject);
      }
    };

    return new Promise(executePoll);
  }

  /**
   * Finds the ballot status corresponding to the given trackingcode.
   * Also returns the activities associated with the ballot
   *
   * @param trackingCode base58-encoded trackingcode
  */
  public async checkBallotStatus(trackingCode: string): Promise<BallotStatus> {
    const shortAddres = shortCodeToHex(trackingCode)
    const { status, activities } = (await this.bulletinBoard.getBallotStatus(shortAddres)).data

    const ballotStatus = {
      activities: activities,
      status: status
    }

    return ballotStatus
  }
}

type BigNum = string;

export type {
  IAVClient,
  ContestMap,
  BallotSelection,
  Affidavit,
  BallotBoxReceipt,
  HashValue,
  Signature,
  LatestConfig
}

export {
  extractContestSelections,
  AVVerifier,
  AvClientError,
  AccessCodeExpired,
  AccessCodeInvalid,
  BulletinBoardError,
  CorruptCvrError,
  TimeoutError,
  EmailDoesNotMatchVoterRecordError,
  InvalidConfigError,
  InvalidStateError,
  NetworkError,
  DBBError
}
