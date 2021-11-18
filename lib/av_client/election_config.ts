import { BulletinBoard } from "./connectors/bulletin_board";
import { Ballot, Election } from "./types";
import { InvalidConfigError } from "./errors";

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

export function validateElectionConfig(config: ElectionConfig): void {
  const errors : string[] = [];
  if (!containsOTPProviderURL(config)) {
    errors.push("Configuration is missing OTP Provider URL")
  }
  if (!containsVoterAuthorizerURL(config)) {
    errors.push("Configuration is missing Voter Authorizer URL")
  }

  if (errors.length > 0)
    throw new InvalidConfigError(`Received invalid election configuration. Errors: ${errors.join(",\n")}`);
}

function containsOTPProviderURL(config: ElectionConfig) {
  return config?.services?.otp_provider?.url?.length > 0;
}

function containsVoterAuthorizerURL(config: ElectionConfig) {
  return config?.services?.voter_authorizer?.url?.length > 0;
}
