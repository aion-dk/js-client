import { BoardItem, ItemExpectation } from './types';
export declare const signPayload: (obj: Record<string, unknown>, privateKey: string) => {
    signature: any;
};
export declare const validatePayload: (item: BoardItem, expectations: ItemExpectation, signaturePublicKey?: string) => void;
export declare const validateReceipt: (items: BoardItem[], receipt: string, publicKey: string) => void;
