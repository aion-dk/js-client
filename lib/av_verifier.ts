import { BulletinBoard } from './av_client/connectors/bulletin_board';
import { CAST_REQUEST_ITEM, MAX_POLL_ATTEMPTS, POLLING_INTERVAL_MS, SPOIL_REQUEST_ITEM, VERIFIER_ITEM } from './av_client/constants';
import { randomKeyPair } from './av_client/generate_key_pair';
import { signPayload } from './av_client/sign';
import { VerifierItem, BoardCommitmentOpeningItem, VoterCommitmentOpeningItem, BallotCryptogramItem, ContestSelection, ReadableContestSelection, LatestConfig } from './av_client/types';
import { hexToShortCode, shortCodeToHex } from './av_client/short_codes';
import { fetchLatestConfig } from './av_client/election_config';
import { decryptCommitmentOpening, validateCommmitmentOpening } from './av_client/crypto/commitments';
import { InvalidContestError, InvalidTrackingCodeError } from './av_client/errors';
import { decryptContestSelections } from './av_client/decrypt_contest_selections';
import { makeOptionFinder } from './av_client/option_finder';
export class AVVerifier {
  private dbbPublicKey: string | undefined;
  private verifierPrivateKey: string | undefined
  private cryptogramAddress: string
  private verifierItem: VerifierItem
  private voterCommitment: string;
  private boardCommitment: string;
  private ballotCryptograms: BallotCryptogramItem;
  private boardCommitmentOpening: VoterCommitmentOpeningItem
  private voterCommitmentOpening: BoardCommitmentOpeningItem
  private latestConfig: LatestConfig
  private bulletinBoard: BulletinBoard;

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
   * @param electionConfig Allows injection of an election configuration for testing purposes
   * @param keyPair Allows injection of a keypair to support automatic testing
   * @returns Returns undefined if succeeded or throws an error
   * @throws {@link NetworkError | NetworkError } if any request failed to get a response
   */
  public async initialize(latestConfig?: LatestConfig): Promise<void> {
    if (latestConfig) {
      this.latestConfig = latestConfig;
    } else {
      this.latestConfig = await fetchLatestConfig(this.bulletinBoard)
    }
  }

  public async findBallot(trackingCode: string): Promise<string> {
    const shortAddress = shortCodeToHex(trackingCode)
    await this.bulletinBoard.getVotingTrack(shortAddress).then(response => {
      if (shortAddress !== response.data.verificationTrackStart.shortAddress) {
        throw new InvalidTrackingCodeError("Tracking code and short address from response doesn't match")
      }
      if (['voterCommitment', 'serverCommitment', 'ballotCryptograms', 'verificationTrackStart']
        .every(p => Object.keys(response.data).includes(p))){
          this.cryptogramAddress = response.data.ballotCryptograms.address
          this.voterCommitment = response.data.voterCommitment.content.commitment;
          this.boardCommitment = response.data.serverCommitment.content.commitment;
          this.ballotCryptograms = response.data.ballotCryptograms;
      }
    })

    return this.cryptogramAddress
  }

  public async submitVerifierKey(spoilRequestAddress: string): Promise<string> {
    const keyPair = randomKeyPair()
    this.verifierPrivateKey = keyPair.privateKey

    const verfierItem = {
      type: VERIFIER_ITEM,
      parentAddress: spoilRequestAddress,
      content: {
        publicKey: keyPair.publicKey
      }
    }

    const signedVerifierItem = signPayload(verfierItem, keyPair.privateKey)
    // TODO: Validate payload and receipt
    // check verifierItem.previousAddress === verificationTrackStartItem address
    this.verifierItem = (await this.bulletinBoard.submitVerifierItem(signedVerifierItem)).data.verifier
    const pairingCode = hexToShortCode(this.verifierItem.shortAddress)
    return pairingCode
  }

  public decryptBallot(): ContestSelection[] {
    if( !this.verifierPrivateKey ){
      throw new Error('Verifier private key not present')
    }

    const boardCommitmentOpening = decryptCommitmentOpening(this.verifierPrivateKey, this.boardCommitmentOpening.content.package)
    const voterCommitmentOpening = decryptCommitmentOpening(this.verifierPrivateKey, this.voterCommitmentOpening.content.package)

    validateCommmitmentOpening(boardCommitmentOpening, this.boardCommitment, 'Board commitment not valid')
    validateCommmitmentOpening(voterCommitmentOpening, this.voterCommitment, 'Voter commitment not valid')

    return decryptContestSelections(
      this.latestConfig.items.contestConfigs,
      this.latestConfig.items.thresholdConfig.content.encryptionKey,
      this.ballotCryptograms.content.contests,
      boardCommitmentOpening,
      voterCommitmentOpening
    )
  }

  public async pollForSpoilRequest(): Promise<string> {
    let attempts = 0;

    const executePoll = async (resolve, reject) => {
      const result = await this.bulletinBoard.getSpoilRequestItem(this.cryptogramAddress).catch(error => {
        console.error(error.response.data.error_message)
      });
      attempts++;

      if (result?.data?.item?.type === SPOIL_REQUEST_ITEM) {
        return resolve(result.data.item.address);
      } else if (result?.data?.item?.type === CAST_REQUEST_ITEM){
        return reject(new Error('Ballot has been cast and cannot be spoiled'))
      }  else if (MAX_POLL_ATTEMPTS && attempts === MAX_POLL_ATTEMPTS) {
        return reject(new Error('Exceeded max attempts'));
      } else  {
        setTimeout(executePoll, POLLING_INTERVAL_MS, resolve, reject);
      }
    };

    return new Promise(executePoll);
  }

  public getReadableContestSelections( contestSelections: ContestSelection[], locale: string ): ReadableContestSelection[] {
    const localizer = makeLocalizer(locale)

    return contestSelections.map(cs => {
      const contestConfig = this.latestConfig.items.contestConfigs[cs.reference]
      if( !contestConfig ){
        throw new InvalidContestError("Contest is not present in the election")
      }

      const optionFinder = makeOptionFinder(contestConfig.content.options)

      return {
        reference: cs.reference,
        title: localizer(contestConfig.content.title),
        optionSelections: cs.optionSelections.map(os => {
          const optionConfig = optionFinder(os.reference)
          return {
            reference: os.reference,
            title: localizer(optionConfig.title),
            text: os.text,
          }
        })
      }
    })
  }

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
      } else  {
        setTimeout(executePoll, POLLING_INTERVAL_MS, resolve, reject);
      }
    };

    return new Promise(executePoll);
  }
}

function makeLocalizer( locale: string ){
  return ( field: { [locale: string]: string } ) => {
    const availableFields = Object.keys(field)
    if( availableFields.length === 0 ){
      throw new Error('No localized data available')
    }

    return field[locale] || field[availableFields[0]]
  }
}
