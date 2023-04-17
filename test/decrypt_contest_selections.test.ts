import {expect} from 'chai';
import {decryptContestSelections} from '../lib/av_client/decrypt_contest_selections'
import {CommitmentOpening, ContestConfig, ContestConfigMap, ContestEnvelope, ContestMap} from '../lib/av_client/types';
import {finalizeCryptograms} from "../lib/av_client/finalize_cryptograms";
import {baseItemAttributes} from "./fixtures/itemHelper";

const encryptionKey = '021edaa87d7626dbd2faa99c4dc080f443c150ab70b24da411b13aa56249b5242e'

const bigContest: ContestConfig = {
  ...baseItemAttributes(),
  type: 'ContestConfigItem',
  content: {
    reference: 'big-contest',
    markingType: {
      minMarks: 1,
      maxMarks: 1,
      blankSubmission: "disabled",
      encoding: {
        codeSize: 1,
        maxSize: 41,
        cryptogramCount: 2
      }
    },
    resultType: {
      name: 'does not matter right now'
    },
    title: {en: 'Contest 1'},
    subtitle: {en: 'Contest 1'},
    description: {en: 'Contest 1'},
    options: [
      {
        reference: 'option-1',
        code: 1,
        title: {en: 'Option 1'},
        subtitle: {en: 'Option 1'},
        description: {en: 'Option 1'},
        writeIn: {
          maxSize: 40,
          encoding: 'utf8'
        }
      }
    ]
  }
}
const contestConfigs: ContestConfigMap = {
  [bigContest.content.reference]: bigContest
}

const voterEnvelopeRandomizers = [
  '0723349a9b35ca901cbdebc38b3a270ab5c01a2ddb0ff51e195d40e70086b862',
  '183f83fd53eff298e336dd275c7ef89698f284018ba8b53e2f11a61935ad4c94'
]

// Generated with the help of encryptContestSelections
const voterEnvelopes: ContestEnvelope[] = [
  {
    reference: 'big-contest',
    piles: [{
      multiplier: 1,
      cryptograms: [
        '02d1b46fd169cf713312ed96ca8c77c810991f02a21c14d974e31ff4589141bbb3,03ceaa07c76e81c0ce7988f987b2bca9a969f7195c4f5baad42555c9c964854e4d',
        '03faef66334c1e25a3ea3137299193723675d1bc7542b1b29bdb08644cbd3656ae,0258aed18f2328d18538b77db38d4ff58e2a877a0b73bfcfdb8b12bc62b9d1d28e'
      ],
      randomizers: voterEnvelopeRandomizers
    }]
  }
]

// These cryptograms are generated via dbb - ::Crypto.generate_empty_cryptogram(encryption_key)
const boardEnvelopes: ContestMap<string[][]> = {
    'big-contest': [
      [
        "032034e4abc90113124c4dfe2e5cb6e39fae03a31a48fff9937b39bef3bf362a16,02b21f6d0137c5c34ac40f4b07bfd03b6e8e43b5defb7991f0acd5b8501c0ca866",
        "0378176eb715d76fdc71547d5117b0dcb028b2b253af3b35b34c17c7d0ab6341a5,03f73d0b25d6ef50d1c410a265705a85030bc715f0c3b0f67795ad1ea4d08aafba",
      ]
    ]
  }

const voterCommitmentOpening: CommitmentOpening = {
  commitmentRandomness: '',
  randomizers: {
    'big-contest': [voterEnvelopeRandomizers]
  }
}

const boardCommitmentOpening: CommitmentOpening = {
  commitmentRandomness: '',
  randomizers: {
    "big-contest": [
      [
        "9877646aba2277ed9d9c33c0fb5a2f681db771fff071ec38e895dc3a23d7881a",
        "4c604fbde86db034509a2474d4e3a71042a5b12a12dba8b2231f6af37c5e8839"
      ]
    ]
  }
}

const cryptograms = finalizeCryptograms(voterEnvelopes, boardEnvelopes)

describe('decryptContestSelections', () => {
  context('when given valid arguments', () => {
    it('returns an array of contest selections', () => {
      const contestSelections = decryptContestSelections(contestConfigs, encryptionKey, cryptograms, boardCommitmentOpening, voterCommitmentOpening)

      expect(contestSelections).to.eql([
        {
          reference: 'big-contest',
          piles: [{
            multiplier: 1,
            optionSelections: [
              {reference: 'option-1', text: 'this is a write in text'}
            ]
          }]
        }
      ])
    })
  })
})
