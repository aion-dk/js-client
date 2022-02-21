import { BulletinBoard } from './av_client/connectors/bulletin_board';

export class AVVerifier {
  private dbbPublicKey: string | undefined;

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
            cryptogramAddress = response.data.ballotCryptogramsItem.address
        }
      })

      return cryptogramAddress
    }

    public async pollForSpoilRequest(ballotCryptogramsAddress: string, interval: number, maxAttempts: number): Promise<string> {
      let attempts = 0;
      
      const executePoll = async (resolve, reject) => {
        let result  = await this.bulletinBoard.getSpoilRequestItem(ballotCryptogramsAddress);
        attempts++;

        if (result?.data?.item?.type === 'SpoilRequestItem') {
          return resolve(result.data.item.address);
        } else if (result?.data?.item?.type === 'CastRequestItem'){
          return reject(new Error('Ballot has been cast and cannot be spoiled'))
        }  else if (maxAttempts && attempts === maxAttempts) {
          return reject(new Error('Exceeded max attempts'));
        } else  {
          setTimeout(executePoll, interval, resolve, reject);
        }
      };
    
      return new Promise(executePoll);
    };
}
