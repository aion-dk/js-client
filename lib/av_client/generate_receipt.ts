import { hexToShortCode } from "./short_codes";
import { BallotBoxReceipt, CastRequestItem } from "./types"

export function generateReceipt(serverReceipt: string, castRequest: CastRequestItem): BallotBoxReceipt {
  return {
    trackingCode: hexToShortCode(castRequest.address.substring(0,10)),
    receipt: {
      address: castRequest.address,
      parentAddress: castRequest.parentAddress,
      previousAddress: castRequest.previousAddress,
      registeredAt: castRequest.registeredAt,
      dbbSignature: serverReceipt,
      voterSignature: castRequest.signature
    }
  }
}
