import { expect } from "chai";
import { generatePedersenCommitment, isValidPedersenCommitment } from "../../lib/av_client/crypto/pedersen_commitment";

describe("Pedersen Commitments", () => {
  it("generate commitment from single message", () => {
    const randomizer = "01";
    const messages = ["ABBA"];

    const result = generatePedersenCommitment(messages, { randomizer });

    expect(result.commitment).to.eq("021600f61b9d347e249b4a2d08b95458ba8e17504b5481d04165cd492cadf242fc");
    expect(result.randomizer).to.eq("01");

    const isValid = isValidPedersenCommitment(result.commitment, messages, randomizer)
    expect(isValid).to.be.true;
  })

  it("generate commitment from multiple messages", () => {
    const randomizer = "01";
    const messages = ["ABBA", "BEEF"];

    const result = generatePedersenCommitment(messages, { randomizer });

    expect(result.commitment).to.eq("02c62f4fb334f5a43d96a9c3b652cf7c930922f1627ef29349fcb2085d2f2f9aed");
    expect(result.randomizer).to.eq("01");

    const isValid = isValidPedersenCommitment(result.commitment, messages, randomizer)
    expect(isValid).to.be.true;
  });

  it("generate commitment with realistic randomizer", () => {
    const randomizer = "d05bc90d9108d486835030e1374bcef4a73dc456888444f6b16aeffbc6b32391";
    const messages = ["ABBA", "BEEF", "DEADBEAF1234567890FFFFFF"];

    const result = generatePedersenCommitment(messages, { randomizer });

    expect(result.commitment).to.eq("027c5c17a18f5e671a9c9f09b90fa69bb8fcb52a753d8a69959cd329fe7570f366");
    expect(result.randomizer).to.eq("d05bc90d9108d486835030e1374bcef4a73dc456888444f6b16aeffbc6b32391");

    const isValid = isValidPedersenCommitment(result.commitment, messages, randomizer)
    expect(isValid).to.be.true;
  });

  it("generate commitment using built-in randomizer", () => {
    const messages = [
      "d70d319fd1c7867af1ca477878d381e4",
      "ef5b373b279ed26cf774d7e3376ac549",
      "3c2e2bdcc29734c7e06d53b37cc2724c"
    ];

    const result = generatePedersenCommitment(messages);
    const isValid = isValidPedersenCommitment(result.commitment, messages, result.randomizer)
    expect(isValid).to.be.true;
  });

  it("generator/verifier ignores casing of messages", () => {
    const lowerCaseMessages = [ "d70d319fd1c7867af1ca477878d381e4" ];
    const upperCaseMessages = lowerCaseMessages.map(m => m.toUpperCase());

    const result = generatePedersenCommitment(lowerCaseMessages);
    const isValid = isValidPedersenCommitment(result.commitment, upperCaseMessages, result.randomizer)
    expect(isValid).to.be.true;
  });

  it("generate commitment for empty set of messages", () => {
    const messages = [];

    const result = generatePedersenCommitment(messages);
    const isValid = isValidPedersenCommitment(result.commitment, messages, result.randomizer)
    expect(isValid).to.be.true;
  });

  it("fail validity check on invalid commitment", () => {
    expect(() => isValidPedersenCommitment("ABCD", ["ABCD1234"], "123456")).to.throw("not on the curve!");
  });

  it("fail on generation for non-hex messages", () => {
    expect(() => generatePedersenCommitment(["XYZ"])).to.throw(Error, "Input is not a valid hex string");
    expect(() => generatePedersenCommitment(["A"])).to.throw(Error, "Input is not a valid hex string");
  });

  it("fail on validation for non-hex messages", () => {
    expect(() => isValidPedersenCommitment("", ["XYZ"], "")).to.throw(Error, "Input is not a valid hex string");
    expect(() => isValidPedersenCommitment("XX", ["AA"], "")).to.throw(Error, "Input is not a valid hex string");
    expect(() => isValidPedersenCommitment("AA", ["AA"], "XX")).to.throw(Error, "Input is not a valid hex string");
    expect(() => isValidPedersenCommitment("A", ["AA"], "AA")).to.throw(Error, "Input is not a valid hex string");
  });
});
