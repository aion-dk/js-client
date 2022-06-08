import { hexToShortCode } from "./short_codes";
import { BallotBoxReceipt, BoardItem } from "./types"

export function generateReceipt(serverReceipt: string, castRequest: BoardItem): BallotBoxReceipt {  
  return {
    trackingCode: hexToShortCode(castRequest.address.substring(0,10)),
    receipt: {
      address: castRequest.address,
      dbbSignature: serverReceipt,
      voterSignature: castRequest.signature
    }
  }
}
