import { ContestEnvelope, ContestMap, SealedPile } from '../types';
export declare function finalizeCryptograms(contestEnvelopes: ContestEnvelope[], serverCryptograms: ContestMap<string[][]>): ContestMap<SealedPile[]>;
