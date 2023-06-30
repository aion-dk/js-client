import { ContestConfig, SelectionPile } from "../types";
export declare function byteArrayToSelectionPile(contestConfig: ContestConfig, byteArray: Uint8Array, multiplier: number): SelectionPile;
export declare function selectionPileToByteArray(contestConfig: ContestConfig, selectionPile: SelectionPile): Uint8Array;
