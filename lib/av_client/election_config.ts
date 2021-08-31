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
  voterAuthorizationCoordinatorURL: string;
  OTPProviderCount: number;
  OTPProviderURLs: string[];

  authorizationMode: 'election codes' | 'otps'
}

interface Election {
  enabled: boolean;
  id: number;
  title: LocalString;
  subtitle: LocalString;
  description: LocalString;
  //...
}

interface Ballot {
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

export async function fetchElectionConfig(bulletinBoard: any): Promise<ElectionConfig> {
  return bulletinBoard.getElectionConfig()
    .then(
      (response: { data: ElectionConfig }) => {
        let configData = response.data;
        configData.voterAuthorizationCoordinatorURL = 'http://localhost:1234';
        configData.OTPProviderCount = 1;
        configData.OTPProviderURLs = [
          'http://localhost:1111',
        ]
        return configData;
      },
      (error: any) => { return Promise.reject(error) }
    );
}
