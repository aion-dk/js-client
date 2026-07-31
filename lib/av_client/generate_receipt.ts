import { hexToShortCode } from "./short_codes";
import { BallotBoxReceipt, CastRequestItem } from "./types"

export function generateReceipt(serverReceipt: string, castRequest: CastRequestItem, ballotCode: string): BallotBoxReceipt {
  const receiptData = {
    address: castRequest.address,
    parentAddress: castRequest.parentAddress,
    previousAddress: castRequest.previousAddress,
    registeredAt: castRequest.registeredAt,
    dbbSignature: serverReceipt,
    voterSignature: castRequest.signature
  }
  return {
    trackingCode: ballotCode,
    receipt: btoa(JSON.stringify(receiptData))
  }
}
