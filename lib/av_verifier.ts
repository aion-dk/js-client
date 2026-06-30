import {BulletinBoard} from './av_client/connectors/bulletin_board';
import {
  CAST_REQUEST_ITEM,
  MAX_POLL_ATTEMPTS,
  POLLING_INTERVAL_MS,
  SPOIL_REQUEST_ITEM,
  VERIFIER_ITEM
} from './av_client/constants';
import {randomKeyPair} from './av_client/new_crypto/generate_key_pair';
import {signPayload, validateReceipt, verifyAddress} from './av_client/new_crypto/signing';
import {
  VerifierItem,
  BoardCommitmentOpeningItem,
  VoterCommitmentOpeningItem,
  BallotCryptogramItem,
  ContestSelection,
  ReadableContestSelection,
  LatestConfig, CastRequestItem
} from './av_client/types';
import {hexToShortCode, shortCodeToHex} from './av_client/short_codes';
import {fetchLatestConfig} from './av_client/election_config';
import {decryptCommitmentOpening} from './av_client/new_crypto/commitment_opening_encryption';
import {InvalidContestError, InvalidOptionError, InvalidReceiptError, InvalidTrackingCodeError, NetworkError} from './av_client/errors';
import {decryptContestSelections} from './av_client/new_crypto/decrypt_contest_selections';
import {makeOptionFinder} from './av_client/option_finder';
import {validateCommitment} from './av_client/new_crypto/commitments';
import {AVCrypto} from "@assemblyvoting/av-crypto";

export class AVVerifier {
  private readonly dbbPublicKey: string | undefined;
  private verifierPrivateKey: string | undefined
  private cryptogramAddress: string
  private verifierItem: VerifierItem
  private voterCommitment: string;
  private boardCommitment: string;
  private ballotCryptograms: BallotCryptogramItem;
  private boardCommitmentOpening: VoterCommitmentOpeningItem
  private voterCommitmentOpening: BoardCommitmentOpeningItem
  private latestConfig: LatestConfig
  private readonly bulletinBoard: BulletinBoard;
  private crypto: AVCrypto;

  /**
   * Creates a new AVVerifier instance pointed at a specific Digital Ballot Box.
   *
   * @param bulletinBoardURL Base URL of the Digital Ballot Box for this election.
   * @param dbbPublicKey Optional DBB public key to pin at construction time. If omitted, the key
   *   is read from the genesis config once {@link AVVerifier.initialize | initialize} is called.
   */
  constructor(bulletinBoardURL: string, dbbPublicKey?: string) {
    this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
    this.dbbPublicKey = dbbPublicKey;
  }

  /**
   * Initializes the verifier with an election configuration.
   *
   * If no config is provided, fetches it from the Digital Ballot Box
   * (`GET /configuration/latest_config`) and initialises `AVCrypto` with the elliptic curve
   * specified in the genesis config. Must be the first method called on a new `AVVerifier`.
   *
   * @param latestConfig Optional election configuration to inject (useful for testing).
   *   If omitted, the config is fetched from the DBB.
   * @returns Returns undefined on success or throws an error.
   * @throws {@link NetworkError | NetworkError} if the DBB is unreachable.
   */
  public async initialize(latestConfig?: LatestConfig): Promise<void> {
    if (latestConfig) {
      this.latestConfig = latestConfig;
    } else {
      this.latestConfig = await fetchLatestConfig(this.bulletinBoard)
    }

    this.crypto = new AVCrypto(this.latestConfig.items.genesisConfig.content.eaCurveName)
  }

