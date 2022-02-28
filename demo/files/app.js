const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const verifier = new AssemblyVoting.AVVerifier("https://avx.com/dbb/" + params.election + "/api");
var ballotCryptogramsAddress;

$(document).ready(() => {
  $("form#findBallot").submit((event) => {
    event.preventDefault();

    const findBallotView = $(this);
    const address = findBallotView.find("input#verifier-code").value();

    verifier.findBallot(address).then((response) => {
      const verifyKeyView = $("#submitVerifierKey");

      ballotCryptogramsAddress = response.address
      verifyKeyView.find("#verification-code").text(response.address);

      findBallotView.collapse("hide");
      verifyKeyView.collapse("show");
    });
  });

  $("form#submitVerifierKey").submit((event) => {
    event.preventDefault();

    const verifyKeyView = $(this);

    verifyKeyView.collapse("hide");
    loading.collapse("show");
    verifier.pollForSpoilRequest().then((response) => {
      console.log(response)
      loading.collapse("hide");
      showChoices.collapse("show");
    });
  });
});
