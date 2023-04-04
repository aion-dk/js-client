import { expect } from "chai";
import { generatePedersenCommitment, isValidPedersenCommitment } from "../../lib/av_client/crypto/pedersen_commitment";

describe("Pedersen Commitments", () => {
  it("generate commitment from single message", () => {
    const randomizer = "01";
    const messages = { "1": [["ABBA"]] };

    const result = generatePedersenCommitment(messages, { randomizer });

    expect(result.commitment).to.eq("032ec8f41b4d0dd083b2a2de93ae15801bf00ce90f154f8ce653ac15141cec1c09");
    expect(result.randomizer).to.eq("01");

    const isValid = isValidPedersenCommitment(result.commitment, messages, randomizer)
    expect(isValid).to.be.true;
  })

  it("generate commitment from multiple messages", () => {
    const randomizer = "01";
    const messages = { "1": [["ABBA", "BEEF"]] };

    const result = generatePedersenCommitment(messages, { randomizer });

    expect(result.commitment).to.eq("0243a659f3e0313cffcc38ef8339892dcac275ec1ce9b2a0ac540a2d1ab0bbad66");
    expect(result.randomizer).to.eq("01");

    const isValid = isValidPedersenCommitment(result.commitment, messages, randomizer)
    expect(isValid).to.be.true;
  });

  it("generate commitment with realistic randomizer", () => {
    const randomizer = "d05bc90d9108d486835030e1374bcef4a73dc456888444f6b16aeffbc6b32391";
    const messages = { "1": [["ABBA", "BEEF", "DEADBEAF1234567890FFFFFF"]] };

    const result = generatePedersenCommitment(messages, { randomizer });

    expect(result.commitment).to.eq("03204472ebf42b9f7fa31a4a5a8052ee5ae829f614b3b5a5d701d64e7807b3711c");
    expect(result.randomizer).to.eq("d05bc90d9108d486835030e1374bcef4a73dc456888444f6b16aeffbc6b32391");

    const isValid = isValidPedersenCommitment(result.commitment, messages, randomizer)
    expect(isValid).to.be.true;
  });

  it("generate commitment using built-in randomizer for two contests", () => {
    const messages = {
      "1": [[
        "d70d319fd1c7867af1ca477878d381e4d70d319fd1c7867af1ca477878d381e4",
        "ef5b373b279ed26cf774d7e3376ac549ef5b373b279ed26cf774d7e3376ac549"
      ]],
      "2": [[
        "3c2e2bdcc29734c7e06d53b37cc2724c3c2e2bdcc29734c7e06d53b37cc2724c",
        "000000dcc29734c7e06d53b37cc2724c000000dcc29734c7e06d53b37cc2724c"
      ]]
    };

    const result = generatePedersenCommitment(messages);
    const isValid = isValidPedersenCommitment(result.commitment, messages, result.randomizer)
    expect(isValid).to.be.true;
    // TODO: assert actual commitment result
  });

  it("generate same commitment independant of order of contests", () => {
    const randomizer = "01";
    const messages1 = {
      "1": [[ "01" ]],
      "2": [[ "02" ]]
    };
    const messages2 = {
      "2": [[ "02" ]],
      "1": [[ "01" ]]
    };

    const result1 = generatePedersenCommitment(messages1, { randomizer });
    const result2 = generatePedersenCommitment(messages2, { randomizer })

    expect(result1.commitment).to.eq("03f501e31a38c043e75958fdffccc9485b6938c508a6743e969f8b4d8b1b7c9b99");
    expect(result2.commitment).to.eq("03f501e31a38c043e75958fdffccc9485b6938c508a6743e969f8b4d8b1b7c9b99");
    // TODO: assert actual commitment result
  });

  it("generator/verifier ignores casing of messages", () => {
    const lowerCaseMessages = { "1": [[ "d70d319fd1c7867af1ca477878d381e4" ]] };
    const upperCaseMessages = { "1": [[ lowerCaseMessages["1"][0][0].toUpperCase() ]] } ;

    const result = generatePedersenCommitment(lowerCaseMessages);
    const isValid = isValidPedersenCommitment(result.commitment, upperCaseMessages, result.randomizer)
    expect(isValid).to.be.true;
  });

  it("generate commitment for empty set of messages", () => {
    const messages = { "1": []};

    const result = generatePedersenCommitment(messages);
    const isValid = isValidPedersenCommitment(result.commitment, messages, result.randomizer)
    expect(isValid).to.be.true;
  });

  it("generate commitment for empty set of contests", () => {
    const messages = {};

    const result = generatePedersenCommitment(messages);
    const isValid = isValidPedersenCommitment(result.commitment, messages, result.randomizer)
    expect(isValid).to.be.true;
  });

  it("Ensure generated commitment is identical to one generated on the backed", () => {
    const messages = {
      "f7a04384-1458-5911-af38-7e08a46136e7": [["52e8cf00e474abae704f84971535a889f4ef1e0325b150e8f5b25b8ec1f21a3b"]],
      "026ca870-537e-57b2-b313-9bb5d9fbe78b": [["6745d2cc2d0b138adead55355c7c7949704115c99fcfb45a4549d0ce0e6265ec"]]
    }

    const randomizer = "7fb82ea659887d8368c70888ade78bb59c5b892939dcceab80eca02a54614d62";

    const result = generatePedersenCommitment(messages, { randomizer });
    const isValid = isValidPedersenCommitment(result.commitment, messages, result.randomizer)
    expect(isValid).to.be.true;
    expect(result.commitment).to.eq("03c5322bcb6baf281a91afc0948346ab50978420fd8e1f934e25f8127ecb1d1456");
  });

  it("fail validity check on invalid commitment (not a point on the curve)", () => {
    expect(() => isValidPedersenCommitment("ABCD", { "1": [["ABCD1234"]] }, "123456")).to.throw("not on the curve!");
  });

  it("fail on generation for non-hex messages", () => {
    expect(() => generatePedersenCommitment({ "1": [["XYZ"]] })).to.throw(Error, "Input is not a valid hex string");
    expect(() => generatePedersenCommitment({ "1": [["A"]] })).to.throw(Error, "Input is not a valid hex string");
  });

  it("fail on validation for non-hex messages", () => {
    expect(() => isValidPedersenCommitment("", { "1": [["XYZ"]] }, "")).to.throw(Error, "Input is not a valid hex string");
    expect(() => isValidPedersenCommitment("XX", { "1": [["AA"]] }, "")).to.throw(Error, "Input is not a valid hex string");
    expect(() => isValidPedersenCommitment("AA", { "1": [["AA"]] }, "XX")).to.throw(Error, "Input is not a valid hex string");
    expect(() => isValidPedersenCommitment("A", { "1": [["AA"]] }, "AA")).to.throw(Error, "Input is not a valid hex string");
  });
});
