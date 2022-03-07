import { BulletinBoard } from './av_client/connectors/bulletin_board';
import { CAST_REQUEST_ITEM, MAX_POLL_ATTEMPTS, POLLING_INTERVAL_MS, SPOIL_REQUEST_ITEM, VERIFIER_ITEM } from './av_client/constants';
import { randomKeyPair } from './av_client/generate_key_pair';
import { signPayload, validateReceipt } from './av_client/sign';
import { decrypt } from './av_client/decrypt_vote';
import { isValidPedersenCommitment } from './av_client/crypto/pedersen_commitment';
import { CommitmentOpening, BoardCommitmentItem, VerifierItem, VoterCommitmentItem, BoardCommitmentOpeningItem, VoterCommitmentOpeningItem, BallotCryptogramItem } from './av_client/types';

import {
  fetchElectionConfig,
  ElectionConfig,
  validateElectionConfig
} from './av_client/election_config';


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

  public async findBallot(verificationStartAddress: string): Promise<string> {
    await this.bulletinBoard.getVotingTrack(verificationStartAddress).then(response => {
      // TODO: Validate item payloads and receipt.... How can I validate the payload, when I dont know what to expect?
      // and verificationTrackStartItem === ballot checking code
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

  public async submitVerifierKey(spoilRequestAddress: string): Promise<VerifierItem> {
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
    return this.verifierItem
  }

  public decryptBallot() {
    this.validateBoardCommitmentOpening(this.boardCommitmentOpening.content, this.boardCommitment);
    this.validateVoterCommitmentOpening(this.voterCommitmentOpening.content, this.voterCommitment);

    const defaultMarkingType = {
      style: "regular",
      handleSize: 1,
      minMarks: 1,
      maxMarks: 1
    }

    return decrypt(
      defaultMarkingType,
      this.electionConfig.encryptionKey,
      this.ballotCryptograms.content.cryptograms, 
      this.boardCommitmentOpening.content, 
      this.voterCommitmentOpening.content
    )
  }

  private validateBoardCommitmentOpening(commitmentOpening: CommitmentOpening, commitment: string) {
    if(!this.validateCommitmentOpening(commitmentOpening, commitment))
      throw new Error("The board lied!!!");
  }

  private validateVoterCommitmentOpening(commitmentOpening: CommitmentOpening, commitment: string) {
    if(!this.validateCommitmentOpening(commitmentOpening, commitment))
      throw new Error("The voter lied!!!");
  }

  private validateCommitmentOpening(commitmentOpening: CommitmentOpening, commitment: string): boolean {
    return isValidPedersenCommitment(commitment, commitmentOpening.randomizers, commitmentOpening.commitmentRandomness);
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
