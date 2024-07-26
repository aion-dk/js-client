import { hexToShortCode } from "./short_codes";
import { BallotBoxReceipt, CastRequestItem } from "./types"

export function generateReceipt(serverReceipt: string, castRequest: CastRequestItem): BallotBoxReceipt {
  const receiptData = {
    address: castRequest.address,
    parentAddress: castRequest.parentAddress,
    previousAddress: castRequest.previousAddress,
    registeredAt: castRequest.registeredAt,
    dbbSignature: serverReceipt,
    voterSignature: castRequest.signature
  }
  return {
    trackingCode: hexToShortCode(castRequest.address.substring(0,10)),
    receipt: Buffer.from(JSON.stringify(receiptData)).toString("base64")
  }
}
