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
      this.bulletinBoard.getVotingTrack(verificationStartAddress).then(res => {
        if(res.status === 404) {
          return [Promise.resolve(false), Promise.resolve('')]
        }

        if (!['voterCommitmentItem', 'serverCommitmentItem', 'ballotCryptogramsItem', 'verificationTrackStartItem'].every(p => Object.keys(res.data).includes(p))){
          return [Promise.resolve(false), Promise.resolve('')]
        }
      })

      return [Promise.resolve(false), Promise.resolve('')]
    }
}
