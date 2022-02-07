import EncryptVotes from '../encrypt_votes';
import { ContestMap, OpenableEnvelope } from '../types';

export const finalizeBallotCryptograms = (clientCryptograms: ContestMap<OpenableEnvelope>, serverCryptograms: ContestMap<string>): ContestMap<string> => { 

  const finalizedCryptograms = Object.keys(clientCryptograms).map((contestUuid, i) => {
    const finalizedCryptogram = EncryptVotes.homomorphicallyAddCryptograms(
      // TODO: we operate with the assumption that only one cryptogram is used per contest
      clientCryptograms[contestUuid].cryptograms[0],
      serverCryptograms[contestUuid][0]
    );

    return [contestUuid, [finalizedCryptogram]]
  })
  return Object.fromEntries(finalizedCryptograms)
}
