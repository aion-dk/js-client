import {BulletinBoard} from "./connectors/bulletin_board";
import {LatestConfig} from "./types";
import {InvalidConfigError} from "./errors";

export async function fetchLatestConfig(bulletinBoard: BulletinBoard): Promise<LatestConfig> {
  return bulletinBoard.getLatestConfig()
    .then(
      (response: { data: LatestConfig }) => {
        return response.data;
      })
      .catch((error) => {
        console.error()
        throw error;
      });
}

export function validateLatestConfig(config: LatestConfig): void {
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
}

function containsOTPProviderContextId(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.identityProvider?.contextUuid?.length > 0;
}

function containsOTPProviderPublicKey(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.identityProvider?.publicKey?.length > 0;
}

function containsVoterAuthorizerURL(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.voterAuthorizer?.url?.length > 0;
}

function containsVoterAuthorizerContextId(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.voterAuthorizer?.contextUuid?.length > 0;
}

function containsVoterAuthorizerPublicKey(config: LatestConfig) {
  return config?.items?.voterAuthorizerConfig?.content?.voterAuthorizer?.publicKey?.length > 0;
}

