
import {AVCrypto} from "@assemblyvoting/av-crypto";
import { CommitmentOpening, ContestMap } from "@assemblyvoting/types";
import { fromString } from "@assemblyvoting/av-crypto/dist/lib/av_crypto/el_gamal/cryptogram";
import { hexToScalar, generateKeyPair, pointEquals } from "@assemblyvoting/av-crypto/dist/lib/av_crypto/utils";

export function validateServerEnvelopes(crypto: AVCrypto, serverEnvelopes: ContestMap<string[][]>, commitmentOpeninigs: CommitmentOpening): void {
  const randomizers = commitmentOpeninigs.randomizers;

  const envelopeContests = Object.keys(serverEnvelopes).sort();
  const randomizerContests = Object.keys(randomizers).sort();

  if (envelopeContests.length !== randomizerContests.length ||
      !envelopeContests.every((key, i) => key === randomizerContests[i])) {
    throw new Error('Server envelope contests do not match commitment opening contests');
  }

  for (const contestId of envelopeContests) {
    const envelopePiles = serverEnvelopes[contestId];
    const randomizerPiles = randomizers[contestId];

    if (envelopePiles.length !== randomizerPiles.length) {
      throw new Error(`Pile count mismatch for contest '${contestId}'`);
    }

    for (let pileIndex = 0; pileIndex < envelopePiles.length; pileIndex++) {
      const cryptograms = envelopePiles[pileIndex];
      const pileRandomizers = randomizerPiles[pileIndex];

      if (cryptograms.length !== pileRandomizers.length) {
        throw new Error(`Cryptogram count mismatch for contest '${contestId}', pile ${pileIndex}`);
      }

      for (let i = 0; i < cryptograms.length; i++) {
        const cryptogram = fromString(cryptograms[i], crypto.curve);
        const scalar = hexToScalar(pileRandomizers[i], crypto.curve);
        const expectedR = generateKeyPair(crypto.curve, scalar).pub.H;

        if (!pointEquals(cryptogram.r, expectedR)) {
          throw new Error(`Server envelope cryptogram does not match randomizer for contest '${contestId}', pile ${pileIndex}, index ${i}`);
        }
      }
    }
  }
}

function flattenRandomizers(randomizersMap: ContestMap<string[][]>): string[] {
  const iterator = Object.entries(randomizersMap)

  return iterator.map(([_, matrix]) => matrix).flat(2)
}

