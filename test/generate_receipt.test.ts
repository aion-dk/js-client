import {expect} from 'chai';
import {generateReceipt} from '../lib/av_client/generate_receipt';
import {CastRequestItem} from '../lib/av_client/types';
import {baseItemAttributes} from "./fixtures/itemHelper";

const castRequest: CastRequestItem = {
  ...baseItemAttributes(),
  type: 'CastRequestItem'
}

const serverReceipt = "dummy signature string"

describe('generateReceipt', () => {
  context('when given a valid arguments', () => {
    it('constructs a vote receipt', async () => {
      const voteReceipt = generateReceipt(serverReceipt, castRequest)
      expect(voteReceipt).to.have.keys('trackingCode', 'receipt')
      expect(voteReceipt.receipt).to.have.keys('address', 'parentAddress', 'previousAddress', 'registeredAt', 'dbbSignature', 'voterSignature')
    })
  })
})
