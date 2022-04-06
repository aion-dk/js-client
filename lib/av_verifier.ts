import { BulletinBoard } from './av_client/connectors/bulletin_board';
import { CAST_REQUEST_ITEM, MAX_POLL_ATTEMPTS, POLLING_INTERVAL_MS, SPOIL_REQUEST_ITEM, VERIFIER_ITEM } from './av_client/constants';
import { randomKeyPair } from './av_client/generate_key_pair';
import { signPayload } from './av_client/sign';
import { decrypt } from './av_client/decrypt_vote';
import { VerifierItem, BoardCommitmentOpeningItem, VoterCommitmentOpeningItem, BallotCryptogramItem, ElectionConfig, ContestMap } from './av_client/types';
import { hexToShortCode, shortCodeToHex } from './av_client/short_codes';

import {
  fetchElectionConfig,
  validateElectionConfig
} from './av_client/election_config';
import { decryptCommitmentOpening, validateCommmitmentOpening } from './av_client/crypto/commitments';
import { InvalidContestError, InvalidOptionError, InvalidTrackingCodeError } from './av_client/errors';

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
  private electionConfig: ElectionConfig
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
  async initialize(electionConfig: ElectionConfig): Promise<void>
  async initialize(): Promise<void>
  public async initialize(electionConfig?: ElectionConfig): Promise<void> {
    if (electionConfig) {
      validateElectionConfig(electionConfig);
      this.electionConfig = electionConfig;
    } else {
      this.electionConfig = await fetchElectionConfig(this.bulletinBoard);
    }
  }

  public async findBallot(trackingCode: string): Promise<string> {
    const shortAddress = shortCodeToHex(trackingCode)
    await this.bulletinBoard.getVotingTrack(shortAddress).then(response => {
      if (shortAddress !== response.data.verificationTrackStart.shortAddress) {
        throw new InvalidTrackingCodeError("Tracking code and short address from respose doesn't match")
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

  public decryptBallot() {
    if( !this.verifierPrivateKey ){
      throw new Error('Verifier private key not present')
    }

    const boardCommitmentOpening = decryptCommitmentOpening(this.verifierPrivateKey, this.boardCommitmentOpening.content.package)
    const voterCommitmentOpening = decryptCommitmentOpening(this.verifierPrivateKey, this.voterCommitmentOpening.content.package)

    validateCommmitmentOpening(boardCommitmentOpening, this.boardCommitment, 'Board commitment not valid')
    validateCommmitmentOpening(voterCommitmentOpening, this.voterCommitment, 'Voter commitment not valid')

    const defaultMarkingType = {
      style: "regular",
      codeSize: 1,
      minMarks: 1,
      maxMarks: 1
    }

    return decrypt(
      this.electionConfig.contestConfigs,
      defaultMarkingType,
      this.electionConfig.encryptionKey,
      this.ballotCryptograms.content.cryptograms,
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

  public getReadableBallot(decryptedBallot: ContestMap<string>, locale: string) {
    const ballot = {}
    Object.keys(decryptedBallot).forEach((contestRef) => {
      let chosenOption = ""
      if (!this.electionConfig.contestConfigs[contestRef]) {
        throw new InvalidContestError("Contest is not present in the election")
      } 
      this.electionConfig.contestConfigs[contestRef].options.forEach((opt) => {
        if (opt.reference === decryptedBallot[contestRef]) {
          chosenOption = opt.title[locale]
        }
      })
      if (!chosenOption) {
        throw new InvalidOptionError("Option is not present in the contest")
      }
      ballot[this.electionConfig.contestConfigs[contestRef].title[locale]] = chosenOption
    })

    return ballot
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
