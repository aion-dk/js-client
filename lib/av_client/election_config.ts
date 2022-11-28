import { BulletinBoard } from "./connectors/bulletin_board";
import { LatestConfig } from "./types";
import { InvalidConfigError } from "./errors";

export async function fetchElectionConfig(bulletinBoard: BulletinBoard): Promise<LatestConfig> {
  return bulletinBoard.getElectionConfig()
    .then(
      (response: { data: LatestConfig }) => {
        const configData = response.data;

        // const privKey = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
        const pubKey = '03e9858b6e48eb93d8f27aa76b60806298c4c7dd94077ad6c3ff97c44937888647'
        configData.affidavit = {
          curve: 'k256',
          encryptionKey: pubKey
        }

        return configData;
      })
      .catch((error) => {
        console.error()
        throw error;
      });
}

export function validateElectionConfig(config: LatestConfig): void {
  const errors : string[] = [];
  if (!containsOTPProviderURL(config)) {
    errors.push("Configuration is missing OTP Provider URL")
  }
  if (!containsOTPProviderContextId(config)) {
    errors.push("Configuration is missing OTP Provider election context uuid")
  }
  if (!containsOTPProviderPublicKey(config)) {
    errors.push("Configuration is missing OTP Provider public key")
  }
  if (!containsVoterAuthorizerURL(config)) {
    errors.push("Configuration is missing Voter Authorizer URL")
  }
  if (!containsVoterAuthorizerContextId(config)) {
    errors.push("Configuration is missing Voter Authorizer election context uuid")
  }
  if (!containsVoterAuthorizerPublicKey(config)) {
    errors.push("Configuration is missing Voter Authorizer public key")
  }

  if (errors.length > 0)
    throw new InvalidConfigError(`Received invalid election configuration. Errors: ${errors.join(",\n")}`);
}

function containsOTPProviderURL(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.identityProvider?.url?.length > 0;
  // return config?.services?.otpProvider?.url?.length > 0;
}

function containsOTPProviderContextId(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.identityProvider?.contextUuid?.length > 0;
  // return config?.services?.otpProvider?.electionContextUuid?.length > 0;
}

function containsOTPProviderPublicKey(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.identityProvider?.publicKey?.length > 0;
  // return config?.services?.otpProvider?.publicKey?.length > 0;
}

function containsVoterAuthorizerURL(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.voterAuthorizer?.url?.length > 0;
  // return config?.services?.voterAuthorizer?.url?.length > 0;
}

function containsVoterAuthorizerContextId(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.voterAuthorizer?.contextUuid?.length > 0;
  // return config?.services?.voterAuthorizer?.electionContextUuid?.length > 0;
}

function containsVoterAuthorizerPublicKey(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.voterAuthorizer?.publicKey?.length > 0;
  // return config?.services?.voterAuthorizer?.publicKey?.length > 0;
}