  /**
   * Locates a ballot on the Digital Ballot Box by its tracking code and loads the data needed
   * to decrypt and verify it.
   *
   * Decodes the Base58 tracking code to its hex short address, queries
   * `GET /verification/vote_track`, and validates that the returned short address matches the
   * tracking code. On success, stores the voter commitment, board commitment, ballot cryptograms,
   * and cryptogram address internally.
   *
   * Must be called after {@link AVVerifier.initialize | initialize} and before
   * {@link AVVerifier.pollForSpoilRequest | pollForSpoilRequest}.
   *
   * @param trackingCode The 7-character Base58 tracking code shown on the voter's device.
   * @returns The DBB address of the ballot cryptograms item (`cryptogramAddress`).
   * @throws {@link InvalidTrackingCodeError | InvalidTrackingCodeError} if the tracking code does not match the DBB response.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async findBallot(trackingCode: string): Promise<string> {
    const shortAddress = shortCodeToHex(trackingCode)
    await this.bulletinBoard.getVotingTrack(shortAddress).then(response => {
      if (shortAddress !== response.data.verificationTrackStart.shortAddress) {
        throw new InvalidTrackingCodeError("Tracking code and short address from response doesn't match")
      }
      if (['voterCommitment', 'serverCommitment', 'ballotCryptograms', 'verificationTrackStart']
        .every(p => Object.keys(response.data).includes(p))) {
        this.cryptogramAddress = response.data.ballotCryptograms.address
        this.voterCommitment = response.data.voterCommitment.content.commitment;
        this.boardCommitment = response.data.serverCommitment.content.commitment;
        this.ballotCryptograms = response.data.ballotCryptograms;
      }
    })

    return this.cryptogramAddress
  }

  /**
   * Registers this verifier device on the Digital Ballot Box so the voter's device can pair with it.
   *
   * Generates a fresh EC key pair for this verifier session, constructs a `VerifierItem` signed
   * with the verifier's private key, and posts it to `POST /verification/verifiers`. The
   * `spoilRequestAddress` (obtained from `AVClient.spoilBallot`)
   * links the verifier to the specific spoil request.
   *
   * Must be called after {@link AVVerifier.findBallot | findBallot} and before
   * {@link AVVerifier.pollForCommitmentOpening | pollForCommitmentOpening}.
   *
   * @param spoilRequestAddress The DBB address of the spoil request item, as returned by
   *   `AVClient.spoilBallot`.
   * @returns The 7-character Base58 pairing code derived from the verifier item's short address.
   *   Both the voter's app and this verifier should display this code so the voter can confirm
   *   they are paired with the correct device.
   * @throws {@link NetworkError | NetworkError} if any request failed to get a response.
   */
  public async submitVerifierKey(spoilRequestAddress: string): Promise<string> {
    const keyPair = randomKeyPair(this.crypto)
    this.verifierPrivateKey = keyPair.privateKey

    const verfierItem = {
      type: VERIFIER_ITEM,
      parentAddress: spoilRequestAddress,
      content: {
        publicKey: keyPair.publicKey
      }
    }

    const signedVerifierItem = signPayload(this.crypto, verfierItem, keyPair.privateKey)
    // TODO: Validate payload and receipt
    // check verifierItem.previousAddress === verificationTrackStartItem address
    this.verifierItem = (await this.bulletinBoard.submitVerifierItem(signedVerifierItem)).data.verifier
    const pairingCode = hexToShortCode(this.verifierItem.shortAddress)
    return pairingCode
  }

  /**
   * Decrypts the ballot and returns the original contest selections.
   *
   * Synchronous. Uses the verifier's private key (generated in
   * {@link AVVerifier.submitVerifierKey | submitVerifierKey}) to decrypt both the voter and board
   * commitment openings retrieved in
   * {@link AVVerifier.pollForCommitmentOpening | pollForCommitmentOpening}. Validates both
   * Pedersen commitments to confirm neither party manipulated their randomizers, then decrypts
   * each contest pile to recover the original `ContestSelection[]`.
   *
   * This is the core end-to-end verification step: if it succeeds, the ballot was encrypted
   * honestly and matches what the voter submitted.
   *
   * Must be called after {@link AVVerifier.pollForCommitmentOpening | pollForCommitmentOpening}.
   *
   * @returns Array of `ContestSelection` objects representing the original ballot choices.
   * @throws An error if the verifier private key is not present (i.e. `submitVerifierKey` was not called).
   * @throws An error if either the voter or board Pedersen commitment fails validation.
   */
  public decryptBallot(): ContestSelection[] {
    if (!this.verifierPrivateKey) {
      throw new Error('Verifier private key not present')
    }

    const boardCommitmentOpening = decryptCommitmentOpening(this.crypto, this.verifierPrivateKey, this.boardCommitmentOpening.content.package)
    const voterCommitmentOpening = decryptCommitmentOpening(this.crypto, this.verifierPrivateKey, this.voterCommitmentOpening.content.package)

    validateCommitment(this.crypto, boardCommitmentOpening, this.boardCommitment, 'Board commitment not valid')
    validateCommitment(this.crypto, voterCommitmentOpening, this.voterCommitment, 'Voter commitment not valid')

    return decryptContestSelections(
      this.crypto,
      this.latestConfig.items.contestConfigs,
      this.latestConfig.items.thresholdConfig.content.encryptionKey,
      this.ballotCryptograms.content.contests,
      boardCommitmentOpening,
      voterCommitmentOpening
    )
  }

