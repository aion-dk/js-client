import { BulletinBoard } from './av_client/connectors/bulletin_board';
import { CAST_REQUEST_ITEM, MAX_POLL_ATTEMPTS, POLLING_INTERVAL_MS, SPOIL_REQUEST_ITEM, VERIFIER_ITEM } from './av_client/constants';
import { randomKeyPair } from './av_client/generate_key_pair';
import { signPayload } from './av_client/sign';
import { VerifierItem } from './av_client/types';

export class AVVerifier {
  private dbbPublicKey: string | undefined;
  private verifierPrivateKey: string | undefined
  private cryptogramAddress: string
  private verifierItem: VerifierItem

  private bulletinBoard: BulletinBoard;
    /**
     * @param bulletinBoardURL URL to the Assembly Voting backend server, specific for election.
     */
     constructor(bulletinBoardURL: string, dbbPublicKey?: string) {
      this.bulletinBoard = new BulletinBoard(bulletinBoardURL);
      this.dbbPublicKey = dbbPublicKey;
    }

    public async findBallot(verificationStartAddress: string): Promise<string> {
      let cryptogramAddress = ''
      await this.bulletinBoard.getVotingTrack(verificationStartAddress).then(response => {
        if (['voterCommitmentItem', 'serverCommitmentItem', 'ballotCryptogramsItem', 'verificationTrackStartItem']
          .every(p => Object.keys(response.data).includes(p))){
            this.cryptogramAddress = response.data.ballotCryptogramsItem.address
        }
      })

      return cryptogramAddress
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
      this.verifierItem = (await this.bulletinBoard.submitVerifierItem(signedVerifierItem)).data
      return this.verifierItem
    }

    public async pollForSpoilRequest(): Promise<string> {
      let attempts = 0;
      
      const executePoll = async (resolve, reject) => {
        const result = await this.bulletinBoard.getSpoilRequestItem(this.cryptogramAddress).catch(error => {
          // console.error(error)
        });
        attempts++;

        if (result?.data?.type === SPOIL_REQUEST_ITEM) {
          return resolve(result.data.address);
        } else if (result?.data?.type === CAST_REQUEST_ITEM){
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
          // console.error(error)
        });

        attempts++;
        if (result?.data?.voterCommitmentOpening && result?.data?.boardCommitmentOpening) {
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
