import { BulletinBoard } from "./connectors/bulletin_board";
import { LatestConfig } from "./types";
export declare function fetchLatestConfig(bulletinBoard: BulletinBoard): Promise<LatestConfig>;
export declare function validateLatestConfig(config: LatestConfig): void;
