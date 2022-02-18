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

    public findBallot(verificationStartAddress: string): [Promise<boolean>, Promise<string>] {
      return [this.searchForBallot(verificationStartAddress), this.pollForSpoilRequest(verificationStartAddress, 500, 10)]
    }

    private async searchForBallot(verificationStartAddress: string): Promise<boolean>{
      let foundBallot = true
      await this.bulletinBoard.getVotingTrack(verificationStartAddress)
        .then(res => {
          if (!['voterCommitmentItem', 'serverCommitmentItem', 'ballotCryptogramsItem', 'verificationTrackStartItem'].every(p => Object.keys(res.data).includes(p))){
            foundBallot = false
          }
        })
        .catch(() => {
          foundBallot = false
        })

      return Promise.resolve(foundBallot)
    }

    private async pollForSpoilRequest(verificationStartAddress: string, interval: number, maxAttempts: number): Promise<string> {
      let attempts = 0;
    
      const executePoll = async (resolve, reject) => {
        const result = await this.bulletinBoard.getVerifierItem(verificationStartAddress);
        attempts++;
    
        if (result.data.item.type === 'SpoilRequestItem') {
          return resolve(result.data.item.address);
        } else if (maxAttempts && attempts === maxAttempts) {
          return reject(new Error('Exceeded max attempts'));
        } else if (result.data.item.type === 'CastRequestItem'){
            return reject(new Error('Ballot has been cast and cannot be spoiled'))
        } else {
          setTimeout(executePoll, interval, resolve, reject);
        }
      };
    
      return new Promise(executePoll);
    };
}
