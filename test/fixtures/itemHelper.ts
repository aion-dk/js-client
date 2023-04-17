import {BaseBoardItem} from "../../lib/av_client/types";

export function baseItemAttributes(): BaseBoardItem {
  return {
    address: '',
    author: '',
    parentAddress: '',
    previousAddress: '',
    registeredAt: '',
    signature: '',
  }
}