  /**
   * Polls the Digital Ballot Box until the voter submits a spoil (or cast) request.
   *
   * Queries `GET /verification/spoil_status` every `1000ms` for up to 600 attempts (10 minutes).
   * Resolves as soon as a `SpoilRequestItem` is detected on the DBB chain for this ballot.
   * Rejects immediately if a `CastRequestItem` is detected instead (ballot was cast, not spoiled).
   *
   * The returned address is passed to
   * {@link AVVerifier.submitVerifierKey | submitVerifierKey} to link the verifier to the spoil
   * request.
   *
   * Must be called after {@link AVVerifier.findBallot | findBallot}.
   *
   * @returns The `spoilRequest.address` string once the voter has initiated the spoil flow.
   * @throws An error if the ballot is cast rather than spoiled.
   * @throws An error if 600 poll attempts are exceeded without a result.
   */
  public async pollForSpoilRequest(): Promise<string> {
    let attempts = 0;

    const executePoll = async (resolve, reject) => {
      const result = await this.bulletinBoard.getSpoilRequestItem(this.cryptogramAddress).catch(error => {
        console.error(error.response.data.error_message)
      });
      attempts++;

      if (result?.data?.item?.type === SPOIL_REQUEST_ITEM) {
        return resolve(result.data.item.address);
      } else if (result?.data?.item?.type === CAST_REQUEST_ITEM) {
        return reject(new Error('Ballot has been cast and cannot be spoiled'))
      } else if (MAX_POLL_ATTEMPTS && attempts === MAX_POLL_ATTEMPTS) {
        return reject(new Error('Exceeded max attempts'));
      } else {
        setTimeout(executePoll, POLLING_INTERVAL_MS, resolve, reject);
      }
    };

    return new Promise(executePoll);
  }

  /**
   * Transforms raw contest selections into human-readable form using localised titles.
   *
   * Maps each `ContestSelection` (which uses internal contest and option references) to a
   * `ReadableContestSelection` with localised titles from the election config. Falls back to the
   * first available locale if `locale` is not present in the config.
   *
   * Typically called after {@link AVVerifier.decryptBallot | decryptBallot} to present the
   * verification result to the voter in a readable format.
   *
   * @param contestSelections Array of `ContestSelection` objects as returned by {@link AVVerifier.decryptBallot | decryptBallot}.
   * @param locale BCP 47 locale tag (e.g. `"en"`, `"es"`, `"fr"`) for title localisation.
   * @returns Array of `ReadableContestSelection` objects:
   * ```javascript
   * {
   *   reference: string,
   *   title: string,         // localised contest title
   *   piles: {
   *     multiplier: number,
   *     optionSelections: {
   *       reference: string,
   *       title: string,     // localised option title
   *       text?: string      // write-in text, if applicable
   *     }[]
   *   }[]
   * }[]
   * ```
   * @throws {@link InvalidContestError | InvalidContestError} if a contest reference is not found in the election configuration.
   * @throws {@link InvalidOptionError | InvalidOptionError} if an option reference inside a contest is not found in the election configuration.
   */
  public getReadableContestSelections(contestSelections: ContestSelection[], locale: string): ReadableContestSelection[] {
    const localizer = makeLocalizer(locale)

    return contestSelections.map(cs => {
      const contestConfig = this.latestConfig.items.contestConfigs[cs.reference]
      if (!contestConfig) {
        throw new InvalidContestError("Contest is not present in the election")
      }

      const optionFinder = makeOptionFinder(contestConfig.content.options)

      const readablePiles = cs.piles.map(pile => ({
        multiplier: pile.multiplier,
        optionSelections: pile.optionSelections.map(os => {
          const optionConfig = optionFinder(os.reference)

          return {
            reference: os.reference,
            title: localizer(optionConfig.title),
            text: os.text,
          }
        })
      }))

      return {
        reference: cs.reference,
        title: localizer(contestConfig.content.title),
        piles: readablePiles
      }
    })
  }

