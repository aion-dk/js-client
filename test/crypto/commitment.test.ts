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
      "d70d319fd1c7867af1ca477878d381e4d70d319fd1c7867af1ca477878d381e4",
      "ef5b373b279ed26cf774d7e3376ac549ef5b373b279ed26cf774d7e3376ac549",
      "3c2e2bdcc29734c7e06d53b37cc2724c3c2e2bdcc29734c7e06d53b37cc2724c",
      "000000dcc29734c7e06d53b37cc2724c000000dcc29734c7e06d53b37cc2724c"
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

  it("Ensure generated commitment is identical to one generated on the backed", () => {
    const messages = ["60555da4264ac93be14a57ac8eb8a9721479955b62fb9fc9bc0e2148204734be",
    "49087997fbb2bf9b9f6a960dbefcf10197aae7662be851353665a5769afd5fc7",
    "78b1ae220fc1d8189d07ffd51afe3eeb9b3d9f9930eedea36966fdd8aa239969",
    "d9492309709b97fa9278b8b00ec00e08744e07549570d0951da17c97cad72a12",
    "6c984df612c2be71043125ce7657170772e66fcb0c54bf5ba1f7ee10537e46bc",
    "207e5e08b7aa49ce664c107a16def239c0fedd85266364fc0513b4785d975a62",
    "e5f87812e630bd4512300fab740cb2d0ed0d9df1ecbd2189df6dc86b2a4ded63",
    "7cd5768b2f178bf82a6a805a86c1079d048a5da414fb37fddaf28995db233e78",
    "550ad30e4bc121c6d20eb680b0f9b09b0d9fcf4500be9d92ac82a54790d80e57",
    "343366aadf06230a43cbee0872a711129940fcb0ab0016383a4006deaa4b82e0"];

    const randomizer = "e05f475e8c19504301735c8411541dee2d5f154e51c99d080ddd0278ec27ea05";

    const result = generatePedersenCommitment(messages, { randomizer });
    const isValid = isValidPedersenCommitment(result.commitment, messages, result.randomizer)
    expect(isValid).to.be.true;
    expect(result.commitment).to.eq("03c1bb8d0986b1ce0c28d4df6e3e339c813873e03df1d4bab1a7140690674e45ca");
  });

  it("fail validity check on invalid commitment (not a point on the curve)", () => {
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
