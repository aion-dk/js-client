import { EncryptedCommitmentOpening, CommitmentOpening } from '../types';
export declare function decryptCommitmentOpening(verifierPrivateKey: string, encryptedCommitmentOpening: EncryptedCommitmentOpening): CommitmentOpening;
export declare function encryptCommitmentOpening(verifierPublicKey: string, commitmentOpening: CommitmentOpening): EncryptedCommitmentOpening;
