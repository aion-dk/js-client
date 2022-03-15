import EncryptVotes from '../encrypt_votes';
import { ContestMap, OpenableEnvelope } from '../types';

export const finalizeBallotCryptograms = (clientCryptograms: ContestMap<OpenableEnvelope>, serverCryptograms: ContestMap<string[]>): ContestMap<string[]> => { 
  const finalizedCryptograms = Object.fromEntries(Object.entries(clientCryptograms)
      .map(([contestUuid, crypto]) => [contestUuid, crypto.cryptograms.map((cryptogram, i) => EncryptVotes.homomorphicallyAddCryptograms(
        cryptogram,
        serverCryptograms[contestUuid][i]
      ))])
  );
  
  return finalizedCryptograms
}
