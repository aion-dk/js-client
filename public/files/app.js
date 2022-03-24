
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const verifier = new AssemblyVoting.AVVerifier("http://us-avx:3000/dbb/us/api");
verifier.initialize()

$(document).ready(() => {
  $("form#findBallot").collapse("show")
  $("form#findBallot").submit((event) => {
    event.preventDefault();
    const address = $("form#findBallot").find("input#verifier-code").val();

    verifier.findBallot(address).then((response) => {
      $("form#findBallot").collapse("hide")
      const trackingCodeEl = $("#submitTrackingCode");
      
      trackingCodeEl.collapse("show");

      let timer = startTimer(30, trackingCodeEl)

      verifier.pollForSpoilRequest().then((spoilRequestAddress) => {
        window.clearInterval(timer)
        trackingCodeEl.collapse("hide")        
        
        verifier.submitVerifierKey(spoilRequestAddress).then(verifierItem => {
          const verifyKeyView = $("#submitVerifierKey");
          verifyKeyView.collapse("show")
          startTimer(30, verifyKeyView)

          console.log(verifierItem);
          verifyKeyView.find("#verification-code")[0].innerHTML = verifierItem.shortAddress

          verifier.pollForCommitmentOpening().then(commitmentOpenings => {
            verifyKeyView.collapse("hide")
            window.clearInterval(timer)
            let selections = verifier.decryptBallot()
            selections = verifier.getReadableBallot(selections, 'en');
            var el = $("#choices")
            el.html()
            Object.keys(selections).forEach(key => {
              el.append(`<li>${key} -> ${selections[key]}</li>`)
            })

            $('#showChoices').collapse("show");
          })
        })
      });
    });
  });
});

function startTimer(maxAttempts, element) {
  attempts = maxAttempts;
  let timerElement = `${element[0].id}-timer`
  element.append(`<p style="text-align: center;" id="${timerElement}"></p>`)

  return setInterval(() => {
    document.getElementById(timerElement).innerHTML = `Time left ${attempts} seconds`;

    attempts <= 0 ? element.innerHTML = "Neither spoiling nor casting action was found on the board within expected period of time. Try verifying again." : attempts--
  }, 1000);
}
