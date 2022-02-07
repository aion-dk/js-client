import {  Affidavit } from './types'
import { encryptAES } from './sign'
import { BulletinBoard } from './connectors/bulletin_board'

type AffidavitConfig = {
  curve: string;
  encryptionKey: string;
}
export default class SubmitVotes {
  bulletinBoard: BulletinBoard;

  constructor(bulletinBoard: BulletinBoard) {
    this.bulletinBoard = bulletinBoard;
  }

  encryptAffidavit(affidavit: Affidavit, affidavitConfig: AffidavitConfig): string {
    return encryptAES(affidavit, affidavitConfig)
  }
}
