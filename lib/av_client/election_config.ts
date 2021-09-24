import { BulletinBoard } from "./connectors/bulletin_board";

export interface ElectionConfig {
  app_url: string;
  encryptionKey: string;
  signingPublicKey: string;
  election: Election;
  ballots: Ballot[];
  availableLocales: string[];
  currentLocale: string;
  //...

  // appended data:
  affidavit: AffidavitConfig;

  authorizationMode: 'election codes' | 'otps';

  services: {
    'voter_authorizer': Service,
    'otp_provider': Service
  };
}

interface Service {
  url: string;
}

interface AffidavitConfig {
  curve: string;
  encryptionKey: string;
}

interface Election {
  enabled: boolean;
  id: number;
  title: LocalString;
  subtitle: LocalString;
  description: LocalString;
  //...
}

export interface Ballot {
  id: number;
  vote_encoding_type: number;
  title: LocalString;
  description: LocalString;
  options: Option[];
  write_in: boolean;
  //...
}

interface Option {
  id: number;
  handle: string;
  title: LocalString;
  subtitle: LocalString;
  description: LocalString;
}

interface LocalString {
  [locale: string]: string;
}

export async function fetchElectionConfig(bulletinBoard: BulletinBoard): Promise<ElectionConfig> {
  return bulletinBoard.getElectionConfig()
    .then(
      (response: { data: ElectionConfig }) => {
        const configData = response.data;

        // const privKey = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
        const pubKey = '03e9858b6e48eb93d8f27aa76b60806298c4c7dd94077ad6c3ff97c44937888647'
        configData.affidavit = {
          curve: 'k256',
          encryptionKey: pubKey
        }

        return configData;
      });
}
