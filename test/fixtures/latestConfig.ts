import { LatestConfig } from '../../lib/av_client';
import {baseItemAttributes} from "./itemHelper";

const latestConfig: LatestConfig = {
  items: {
    thresholdConfig: {
      ...baseItemAttributes(),
      type: 'ThresholdConfigItem',
      content: {
        encryptionKey: "03d8c46ae42cd7f95009ddf444eebc5b18e2cad34aad94129ffc54b5606b5638f4",
        threshold: 1,
        trustees: []
      }
    },
    voterAuthorizerConfig: {
      ...baseItemAttributes(),
      type: 'VoterAuthorizationConfigItem',
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
        ...baseItemAttributes(),
        type: 'BallotConfigItem',
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
      "contest ref 1": {
        ...baseItemAttributes(),
        type: 'ContestConfigItem',
        content: {
          reference: "contest ref 1",
          title: {
            en: "First ballot"
          },
          subtitle: {
            en: "First ballot"
          },
          description: {
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
              subtitle: {
                en: "Option 1"
              },
              description: {
                en: "Option 1"
              },
            },
            {
              reference: "option ref 2",
              code: 2,
              title: {
                en: "Option 2"
              },
              subtitle: {
                en: "Option 2"
              },
              description: {
                en: "Option 2"
              },
            }
          ]
        }
      },
      "contest ref 2": {
        ...baseItemAttributes(),
        type: 'ContestConfigItem',
        content: {
          reference: "contest ref 2",
          title: {
            en: "Second ballot"
          },
          subtitle: {
            en: "Second ballot"
          },
          description: {
            en: "Second ballot"
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
              subtitle: {
                en: "Option 1"
              },
              description: {
                en: "Option 1"
              },
            },
            {
              reference: "option ref 2",
              code: 2,
              title: {
                en: "Option 2"
              },
              subtitle: {
                en: "Option 2"
              },
              description: {
                en: "Option 2"
              },
            }
          ]
        }
      },
    },
    electionConfig: {
      ...baseItemAttributes(),
      type: 'ElectionConfigItem',
      content: {
        title: {
          en: "Some US Election"
        },
        uuid: "bc1b1ed0-943e-4647-bfc1-0633ba08c05e",
        status: "scheduled",
        locales: [
          "en"
        ],
      }
    },
    votingRoundConfigs: {
      "voting-round-1": {
        ...baseItemAttributes(),
        type: 'VotingRoundConfigItem',
        content: {
          status: "open",
          reference: "voting-round-1",
          resultPublicationDelay: 0,
          contestReferences: ["contest ref 1"]
        },
      }
    },
    genesisConfig: {
      address: '',
      author: '',
      parentAddress: '0000000000000000000000000000000000000000000000000000000000000000',
      previousAddress: '0000000000000000000000000000000000000000000000000000000000000000',
      registeredAt: '',
      signature: '',
      type: 'GenesisItem',
      content: {
        ballotAcceptance: "inferred",
        eaCurveName: "secp256k1",
        eaPublicKey: "03d247cd0170769326a0dcd321653bf5986618fcdda418da0eb45184f8f350ed61",
        electionSlug: "us",
        publicKey: "037b9c074d3756dc2b8f0eda4aa9d36d661e79d0e2b50da38b5d56a0154b630838",
        resultExtraction: "throughout-election"
      }
    },
    segmentsConfig: null,
    extractionIntents: {},
    extractionData: {},
    extractionConfirmations: {},
    latestConfigItem: {
      address: "f777803fa83e8f79141becb3858cf23e28a1fd6e701b94eb6c20aa2fcd9f58c1",
      author: "Election Admin App",
      parentAddress: "35629e3960fb05b7ddbb27ec161ef74581b2be4e1345477f0c9be2c38f2d17be",
      previousAddress: "35629e3960fb05b7ddbb27ec161ef74581b2be4e1345477f0c9be2c38f2d17be",
      content: {
        encryptionKey: "0220f81d43002c88229ed8c80cfc7f84f9700ee13d80e1be1cd8a3677f84e99ae1",
        threshold: 1,
        trustees: [
          {
            publicKey: "0220f81d43002c88229ed8c80cfc7f84f9700ee13d80e1be1cd8a3677f84e99ae1",
            id: 6,
            polynomialCoefficients: []
          }
        ]
      },
      registeredAt: "2022-12-21T13:26:04.894Z",
      signature: "b9941eac0965bcac23b935206a934fec07aeac1f12d785868b9cfe49c54bca8d,25250822e9b315b9db3c71cd81092c1ee2175e1d591a95bf1a391bdc84821722",
      type: "ThresholdConfigItem"
    }
  },
};

export default latestConfig;
