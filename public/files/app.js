let verifier = {}

$(document).ready(() => {
  $("form#initialize").collapse("show")
  $("form#initialize").submit((event) => {
    verifier = new AssemblyVoting.AVVerifier($("form#initialize").find("input#election-url").val())
    verifier.initialize()
    $("form#findBallot").collapse("show")
    $("form#initialize").collapse("hide")
  });

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
        
        verifier.submitVerifierKey(spoilRequestAddress).then(pairingCode => {
          const verifyKeyView = $("#submitVerifierKey");
          verifyKeyView.collapse("show")
          startTimer(30, verifyKeyView)

          verifyKeyView.find("#verification-code")[0].innerHTML = pairingCode

          verifier.pollForCommitmentOpening().then(commitmentOpenings => {
            verifyKeyView.collapse("hide")
            window.clearInterval(timer)
            const contestSelections = verifier.decryptBallot()
            const readableContestSelections = verifier.getReadableContestSelections(contestSelections, 'en');
            var el = $("#choices")
            el.html("")
            readableContestSelections.forEach(rcs => {
              el.append(`<li>${rcs.title} -> ${rcs.optionSelections.map(ros => ros.title).join(', ')}</li>`)
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
