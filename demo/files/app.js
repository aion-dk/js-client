const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const verifier = new AssemblyVoting.AVVerifier("http://us-avx:3000/dbb/us/api");

$(document).ready(() => {
  $("form#findBallot").submit((event) => {
    event.preventDefault();
    const address = $("form#findBallot").find("input#verifier-code").val();

    verifier.findBallot(address).then((response) => {
      const verifyKeyView = $("#submitVerifierKey");
      console.log('ballot', response)
      verifyKeyView.find("#verification-code").text(response.address);
      
      verifyKeyView.collapse("show");

      verifier.pollForSpoilRequest().then((spoilRequestAddress) => {
        console.log('spoil address', spoilRequestAddress)

        verifier.submitVerifierKey(spoilRequestAddress).then(verifierItem => {
          console.log('verifier', verifierItem)
          $("form#submitVerifierKey #verification-code").text(verifierItem.address)

          verifier.pollForCommitmentOpening().then(commitmentOpenings => {
            console.log('commitment openings', commitmentOpenings)
            $('#showChoices').collapse("show");
            $("#choices").text(JSON.stringify(commitmentOpenings))
          })
        })
      });
    });
  });
});
