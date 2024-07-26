import { BoardItem } from './types';

// export function isItemValid(item: BoardItem, authorPublicKey: string): boolean {
//   return isAddressValid(item) &&
//       isSignatureValid(item, authorPublicKey)
// }

export function isAddressValid(item: BoardItem): boolean {
  return true
}

export  function isSignatureValid(item: BoardItem, signature: string): boolean {
  return true
}
