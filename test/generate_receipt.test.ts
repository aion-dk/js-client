import {expect} from 'chai';
import {generateReceipt} from '../lib/av_client/generate_receipt';
import {CastRequestItem} from '../lib/av_client/types';
import {baseItemAttributes} from "./fixtures/itemHelper";

const castRequest: CastRequestItem = {
  ...baseItemAttributes(),
  content: {},
  type: 'CastRequestItem'
}

const serverReceipt = "dummy signature string"

describe('generateReceipt', () => {
  context('when given a valid arguments', () => {
    it('constructs a vote receipt', async () => {
      const voteReceipt = generateReceipt(serverReceipt, castRequest)
      expect(voteReceipt).to.have.keys('trackingCode', 'receipt')
      expect(voteReceipt.trackingCode).to.be.a("string")
      expect(voteReceipt.receipt).to.be.a("string")
    })
  })
})
