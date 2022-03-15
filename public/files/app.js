const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const verifier = new AssemblyVoting.AVVerifier("http://us-avx:3000/dbb/us/api");
verifier.initialize()

$(document).ready(() => {
  $("form#findBallot").submit((event) => {
    event.preventDefault();
    const address = $("form#findBallot").find("input#verifier-code").val();

    verifier.findBallot(address).then((response) => {
      const verifyKeyView = $("#submitVerifierKey");
      verifyKeyView.find("#verification-code").text(response.address);

      verifyKeyView.collapse("show");

      verifier.pollForSpoilRequest().then((spoilRequestAddress) => {

        verifier.submitVerifierKey(spoilRequestAddress).then(verifierItem => {
          $("form#submitVerifierKey #verification-code").text(verifierItem.shortAddress)

          verifier.pollForCommitmentOpening().then(commitmentOpenings => {
            const selections = verifier.decryptBallot()
            var el = $("#choices")
            el.html()
            Object.keys(selections).forEach(key => {
              el.append(`<li>Contest: ${key} - Choice: ${selections[key]}</li>`)
            })

            $('#showChoices').collapse("show");
          })
        })
      });
    });
  });
});