  /**
   * Polls the Digital Ballot Box until both the voter and board commitment openings are available.
   *
   * Queries `GET /verification/commitment_openings` every `1000ms` for up to 600 attempts
   * (10 minutes). Resolves once both `voterCommitmentOpening` and `boardCommitmentOpening` are
   * present in the DBB response and stores them internally for use in
   * {@link AVVerifier.decryptBallot | decryptBallot}.
   *
   * Must be called after {@link AVVerifier.submitVerifierKey | submitVerifierKey} and after the
   * voter's device has called `AVClient.challengeBallot` to post the encrypted commitment opening.
   *
   * Typical usage: consumers simply `await` this method and immediately call
   * {@link AVVerifier.decryptBallot | decryptBallot} — the return value is not usually needed.
   *
   * @returns The full commitment openings response data once both openings are available.
   * @throws An error if 600 poll attempts are exceeded without both openings being present.
   */
  public async pollForCommitmentOpening() {
    let attempts = 0;

    const executePoll = async (resolve, reject) => {
      const result = await this.bulletinBoard.getCommitmentOpenings(this.verifierItem.address).catch(error => {
        console.error(error.response.data.error_message)
      });

      attempts++;
      if (result?.data?.voterCommitmentOpening && result?.data?.boardCommitmentOpening) {
        this.boardCommitmentOpening = result.data.boardCommitmentOpening
        this.voterCommitmentOpening = result.data.voterCommitmentOpening

        return resolve(result.data);
      } else if (MAX_POLL_ATTEMPTS && attempts === MAX_POLL_ATTEMPTS) {
        return reject(new Error('Exceeded max attempts'));
      } else {
        setTimeout(executePoll, POLLING_INTERVAL_MS, resolve, reject);
      }
    };

    return new Promise(executePoll);
  }

  /**
   * Validates a `BallotBoxReceipt` against the DBB public key and the ballot's tracking code.
   *
   * `encodedReceipt` is a base64-encoded JSON string containing the cast request item fields
   * (address, parentAddress, previousAddress, registeredAt, voterSignature) and the DBB
   * signature (`dbbSignature`). This method:
   * 1. Parses and decodes the base64 receipt string.
   * 2. Confirms the tracking code matches the receipt address.
   * 3. Verifies the item's address matches its content (integrity check).
   * 4. Verifies the DBB signature against the DBB public key.
   *
   * @param encodedReceipt Base64-encoded JSON receipt string as returned by
   *   `AVClient.castBallot` (after further encoding by the consuming app).
   * @param trackingCode The 7-character Base58 tracking code for the ballot.
   * @throws {@link InvalidReceiptError | InvalidReceiptError} if the receipt string is malformed or fails the cryptographic check.
   * @throws {@link InvalidTrackingCodeError | InvalidTrackingCodeError} if the tracking code does not match the receipt address.
   */
  public validateReceipt(encodedReceipt: string, trackingCode: string): void {
    const [castRequestItem, receipt] = this.parseReceipt(encodedReceipt)
    this.validateTrackingCode(trackingCode, castRequestItem)

    try {
      verifyAddress(castRequestItem)
      validateReceipt(this.crypto, [castRequestItem], receipt, this.getDbbPublicKey())
    } catch (err) {
      // This checks for the specific error messages that invalidate a receipt. Other different errors would bubble up.
      if (
        err.message.startsWith('Unknown parameter type ') ||                             // if the unifier encounters unsupported data types
        err.message.startsWith('BoardItem address does not match expected address ') ||  // if crypto fails on validating the address
        err.message == "Board receipt verification failed"                          // if crypto fails on validating the dbb signature
      ) {
        throw new InvalidReceiptError(err.message)
      } else {
        throw err
      }
    }
  }

  private getDbbPublicKey(): string {
    return this.dbbPublicKey || this.latestConfig.items.genesisConfig.content.publicKey;
  }

  private validateTrackingCode(trackingCode: string, castRequestItem: CastRequestItem) {
    const shortAddress = shortCodeToHex(trackingCode)
    if (shortAddress != castRequestItem.address.substring(0,10)) {
      throw new InvalidTrackingCodeError("Tracking code does not match the receipt")
    }
  }

  private parseReceipt(encodedReceipt: string) {
    let receiptData
    try {
      receiptData = JSON.parse(atob(encodedReceipt))
    } catch (err) {
      throw new InvalidReceiptError(`Receipt string is invalid: ${err instanceof Error ? err.message : err}`)
    }

    const castRequestItem: CastRequestItem = {
      type: "CastRequestItem",
      author: "",
      address: receiptData.address,
      parentAddress: receiptData.parentAddress,
      previousAddress: receiptData.previousAddress,
      content: {},
      registeredAt: receiptData.registeredAt,
      signature: receiptData.voterSignature
    }
    const receipt = receiptData.dbbSignature

    return [castRequestItem, receipt]
  }
}

export {
  InvalidContestError,
  InvalidOptionError,
  InvalidReceiptError,
  InvalidTrackingCodeError,
  NetworkError,
};

function makeLocalizer(locale: string) {
  return (field: { [locale: string]: string }) => {
    const availableFields = Object.keys(field)
    if (availableFields.length === 0) {
      throw new Error('No localized data available')
    }

    return field[locale] || field[availableFields[0]]
  }
}
