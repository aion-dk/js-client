import { ContestEnvelope, ContestMap, } from './types';
import { ElGamalPointCryptogram } from './aion_crypto'

export function finalizeCryptograms( contestEnvelopes: ContestEnvelope[], serverCryptograms: ContestMap<string[]> ): ContestMap<string[]> { 
  const entries = contestEnvelopes.map(ce => 
    [ ce.reference, addCryptograms(ce.cryptograms, serverCryptograms[ce.reference]) ]
  )
  return Object.fromEntries(entries)
}

function addCryptograms( list1: string[], list2: string[] ){
  return list1.map((cryptogram, i) => {
    const point1 = ElGamalPointCryptogram.fromString(cryptogram);
    const point2 = ElGamalPointCryptogram.fromString(list2[i]);

    point1.homomorphicallyAddCryptogram(point2)

    return point1.toString();
  })
}
