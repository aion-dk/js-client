import { BulletinBoard } from '../connectors/bulletin_board';
import { BallotCryptogramItem, ContestEnvelope, ContestMap, VerificationStartItem } from '../types';
export declare function submitBallotCryptograms(bulletinBoard: BulletinBoard, clientEnvelopes: ContestEnvelope[], serverEnvelopes: ContestMap<string[][]>, boardCommitmentAddress: string, voterPrivateKey: string, dbbPublicKey: string): Promise<[BallotCryptogramItem, VerificationStartItem]>;
