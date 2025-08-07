import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { IdentityConfirmationToken } from "./otp_provider";
import { EmailDoesNotMatchVoterRecordError, NetworkError, UnsupportedServerReplyError, VoterRecordNotFoundError, DBBError, BallotReferenceNotOnVoterRecord } from "../errors";
import { ProofOfElectionCodes } from "../crypto/proof_of_election_codes";
import { BallotBoxReceipt, VoterAuthorizationIdentification } from '../types';

export default class VoterAuthorizationCoordinator {
  private backend: AxiosInstance;
  private electionContextUuid: string;

  constructor(baseURL: string, electionContextUuid: string, timeout = 10000) {
    this.createBackendClient(baseURL, timeout);
    this.electionContextUuid = electionContextUuid;
  }

  /**
   *
   * @param opaqueVoterId Gets
   * @returns
   */
  createSession(
    opaqueVoterId: string,
    email: string,
    ballotReference?: string
  ): Promise<AxiosResponse> {
    return this.backend
      .post("create_session", {
        electionContextUuid: this.electionContextUuid,
        opaqueVoterId: opaqueVoterId,
        ballotReference: ballotReference,
        email,
      })
      .catch((error) => {
        const response = error.response;

        if (error.request && !response) {
          throw new NetworkError(
            "Network error. Could not connect to Voter Authorization Coordinator."
          );
        }

        if ([403, 500].includes(response.status) && response.data) {
          const errorCode = response.data.error_code;
          const errorMessage = response.data.error_message;
          switch (errorCode) {
            case "BALLOT_REFERERENCE_NOT_ON_VOTER_RECORD":
              throw new BallotReferenceNotOnVoterRecord(errorMessage);
            case "EMAIL_DOES_NOT_MATCH_VOTER_RECORD":
              throw new EmailDoesNotMatchVoterRecordError(errorMessage);
            case "COULD_NOT_CONNECT_TO_OTP_PROVIDER":
              throw new NetworkError(errorMessage);
            case "VOTER_RECORD_NOT_FOUND_ERROR":
              throw new VoterRecordNotFoundError(errorMessage);
            case "DBB_ERROR":
              throw new DBBError(errorMessage);
            default:
              throw new UnsupportedServerReplyError(
                `Unsupported server error: ${errorMessage}`
              );
          }
        }

        throw error;
      });
  }

  sendReceipt(
    receipt: BallotBoxReceipt,
    authorizationSessionId: string,
    dbasUrl?: string,
    locale = "en"
  ): Promise<AxiosResponse> {
    return this.backend.post(`${locale}/send_receipt`, {
      trackingCode: receipt.trackingCode,
      electionContextUuid: this.electionContextUuid,
      authorizationSessionId: authorizationSessionId,
      receipt: receipt.receipt,
      dbasUrl: dbasUrl,
    });
  }

  sendSms(
    receipt: BallotBoxReceipt,
    authorizationSessionId: string,
    dbasUrl?: string,
    locale = "en"
  ): Promise<AxiosResponse> {
    return this.backend.post(`${locale}/send_sms`, {
      trackingCode: receipt.trackingCode,
      electionContextUuid: this.electionContextUuid,
      authorizationSessionId: authorizationSessionId,
      receipt: receipt.receipt,
      dbasUrl: dbasUrl,
    });
  }


  requestPublicKeyAuthorization(
    sessionId: string,
    identityConfirmationToken: IdentityConfirmationToken,
    publicKey: string,
    votingRoundReference: string
  ): Promise<AxiosResponse> {
    return this.backend.post("request_authorization", {
      electionContextUuid: this.electionContextUuid,
      sessionId: sessionId,
      emailConfirmationToken: identityConfirmationToken,
      publicKey: publicKey,
      votingRoundReference: votingRoundReference,
    });
  }

  authorizeProofOfElectionCodes(
    publicKey: string,
    proof: ProofOfElectionCodes,
    votingRoundReference: string,
    scope = "register"
  ): Promise<AxiosResponse> {
    return this.backend.post("authorize_proof", {
      scope: scope,
      electionContextUuid: this.electionContextUuid,
      voterPublicKey: proof.mainKeyPair.publicKey, // This public key is used by the VA to find the voter to authorize.
      sessionPublicKey: publicKey, // This public key is used for the auth token
      proof: proof.proof,
      votingRoundReference: votingRoundReference,
    });
  }

  getVoterInfo(identification: VoterAuthorizationIdentification) {
    return this.backend.get("voter_info", {
      params: identification,
    });
  }

  private createBackendClient(baseURL: string, timeout: number) {
    this.backend = axios.create({
      baseURL: baseURL,
      withCredentials: false,
      timeout: timeout,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }
}
