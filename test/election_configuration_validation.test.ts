/*eslint-disable @typescript-eslint/no-explicit-any*/
import { AVClient, LatestConfig } from '../lib/av_client';
import { expectError } from './test_helpers';
import { InvalidConfigError } from '../lib/av_client/errors';

describe('election configuration validation', () => {
  let client: AVClient;
  const config: LatestConfig = {
    items: {
      thresholdConfig: {
        content: {
          encryptionKey: "03d8c46ae42cd7f95009ddf444eebc5b18e2cad34aad94129ffc54b5606b5638f4"
        }
      },
      voterAuthorizerConfig: {
        content: {
          identityProvider: {
            contextUuid: "adb99ef7-7992-4bc9-a54b-239d64d97f91",
            publicKey: "030edb8bebffcd417b3bbb33a2ea95508b710b46dddd08de1a6d333768264b4a51",
            url: "http://otp:3001"
          },
          voterAuthorizer: {
            contextUuid: "fce38c77-3418-41b5-8dc5-915557fe7aa5",
            publicKey: "03020e0548dac980b65218f60134ee8d15ef16a9631e217d95240ec06c277bfc8b",
            url: "http://voter-authorizer:3002/",
            authorizationMode: "proof-of-identity"
          }
        },
      },
      ballotConfigs: {
        precinct_4_bedrock: {
          content: {
            reference: "precinct_4_bedrock",
            voterGroup: "precinct_4_bedrock",
            contestReferences: [
              "contest ref 1",
              "contest ref 2"
            ]
          },
        },
      },
      contestConfigs: {
        ["contest ref 1"]: {
          content: {
            reference: "contest ref 1",
            title: {
              en: "First ballot"
            },
            markingType: {
              blankSubmission: "disabled",
              minMarks: 1,
              maxMarks: 1,
              encoding: {
                codeSize: 1,
                maxSize: 1,
                cryptogramCount: 1
              }
            },
            resultType: {
              name: "resultType name not matter right now"
            },
            options: [
              {
                reference: "option ref 1",
                code: 1,
                title: {
                  en: "Option 1"
                },
              },
              {
                reference: "option ref 2",
                code: 2,
                title: {
                  en: "Option 2"
                }
              }
            ]
          }
        },
        ["contest ref 2"]: {
          content: {
            reference: "contest ref 2",
            title: {
              en: "First ballot"
            },
            markingType: {
              blankSubmission: "disabled",
              minMarks: 1,
              maxMarks: 1,
              encoding: {
                codeSize: 1,
                maxSize: 1,
                cryptogramCount: 1
              }
            },
            resultType: {
              name: "resultType name not matter right now"
            },
            options: [
              {
                reference: "option ref 1",
                code: 1,
                title: {
                  en: "Option 1"
                }
              },
              {
                reference: "option ref 2",
                code: 2,
                title: {
                  en: "Option 2"
                }
              }
            ]
          }
        },
      },
      electionConfig: {
        content: {
          title: {
            en: "Some US Election"
          },
          uuid: "bc1b1ed0-943e-4647-bfc1-0633ba08c05e",
        }
      },
      genesisConfig: {
        content: {
          ballotAcceptance: "inferred",
          eaCurveName: "secp256k1",
          eaPublicKey: "03d247cd0170769326a0dcd321653bf5986618fcdda418da0eb45184f8f350ed61",
          electionSlug: "us",
          publicKey: "037b9c074d3756dc2b8f0eda4aa9d36d661e79d0e2b50da38b5d56a0154b630838",
          resultExtraction: "throughout-election"
        }
      },
      latestConfigItem: {
        address: "0e4cc630c0fd8f6ca3f4a2f4329ab440969044a7dd470038f6c5ae17c5f6ed23",
        author: "Election Admin App",
        parentAddress: "dfd82ccd645048358fe92cb48988ee4487fdd390fb657bf68733fae9bf308cfd",
        previousAddress: "dfd82ccd645048358fe92cb48988ee4487fdd390fb657bf68733fae9bf308cfd",
        registeredAt: "2022-11-30T13:57:38.451Z",
        signature: "ccb3e5af13908cdbff5b41b0e5a349bddb573adc017fa4f0ba436c45c3b7f7f8,18f361cc6944ffae8ab0b9f34e8b1c49a5bb78fb0a09889e1ab405d183b11e9b",
      }
    },
  };

  beforeEach(async () => {
    client = new AVClient('http://nothing.local');
  });

  context('OTP provider URL is empty', () => {
    it('fails with an error', async () => {
      
      config.items.voterAuthorizerConfig.content.identityProvider.url = '';
      
      await expectError(
        client.initialize(config),
        InvalidConfigError,
        'Received invalid election configuration. Errors: Configuration is missing OTP Provider URL'
        );

      config.items.voterAuthorizerConfig.content.identityProvider.url = 'http://otp:3001';
    });
  });

  context('Voter Authorizer URL is empty', () => {
    it('fails with an error', async () => {
      config.items.voterAuthorizerConfig.content.voterAuthorizer.url = '';

      await expectError(
        client.initialize(config),
        InvalidConfigError,
        'Received invalid election configuration. Errors: Configuration is missing Voter Authorizer URL'
      );
    });
  });

  context('services key is missing', () => {
    it('fails with an error', async () => {
      delete (config as any).items.voterAuthorizerConfig;

      await expectError(
        client.initialize(config),
        InvalidConfigError,
        "Received invalid election configuration. Errors: Configuration is missing OTP Provider URL,\n" +
        "Configuration is missing OTP Provider election context uuid,\n" +
        "Configuration is missing OTP Provider public key,\n" +
        "Configuration is missing Voter Authorizer URL,\n" +
        "Configuration is missing Voter Authorizer election context uuid,\n" +
        "Configuration is missing Voter Authorizer public key"
      );
    });
  });
});
